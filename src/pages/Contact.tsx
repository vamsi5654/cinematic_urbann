import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Linkedin } from 'lucide-react';
import { Button } from '../components/Button';
import { ContactFormData } from '../types';
import * as api from '../services/api';
import styles from './Contact.module.css';

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    budget: '',
    timeline: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send to backend/API
    api.submitContactForm(formData).then(() => {
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          projectType: '',
          budget: '',
          timeline: '',
          message: ''
        });
        setIsSubmitted(false);
      }, 3000);
    }).catch(error => {
      console.error('Error submitting form:', error);
    });
  };

  return (
    <div className={styles.contact}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span>Get In Touch</span>
          <h1>Let's Talk</h1>
          <p>
            Ready to transform your space? We'd love to hear about your project. 
            Reach out to schedule a consultation or simply say hello.
          </p>
        </motion.div>

        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.info}>
            <h2>Contact Information</h2>
            
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <MapPin size={20} />
              </div>
              <div className={styles.infoText}>
                <h3>Visit Us</h3>
                <p>
                  123 Design Street, Suite 100<br />
                  New York, NY 10001
                </p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <Phone size={20} />
              </div>
              <div className={styles.infoText}>
                <h3>Call Us</h3>
                <p>
                  <a href="tel:+1234567890">+1 (234) 567-890</a>
                </p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <Mail size={20} />
              </div>
              <div className={styles.infoText}>
                <h3>Email Us</h3>
                <p>
                  <a href="mailto:hello@theurbann.com">hello@theurbann.com</a>
                </p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <Clock size={20} />
              </div>
              <div className={styles.infoText}>
                <h3>Office Hours</h3>
                <p>
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: By Appointment<br />
                  Sunday: Closed
                </p>
              </div>
            </div>

            <div className={styles.socialLinks}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Facebook size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className={styles.formWrapper}>
            <h2>Send Us a Message</h2>
            <p>Fill out the form below and we'll get back to you within 24 hours.</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="projectType">Project Type *</label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select project type</option>
                    <option value="residential">Residential Design</option>
                    <option value="commercial">Commercial Space</option>
                    <option value="renovation">Full Renovation</option>
                    <option value="consultation">Consultation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="budget">Budget Range</label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                  >
                    <option value="">Select budget range</option>
                    <option value="under-50k">Under $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="100k-250k">$100,000 - $250,000</option>
                    <option value="250k-plus">$250,000+</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="timeline">Timeline</label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP</option>
                    <option value="1-3months">1-3 Months</option>
                    <option value="3-6months">3-6 Months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Tell Us About Your Project *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Describe your vision, specific needs, and any questions you have..."
                />
              </div>

              <div className={styles.submitButton}>
                <Button type="submit" variant="primary" size="large">
                  Send Message
                </Button>
              </div>

              {isSubmitted && (
                <motion.div
                  className={styles.successMessage}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Thank you! We'll be in touch within 24 hours.
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}