'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { scrollStore, updateScrollStore } from '@/lib/scroll-store'
import {
  SCROLL_PHYSICS,
  TRANSITION_RESISTANCE,
  ASCENT_RESISTANCE_MULTIPLIER,
} from '@/lib/scroll-physics'
import { SECTIONS } from '@/lib/sections'

gsap.registerPlugin(ScrollTrigger)

/**
 * Calculate transition membrane resistance multiplier.
 * Returns a value between 0-1 where lower = more resistance.
 * Non-transition sections return 1 (no resistance).
 *
 * Build phase: resistance increases via sine curve up to releasePoint.
 * Release phase: resistance drops rapidly back to 1 (the "pop" through).
 * Ascending direction gets 50% less resistance (surfacing = relief).
 */
export function getTransitionResistance(
  progress: number,
  direction: number,
  transitionId: string
): number {
  const config = TRANSITION_RESISTANCE[transitionId]
  if (!config) return 1

  const dirMultiplier =
    direction === -1 ? ASCENT_RESISTANCE_MULTIPLIER : 1.0

  if (progress < config.releasePoint) {
    // Build phase: resistance increases via sine curve
    const buildProgress = progress / config.releasePoint
    return (
      1 -
      (1 - config.basePeak) *
        Math.sin(buildProgress * Math.PI * 0.5) *
        dirMultiplier
    )
  }

  // Release phase: resistance drops rapidly back to 1 (the "pop")
  const releaseProgress =
    (progress - config.releasePoint) / (1 - config.releasePoint)
  const currentResistance =
    1 -
    (1 - config.basePeak) *
      Math.sin(1 * Math.PI * 0.5) *
      dirMultiplier
  return currentResistance + (1 - currentResistance) * releaseProgress
}

type ScrollEngineProps = {
  readonly children: React.ReactNode
}

export function ScrollEngine({ children }: ScrollEngineProps) {
  const prefersReduced = useReducedMotion()
  const lenisRef = useRef<Lenis | null>(null)
  const tickerCallbackRef = useRef<((time: number) => void) | null>(null)

  // Initialize Lenis (not a GSAP animation, so useEffect not useGSAP)
  useEffect(() => {
    if (prefersReduced) return

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    })

    lenisRef.current = lenis

    // Sync Lenis scroll events -> ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Sync GSAP ticker -> Lenis RAF
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    tickerCallbackRef.current = tickerCallback
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    // Update mutable scroll store and apply membrane resistance on each scroll event
    lenis.on(
      'scroll',
      ({
        progress,
        velocity,
        direction,
      }: {
        progress: number
        velocity: number
        direction: number
      }) => {
        updateScrollStore({ progress, velocity, direction })

        // Apply transition membrane resistance to Lenis wheel multiplier
        const currentSection = scrollStore.section
        const resistance = getTransitionResistance(
          scrollStore.sectionProgress,
          direction,
          currentSection
        )

        if (TRANSITION_RESISTANCE[currentSection]) {
          lenis.options.wheelMultiplier = resistance
          lenis.options.touchMultiplier = resistance
        } else {
          lenis.options.wheelMultiplier = 1
          lenis.options.touchMultiplier = 1
        }
      }
    )

    // Expose scroll store and resistance function on window for e2e tests
    if (typeof window !== 'undefined') {
      const win = window as unknown as Record<string, unknown>
      win.__scrollStore = scrollStore
      win.__SCROLL_STORE_READS__ = 0
      win.__getTransitionResistance = getTransitionResistance
    }

    return () => {
      lenis.destroy()
      if (tickerCallbackRef.current) {
        gsap.ticker.remove(tickerCallbackRef.current)
      }
      ScrollTrigger.getAll().forEach((st) => st.kill())
      lenisRef.current = null
    }
  }, [prefersReduced])

  // Create ScrollTrigger instances for each section (GSAP animation context)
  useGSAP(
    () => {
      if (prefersReduced) return

      for (const section of SECTIONS) {
        const config = SCROLL_PHYSICS[section.id]
        if (!config) continue

        ScrollTrigger.create({
          trigger: `#${section.id}`,
          start: 'top top',
          end: config.end,
          pin: config.pin,
          scrub: config.scrub,
          onUpdate: (self) => {
            updateScrollStore({
              section: section.id,
              sectionProgress: self.progress,
            })
          },
        })
      }

      // Debounced resize handler to refresh ScrollTrigger positions
      let resizeTimer: ReturnType<typeof setTimeout> | null = null
      const handleResize = () => {
        if (resizeTimer) clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          ScrollTrigger.refresh()
        }, 200)
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        if (resizeTimer) clearTimeout(resizeTimer)
      }
    },
    { dependencies: [prefersReduced] }
  )

  // Reduced motion: render children without Lenis/GSAP
  return <>{children}</>
}
