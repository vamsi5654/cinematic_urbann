import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import * as api from '../services/api';
import styles from './EventPopup.module.css';

interface Event {
  id: string;
  title: string;
  message: string;
  image_url?: string;
  scheduled_date: string;
  scheduled_time: string;
}

export function EventPopup() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [dismissedEvents, setDismissedEvents] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed events from localStorage
    const dismissed = localStorage.getItem('dismissedEvents');
    if (dismissed) {
      setDismissedEvents(JSON.parse(dismissed));
    }

    // Fetch active events for today
    api.getActiveEvents()
      .then((fetchedEvents) => {
        if (fetchedEvents.length > 0) {
          setEvents(fetchedEvents);
        }
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
      });
  }, []);

  useEffect(() => {
    if (events.length === 0) return;

    // Filter out dismissed events
    const undismissedEvents = events.filter(
      (event) => !dismissedEvents.includes(event.id)
    );

    if (undismissedEvents.length === 0) return;

    // Get current time
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Find events that should be shown now
    const currentEvent = undismissedEvents.find((event) => {
      const eventTime = event.scheduled_time;
      // Show event if current time is within 5 minutes of scheduled time
      const timeDiff = getTimeDifferenceMinutes(currentTime, eventTime);
      return timeDiff >= 0 && timeDiff <= 5;
    });

    if (currentEvent) {
      setShowPopup(true);
      setCurrentEventIndex(events.findIndex((e) => e.id === currentEvent.id));
    }

    // Check every minute for new events
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const currentEvent = undismissedEvents.find((event) => {
        const eventTime = event.scheduled_time;
        const timeDiff = getTimeDifferenceMinutes(currentTime, eventTime);
        return timeDiff >= 0 && timeDiff <= 5;
      });

      if (currentEvent && !showPopup) {
        setShowPopup(true);
        setCurrentEventIndex(events.findIndex((e) => e.id === currentEvent.id));
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [events, dismissedEvents, showPopup]);

  const getTimeDifferenceMinutes = (time1: string, time2: string): number => {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;
    return minutes2 - minutes1;
  };

  const handleDismiss = () => {
    if (events[currentEventIndex]) {
      const newDismissed = [...dismissedEvents, events[currentEventIndex].id];
      setDismissedEvents(newDismissed);
      localStorage.setItem('dismissedEvents', JSON.stringify(newDismissed));
    }
    setShowPopup(false);
  };

  if (!showPopup || events.length === 0 || !events[currentEventIndex]) {
    return null;
  }

  const currentEvent = events[currentEventIndex];

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />
          <motion.div
            className={styles.popup}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <button className={styles.closeButton} onClick={handleDismiss}>
              <X size={24} />
            </button>

            {currentEvent.image_url && (
              <div className={styles.imageContainer}>
                <ImageWithFallback
                  src={currentEvent.image_url}
                  alt={currentEvent.title}
                  className={styles.image}
                />
              </div>
            )}

            <div className={styles.content}>
              <h2 className={styles.title}>{currentEvent.title}</h2>
              <p className={styles.message}>{currentEvent.message}</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
