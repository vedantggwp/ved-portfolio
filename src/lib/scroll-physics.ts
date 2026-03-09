export type ScrollPhysicsConfig = {
  readonly end: string
  readonly scrub: number
  readonly pin: boolean
}

/**
 * Per-section ScrollTrigger configuration.
 * Durations are content-proportional:
 *   surface 1x, transitions 0.5x, pockets 1.5x, projects 2x, contact 0.75x
 * Scrub values create variable scroll feel (~30% variation):
 *   surface 1 (baseline), pockets 1.2 (~20% heavier), projects 1.5 (~50% heavier)
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

// --- Transition Membrane Resistance ---

export type TransitionResistanceConfig = {
  /** Normalized progress range [start, end] within the transition zone */
  readonly zone: readonly [number, number]
  /** Peak resistance multiplier (lower = more resistance, 0-1 range) */
  readonly basePeak: number
  /** Progress threshold where resistance releases ("pops" through) */
  readonly releasePoint: number
}

/**
 * Transition membrane resistance configuration.
 * Transition 2 is ~50% heavier than Transition 1 (lower basePeak = more resistance).
 */
export const TRANSITION_RESISTANCE: Readonly<
  Record<string, TransitionResistanceConfig>
> = {
  'transition-1': { zone: [0, 1], basePeak: 0.4, releasePoint: 0.8 },
  'transition-2': { zone: [0, 1], basePeak: 0.25, releasePoint: 0.8 },
} as const

/**
 * Ascending through transitions feels 50% lighter than descending.
 * Applied as a multiplier to the resistance effect (closer to 1 = less resistance).
 */
export const ASCENT_RESISTANCE_MULTIPLIER = 0.5

// PERF-03: Adaptive DPR via @react-three/drei PerformanceMonitor
// Implementation deferred to Phase 3 (requires R3F Canvas)
// Strategy: PerformanceMonitor watches frame rate, adjusts DPR between 1-2
// scrollStore.progress can be used to set baseline DPR expectations per depth
