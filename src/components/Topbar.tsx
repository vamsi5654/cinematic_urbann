import React from 'react';
import { Phone, Mail, Instagram, Facebook, Linkedin } from 'lucide-react';
import styles from './Topbar.module.css';

export function Topbar() {
  return (
    <div className={styles.topbar}>
      <div className={styles.container}>
        <div className={styles.contact}>
          <a href="tel:+1234567890" className={styles.contactItem}>
            <Phone size={14} />
            <span>+1 (234) 567-890</span>
          </a>
          <a href="mailto:hello@theurbann.com" className={styles.contactItem}>
            <Mail size={14} />
            <span>hello@theurbann.com</span>
          </a>
        </div>
        
        <div className={styles.socialLinks}>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            <Instagram size={16} />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            <Facebook size={16} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            <Linkedin size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
