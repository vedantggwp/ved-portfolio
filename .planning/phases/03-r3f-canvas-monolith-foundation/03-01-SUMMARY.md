---
phase: 03-r3f-canvas-monolith-foundation
plan: 01
subsystem: ui
tags: [three.js, r3f, react-three-fiber, drei, webgl, canvas, lighting]

# Dependency graph
requires:
  - phase: 02-scroll-engine
    provides: scroll engine with Lenis+GSAP, useReducedMotion hook
provides:
  - Fixed R3F canvas layer behind DOM content with pointer-events passthrough
  - Cinematic breathing point light with sinusoidal modulation
  - Placeholder monolith mesh for scene composition
  - R3FCanvasLoader for SSR-safe dynamic import
  - E2E test scaffold for 3D behavior verification (5 tests)
affects: [03-r3f-canvas-monolith-foundation, 04-surface-layer, 05-mid-depth-layers]

# Tech tracking
tech-stack:
  added: [three@r183, @react-three/fiber@9, @react-three/drei, @types/three]
  patterns: [useRef+useFrame for animation (no React state), dynamic import via client wrapper for SSR exclusion]

key-files:
  created:
    - src/components/R3FCanvas.tsx
    - src/components/R3FCanvasLoader.tsx
    - src/three/CinematicLighting.tsx
    - src/three/MonolithScene.tsx
    - tests/r3f.spec.ts
  modified:
    - next.config.ts
    - src/app/layout.tsx
    - package.json

key-decisions:
  - "Client wrapper pattern for SSR-false dynamic import (Next.js 16 disallows ssr:false in Server Components)"
  - "preserveDrawingBuffer for WebGL context to enable screenshot-based test verification"
  - "Screenshot byte-length heuristic for lighting presence test (>300 bytes = non-trivial rendering)"

patterns-established:
  - "R3F client wrapper: use R3FCanvasLoader (client component) with next/dynamic ssr:false, not layout.tsx directly"
  - "Animation via useRef+useFrame: never use useState for per-frame mutations in R3F components"
  - "Canvas layering: fixed div at z-index 0 with pointer-events:none, DOM content at z-index 1"

requirements-completed: [FOUND-04, MONO-06]

# Metrics
duration: 5min
completed: 2026-03-09
---

# Phase 3 Plan 01: R3F Canvas Foundation Summary

**Fixed R3F canvas behind DOM with warm sinusoidal breathing light, placeholder monolith mesh, and 5 e2e tests**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-09T15:11:18Z
- **Completed:** 2026-03-09T15:16:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- R3F canvas renders behind all DOM content at z-index 0 with pointer-events passthrough
- Warm cinematic point light at [3,5,4] with sinusoidal breathing (0.8-1.2 intensity)
- Canvas completely hidden when prefers-reduced-motion is active
- All 22 existing tests pass (scroll + a11y) with no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Install R3F dependencies and configure Next.js** - `542e1d1` (feat)
2. **Task 2: Create R3FCanvas, CinematicLighting, MonolithScene and wire into layout** - `8ed6989` (feat)

## Files Created/Modified
- `src/components/R3FCanvas.tsx` - Fixed canvas wrapper with reduced-motion gate and R3F Canvas
- `src/components/R3FCanvasLoader.tsx` - Client-side dynamic import wrapper (SSR-safe)
- `src/three/CinematicLighting.tsx` - Warm point light with sinusoidal breathing via useFrame
- `src/three/MonolithScene.tsx` - Scene composition with lighting + placeholder dark box mesh
- `tests/r3f.spec.ts` - 5 E2E tests: canvas positioning, reduced motion, scroll compat, WebGL, lighting
- `next.config.ts` - Added transpilePackages for three
- `src/app/layout.tsx` - Wired R3FCanvasLoader before ScrollEngine, added z-index 1 to main
- `package.json` - Added three, @react-three/fiber, @react-three/drei, @types/three

## Decisions Made
- Used client wrapper pattern (R3FCanvasLoader) instead of direct `next/dynamic` with `ssr: false` in layout -- Next.js 16 disallows `ssr: false` in Server Components
- Added `preserveDrawingBuffer: true` to WebGL config for test screenshot verification
- Used screenshot byte-length heuristic (>300 bytes) to verify non-blank scene rendering in tests

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Next.js 16 ssr:false restriction in Server Components**
- **Found during:** Task 2 (wiring layout)
- **Issue:** `next/dynamic` with `ssr: false` not allowed in Server Components (layout.tsx)
- **Fix:** Created `R3FCanvasLoader.tsx` client component wrapper that uses `next/dynamic` internally
- **Files modified:** src/components/R3FCanvasLoader.tsx, src/app/layout.tsx
- **Verification:** Dev server starts, canvas renders, all tests pass
- **Committed in:** 8ed6989 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for Next.js 16 compatibility. No scope creep.

## Issues Encountered
- Pre-existing TypeScript error in `src/components/VisuallyHidden.tsx:9` blocks `npm run build` but not dev server or tests. Logged to deferred-items.md. Not caused by Phase 3 changes.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- R3F canvas foundation complete, ready for GLSL monolith shader (Plan 02)
- CinematicLighting ready for scroll-reactive intensity modulation
- MonolithScene ready to swap placeholder box for custom shader mesh
- Pre-existing build error in VisuallyHidden.tsx should be resolved before production deploy

---
*Phase: 03-r3f-canvas-monolith-foundation*
*Completed: 2026-03-09*
