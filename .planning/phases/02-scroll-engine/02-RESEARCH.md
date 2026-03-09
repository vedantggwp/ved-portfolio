# Phase 2: Scroll Engine - Research

**Researched:** 2026-03-09
**Domain:** Smooth scroll, scroll-driven animation, performance optimization
**Confidence:** HIGH

## Summary

Phase 2 builds the scroll infrastructure that every subsequent phase depends on. The core stack is Lenis (smooth scroll) synced with GSAP ScrollTrigger (section pinning, scrub-driven animations, variable scroll distances). A mutable scroll store (vanilla object mutated via `lenis.on('scroll')`, never React state) feeds scroll values to consumers at 60fps without triggering React re-renders.

The critical integration pattern is well-established: Lenis drives the smooth scroll feel, GSAP's ticker calls `lenis.raf()` each frame, and `lenis.on('scroll', ScrollTrigger.update)` keeps them in sync. Variable scroll "physics" are achieved not by modifying Lenis speed per-section, but by controlling the `end` scroll distance on each ScrollTrigger instance -- longer distances = slower perceived scroll through that section. Transition "membrane" resistance is implemented by intercepting wheel events and applying a progressive multiplier that builds then releases.

**Primary recommendation:** Use Lenis 1.3.x + GSAP 3.14.x with `@gsap/react` for cleanup. Variable scroll feel via ScrollTrigger `end` distances, not Lenis `wheelMultiplier` changes. Mutable scroll store as a plain object (not zustand) read via refs -- simplest path to zero re-renders.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- ~30% speed variation between sections -- noticeable but smooth, subconscious not jarring
- Progressive deepening: scroll starts light at surface, gets heavier as user descends
- Reverses on ascend: scrolling up feels lighter and faster (surfacing = relief)
- Deep layer (projects + floor): calm and steady -- constant measured pace
- Build-and-release membrane mechanic: resistance increases progressively, then "pops" through with brief ease
- Transition 2 is ~50% heavier than Transition 1
- Ascending through transitions: ~50% of downward resistance
- Physics only -- no visual feedback during resistance (Phase 6's job)
- Content-proportional scroll durations: Surface 1x, Pockets 1.5x, Transitions 0.5x, Projects 2x, Floor 0.75x
- Pin content sections (pockets and projects); transitions scroll through continuously
- No scroll progress indicators within pinned sections
- Surface pins with fade-in: provocation text fades in, holds, then releases
- Reduced motion: disable Lenis entirely, native browser scroll, no variable physics/pinning/resistance, keep proportional section heights

### Claude's Discretion
- Exact Lenis configuration values (lerp, duration, wheelMultiplier)
- GSAP ScrollTrigger scrub values and easing curves per section
- Mutable scroll store implementation pattern (zustand vs vanilla ref store)
- Progressive loading threshold distances
- Adaptive DPR implementation details
- Exact scroll distance multipliers within ~30% variation range

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-02 | Smooth scroll via Lenis synced with GSAP ScrollTrigger without desync | Lenis+GSAP ticker integration pattern verified; `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add()` sync pattern |
| FOUND-03 | Mutable scroll store drives all 60fps values (never React state) | Vanilla mutable object pattern; consumers read via refs or direct property access, no useState |
| SCRL-01 | Depth-based navigation: Surface -> T1 -> Mid (3 pockets) -> T2 -> Deep -> Floor | Section config already in `sections.ts`; map each to ScrollTrigger instances with unique `end` distances |
| SCRL-02 | Camera moves forward (z-axis) on scroll creating dive-into-depth feeling | Scroll store exposes `scrollProgress` (0-1); R3F camera consumes this in Phase 3 -- Phase 2 just provides the value |
| SCRL-03 | Sections pin via ScrollTrigger with scrub | ScrollTrigger `pin: true` + `scrub: 1` per section; use `useGSAP` for cleanup |
| SCRL-04 | Variable scroll physics per section -- fluid, dense, still | Different ScrollTrigger `end` values per section type; longer end = slower perceived scroll |
| SCRL-05 | Transition zones have scroll resistance (membrane effect) then release | Custom wheel event interceptor during transition zones; progressive damping factor with ease-out release |
| PERF-02 | Progressive loading per depth layer (lazy mount approaching sections) | IntersectionObserver with generous rootMargin to mount/unmount section children |
| PERF-03 | Adaptive DPR based on frame rate (PerformanceMonitor) | R3F PerformanceMonitor from @react-three/drei -- research documented but implementation deferred to Phase 3 when R3F is installed |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lenis | 1.3.18 | Smooth scroll engine | Industry standard from darkroom.engineering; lightweight, plays well with ScrollTrigger |
| gsap | 3.14.2 | Animation platform + ScrollTrigger plugin | De facto standard for scroll-driven animations; free including all plugins |
| @gsap/react | 2.1.2 | React integration (useGSAP hook) | Official React bindings; auto-cleanup via gsap.context() on unmount |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | Mutable scroll store | Use vanilla JS object -- no library needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla mutable store | zustand with subscribe() | zustand adds a dependency for a pattern achievable with a plain object + callbacks; vanilla is simpler for this use case |
| Lenis | GSAP ScrollSmoother | ScrollSmoother is GSAP's own smooth scroller but Lenis is the community standard and the user's chosen tool |

**Installation:**
```bash
npm install lenis gsap @gsap/react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── SectionShell.tsx       # Existing -- add ref forwarding for ScrollTrigger targets
│   ├── ScrollEngine.tsx       # Client-only Lenis+GSAP orchestrator
│   └── LazySection.tsx        # IntersectionObserver lazy-mount wrapper
├── hooks/
│   ├── useReducedMotion.ts    # Existing
│   └── useScrollStore.ts      # Hook to subscribe to mutable store values
├── lib/
│   ├── sections.ts            # Existing -- extend with scroll physics config
│   ├── scroll-store.ts        # Mutable scroll store (plain object + event emitter)
│   └── scroll-physics.ts      # Per-section ScrollTrigger config (end distances, scrub values)
└── app/
    ├── layout.tsx             # Wrap children with ScrollEngine
    └── page.tsx               # Existing
```

### Pattern 1: Lenis + GSAP Sync (The Bridge)
**What:** Single client component that initializes Lenis, syncs it with GSAP's ticker, and connects ScrollTrigger.
**When to use:** Once at app root, gated by reduced-motion check.
**Example:**
```typescript
// Source: Lenis GitHub README + GSAP official docs
'use client'

import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

export function ScrollEngine({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return // Native scroll when reduced motion

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    })
    lenisRef.current = lenis

    // Sync Lenis -> ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Sync GSAP ticker -> Lenis RAF
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(lenis.raf)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [reducedMotion])

  return <>{children}</>
}
```

### Pattern 2: Mutable Scroll Store (Zero Re-renders)
**What:** A plain JS object that gets mutated on every scroll event. Consumers read it imperatively (via refs or in rAF loops), never via React state.
**When to use:** For all scroll-dependent values (progress, velocity, direction, current section).
**Example:**
```typescript
// scroll-store.ts
type ScrollValues = {
  progress: number    // 0-1 overall scroll progress
  velocity: number    // current scroll velocity
  direction: number   // 1 = down, -1 = up
  section: string     // current section ID
  sectionProgress: number // 0-1 within current section
}

// Mutable singleton -- NEVER use with useState
export const scrollStore: ScrollValues = {
  progress: 0,
  velocity: 0,
  direction: 1,
  section: 'surface',
  sectionProgress: 0,
}

// Typed callback list for non-React consumers (R3F, audio, etc.)
type ScrollListener = (values: ScrollValues) => void
const listeners: ScrollListener[] = []

export function onScrollChange(fn: ScrollListener): () => void {
  listeners.push(fn)
  return () => {
    const i = listeners.indexOf(fn)
    if (i >= 0) listeners.splice(i, 1)
  }
}

export function updateScrollStore(partial: Partial<ScrollValues>) {
  Object.assign(scrollStore, partial)
  for (const fn of listeners) fn(scrollStore)
}
```

### Pattern 3: Variable Scroll Duration via ScrollTrigger `end`
**What:** Each section gets a unique ScrollTrigger with a different `end` value. Longer `end` = more scroll distance = slower perceived movement through that section.
**When to use:** For all pinned sections to create the depth-based speed variation.
**Example:**
```typescript
// scroll-physics.ts
// Base unit = viewport height
const BASE = '+=100vh'

export const SCROLL_PHYSICS = {
  surface:      { end: '+=100vh',  scrub: 1,   pin: true  },  // 1x -- brief
  'transition-1': { end: '+=50vh',   scrub: 0.5, pin: false }, // 0.5x -- passage
  'pocket-1':   { end: '+=150vh',  scrub: 1.2, pin: true  },  // 1.5x -- reading
  'pocket-2':   { end: '+=150vh',  scrub: 1.2, pin: true  },  // 1.5x
  'pocket-3':   { end: '+=150vh',  scrub: 1.2, pin: true  },  // 1.5x
  'transition-2': { end: '+=50vh',   scrub: 0.5, pin: false }, // 0.5x -- passage
  projects:     { end: '+=200vh',  scrub: 1.5, pin: true  },  // 2x -- discoveries
  contact:      { end: '+=75vh',   scrub: 1,   pin: false },  // 0.75x -- payoff
} as const
```

### Pattern 4: Transition Membrane Resistance
**What:** During transition zones, intercept wheel/touch events and apply a progressive damping factor that builds then releases with an ease.
**When to use:** For transition-1 and transition-2 sections only.
**Example:**
```typescript
// Conceptual pattern -- applied in ScrollEngine
// When scrollProgress enters a transition zone:
// 1. Calculate how deep into the transition (0-1)
// 2. Apply resistance curve: starts at 1x, peaks at 0.3x midway
// 3. At ~80% through, resistance drops rapidly (the "pop")
// 4. Direction-aware: ascending resistance is 50% of descending

function getTransitionResistance(
  progress: number,   // 0-1 through the transition
  direction: number,  // 1 = down, -1 = up
  transitionIndex: number // 1 or 2
): number {
  const basePeak = transitionIndex === 1 ? 0.4 : 0.25 // T2 is heavier
  const dirMultiplier = direction === -1 ? 0.5 : 1.0   // Ascending = lighter

  // Build phase (0-0.8): resistance increases
  if (progress < 0.8) {
    const buildProgress = progress / 0.8
    const curve = Math.sin(buildProgress * Math.PI * 0.5) // ease-in
    return 1 - (1 - basePeak) * curve * dirMultiplier
  }
  // Release phase (0.8-1.0): resistance drops rapidly
  const releaseProgress = (progress - 0.8) / 0.2
  const current = basePeak * dirMultiplier
  return current + (1 - current) * releaseProgress // ease back to 1
}
```

### Anti-Patterns to Avoid
- **Storing scroll position in React state:** Causes 60 re-renders/second. Use mutable store + refs instead.
- **Using Lenis `wheelMultiplier` for per-section speed:** Lenis config is global. Use ScrollTrigger `end` distances for per-section control.
- **Animating the pinned element itself:** ScrollTrigger docs explicitly warn against this -- it throws off measurements. Animate children of the pinned element.
- **Nesting ScrollTrigger pins:** Multiple nested pins cause layout calculation errors. Each pin should be a direct child of the scroll container.
- **Skipping `gsap.context()` cleanup in React:** Causes memory leaks and stale ScrollTrigger instances on re-render/unmount. Always use `useGSAP` or manual context cleanup.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth scroll | Custom rAF scroll interpolation | Lenis | Edge cases: momentum, touch, keyboard, focus management, accessibility |
| Scroll-linked animations | Manual scroll listeners + transforms | GSAP ScrollTrigger | Handles pin spacing, scrub timing, resize recalculation, mobile quirks |
| React animation cleanup | Manual cleanup in useEffect | @gsap/react useGSAP | gsap.context() auto-reverts all animations/ScrollTriggers created in scope |
| Intersection observation | Custom scroll position math | IntersectionObserver API | Browser-native, off-main-thread, handles edge cases |
| Frame rate monitoring | Manual fps counting | PerformanceMonitor (drei) | Handles averaging, flipping, callbacks -- proven in R3F ecosystem |

**Key insight:** The Lenis+GSAP bridge is a well-trodden path with known patterns. The value is in the configuration (per-section physics, transition resistance) not in custom scroll mechanics.

## Common Pitfalls

### Pitfall 1: Lenis/ScrollTrigger Desync on Resize
**What goes wrong:** Window resize causes ScrollTrigger to recalculate positions but Lenis's smooth scroll position diverges, causing pins to jump or content to overlap.
**Why it happens:** ScrollTrigger.refresh() runs but Lenis's internal scroll value hasn't caught up.
**How to avoid:** Call `ScrollTrigger.refresh()` after Lenis completes its resize handling. Use a debounced resize handler that calls both.
**Warning signs:** Pins jumping when resizing browser window; content overlapping after orientation change.

### Pitfall 2: Pin-Spacer Layout Breakage in Next.js
**What goes wrong:** ScrollTrigger wraps pinned elements in a `.pin-spacer` div, which can break layouts when using CSS Grid or Flexbox on the parent.
**Why it happens:** The injected wrapper div inherits/breaks parent layout rules.
**How to avoid:** Ensure pinned sections are direct children of a simple block-flow container (not grid/flex). Use `pinSpacing: true` (default) and test layout after pinning. Consider `pinType: "fixed"` vs `"transform"`.
**Warning signs:** Large blank gaps between sections; sections overlapping; pin-spacer with wrong height.

### Pitfall 3: React Strict Mode Double-Initialization
**What goes wrong:** In development, React 18+ strict mode mounts/unmounts/remounts components, causing Lenis and ScrollTrigger to initialize twice.
**Why it happens:** React's strict mode development behavior for catching side-effect bugs.
**How to avoid:** Use `useGSAP` from @gsap/react which handles cleanup correctly. For Lenis, ensure destroy() is called in the cleanup function. Don't store instances in module-level variables.
**Warning signs:** Double scroll speed; animations running twice as fast; duplicate ScrollTrigger instances.

### Pitfall 4: Scroll Store Causing React Re-renders
**What goes wrong:** Developer accidentally uses useState or zustand reactive state for scroll values, causing 60 re-renders/second and janky scroll.
**Why it happens:** Natural React instinct to use state for changing values.
**How to avoid:** Enforce the mutable store pattern. Consumers must use refs, useGSAP callbacks, or direct property reads in rAF loops. Never expose scroll values through React context or useState.
**Warning signs:** React DevTools showing constant re-renders during scroll; dropped frames; sluggish scroll feel.

### Pitfall 5: Lazy-Mount Sections Breaking ScrollTrigger Measurements
**What goes wrong:** If a section unmounts (lazy loading), ScrollTrigger loses its trigger element and all subsequent pin positions are wrong.
**Why it happens:** ScrollTrigger calculates all positions on creation/refresh; removing DOM elements invalidates those calculations.
**How to avoid:** Lazy-mount section *children* (content), not the section containers themselves. Section shells with their height-defining CSS must always be in the DOM. Use `visibility: hidden` or empty shells for far-away sections.
**Warning signs:** Pins at wrong positions after scrolling back up; content jumping when sections mount/unmount.

### Pitfall 6: GSAP lagSmoothing Interference
**What goes wrong:** Scroll feels stuttery because GSAP's built-in lag smoothing interferes with Lenis's own interpolation.
**Why it happens:** Both Lenis and GSAP try to smooth the animation independently.
**How to avoid:** Always call `gsap.ticker.lagSmoothing(0)` when using Lenis. This is documented but easily forgotten.
**Warning signs:** Scroll feels "double-smoothed" or has occasional micro-stutters.

## Code Examples

### Lenis CSS (Required)
```css
/* Add to globals.css */
html.lenis, html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-scrolling iframe {
  pointer-events: none;
}
```

### ScrollTrigger Section Setup with useGSAP
```typescript
// Source: GSAP official React docs + ScrollTrigger docs
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCROLL_PHYSICS } from '@/lib/scroll-physics'
import { updateScrollStore } from '@/lib/scroll-store'

gsap.registerPlugin(ScrollTrigger)

export function useSectionScrollTrigger(
  sectionId: string,
  containerRef: React.RefObject<HTMLElement | null>
) {
  useGSAP(() => {
    const el = containerRef.current
    if (!el) return

    const config = SCROLL_PHYSICS[sectionId as keyof typeof SCROLL_PHYSICS]
    if (!config) return

    ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: config.end,
      pin: config.pin,
      scrub: config.scrub,
      onUpdate: (self) => {
        updateScrollStore({
          section: sectionId,
          sectionProgress: self.progress,
        })
      },
    })
  }, { scope: containerRef })
}
```

### Reduced-Motion Fallback
```typescript
// When reduced motion is active:
// 1. Do NOT initialize Lenis
// 2. Do NOT create ScrollTrigger instances
// 3. Keep section heights proportional via CSS
// 4. Content flows with native scroll

// globals.css addition for reduced-motion proportional heights
/*
@media (prefers-reduced-motion: reduce) {
  #surface      { min-height: 100vh; }
  #transition-1 { min-height: 50vh; }
  #pocket-1,
  #pocket-2,
  #pocket-3     { min-height: 150vh; }
  #transition-2 { min-height: 50vh; }
  #projects     { min-height: 200vh; }
  #contact      { min-height: 75vh; }
}
*/
```

### Lazy Section Mount via IntersectionObserver
```typescript
'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'

type LazySectionProps = {
  readonly children: ReactNode
  readonly rootMargin?: string
}

export function LazySection({
  children,
  rootMargin = '200% 0px',  // Mount 2 viewports ahead
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMounted(true)
        // Don't unmount -- once mounted, stay mounted
        // (unmounting breaks ScrollTrigger measurements)
      },
      { rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return <div ref={ref}>{mounted ? children : null}</div>
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @studio-freight/lenis | lenis (renamed package) | 2024 | Import from `lenis` not `@studio-freight/lenis` |
| GSAP Club membership for ScrollTrigger | GSAP fully free (all plugins) | Late 2024 | No license concerns; ScrollTrigger, SplitText all free |
| scrollerProxy for Lenis sync | Direct ticker integration | 2023+ | Simpler setup; no proxy needed |
| Manual gsap.context cleanup | @gsap/react useGSAP hook | 2024 | Auto cleanup; drop-in useEffect replacement |

**Deprecated/outdated:**
- `@studio-freight/lenis`: Renamed to `lenis`. Old package is deprecated.
- `@studio-freight/react-lenis`: Use `lenis/react` subpath import instead.
- `ScrollTrigger.scrollerProxy()` for Lenis: The ticker-based sync pattern is simpler and recommended.

## Open Questions

1. **Exact scrub values for "heavy" vs "light" feel**
   - What we know: `scrub: 1` = 1 second catch-up; higher = floatier
   - What's unclear: Optimal values for the ~30% speed variation require testing
   - Recommendation: Start with scrub 0.8-1.5 range, tune by feel

2. **Membrane resistance implementation approach**
   - What we know: Lenis accepts a custom `modifyTarget` option; wheel events can be intercepted
   - What's unclear: Whether to use Lenis's built-in event modification or a separate wheel event listener
   - Recommendation: Use Lenis's scroll event callback to detect transition zones, then dynamically adjust via `lenis.options` or a scroll velocity dampener

3. **Lazy-mount unmounting strategy**
   - What we know: Unmounting section containers breaks ScrollTrigger; mount-only is safe
   - What's unclear: Memory impact of never unmounting on very long pages
   - Recommendation: Mount-only for v1 (8 sections is small); revisit if memory profiling shows issues

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 |
| Config file | `playwright.config.ts` |
| Quick run command | `npx playwright test tests/scroll.spec.ts --project=chromium` |
| Full suite command | `npx playwright test --project=chromium` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-02 | Lenis + ScrollTrigger sync without desync | e2e | `npx playwright test tests/scroll.spec.ts -g "smooth scroll" --project=chromium` | No -- Wave 0 |
| FOUND-03 | Mutable scroll store, no React re-renders | e2e | `npx playwright test tests/scroll.spec.ts -g "no rerender" --project=chromium` | No -- Wave 0 |
| SCRL-01 | Depth-based section order in DOM | e2e | `npx playwright test tests/scroll.spec.ts -g "section order" --project=chromium` | No -- Wave 0 |
| SCRL-03 | Sections pin during scroll | e2e | `npx playwright test tests/scroll.spec.ts -g "pin" --project=chromium` | No -- Wave 0 |
| SCRL-04 | Variable scroll distance per section type | e2e | `npx playwright test tests/scroll.spec.ts -g "variable" --project=chromium` | No -- Wave 0 |
| SCRL-05 | Transition membrane resistance | e2e | `npx playwright test tests/scroll.spec.ts -g "membrane" --project=chromium` | No -- Wave 0 |
| PERF-02 | Sections lazy-mount when approaching viewport | e2e | `npx playwright test tests/scroll.spec.ts -g "lazy" --project=chromium` | No -- Wave 0 |
| SCRL-02 | Scroll store exposes progress value (0-1) | e2e | `npx playwright test tests/scroll.spec.ts -g "progress" --project=chromium` | No -- Wave 0 |
| PERF-03 | Adaptive DPR via PerformanceMonitor | manual-only | N/A -- requires R3F Canvas (Phase 3) | N/A |

### Sampling Rate
- **Per task commit:** `npx playwright test tests/scroll.spec.ts --project=chromium`
- **Per wave merge:** `npx playwright test --project=chromium`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/scroll.spec.ts` -- covers FOUND-02, FOUND-03, SCRL-01 through SCRL-05, PERF-02
- [ ] Test helpers for programmatic scroll simulation in Playwright (`page.mouse.wheel()`, `page.evaluate(() => window.scrollTo())`)

## Sources

### Primary (HIGH confidence)
- [Lenis GitHub](https://github.com/darkroomengineering/lenis) - Configuration options, GSAP integration pattern, React setup
- [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) - Pin, scrub, end values, scrollerProxy
- [GSAP React Docs](https://gsap.com/resources/React/) - useGSAP hook, cleanup patterns
- [lenis npm](https://www.npmjs.com/package/lenis) - Version 1.3.18 confirmed
- [gsap npm](https://www.npmjs.com/package/gsap) - Version 3.14.2 confirmed, all plugins free

### Secondary (MEDIUM confidence)
- [GSAP Forums - Lenis+ScrollTrigger patterns](https://gsap.com/community/forums/topic/40426-patterns-for-synchronizing-scrolltrigger-and-lenis-in-reactnext/) - Community-verified sync patterns
- [GSAP Forums - Pin issues in React](https://gsap.com/community/forums/topic/40434-pin-spacer-breaks-ui-when-using-scrollertrigger-with-nextjs/) - Known pin-spacer issues in Next.js
- [R3F Scaling Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) - PerformanceMonitor API and adaptive DPR

### Tertiary (LOW confidence)
- Transition membrane resistance pattern - Conceptual design based on Lenis event system; needs validation through implementation and testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified on npm with current versions; integration pattern confirmed across multiple official sources
- Architecture: HIGH - Patterns drawn from official docs (GSAP, Lenis) and verified community implementations
- Pitfalls: HIGH - Multiple GSAP forum threads document these exact issues in React/Next.js
- Membrane resistance: MEDIUM - Pattern is sound but specific implementation needs tuning through testing
- Adaptive DPR: MEDIUM - API documented but implementation deferred to Phase 3 (requires R3F)

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable libraries, 30-day validity)
