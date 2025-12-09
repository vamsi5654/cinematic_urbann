import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Calendar, Ruler } from 'lucide-react';
import { Button } from '../components/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import styles from './ProjectDetail.module.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);

  // Mock project data
  const project = {
    id: id || '1',
    title: 'Modern Minimalist Kitchen',
    category: 'Kitchen',
    description: 'A complete transformation of a dated kitchen into a contemporary culinary haven. We focused on maximizing natural light, creating seamless storage solutions, and introducing warm wood tones to balance the clean white surfaces. The result is a space that feels both sophisticated and inviting—a true heart of the home.',
    location: 'Manhattan, NY',
    year: '2024',
    area: '450 sq ft',
    materials: ['White Oak', 'Carrara Marble', 'Brushed Steel', 'Walnut'],
    images: [
      'https://images.unsplash.com/photo-1668026694348-b73c5eb5e299?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzY0NjQ4ODU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1628602813528-0264682cdc87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwYmF0aHJvb20lMjBkZXNpZ258ZW58MXx8fHwxNzY0NjkzNTQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1611094016919-36b65678f3d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsaXZpbmclMjByb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY0NjI2NzA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1763478958711-dd84b33cfe16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwYmVkcm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc2NDU3OTUxN3ww&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    beforeImage: 'https://images.unsplash.com/photo-1578177154072-bbbd429d496f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraXRjaGVuJTIwcmVub3ZhdGlvbiUyMGJlZm9yZXxlbnwxfHx8fDE3NjQ2MzExMjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    afterImage: 'https://images.unsplash.com/photo-1708915965975-2a950db0e215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwcmVub3ZhdGlvbiUyMGFmdGVyfGVufDF8fHx8MTc2NDY5MzY3OHww&ixlib=rb-4.1.0&q=80&w=1080'
  };

  const relatedProjects = [
    {
      id: '2',
      title: 'Serene Master Bedroom',
      category: 'Bedroom',
      image: 'https://images.unsplash.com/photo-1763478958711-dd84b33cfe16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwYmVkcm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc2NDU3OTUxN3ww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      id: '3',
      title: 'Elegant Living Room',
      category: 'Living',
      image: 'https://images.unsplash.com/photo-1611094016919-36b65678f3d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsaXZpbmclMjByb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY0NjI2NzA2fDA&ixlib=rb-4.1.0&q=80&w=1080'
    }
  ];

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div className={styles.projectDetail}>
      <div className={styles.container}>
        <Link to="/gallery" className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Portfolio
        </Link>

        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.imageSection}>
            <ImageWithFallback
              src={project.images[activeImage]}
              alt={project.title}
              className={styles.mainImage}
            />
            <div className={styles.thumbnails}>
              {project.images.map((image, index) => (
                <ImageWithFallback
                  key={index}
                  src={image}
                  alt={`${project.title} ${index + 1}`}
                  className={`${styles.thumbnail} ${activeImage === index ? styles.active : ''}`}
                  onClick={() => setActiveImage(index)}
                />
              ))}
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.category}>{project.category}</div>
            <h1 className={styles.title}>{project.title}</h1>
            <p className={styles.description}>{project.description}</p>

            <div className={styles.facts}>
              <h3>Project Details</h3>
              <div className={styles.fact}>
                <span className={styles.factLabel}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Location
                </span>
                <span className={styles.factValue}>{project.location}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Year
                </span>
                <span className={styles.factValue}>{project.year}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>
                  <Ruler size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Area
                </span>
                <span className={styles.factValue}>{project.area}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Materials</span>
                <div className={styles.materials}>
                  {project.materials.map((material, index) => (
                    <span key={index} className={styles.materialTag}>{material}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Link to="/contact">
                <Button variant="primary">Book a Consultation</Button>
              </Link>
              <Link to="/gallery">
                <Button variant="ghost">View More Projects</Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Before/After Comparison */}
        {project.beforeImage && project.afterImage && (
          <motion.div
            className={styles.beforeAfter}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Before & After</h2>
            <div 
              className={styles.comparisonSlider}
              onMouseMove={handleSliderMove}
            >
              <ImageWithFallback
                src={project.beforeImage}
                alt="Before"
                className={styles.comparisonImage}
              />
              <ImageWithFallback
                src={project.afterImage}
                alt="After"
                className={`${styles.comparisonImage} ${styles.afterImage}`}
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              />
              <div 
                className={styles.sliderHandle}
                style={{ left: `${sliderPosition}%` }}
              />
              <div className={`${styles.sliderLabel} ${styles.before}`}>Before</div>
              <div className={`${styles.sliderLabel} ${styles.after}`}>After</div>
            </div>
          </motion.div>
        )}

        {/* Related Projects */}
        <motion.div
          className={styles.related}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Related Projects</h2>
          <div className={styles.relatedGrid}>
            {relatedProjects.map((related) => (
              <Link key={related.id} to={`/project/${related.id}`} className={styles.relatedCard}>
                <ImageWithFallback src={related.image} alt={related.title} />
                <div className={styles.relatedOverlay}>
                  <h3>{related.title}</h3>
                  <p>{related.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
