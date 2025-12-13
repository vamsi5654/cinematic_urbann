import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Search, Edit, Trash2, X, Eye, Image as ImageIcon, LogOut, Calendar, Mail, Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ImageUpload, ScheduledEvent, ContactSubmission } from '../types';
import * as api from '../services/api';
import styles from './Admin.module.css';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'images' | 'events' | 'contacts'>('images');
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(!api.isAuthenticated());
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const [uploadForm, setUploadForm] = useState({
    customerName: '',
    phone: '',
    category: '',
    tags: [] as string[],
    description: '',
    status: 'draft' as 'draft' | 'published'
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load images on mount
  useEffect(() => {
    if (api.isAuthenticated()) {
      loadImages();
    }
  }, [statusFilter]);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedImages = await api.getImages({ 
        status: statusFilter === 'all' ? undefined : statusFilter 
      });
      setImages(fetchedImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.login(loginForm.username, loginForm.password);
      setShowLoginModal(false);
      loadImages();
    } catch (err) {
      alert('Login failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleLogout = () => {
    api.logout();
    setShowLoginModal(true);
    setImages([]);
  };

// Safe helper: always returns a lowercase string
const safe = (v: any) => (v == null ? '' : String(v)).toLowerCase();

// Normalize search once
const query = safe(searchQuery);

// Helper to normalize tags from either JSON string or array
const normalizeTags = (tags: any): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => (t == null ? '' : String(t)));
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed.map(t => (t == null ? '' : String(t))) : [];
    } catch {
      // If tags is a simple comma-separated string, split it
      return tags.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const filteredImages = (images ?? []).filter(img => {
  const customer = safe((img as any).customerName ?? (img as any).customer_name);
  const category = safe((img as any).category);
  const phone = safe((img as any).phone);
  const tags = normalizeTags((img as any).tags);

  const tagsMatch = tags.some(t => safe(t).includes(query));

  return (
    customer.includes(query) ||
    category.includes(query) ||
    phone.includes(query) ||
    tagsMatch
  );
});

  const stats = {
    total: images.length,
    published: images.filter(img => img.status === 'published').length,
    draft: images.filter(img => img.status === 'draft').length
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!uploadForm.tags.includes(tagInput.trim())) {
        setUploadForm({
          ...uploadForm,
          tags: [...uploadForm.tags, tagInput.trim()]
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setUploadForm({
      ...uploadForm,
      tags: uploadForm.tags.filter(t => t !== tag)
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress (real progress would need server-sent events or polling)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const newImage = await api.uploadImage(selectedFile, {
        customerName: uploadForm.customerName,
        phone: uploadForm.phone,
        category: uploadForm.category,
        tags: uploadForm.tags,
        description: uploadForm.description,
        status: uploadForm.status
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add to list
      setImages([newImage, ...images]);

      // Reset form
      setTimeout(() => {
        setUploadForm({
          customerName: '',
          phone: '',
          category: '',
          tags: [],
          description: '',
          status: 'draft'
        });
        setSelectedFile(null);
        setUploadProgress(0);
        setShowUploadModal(false);
        setIsUploading(false);
      }, 500);

    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await api.deleteImage(id);
        setImages(images.filter(img => img.id !== id));
      } catch (err) {
        alert('Delete failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }
  };

  const handleToggleStatus = async (image: ImageUpload) => {
    try {
      const newStatus = image.status === 'published' ? 'draft' : 'published';
      await api.updateImage(image.id, { status: newStatus });
      
      setImages(images.map(img => 
        img.id === image.id ? { ...img, status: newStatus } : img
      ));
    } catch (err) {
      alert('Update failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Login Modal
  if (showLoginModal) {
    return (
      <div className={styles.admin}>
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ maxWidth: '400px' }}
          >
            <div className={styles.modalHeader}>
              <h2>Admin Login</h2>
            </div>
            <form onSubmit={handleLogin} className={styles.uploadForm}>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              <div className={styles.modalActions}>
                <Button variant="primary" type="submit" style={{ width: '100%' }}>
                  Login
                </Button>
              </div>
              <p style={{ marginTop: '16px', fontSize: '14px', opacity: 0.7, textAlign: 'center' }}>
                Default: admin / admin123
              </p>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  //image url resolver
  const resolveImageUrl = (image: any) =>
  image.imageUrl ||
  image.image_url ||
  image.public_url ||
  '';


  return (
    <div className={styles.admin}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut size={18} />
              Logout
            </Button>
            <Button variant="primary" onClick={() => setShowUploadModal(true)}>
              <Upload size={18} />
              Upload Image
            </Button>
          </div>
        </div>

        <div className={styles.dashboard}>
          <div className={styles.statCard}>
            <h3>Total Images</h3>
            <div className={styles.value}>{stats.total}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Published</h3>
            <div className={styles.value}>{stats.published}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Drafts</h3>
            <div className={styles.value}>{stats.draft}</div>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by customer name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'published' ? styles.active : ''}`}
              onClick={() => setStatusFilter('published')}
            >
              Published
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'draft' ? styles.active : ''}`}
              onClick={() => setStatusFilter('draft')}
            >
              Drafts
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p>Loading images...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-warm-sand)' }}>
            <p>{error}</p>
            <Button variant="ghost" onClick={loadImages} style={{ marginTop: '16px' }}>
              Retry
            </Button>
          </div>
        ) : filteredImages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p>No images found. Upload your first image to get started!</p>
          </div>
        ) : (
          <div className={styles.imageGrid}>
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                className={styles.imageCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div className={styles.imagePreview}>
                  <ImageWithFallback
                      src={resolveImageUrl(image)}
                      alt={image.customerName}
                    />
                  <span 
                    className={`${styles.statusBadge} ${styles[image.status]}`}
                    onClick={() => handleToggleStatus(image)}
                    style={{ cursor: 'pointer' }}
                    title="Click to toggle status"
                  >
                    {image.status}
                  </span>
                </div>
                <div className={styles.imageInfo}>
                  <h4>{image.customerName}</h4>
                  <p className={styles.imageMeta}>
                    {image.category} • {new Date(image.uploadedAt).toLocaleDateString()}
                  </p>
                  <div className={styles.imageActions}>
                    <button className={styles.iconBtn} title="View">
                      <Eye size={16} />
                    </button>
                    <button className={styles.iconBtn} title="Edit">
                      <Edit size={16} />
                    </button>
                    <button 
                      className={styles.iconBtn} 
                      title="Delete"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isUploading && setShowUploadModal(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Upload New Image</h2>
                <button 
                  className={styles.closeBtn} 
                  onClick={() => !isUploading && setShowUploadModal(false)}
                  disabled={isUploading}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpload} className={styles.uploadForm}>
                <div
                  className={`${styles.dropZone} ${isDragging ? styles.active : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && document.getElementById('fileInput')?.click()}
                >
                  <ImageIcon size={48} />
                  <p>{selectedFile ? selectedFile.name : 'Drop image here or click to browse'}</p>
                  <span>Supports: JPG, PNG, WEBP (Max 10MB)</span>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    disabled={isUploading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="customerName">Customer Name *</label>
                  <input
                    id="customerName"
                    type="text"
                    required
                    value={uploadForm.customerName}
                    onChange={(e) => setUploadForm({ ...uploadForm, customerName: e.target.value })}
                    disabled={isUploading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={uploadForm.phone}
                    onChange={(e) => setUploadForm({ ...uploadForm, phone: e.target.value })}
                    disabled={isUploading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    required
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    disabled={isUploading}
                  >
                    <option value="">Select category</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Living">Living</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Bathroom">Bathroom</option>
                    <option value="Office">Office</option>
                    <option value="Full Home">Full Home</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Tags</label>
                  <div className={styles.tagInput}>
                    {uploadForm.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tag)}
                          disabled={isUploading}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Add tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      disabled={isUploading}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    disabled={isUploading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    required
                    value={uploadForm.status}
                    onChange={(e) => setUploadForm({ ...uploadForm, status: e.target.value as 'draft' | 'published' })}
                    disabled={isUploading}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                {uploadProgress > 0 && (
                  <div className={styles.uploadProgress}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className={styles.progressText}>Uploading... {uploadProgress}%</p>
                  </div>
                )}

                <div className={styles.modalActions}>
                  <Button 
                    variant="ghost" 
                    type="button" 
                    onClick={() => setShowUploadModal(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}