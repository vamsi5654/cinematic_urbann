import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Building2, PaintBucket, Lightbulb, Hammer, Eye } from 'lucide-react';
import { Button } from '../components/Button';
import styles from './Services.module.css';

const services = [
  {
    icon: Home,
    title: 'Residential Design',
    description: 'Transform your living spaces into personalized sanctuaries that reflect your lifestyle and aesthetic vision.',
    features: [
      'Full home interior design',
      'Room-by-room consultation',
      'Space planning & layouts',
      'Custom furniture selection'
    ]
  },
  {
    icon: Building2,
    title: 'Commercial Spaces',
    description: 'Create inspiring work environments that enhance productivity while maintaining aesthetic excellence.',
    features: [
      'Office design & planning',
      'Retail space design',
      'Restaurant & hospitality',
      'Brand-aligned interiors'
    ]
  },
  {
    icon: PaintBucket,
    title: 'Full Renovations',
    description: 'Complete transformation from concept to completion, managing every detail of your renovation journey.',
    features: [
      'Architectural planning',
      'Contractor coordination',
      'Material sourcing',
      'Project management'
    ]
  },
  {
    icon: Lightbulb,
    title: 'Consultation Services',
    description: 'Expert guidance for your design decisions, from color palettes to furniture placement and styling.',
    features: [
      'Color consultation',
      'Furniture & decor advice',
      'Space optimization',
      'Virtual consultations available'
    ]
  },
  {
    icon: Hammer,
    title: 'Kitchen & Bath',
    description: 'Specialized design for the most important rooms in your home, blending function with timeless beauty.',
    features: [
      'Custom cabinetry design',
      'Fixture selection',
      'Storage solutions',
      'Lighting design'
    ]
  },
  {
    icon: Eye,
    title: 'Styling & Staging',
    description: 'Curated styling that brings your space to life, perfect for photoshoots or preparing your home for sale.',
    features: [
      'Home staging',
      'Art & accessory curation',
      'Photo shoot styling',
      'Seasonal refresh'
    ]
  }
];

const processSteps = [
  {
    number: '01',
    title: 'Discover',
    description: 'We begin by understanding your vision, lifestyle, and design aspirations through in-depth consultation.'
  },
  {
    number: '02',
    title: 'Design',
    description: 'Our team crafts a comprehensive design plan with mood boards, 3D renderings, and detailed specifications.'
  },
  {
    number: '03',
    title: 'Deliver',
    description: 'We bring the design to life, managing every detail from procurement to installation and final styling.'
  }
];

export default function Services() {
  return (
    <div className={styles.services}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span>What We Offer</span>
          <h1>Our Services</h1>
          <p>
            From concept to completion, we offer a full spectrum of interior design services 
            tailored to your unique needs and aspirations.
          </p>
        </motion.div>

        <div className={styles.serviceGrid}>
          {services.map((service, index) => (
            <motion.div
              key={index}
              className={styles.serviceCard}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className={styles.serviceIcon}>
                <service.icon size={36} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul className={styles.serviceFeatures}>
                {service.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <Link to="/contact">
                <Button variant="ghost">Learn More</Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className={styles.process}>
        <div className={styles.processContainer}>
          <motion.div
            className={styles.processHeader}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span style={{ 
              display: 'block', 
              fontSize: '14px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.2em', 
              color: 'var(--color-warm-sand)', 
              marginBottom: '16px' 
            }}>
              Our Process
            </span>
            <h2>How We Work</h2>
          </motion.div>

          <div className={styles.processSteps}>
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                className={styles.processStep}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className={styles.processNumber}>{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className={styles.cta}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2>Ready to Transform Your Space?</h2>
        <p>
          Let's discuss your project and create something extraordinary together.
        </p>
        <Link to="/contact">
          <Button variant="primary" size="large">
            Book a Free Consultation
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
