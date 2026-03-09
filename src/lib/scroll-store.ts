export type ScrollValues = {
  progress: number
  velocity: number
  direction: number
  section: string
  sectionProgress: number
}

const DEFAULT_VALUES: Readonly<ScrollValues> = {
  progress: 0,
  velocity: 0,
  direction: 1,
  section: 'surface',
  sectionProgress: 0,
} as const

/**
 * Mutable scroll value singleton.
 * INTENTIONALLY mutable -- consumers read via refs or rAF loops, never React state.
 * This avoids 60fps re-renders from scroll position changes.
 */
export const scrollStore: ScrollValues = { ...DEFAULT_VALUES }

type ScrollListener = (values: ScrollValues) => void

const listeners: ScrollListener[] = []

/** Update scroll store values and notify all listeners. */
export function updateScrollStore(partial: Partial<ScrollValues>): void {
  Object.assign(scrollStore, partial)
  for (const fn of listeners) {
    fn(scrollStore)
  }
}

/** Subscribe to scroll store changes. Returns an unsubscribe function. */
export function onScrollChange(fn: ScrollListener): () => void {
  listeners.push(fn)
  return () => {
    const idx = listeners.indexOf(fn)
    if (idx !== -1) {
      listeners.splice(idx, 1)
    }
  }
}

/** Reset scroll store to defaults. For testing only. */
export function resetScrollStore(): void {
  Object.assign(scrollStore, DEFAULT_VALUES)
  listeners.length = 0
}
