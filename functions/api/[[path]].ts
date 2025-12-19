// Cloudflare Workers API Handler
// This handles all /api/* requests

interface Env {
  IMAGES_BUCKET: R2Bucket;
  DB: D1Database;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
  R2_PUBLIC_URL?: string; // Add this for custom R2 public URL
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
      return await handleContactSubmission(request, env, headers);
    }

    if (path === 'contact' && request.method === 'GET') {
      return await handleGetContactSubmissions(request, env, headers);
    }

    if (path.startsWith('contact/') && path.endsWith('/read') && request.method === 'PUT') {
      const contactId = path.split('/')[1];
      return await handleMarkContactAsRead(contactId, request, env, headers);
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

    // Project details route
    if (path.startsWith('project/') && request.method === 'GET') {
      const projectId = path.split('/')[1];
      return await handleGetProjectDetails(projectId, env, headers);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
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
  try {
    console.log('=== UPLOAD REQUEST STARTED ===');
    
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Auth failed: Missing or invalid authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    console.log('Parsing form data...');
    const formData = await request.formData();
    console.log('Form data parsed successfully');
    
    const file = formData.get('file') as File;
    const metadataString = formData.get('metadata') as string;
    
    console.log('File present:', !!file);
    console.log('File name:', file?.name);
    console.log('File size:', file?.size);
    console.log('File type:', file?.type);
    console.log('Metadata string present:', !!metadataString);
    console.log('Metadata string:', metadataString);

    if (!file) {
      console.error('Upload failed: No file provided');
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (!metadataString) {
      console.error('Upload failed: No metadata provided');
      return new Response(JSON.stringify({ error: 'No metadata provided' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Parse metadata with error handling
    let metadata;
    try {
      metadata = JSON.parse(metadataString);
      console.log('Metadata parsed successfully:', metadata);
    } catch (parseError) {
      console.error('Metadata parse error:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid metadata format',
        details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    console.log('Validating metadata fields...');
    console.log('customerNumber:', metadata.customerNumber);
    console.log('customerName:', metadata.customerName);
    console.log('category:', metadata.category);
    
    if (!metadata.customerNumber || !metadata.customerName || !metadata.category) {
      console.error('Validation failed: Missing required fields');
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: customerNumber, customerName, or category',
        received: {
          customerNumber: metadata.customerNumber || 'missing',
          customerName: metadata.customerName || 'missing',
          category: metadata.category || 'missing'
        }
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Create hierarchical folder structure: /uploads/{customer_number}_{customer_name}/{category}/
    const customerFolder = `${metadata.customerNumber}_${metadata.customerName.replace(/\s+/g, '_')}`;
    const categoryFolder = metadata.category.replace(/\s+/g, '');
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
    const fullPath = `uploads/${customerFolder}/${categoryFolder}/${fileName}`;
    
    console.log('File path:', fullPath);
    console.log('Converting file to buffer...');
    
    // Convert file to ArrayBuffer for R2
    const fileBuffer = await file.arrayBuffer();
    console.log('File buffer size:', fileBuffer.byteLength);
    
    // Check if R2 bucket is available
    if (!env.IMAGES_BUCKET) {
      console.error('IMAGES_BUCKET binding not found!');
      return new Response(JSON.stringify({ 
        error: 'R2 bucket not configured',
        details: 'IMAGES_BUCKET environment binding is missing'
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Uploading to R2...');
    // Upload to R2 with hierarchical path
    await env.IMAGES_BUCKET.put(fullPath, fileBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    console.log('R2 upload successful');

    // Generate public URL using R2 dev subdomain or custom domain
    const bucketUrl = env.R2_PUBLIC_URL || 'https://pub-PLACEHOLDER.r2.dev';
    const imageUrl = `${bucketUrl}/${fullPath}`;
    console.log('Image URL:', imageUrl);
    
    // Generate project_id based on customer number and name
    const projectId = `${metadata.customerNumber}_${metadata.customerName.replace(/\s+/g, '_')}`;
    console.log('Project ID:', projectId);
    
    // Check if D1 database is available
    if (!env.DB) {
      console.error('DB binding not found!');
      return new Response(JSON.stringify({ 
        error: 'Database not configured',
        details: 'DB environment binding is missing'
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Saving to database...');
    // Save metadata to D1
    const imageId = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO images (id, public_id, image_url, customer_number, customer_name, phone, category, tags, description, status, project_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      imageId,
      fullPath,
      imageUrl,
      metadata.customerNumber,
      metadata.customerName,
      metadata.phone || '',
      metadata.category,
      JSON.stringify(metadata.tags || []),
      metadata.description || '',
      metadata.status || 'draft',
      projectId
    ).run();
    
    console.log('Database insert successful');
    console.log('=== UPLOAD COMPLETED SUCCESSFULLY ===');

    return new Response(JSON.stringify({ 
      success: true,
      image: {
        id: imageId,
        imageUrl,
        publicId: fullPath,
        projectId,
        ...metadata
      }
    }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('=== UPLOAD ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name || 'Unknown'
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
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

// Contact form submission handler
async function handleContactSubmission(request: Request, env: Env, headers: Record<string, string>) {
  const contactData = await request.json();
  
  const contactId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO contact_submissions (id, name, email, phone, project_type, budget, timeline, message, read_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`
  ).bind(
    contactId,
    contactData.name,
    contactData.email,
    contactData.phone,
    contactData.projectType || 'other',
    contactData.budget || '',
    contactData.timeline || '',
    contactData.message
  ).run();

  return new Response(JSON.stringify({ 
    success: true,
    contactId
  }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Get contact submissions handler
async function handleGetContactSubmissions(request: Request, env: Env, headers: Record<string, string>) {
  // Verify authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const { results } = await env.DB.prepare(
    'SELECT * FROM contact_submissions ORDER BY submitted_at DESC'
  ).all();
  
  return new Response(JSON.stringify({ submissions: results }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Mark contact as read handler
async function handleMarkContactAsRead(contactId: string, request: Request, env: Env, headers: Record<string, string>) {
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

// Get events handler with auto-cleanup
async function handleGetEvents(request: Request, env: Env, headers: Record<string, string>) {
  // Verify authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  // Auto-delete past events (events where scheduled_date < today)
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  await env.DB.prepare(
    'DELETE FROM scheduled_events WHERE scheduled_date < ?'
  ).bind(today).run();
  
  // Get remaining events
  const { results } = await env.DB.prepare(
    'SELECT * FROM scheduled_events ORDER BY scheduled_date DESC, scheduled_time DESC'
  ).all();
  
  return new Response(JSON.stringify({ events: results }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Get active events handler with auto-cleanup
async function handleGetActiveEvents(request: Request, env: Env, headers: Record<string, string>) {
  // Auto-delete past events
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  await env.DB.prepare(
    'DELETE FROM scheduled_events WHERE scheduled_date < ?'
  ).bind(today).run();

  // Get active events for today or future
  const { results } = await env.DB.prepare(
    'SELECT * FROM scheduled_events WHERE active = 1 AND scheduled_date >= ? ORDER BY scheduled_date, scheduled_time'
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
  
  // Build dynamic update query based on provided fields
  const fields = [];
  const values = [];
  
  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.message !== undefined) { fields.push('message = ?'); values.push(updates.message); }
  if (updates.imageUrl !== undefined) { fields.push('image_url = ?'); values.push(updates.imageUrl); }
  if (updates.scheduledDate !== undefined) { fields.push('scheduled_date = ?'); values.push(updates.scheduledDate); }
  if (updates.scheduledTime !== undefined) { fields.push('scheduled_time = ?'); values.push(updates.scheduledTime); }
  if (updates.active !== undefined) { fields.push('active = ?'); values.push(updates.active ? 1 : 0); }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(eventId);
  
  await env.DB.prepare(
    `UPDATE scheduled_events SET ${fields.join(', ')} WHERE id = ?`
  ).bind(...values).run();

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

  await env.DB.prepare('DELETE FROM scheduled_events WHERE id = ?').bind(eventId).run();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Get project details handler
async function handleGetProjectDetails(projectId: string, env: Env, headers: Record<string, string>) {
  // Get all images for this project_id (grouped by customer_number + customer_name)
  const { results: images } = await env.DB.prepare(
    'SELECT * FROM images WHERE project_id = ? AND status = ? ORDER BY category, uploaded_at DESC'
  ).bind(projectId, 'published').all();

  if (!images || images.length === 0) {
    return new Response(JSON.stringify({ error: 'Project not found' }), {
      status: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  // Get project info from first image
  const firstImage: any = images[0];
  
  // Parse JSON fields and group images by category
  const parsedImages = images.map((img: any) => ({
    ...img,
    tags: JSON.parse(img.tags || '[]'),
    uploadedAt: img.uploaded_at
  }));

  // Group images by room/category
  const imagesByCategory = parsedImages.reduce((acc: any, img: any) => {
    if (!acc[img.category]) {
      acc[img.category] = [];
    }
    acc[img.category].push(img.image_url);
    return acc;
  }, {});

  const project = {
    id: projectId,
    customerNumber: firstImage.customer_number,
    customerName: firstImage.customer_name,
    phone: firstImage.phone,
    description: firstImage.description || `Project for ${firstImage.customer_name}`,
    categories: Object.keys(imagesByCategory),
    imagesByCategory,
    allImages: parsedImages.map((img: any) => img.image_url),
    year: new Date(firstImage.uploaded_at).getFullYear().toString(),
  };

  return new Response(JSON.stringify({ 
    project,
    images: parsedImages
  }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}