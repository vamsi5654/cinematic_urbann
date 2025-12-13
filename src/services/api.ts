// API Service Layer - Frontend integration with Cloudflare Workers

const API_BASE_URL = typeof window !== 'undefined' && (window as any).__ENV__?.VITE_API_URL 
  ? (window as any).__ENV__.VITE_API_URL 
  : '/api';

// Types
export interface ImageUpload {
  id: string;
  imageUrl: string;
  publicId: string;
  customerName: string;
  phone: string;
  category: string;
  tags: string[];
  description?: string;
  uploadedAt: Date;
  uploadedBy?: string;
  status: 'draft' | 'published';
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

// Auth helpers
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Generic fetch wrapper with auth
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    throw new Error('Unauthorized - Please login again');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'An error occurred');
  }

  return response.json();
}

// Auth API
export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const data = await response.json();
  setAuthToken(data.token);
  return data;
}

export function logout(): void {
  clearAuthToken();
}

// Image Upload API
export async function uploadImage(
  file: File,
  metadata: {
    customerName: string;
    phone: string;
    category: string;
    tags: string[];
    description?: string;
    status: 'draft' | 'published';
  }
): Promise<ImageUpload> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return {
  id: data.image.id,
  imageUrl: data.image.imageUrl,
  publicId: data.image.publicId,
  customerName: data.image.customerName,
  phone: data.image.phone,
  category: data.image.category,
  tags: data.image.tags || [],
  description: data.image.description,
  status: data.image.status,
  uploadedAt: new Date(data.image.uploadedAt || Date.now()),
};

}

// Get Images API
export async function getImages(filters?: {
  status?: 'draft' | 'published' | 'all';
  category?: string;
}): Promise<ImageUpload[]> {
  const params = new URLSearchParams();
  
  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status);
  } else if (!filters?.status) {
    params.append('status', 'published'); // Default to published for public gallery
  }
  
  if (filters?.category && filters.category !== 'All') {
    params.append('category', filters.category);
  }

  const response = await fetch(`${API_BASE_URL}/images?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch images');
  }

const data = await response.json();

return data.images.map((img: any) => ({
  id: img.id,
  imageUrl: img.imageUrl,          // ✅ single source of truth
  publicId: img.publicId,
  customerName: img.customerName,
  phone: img.phone,
  category: img.category,
  tags: img.tags || [],
  description: img.description,
  status: img.status,
  uploadedAt: new Date(img.uploadedAt || Date.now()),
}));
}


// Delete Image API
export async function deleteImage(imageId: string): Promise<void> {
  await apiFetch(`/images/${imageId}`, {
    method: 'DELETE',
  });
}

// Update Image API
export async function updateImage(
  imageId: string,
  updates: {
    customerName?: string;
    phone?: string;
    category?: string;
    tags?: string[];
    description?: string;
    status?: 'draft' | 'published';
  }
): Promise<void> {
  await apiFetch(`/images/${imageId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// Contact Form Submission API
export async function submitContactForm(formData: {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Failed to submit contact form');
  }
}

// Get Contact Submissions (Admin only)
export async function getContactSubmissions(): Promise<any[]> {
  const data = await apiFetch('/contact');
  return data.submissions.map((sub: any) => ({
    ...sub,
    submittedAt: new Date(sub.submittedAt),
  }));
}

// Mark Contact as Read
export async function markContactAsRead(id: string): Promise<void> {
  await apiFetch(`/contact/${id}/read`, {
    method: 'PUT',
  });
}

// Scheduled Events API
export async function createEvent(eventData: {
  title: string;
  message: string;
  imageUrl?: string;
  scheduledDate: string;
  scheduledTime: string;
  active: boolean;
}): Promise<any> {
  return await apiFetch('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

export async function getEvents(): Promise<any[]> {
  const data = await apiFetch('/events');
  return data.events.map((event: any) => ({
    ...event,
    createdAt: new Date(event.createdAt),
    updatedAt: new Date(event.updatedAt),
  }));
}

export async function getActiveEvents(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/events/active`);
  if (!response.ok) {
    throw new Error('Failed to fetch active events');
  }
  const data = await response.json();
  return data.events.map((event: any) => ({
    ...event,
    createdAt: new Date(event.createdAt),
    updatedAt: new Date(event.updatedAt),
  }));
}

export async function updateEvent(
  id: string,
  updates: {
    title?: string;
    message?: string;
    imageUrl?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    active?: boolean;
  }
): Promise<void> {
  await apiFetch(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await apiFetch(`/events/${id}`, {
    method: 'DELETE',
  });
}