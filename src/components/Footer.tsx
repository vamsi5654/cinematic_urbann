import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.column}>
            <h3>Services</h3>
            <ul>
              <li><Link to="/services">Residential Design</Link></li>
              <li><Link to="/services">Commercial Spaces</Link></li>
              <li><Link to="/services">Renovations</Link></li>
              <li><Link to="/services">Full Home Design</Link></li>
              <li><Link to="/services">Consultation</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/gallery">Portfolio</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/admin">Admin Login</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3>Get in Touch</h3>
            <p>
              <MapPin size={16} style={{ display: 'inline', marginRight: '8px' }} />
              6th Floor, The 27th Building, DLF Rd, Jayabheri Enclave,<br />
              Gachibowli, Hyderabad, Telangana 500032
            </p>
            <p>
              <Phone size={16} style={{ display: 'inline', marginRight: '8px' }} />
              +91 8977978321
            </p>
            <p>
              <Mail size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Urbann2009@gmail.com
            </p>
            <div className={styles.socialLinks}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Instagram size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Facebook size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} The Urbann. All rights reserved.
          </p>
          <div className={styles.legal}>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
