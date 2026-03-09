export type ScrollPhysicsConfig = {
  readonly end: string
  readonly scrub: number
  readonly pin: boolean
}

/**
 * Per-section ScrollTrigger configuration.
 * Durations are content-proportional:
 *   surface 1x, transitions 0.5x, pockets 1.5x, projects 2x, contact 0.75x
 */
export const SCROLL_PHYSICS: Readonly<Record<string, ScrollPhysicsConfig>> = {
  'surface': { end: '+=100vh', scrub: 1, pin: true },
  'transition-1': { end: '+=50vh', scrub: 0.5, pin: false },
  'pocket-1': { end: '+=150vh', scrub: 1.2, pin: true },
  'pocket-2': { end: '+=150vh', scrub: 1.2, pin: true },
  'pocket-3': { end: '+=150vh', scrub: 1.2, pin: true },
  'transition-2': { end: '+=50vh', scrub: 0.5, pin: false },
  'projects': { end: '+=200vh', scrub: 1.5, pin: true },
  'contact': { end: '+=75vh', scrub: 1, pin: false },
} as const
