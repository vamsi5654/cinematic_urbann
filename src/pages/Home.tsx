import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles, Compass, Heart, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import styles from './Home.module.css';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  const featuredProjects = [
    {
      id: '1',
      title: 'Modern Minimalist Kitchen',
      category: 'Kitchen',
      image: 'https://images.unsplash.com/photo-1668026694348-b73c5eb5e299?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzY0NjQ4ODU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Clean lines meet warm wood textures'
    },
    {
      id: '2',
      title: 'Serene Master Bedroom',
      category: 'Bedroom',
      image: 'https://images.unsplash.com/photo-1763478958711-dd84b33cfe16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwYmVkcm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc2NDU3OTUxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'A peaceful retreat for rest and relaxation'
    },
    {
      id: '3',
      title: 'Spa-Inspired Bathroom',
      category: 'Bathroom',
      image: 'https://images.unsplash.com/photo-1628602813528-0264682cdc87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwYmF0aHJvb20lMjBkZXNpZ258ZW58MXx8fHwxNzY0NjkzNTQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Luxury and serenity in perfect harmony'
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'Cinematic Vision',
      description: 'Every space we craft tells a story. From mood lighting to material selection, we design interiors that feel like scenes from your favorite film.'
    },
    {
      icon: Compass,
      title: 'Human-Centered Approach',
      description: 'We listen deeply, understand your lifestyle, and create spaces that enhance how you live, work, and gather with those you love.'
    },
    {
      icon: Heart,
      title: 'Timeless Craftsmanship',
      description: 'Our designs transcend trends. We blend classic principles with contemporary sensibility to create spaces that age beautifully.'
    }
  ];

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={`${styles.hero} film-grain`} ref={heroRef}>
        <motion.div className={styles.heroBackground} style={{ y }}>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1558442069-3213d209b19f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBpbnRlcmlvciUyMGRlc2lnbiUyMGxpdmluZyUyMHJvb20lMjBjaW5lbWF0aWN8ZW58MXx8fHwxNzY0NjkzNTM4fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Luxury interior design"
          />
        </motion.div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroVignette}></div>
        
        <div className={styles.heroContent}>
          <div className={styles.heroTagline}>The Urbann Studio</div>
          <h1 className={styles.heroTitle}>
            Crafting Cinematic Interiors That Feel Like Home
          </h1>
          <p className={styles.heroSubtitle}>
            Where timeless design meets human warmth. Every detail, every texture, every moment—designed with intention.
          </p>
          <div className={styles.heroActions}>
            <Link to="/gallery">
              <Button variant="primary" size="large">
                Explore Portfolio
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="large">
                Book Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featureGrid}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className={styles.featureIcon}>
                <feature.icon size={32} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className={styles.projects}>
        <div className={styles.projectsContainer}>
          <div className={styles.sectionTitle}>
            <span>Recent Work</span>
            <h2>Featured Projects</h2>
          </div>

          <div className={styles.projectsGrid}>
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className={styles.projectCard}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <Link to={`/project/${project.id}`}>
                  <ImageWithFallback
                    src={project.image}
                    alt={project.title}
                    className={styles.projectImage}
                  />
                  <div className={styles.projectOverlay}>
                    <div className={styles.projectCategory}>{project.category}</div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className={styles.projectsAction}>
            <Link to="/gallery">
              <Button variant="secondary" size="large">
                View All Projects <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.sectionTitle}>
          <span>Client Stories</span>
          <h2>What Our Clients Say</h2>
        </div>

        <motion.div
          className={styles.testimonialCard}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <p className={styles.testimonialQuote}>
            The Urbann transformed our house into a home we never want to leave. Every room feels purposeful, warm, and utterly timeless.
          </p>
          <div className={styles.testimonialAuthor}>Sarah & James Chen</div>
          <div className={styles.testimonialRole}>Full Home Renovation, Brooklyn</div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <h2>Ready to Begin Your Journey?</h2>
          <p>
            Let's create a space that reflects your story, enhances your life, and stands the test of time.
          </p>
          <Link to="/contact">
            <Button variant="primary" size="large">
              Start Your Project
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
