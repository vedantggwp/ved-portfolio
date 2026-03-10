'use client'

import { useEffect, useRef, useCallback } from 'react'
import { scrollStore } from '@/lib/scroll-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import styles from './Provocation.module.css'

const LINE_1 = 'The closer you look at one thing,'
const LINE_2 = 'the more it resembles everything else.'

/**
 * Provocation -- cryptic two-line couplet that fades in over the monolith,
 * then parallax-drifts upward and fades out on scroll.
 *
 * Animation strategy:
 * - Entrance: CSS @keyframes fadeIn with staggered delay (line1: 0.5s, line2: 1s)
 * - Exit: rAF loop reads scrollStore.sectionProgress for parallax + opacity
 * - Reduced motion: static text at full opacity, no animations
 */
export function Provocation() {
  const prefersReduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  const startScrollAnimation = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const tick = () => {
      const progress = scrollStore.sectionProgress

      // Parallax drift: translate upward at ~60% of scroll speed
      const translateY = -(progress * 40)
      // Fade out simultaneously
      const opacity = Math.max(0, 1 - progress)

      el.style.transform = `translate(-50%, -50%) translateY(${translateY}vh)`
      el.style.opacity = String(opacity)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (prefersReduced) return

    const el = containerRef.current
    if (!el) return

    // Wait for line 2 entrance animation to finish before starting scroll animation
    const line2 = el.querySelector('[data-line="2"]')
    if (!line2) {
      // Fallback: start immediately if line2 not found
      startScrollAnimation()
      return
    }

    const handleAnimationEnd = () => {
      line2.removeEventListener('animationend', handleAnimationEnd)
      startScrollAnimation()
    }

    line2.addEventListener('animationend', handleAnimationEnd)

    return () => {
      line2.removeEventListener('animationend', handleAnimationEnd)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [prefersReduced, startScrollAnimation])

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  if (prefersReduced) {
    return (
      <div className={styles.static} aria-label="Provocation">
        <p className={styles.line} data-line="1">
          {LINE_1}
        </p>
        <p className={`${styles.line} ${styles.line2}`} data-line="2">
          {LINE_2}
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={styles.container}
      aria-label="Provocation"
    >
      <p className={styles.line1} data-line="1">
        {LINE_1}
      </p>
      <p className={styles.line2} data-line="2">
        {LINE_2}
      </p>
    </div>
  )
}
