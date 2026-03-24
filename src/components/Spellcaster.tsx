'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from './Spellcaster.module.css';

type ElementType = 'quas' | 'wex' | 'exort' | null;

export default function Spellcaster() {
  const [elements, setElements] = useState<ElementType[]>([null, null, null]);
  const [flash, setFlash] = useState<{ type: ElementType; active: boolean }>({
    type: null,
    active: false,
  });

  const triggerFlash = useCallback((type: ElementType) => {
    setFlash({ type, active: true });
    
    // Push new element to history (max 3)
    setElements((prev) => {
      const newElements = [...prev, type].slice(-3);
      return newElements as ElementType[];
    });

    // Remove flash class quickly to allow re-triggering and css transition
    setTimeout(() => {
      setFlash((f) => ({ ...f, active: false }));
    }, 100); 
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        e.metaKey || 
        e.ctrlKey || 
        e.altKey
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'q') triggerFlash('quas');
      else if (key === 'w') triggerFlash('wex');
      else if (key === 'e') triggerFlash('exort');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerFlash]);

  return (
    <div className={styles.spellcaster}>
      {/* 3 Active Orbs HUD */}
      <div className={styles.hud}>
        {elements.map((el, index) => (
          <div 
            key={index} 
            className={`${styles.orb} ${el ? styles[el] : ''}`}
          />
        ))}
      </div>

      {/* Screen Flash Layer */}
      <div 
        className={`
          ${styles.flash} 
          ${flash.type ? styles[`${flash.type}Flash`] : ''} 
          ${flash.active ? styles.active : ''}
        `} 
      />
    </div>
  );
}
