import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, MapPin, Calendar } from 'lucide-react';
import { Button } from '../components/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Project } from '../types';
import * as api from '../services/api';
import styles from './Gallery.module.css';


const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Modern Minimalist Kitchen',
    category: 'Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1668026694348-b73c5eb5e299?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzY0NjQ4ODU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: [],
    location: 'Manhattan, NY',
    year: '2024',
    area: '450 sq ft',
    materials: ['Oak', 'Marble', 'Steel'],
    description: 'A contemporary kitchen design',
    tags: ['modern', 'minimalist'],
    featured: true
  },
  {
    id: '2',
    title: 'Serene Master Bedroom',
    category: 'Bedroom',
    imageUrl: 'https://images.unsplash.com/photo-1763478958711-dd84b33cfe16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwYmVkcm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc2NDU3OTUxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    images: [],
    location: 'Brooklyn, NY',
    year: '2024',
    area: '320 sq ft',
    materials: ['Linen', 'Walnut', 'Brass'],
    description: 'A peaceful bedroom retreat',
    tags: ['serene', 'cozy'],
    featured: true
  },
  {
    id: '3',
    title: 'Spa-Inspired Bathroom',
    category: 'Bathroom',
    imageUrl: 'https://images.unsplash.com/photo-1628602813528-0264682cdc87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwYmF0aHJvb20lMjBkZXNpZ258ZW58MXx8fHwxNzY0NjkzNTQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: [],
    location: 'Queens, NY',
    year: '2023',
    area: '180 sq ft',
    materials: ['Marble', 'Teak', 'Chrome'],
    description: 'Luxury spa bathroom',
    tags: ['spa', 'luxury'],
    featured: false
  },
  {
    id: '4',
    title: 'Elegant Living Room',
    category: 'Living',
    imageUrl: 'https://images.unsplash.com/photo-1611094016919-36b65678f3d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsaXZpbmclMjByb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY0NjI2NzA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: [],
    location: 'Manhattan, NY',
    year: '2024',
    area: '600 sq ft',
    materials: ['Velvet', 'Oak', 'Gold'],
    description: 'Sophisticated living space',
    tags: ['elegant', 'luxury'],
    featured: true
  },
  {
    id: '5',
    title: 'Contemporary Office',
    category: 'Office',
    imageUrl: 'https://images.unsplash.com/photo-1703355685639-d558d1b0f63e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBpbnRlcmlvciUyMGRlc2lnbnxlbnwxfHx8fDE3NjQ2OTM1OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    images: [],
    location: 'Tribeca, NY',
    year: '2024',
    area: '380 sq ft',
    materials: ['Glass', 'Steel', 'Concrete'],
    description: 'Modern workspace design',
    tags: ['modern', 'professional'],
    featured: false
  },
  {
    id: '6',
    title: 'Cozy Dining Space',
    category: 'Full Home',
    imageUrl: 'https://images.unsplash.com/photo-1650091722991-fde645dd72a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwZGluaW5nJTIwcm9vbXxlbnwxfHx8fDE3NjQ2MjM3Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    images: [],
    location: 'Williamsburg, NY',
    year: '2023',
    area: '280 sq ft',
    materials: ['Wood', 'Ceramic', 'Leather'],
    description: 'Warm dining area',
    tags: ['cozy', 'inviting'],
    featured: false
  }
];

const categories = ['All', 'Kitchen', 'Living', 'Bedroom', 'Full Home', 'Bathroom', 'Office'];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load images from API
  useEffect(() => {
    loadProjects();
  }, [selectedCategory]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const images = await api.getImages({ 
        status: 'published',
        category: selectedCategory 
      });
      
      // Convert images to projects format
      const convertedProjects: Project[] = images.map(img => ({
        id: img.id,
        title: `${img.category} Project - ${img.customerName}`,
        category: img.category,
        imageUrl: img.imageUrl,
        images: [img.imageUrl],
        location: 'New York', // Default location
        year: new Date(img.uploadedAt).getFullYear().toString(),
        area: '400 sq ft', // Default area
        materials: img.tags,
        description: img.description || `Beautiful ${img.category.toLowerCase()} design`,
        tags: img.tags,
        featured: false
      }));
      
      setProjects(convertedProjects);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load gallery images');
      // Fallback to mock data on error
      setProjects(mockProjects);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  const visibleProjects = filteredProjects.slice(0, 6);
  const hasMore = filteredProjects.length > 6;

  const handleLoadMore = () => {
    // For simplicity, we're not implementing pagination here
    // In a real-world scenario, you would fetch more data from the API
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span>Our Work</span>
          <h1>Portfolio</h1>
          <p>
            Explore our collection of thoughtfully designed spaces that blend cinematic vision with everyday living.
          </p>
        </motion.div>

        <motion.div
          className={styles.filterBar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.filterButton} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => {
                setSelectedCategory(category);
              }}
            >
              {category}
            </button>
          ))}
        </motion.div>

        <div className={styles.grid}>
          {visibleProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className={styles.gridItem}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/project/${project.id}`}>
                <div className={styles.imageWrapper}>
                  <ImageWithFallback
                    src={project.imageUrl}
                    alt={project.title}
                    className={styles.image}
                  />
                  <div className={styles.magnifyIcon}>
                    <Search size={28} />
                  </div>
                  <div className={styles.overlay}>
                    <div className={styles.category}>{project.category}</div>
                    <h3 className={styles.title}>{project.title}</h3>
                    <div className={styles.meta}>
                      <span><MapPin size={14} /> {project.location}</span>
                      <span><Calendar size={14} /> {project.year}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No Projects Found</h3>
            <p>Try selecting a different category</p>
          </div>
        )}

        {hasMore && (
          <div className={styles.loadMore}>
            <Button variant="secondary" onClick={handleLoadMore}>
              Load More Projects
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}