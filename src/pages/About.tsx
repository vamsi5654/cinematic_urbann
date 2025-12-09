import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Sparkles, Users, Award } from 'lucide-react';
import { Button } from '../components/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import styles from './About.module.css';

const values = [
  {
    icon: Heart,
    title: 'Human-Centered',
    description: 'We design for people, not trends. Every space should enhance how you live and feel.'
  },
  {
    icon: Sparkles,
    title: 'Cinematic Beauty',
    description: 'Our designs tell stories through light, texture, and thoughtful composition.'
  },
  {
    icon: Users,
    title: 'Collaborative',
    description: 'Your vision guides our process. We listen deeply and create together.'
  },
  {
    icon: Award,
    title: 'Timeless Quality',
    description: 'We craft spaces that age beautifully, transcending fleeting trends.'
  }
];

export default function About() {
  return (
    <div className={styles.about}>
      <div className={styles.container}>
        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.heroContent}>
            <div className={styles.tagline}>Our Story</div>
            <h1>Crafting Spaces That Feel Like Home</h1>
            <p>
              Founded on the belief that interior design should be both cinematic and deeply human, 
              The Urbann was born from a passion for creating spaces that don't just look beautiful—they 
              feel right.
            </p>
            <p>
              We're a team of designers, architects, and craftspeople who believe that every detail 
              matters. From the way light filters through a window to the texture of a hand-selected 
              fabric, we approach each project with intention and care.
            </p>
            <p>
              Our work has been featured in leading design publications, but what we're most proud 
              of are the relationships we build and the homes we help create.
            </p>
          </div>
          <div className={styles.heroImage}>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1634768291716-4f1fa5cea55d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcmlvciUyMGRlc2lnbmVyJTIwd29ya3NwYWNlJTIwc3R1ZGlvfGVufDF8fHx8MTc2NDY5Mzc1NXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="The Urbann Studio"
            />
          </div>
        </motion.div>

        <motion.div
          className={styles.philosophy}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2>Our Philosophy</h2>
          <p>
            "Design is not about following trends or filling spaces with objects. 
            It's about understanding how people live, what brings them joy, and translating 
            those insights into environments that feel both extraordinary and utterly natural."
          </p>
        </motion.div>

        <motion.div
          className={styles.values}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Our Values</h2>
          <div className={styles.valuesGrid}>
            {values.map((value, index) => (
              <motion.div
                key={index}
                className={styles.valueCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={styles.valueIcon}>
                  <value.icon size={32} />
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.stats}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className={styles.stat}>
            <span className={styles.statNumber}>200+</span>
            <span className={styles.statLabel}>Projects Completed</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>12</span>
            <span className={styles.statLabel}>Years Experience</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>98%</span>
            <span className={styles.statLabel}>Client Satisfaction</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>15+</span>
            <span className={styles.statLabel}>Design Awards</span>
          </div>
        </motion.div>

        <motion.div
          className={styles.cta}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Let's Create Something Beautiful</h2>
          <p>
            Whether you're renovating a single room or designing an entire home, 
            we'd love to bring your vision to life.
          </p>
          <Link to="/contact">
            <Button variant="primary" size="large">
              Start Your Project
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
