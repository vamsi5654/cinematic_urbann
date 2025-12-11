// TypeScript types for The Urbann

export interface Project {
  id: string;
  title: string;
  category: 'Kitchen' | 'Living' | 'Bedroom' | 'Full Home' | 'Bathroom' | 'Office';
  imageUrl: string;
  images: string[];
  location: string;
  year: string;
  area: string;
  materials: string[];
  description: string;
  tags: string[];
  featured: boolean;
  beforeImage?: string;
  afterImage?: string;
}

export interface ImageUpload {
  id: string;
  imageUrl: string;
  publicId: string;
  customerName: string;
  phone: string;
  category: string;
  tags: string[];
  uploadedAt: Date;
  uploadedBy: string;
  status: 'draft' | 'published';
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  image?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  readStatus: boolean;
  submittedAt: Date;
}

export interface ScheduledEvent {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}