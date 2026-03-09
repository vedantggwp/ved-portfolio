---
phase: 02-scroll-engine
plan: 01
subsystem: ui
tags: [lenis, gsap, scrolltrigger, smooth-scroll, scroll-store]

requires:
  - phase: 01-scaffold-fonts-a11y-primitives
    provides: Section layout, SectionShell, useReducedMotion, ARIA landmarks, Playwright config
provides:
  - Lenis smooth scroll with GSAP ScrollTrigger bridge
  - Mutable scroll store singleton (progress, velocity, direction, section, sectionProgress)
  - Per-section scroll physics configuration (pin, scrub, duration)
  - ScrollEngine client component wrapping layout
  - SectionShell with forwardRef and children support
  - Reduced-motion fallback with native browser scroll
affects: [03-monolith-r3f, 04-surface-mid-content, 05-mid-depth-content, 06-transitions, 07-deep-floor-content, 09-audio]

tech-stack:
  added: [lenis, gsap, "@gsap/react"]
  patterns: [mutable-singleton-store, lenis-gsap-ticker-bridge, content-proportional-scroll-duration]

key-files:
  created:
    - src/lib/scroll-store.ts
    - src/lib/scroll-physics.ts
    - src/components/ScrollEngine.tsx
    - tests/scroll.spec.ts
  modified:
    - src/components/SectionShell.tsx
    - src/app/layout.tsx
    - src/app/globals.css
    - package.json

key-decisions:
  - "Mutable singleton store over React state to avoid 60fps re-renders"
  - "Content-proportional scroll durations: surface 1x, pockets 1.5x, projects 2x"
  - "useEffect for Lenis init (not useGSAP) since Lenis is not a GSAP animation"
  - "useGSAP for ScrollTrigger instances to leverage GSAP context cleanup"

patterns-established:
  - "Mutable store pattern: module-scoped singleton with Object.assign updates and listener notification"
  - "Lenis-GSAP bridge: lenis.on('scroll', ScrollTrigger.update) + gsap.ticker.add for RAF sync"
  - "Scroll physics config: Record<sectionId, { end, scrub, pin }> for declarative per-section behavior"

requirements-completed: [FOUND-02, FOUND-03, SCRL-01, SCRL-02, SCRL-03]

duration: 2min
completed: 2026-03-09
---

# Phase 2 Plan 1: Scroll Engine Summary

**Lenis smooth scroll with GSAP ScrollTrigger bridge, mutable scroll store, and content-proportional section pinning**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T13:13:04Z
- **Completed:** 2026-03-09T13:15:21Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Lenis+GSAP bridge running at 60fps with ticker sync and lag smoothing disabled
- Mutable scroll store exposes progress/velocity/direction/section without React re-renders
- Content sections (surface, pockets, projects) pin in viewport; transitions and contact scroll through
- Reduced-motion users get native browser scroll with proportional section heights
- All 14 Playwright tests pass (6 existing a11y + 2 scaffold + 6 new scroll tests)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create scroll store + physics config** - `e86e8cd` (feat)
2. **Task 2: Create ScrollEngine component and wire section pinning** - `ce1a7aa` (feat)

## Files Created/Modified
- `src/lib/scroll-store.ts` - Mutable scroll value singleton with listener pattern
- `src/lib/scroll-physics.ts` - Per-section ScrollTrigger configuration (end, scrub, pin)
- `src/components/ScrollEngine.tsx` - Client-only Lenis+GSAP orchestrator with ScrollTrigger per section
- `src/components/SectionShell.tsx` - Updated with forwardRef and children prop
- `src/app/layout.tsx` - Wrapped main content with ScrollEngine
- `src/app/globals.css` - Added Lenis CSS overrides and reduced-motion section heights
- `tests/scroll.spec.ts` - 6 e2e tests for scroll engine behavior
- `package.json` - Added lenis, gsap, @gsap/react dependencies

## Decisions Made
- Mutable singleton store over React state to avoid 60fps re-renders from scroll position changes
- Content-proportional scroll durations (surface 1x, pockets 1.5x, projects 2x) for natural reading pacing
- useEffect for Lenis init (imperative, not GSAP animation), useGSAP for ScrollTrigger instances (GSAP context cleanup)
- Exposed __scrollStore on window for e2e test access in dev mode

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Scroll infrastructure complete -- Lenis smooth scroll, GSAP ScrollTrigger, and mutable store all operational
- SectionShell accepts children and forwards refs, ready for content layers in Phases 4-7
- scrollStore provides progress/velocity/direction/section for R3F (Phase 3) and audio (Phase 9) consumers
- Scroll physics config can be tuned per-section as content is added

---
*Phase: 02-scroll-engine*
*Completed: 2026-03-09*
