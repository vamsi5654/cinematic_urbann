-- The Urbann Database Schema for Cloudflare D1
-- Run this to set up your database

-- Images table - stores all uploaded project images
CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    public_id TEXT UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT, -- JSON array stored as string
    description TEXT,
    status TEXT CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
    uploaded_by TEXT DEFAULT 'admin',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table - for featured projects with multiple images
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT,
    year TEXT,
    area TEXT,
    materials TEXT, -- JSON array stored as string
    description TEXT,
    tags TEXT, -- JSON array stored as string
    featured BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project images junction table
CREATE TABLE IF NOT EXISTS project_images (
    project_id TEXT NOT NULL,
    image_id TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, image_id)
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_status ON images(status);
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at ON images(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION!)
-- Password hash is for 'admin123' - MUST be changed in production
INSERT INTO admin_users (id, username, password_hash, email)
VALUES (
    'admin-001',
    'admin',
    '$2a$10$vz0P7CjLKvz8L5YqLz7qJ.Ks7mXxQs8QGQr5IG0oGV5YQxJ8G4qKm',
    'admin@theurbann.com'
)
ON CONFLICT(username) DO NOTHING;
