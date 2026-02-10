import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Edit, Trash2, X, Eye, Image as ImageIcon, LogOut, Calendar, Mail, Plus, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ImageUpload, ScheduledEvent, ContactSubmission } from '../types/index';
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
  const [showEventModal, setShowEventModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(!api.isAuthenticated());
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const [uploadForm, setUploadForm] = useState({
    customerNumber: '',
    customerName: '',
    phone: '',
    category: '',
    tags: [] as string[],
    description: '',
    status: 'draft' as 'draft' | 'published'
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    message: '',
    imageUrl: '',
    scheduledDate: '',
    scheduledTime: '',
    active: true
  });

  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBeforeFile, setSelectedBeforeFile] = useState<File | null>(null);
  const [selectedAfterFile, setSelectedAfterFile] = useState<File | null>(null);

  // Load data on mount and tab change
  useEffect(() => {
    if (api.isAuthenticated()) {
      loadImages();
      loadEvents();
      loadContacts();
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

  const loadEvents = async () => {
    try {
      const fetchedEvents = await api.getEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  const loadContacts = async () => {
    try {
      const fetchedContacts = await api.getContactSubmissions();
      setContacts(fetchedContacts);
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.login(loginForm.username, loginForm.password);
      setShowLoginModal(false);
      loadImages();
      loadEvents();
      loadContacts();
    } catch (err) {
      alert('Login failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleLogout = () => {
    api.logout();
    setShowLoginModal(true);
    setImages([]);
    setEvents([]);
    setContacts([]);
  };

  // Image handlers
  const filteredImages = images.filter((img) => {
    const customerName = img.customerName?.toLowerCase() || '';
    const category = img.category?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    return (
      customerName.includes(query) ||
      category.includes(query)
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

    // Log what we're about to send (for debugging)
    console.log('=== UPLOAD ATTEMPT ===');
    console.log('File:', selectedFile.name, selectedFile.size, selectedFile.type);
    console.log('Metadata:', {
      customerNumber: uploadForm.customerNumber,
      customerName: uploadForm.customerName,
      phone: uploadForm.phone,
      category: uploadForm.category,
      tags: uploadForm.tags,
      description: uploadForm.description,
      status: uploadForm.status
    });

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const newImage = await api.uploadImage(selectedFile, {
        customerNumber: uploadForm.customerNumber,
        customerName: uploadForm.customerName,
        phone: uploadForm.phone,
        category: uploadForm.category,
        tags: uploadForm.tags,
        description: uploadForm.description,
        status: uploadForm.status
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setImages([newImage, ...images]);

      setTimeout(() => {
        setUploadForm({
          customerNumber: '',
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

  // Event handlers
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEvent(eventForm);
      await loadEvents();
      setEventForm({
        title: '',
        message: '',
        imageUrl: '',
        scheduledDate: '',
        scheduledTime: '',
        active: true
      });
      setShowEventModal(false);
    } catch (err) {
      alert('Failed to create event: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleToggleEventActive = async (event: ScheduledEvent) => {
    try {
      await api.updateEvent(event.id, { active: !event.active });
      await loadEvents();
    } catch (err) {
      alert('Failed to update event: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.deleteEvent(id);
        setEvents(events.filter(e => e.id !== id));
      } catch (err) {
        alert('Delete failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }
  };

  // Contact handlers
  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markContactAsRead(id);
      setContacts(contacts.map(c => 
        c.id === id ? { ...c, readStatus: true } : c
      ));
    } catch (err) {
      alert('Failed to mark as read: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    return contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           contact.projectType.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const unreadCount = contacts.filter(c => !c.readStatus).length;

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
              <button 
                className={styles.closeBtn} 
                onClick={() => window.history.back()}
                title="Go back"
              >
                <X size={24} />
              </button>
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
            {activeTab === 'images' && (
              <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                <Upload size={18} />
                Upload Image
              </Button>
            )}
            {activeTab === 'events' && (
              <Button variant="primary" onClick={() => setShowEventModal(true)}>
                <Plus size={18} />
                Create Event
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'images' ? styles.active : ''}`}
            onClick={() => setActiveTab('images')}
          >
            <ImageIcon size={20} />
            Images ({images.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'events' ? styles.active : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <Calendar size={20} />
            Events ({events.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'contacts' ? styles.active : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <Mail size={20} />
            Contacts ({contacts.length})
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>
        </div>

        {/* Images Tab */}
        {activeTab === 'images' && (
          <>
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
                      <ImageWithFallback src={image.imageUrl} alt={image.customerName} />
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
          </>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className={styles.eventsTab}>
            <div style={{ marginBottom: '24px' }}>
              <h2>Scheduled Events</h2>
              <p style={{ opacity: 0.7, marginTop: '8px' }}>Create popup notifications for special occasions</p>
            </div>

            {events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <Calendar size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                <p>No events scheduled. Create your first event!</p>
                <Button variant="primary" onClick={() => setShowEventModal(true)} style={{ marginTop: '16px' }}>
                  <Plus size={18} />
                  Create Event
                </Button>
              </div>
            ) : (
              <div className={styles.eventsList}>
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    className={styles.eventCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className={styles.eventHeader}>
                      <h3>{event.title}</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`${styles.statusBadge} ${event.active ? styles.published : styles.draft}`}>
                          {event.active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          className={styles.iconBtn}
                          onClick={() => handleToggleEventActive(event)}
                          title={event.active ? 'Deactivate' : 'Activate'}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className={styles.iconBtn}
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className={styles.eventMessage}>{event.message}</p>
                    <div className={styles.eventMeta}>
                      <span>📅 {event.scheduledDate} at {event.scheduledTime}</span>
                      <span>Created {new Date(event.createdAt).toLocaleDateString()}</span>
                    </div>
                    {event.imageUrl && (
                      <div className={styles.eventImagePreview}>
                        <img src={event.imageUrl} alt={event.title} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className={styles.contactsTab}>
            <div style={{ marginBottom: '24px' }}>
              <h2>Contact Submissions</h2>
              <p style={{ opacity: 0.7, marginTop: '8px' }}>
                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
              </p>
            </div>

            <div className={styles.controls} style={{ marginBottom: '24px' }}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Search by name, email, or project type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredContacts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <Mail size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                <p>No contact submissions yet.</p>
              </div>
            ) : (
              <div className={styles.contactsList}>
                {filteredContacts.map((contact, index) => (
                  <motion.div
                    key={contact.id}
                    className={`${styles.contactCard} ${!contact.readStatus ? styles.unread : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className={styles.contactHeader}>
                      <div>
                        <h3>{contact.name}</h3>
                        <p className={styles.contactEmail}>{contact.email}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!contact.readStatus && (
                          <button
                            className={styles.iconBtn}
                            onClick={() => handleMarkAsRead(contact.id)}
                            title="Mark as read"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={styles.contactDetails}>
                      <div className={styles.contactRow}>
                        <strong>Phone:</strong> {contact.phone}
                      </div>
                      <div className={styles.contactRow}>
                        <strong>Project Type:</strong> {contact.projectType}
                      </div>
                      <div className={styles.contactRow}>
                        <strong>Budget:</strong> {contact.budget}
                      </div>
                      <div className={styles.contactRow}>
                        <strong>Timeline:</strong> {contact.timeline}
                      </div>
                      <div className={styles.contactRow}>
                        <strong>Message:</strong>
                        <p style={{ marginTop: '8px', lineHeight: '1.6' }}>{contact.message}</p>
                      </div>
                    </div>
                    <div className={styles.contactFooter}>
                      <span>Submitted {new Date(contact.submittedAt).toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Image Modal */}
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
                  <label htmlFor="customerNumber">Customer Number *</label>
                  <input
                    id="customerNumber"
                    type="text"
                    required
                    value={uploadForm.customerNumber}
                    onChange={(e) => setUploadForm({ ...uploadForm, customerNumber: e.target.value })}
                    disabled={isUploading}
                    placeholder="e.g., 001"
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
                  <label htmlFor="beforeImage">Before Image (optional)</label>
                  <input
                    id="beforeImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedBeforeFile(e.target.files[0]);
                      }
                    }}
                    disabled={isUploading}
                  />
                  {selectedBeforeFile && (
                    <p style={{ marginTop: '8px', fontSize: '14px', opacity: 0.7 }}>
                      Selected: {selectedBeforeFile.name}
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="afterImage">After Image (optional)</label>
                  <input
                    id="afterImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedAfterFile(e.target.files[0]);
                      }
                    }}
                    disabled={isUploading}
                  />
                  {selectedAfterFile && (
                    <p style={{ marginTop: '8px', fontSize: '14px', opacity: 0.7 }}>
                      Selected: {selectedAfterFile.name}
                    </p>
                  )}
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

      {/* Create Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '500px' }}
            >
              <div className={styles.modalHeader}>
                <h2>Create Scheduled Event</h2>
                <button 
                  className={styles.closeBtn} 
                  onClick={() => setShowEventModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className={styles.uploadForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="eventTitle">Event Title *</label>
                  <input
                    id="eventTitle"
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g., Independence Day Special"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="eventMessage">Message *</label>
                  <textarea
                    id="eventMessage"
                    required
                    value={eventForm.message}
                    onChange={(e) => setEventForm({ ...eventForm, message: e.target.value })}
                    placeholder="Enter the message to display in the popup"
                    rows={4}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="eventImage">Image URL (optional)</label>
                  <input
                    id="eventImage"
                    type="url"
                    value={eventForm.imageUrl}
                    onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="eventDate">Scheduled Date *</label>
                    <input
                      id="eventDate"
                      type="date"
                      required
                      value={eventForm.scheduledDate}
                      onChange={(e) => setEventForm({ ...eventForm, scheduledDate: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="eventTime">Scheduled Time *</label>
                    <input
                      id="eventTime"
                      type="time"
                      required
                      value={eventForm.scheduledTime}
                      onChange={(e) => setEventForm({ ...eventForm, scheduledTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={eventForm.active}
                      onChange={(e) => setEventForm({ ...eventForm, active: e.target.checked })}
                    />
                    Active (will show on scheduled date/time)
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <Button 
                    variant="ghost" 
                    type="button" 
                    onClick={() => setShowEventModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Create Event
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