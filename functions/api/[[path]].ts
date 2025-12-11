// Cloudflare Workers API Handler
// This handles all /api/* requests

interface Env {
  IMAGES_BUCKET: R2Bucket;
  DB: D1Database;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
}

// CORS headers
function corsHeaders(origin: string = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// Handle OPTIONS requests
function handleOptions(request: Request) {
  return new Response(null, {
    headers: corsHeaders(request.headers.get('Origin') || '*'),
  });
}

// Router
export async function onRequest(context: { request: Request; env: Env; params: { path: string[] } }) {
  const { request, env, params } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  const headers = corsHeaders(request.headers.get('Origin') || '*');

  try {
    // Route handling
    if (path.startsWith('auth/login') && request.method === 'POST') {
      return await handleLogin(request, env, headers);
    }
    
    if (path === 'upload' && request.method === 'POST') {
      return await handleUpload(request, env, headers);
    }
    
    if (path === 'images' && request.method === 'GET') {
      return await handleGetImages(request, env, headers);
    }
    
    if (path.startsWith('images/') && request.method === 'DELETE') {
      const imageId = path.split('/')[1];
      return await handleDeleteImage(imageId, request, env, headers);
    }
    
    if (path.startsWith('images/') && request.method === 'PUT') {
      const imageId = path.split('/')[1];
      return await handleUpdateImage(imageId, request, env, headers);
    }

    // Contact form routes
    if (path === 'contact' && request.method === 'POST') {
      return await handleContactSubmit(request, env, headers);
    }

    if (path === 'contact' && request.method === 'GET') {
      return await handleGetContacts(request, env, headers);
    }

    if (path.startsWith('contact/') && path.endsWith('/read') && request.method === 'PUT') {
      const contactId = path.split('/')[1];
      return await handleMarkContactRead(contactId, request, env, headers);
    }

    // Events routes
    if (path === 'events' && request.method === 'POST') {
      return await handleCreateEvent(request, env, headers);
    }

    if (path === 'events' && request.method === 'GET') {
      return await handleGetEvents(request, env, headers);
    }

    if (path === 'events/active' && request.method === 'GET') {
      return await handleGetActiveEvents(request, env, headers);
    }

    if (path.startsWith('events/') && request.method === 'PUT') {
      const eventId = path.split('/')[1];
      return await handleUpdateEvent(eventId, request, env, headers);
    }

    if (path.startsWith('events/') && request.method === 'DELETE') {
      const eventId = path.split('/')[1];
      return await handleDeleteEvent(eventId, request, env, headers);
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}

// Login handler
async function handleLogin(request: Request, env: Env, headers: Record<string, string>) {
  const { username, password } = await request.json();
  
  // Query user from database
  const user = await env.DB.prepare(
    'SELECT * FROM admin_users WHERE username = ?'
  ).bind(username).first();
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
  
  // Simple password check (in production, use bcrypt)
  // For now, we'll use a simple comparison - YOU MUST implement proper hashing
  const isValid = password === 'admin123'; // TODO: Replace with bcrypt.compare(password, user.password_hash)
  
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
  
  // Generate JWT token (simplified - use a proper JWT library in production)
  const token = btoa(JSON.stringify({ 
    userId: user.id, 
    username: user.username,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  }));
  
  // Update last login
  await env.DB.prepare(
    'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(user.id).run();
  
  return new Response(JSON.stringify({ 
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Upload handler
async function handleUpload(request: Request, env: Env, headers: Record<string, string>) {
  // Verify authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const metadata = JSON.parse(formData.get('metadata') as string);

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  // Generate unique filename
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
  
  // Upload to R2
  await env.IMAGES_BUCKET.put(fileName, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  // Generate public URL (you'll need to set up a custom domain for R2)
  const imageUrl = `https://images.your-domain.com/${fileName}`;
  
  // Save metadata to D1
  const imageId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO images (id, public_id, image_url, customer_name, phone, category, tags, description, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    imageId,
    fileName,
    imageUrl,
    metadata.customerName,
    metadata.phone,
    metadata.category,
    JSON.stringify(metadata.tags || []),
    metadata.description || '',
    metadata.status || 'draft'
  ).run();

  return new Response(JSON.stringify({ 
    success: true,
    image: {
      id: imageId,
      imageUrl,
      publicId: fileName,
      ...metadata
    }
  }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Get images handler
async function handleGetImages(request: Request, env: Env, headers: Record<string, string>) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'published';
  const category = url.searchParams.get('category');
  
  let query = 'SELECT * FROM images WHERE status = ?';
  const params = [status];
  
  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY uploaded_at DESC';
  
  const { results } = await env.DB.prepare(query).bind(...params).all();
  
  // Parse JSON fields
  const images = results.map(img => ({
    ...img,
    tags: JSON.parse(img.tags as string || '[]'),
    uploadedAt: img.uploaded_at
  }));

  return new Response(JSON.stringify({ images }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Delete image handler
async function handleDeleteImage(imageId: string, request: Request, env: Env, headers: Record<string, string>) {
  // Verify authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  // Get image info
  const image = await env.DB.prepare(
    'SELECT * FROM images WHERE id = ?'
  ).bind(imageId).first();

  if (!image) {
    return new Response(JSON.stringify({ error: 'Image not found' }), {
      status: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  // Delete from R2
  await env.IMAGES_BUCKET.delete(image.public_id as string);
  
  // Delete from database
  await env.DB.prepare('DELETE FROM images WHERE id = ?').bind(imageId).run();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Update image handler
async function handleUpdateImage(imageId: string, request: Request, env: Env, headers: Record<string, string>) {
  // Verify authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const updates = await request.json();
  
  await env.DB.prepare(
    `UPDATE images 
     SET customer_name = ?, phone = ?, category = ?, tags = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(
    updates.customerName,
    updates.phone,
    updates.category,
    JSON.stringify(updates.tags || []),
    updates.description || '',
    updates.status,
    imageId
  ).run();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Contact form submit handler
async function handleContactSubmit(request: Request, env: Env, headers: Record<string, string>) {
  const contactData = await request.json();
  
  const contactId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO contact_submissions (id, name, email, phone, project_type, budget, timeline, message, read_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    contactId,
    contactData.name,
    contactData.email,
    contactData.phone,
    contactData.projectType,
    contactData.budget || '',
    contactData.timeline || '',
    contactData.message,
    0
  ).run();

  return new Response(JSON.stringify({ 
    success: true,
    submission: {
      id: contactId,
      ...contactData
    }
  }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Get contacts handler
async function handleGetContacts(request: Request, env: Env, headers: Record<string, string>) {
  // Verify authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const readStatus = url.searchParams.get('read');
  
  let query = 'SELECT * FROM contact_submissions';
  const params: any[] = [];
  
  if (readStatus === 'true') {
    query += ' WHERE read_status = 1';
  } else if (readStatus === 'false') {
    query += ' WHERE read_status = 0';
  }
  
  query += ' ORDER BY submitted_at DESC';
  
  const { results } = await env.DB.prepare(query).bind(...params).all();
  
  return new Response(JSON.stringify({ submissions: results }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Mark contact as read handler
async function handleMarkContactRead(contactId: string, request: Request, env: Env, headers: Record<string, string>) {
  // Verify authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  await env.DB.prepare(
    'UPDATE contact_submissions SET read_status = 1 WHERE id = ?'
  ).bind(contactId).run();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Create event handler
async function handleCreateEvent(request: Request, env: Env, headers: Record<string, string>) {
  // Verify authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const eventData = await request.json();
  
  const eventId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO scheduled_events (id, title, message, image_url, scheduled_date, scheduled_time, active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    eventId,
    eventData.title,
    eventData.message,
    eventData.imageUrl || '',
    eventData.scheduledDate,
    eventData.scheduledTime,
    eventData.active ? 1 : 0
  ).run();

  return new Response(JSON.stringify({ 
    success: true,
    event: {
      id: eventId,
      ...eventData
    }
  }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Get events handler
async function handleGetEvents(request: Request, env: Env, headers: Record<string, string>) {
  // Verify authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const { results } = await env.DB.prepare(
    'SELECT * FROM scheduled_events ORDER BY scheduled_date DESC, scheduled_time DESC'
  ).all();
  
  return new Response(JSON.stringify({ events: results }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Get active events handler (public - no auth required)
async function handleGetActiveEvents(request: Request, env: Env, headers: Record<string, string>) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const { results } = await env.DB.prepare(
    'SELECT * FROM scheduled_events WHERE active = 1 AND scheduled_date = ? ORDER BY scheduled_time ASC'
  ).bind(today).all();
  
  return new Response(JSON.stringify({ events: results }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Update event handler
async function handleUpdateEvent(eventId: string, request: Request, env: Env, headers: Record<string, string>) {
  // Verify authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const updates = await request.json();
  
  await env.DB.prepare(
    `UPDATE scheduled_events 
     SET title = ?, message = ?, image_url = ?, scheduled_date = ?, scheduled_time = ?, active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(
    updates.title,
    updates.message,
    updates.imageUrl || '',
    updates.scheduledDate,
    updates.scheduledTime,
    updates.active ? 1 : 0,
    eventId
  ).run();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Delete event handler
async function handleDeleteEvent(eventId: string, request: Request, env: Env, headers: Record<string, string>) {
  // Verify authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  // Delete from database
  await env.DB.prepare('DELETE FROM scheduled_events WHERE id = ?').bind(eventId).run();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}