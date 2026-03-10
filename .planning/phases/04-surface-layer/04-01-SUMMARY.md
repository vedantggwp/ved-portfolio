---
phase: 04-surface-layer
plan: 01
subsystem: ui
tags: [next-font, css-modules, css-animation, raf-scroll, instrument-serif, provocation]

requires:
  - phase: 02-scroll-engine
    provides: scrollStore.sectionProgress for rAF scroll-linked animation
  - phase: 01-scaffold
    provides: SectionShell, font CSS variable pattern, useReducedMotion hook
provides:
  - Provocation component with entrance animation and scroll-linked exit
  - Instrument Serif font integration (--font-provocation CSS variable)
  - Surface section visual identity (cryptic couplet, no bio/CTA)
affects: [05-mid-layer, 06-transitions, 08-mobile-perf]

tech-stack:
  added: [Instrument Serif (Google Font)]
  patterns: [CSS module animation with rAF scroll override, animationend gating for scroll handoff]

key-files:
  created:
    - src/components/Provocation.tsx
    - src/components/Provocation.module.css
    - tests/surface.spec.ts
  modified:
    - src/app/layout.tsx
    - src/app/page.tsx

key-decisions:
  - "Instrument Serif Regular 400 for provocation font -- Teenage Engineering aesthetic, designed for headlines"
  - "Couplet: 'The closer you look at one thing, / the more it resembles everything else.' -- cryptic, philosophical, second-person"
  - "CSS animationend event gates rAF scroll loop start -- prevents scroll interference during entrance"
  - "Direct style mutation (el.style.transform/opacity) in rAF for zero-rerender scroll animation"

patterns-established:
  - "CSS entrance animation -> animationend -> rAF scroll loop handoff pattern"
  - "Reduced-motion: separate render path with static class, no will-change"

requirements-completed: [SURF-01, SURF-02, SURF-03]

duration: 8min
completed: 2026-03-10
---

# Phase 4 Plan 1: Provocation Overlay Summary

**Instrument Serif provocation couplet with CSS staggered entrance and rAF scroll-linked parallax drift + fade-out over the monolith**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-10T17:33:26Z
- **Completed:** 2026-03-10T17:41:30Z
- **Tasks:** 2 (1 checkpoint decision + 1 TDD implementation)
- **Files modified:** 5

## Accomplishments
- Two-line provocation couplet ("The closer you look at one thing, / the more it resembles everything else.") fades in over the monolith with staggered timing
- Instrument Serif Regular 400 font integrated as --font-provocation CSS variable
- Scroll-linked exit: parallax drift (-40vh) and opacity fade driven by scrollStore.sectionProgress via rAF
- Reduced-motion fallback renders static text at full opacity with no animations
- 4 new e2e tests covering text presence, font, scroll fade-out, content purity, and reduced motion

## Task Commits

Each task was committed atomically:

1. **Task 1: Select provocation font and copy** - checkpoint:decision (resolved by user)
2. **Task 2 RED: Failing tests** - `cba8be8` (test)
3. **Task 2 GREEN: Provocation implementation** - `623252c` (feat)

## Files Created/Modified
- `src/components/Provocation.tsx` - Client component with CSS entrance + rAF scroll exit
- `src/components/Provocation.module.css` - Keyframes, positioning, typography, reduced-motion variant
- `src/app/layout.tsx` - Added Instrument Serif font import and CSS variable
- `src/app/page.tsx` - Renders Provocation component in surface section
- `tests/surface.spec.ts` - 4 e2e tests: SURF-01, SURF-02, SURF-03, A11Y-RM

## Decisions Made
- **Font:** Instrument Serif Regular 400 (user selected) -- clean, confident, Teenage Engineering aesthetic
- **Copy:** "The closer you look at one thing, / the more it resembles everything else." (user selected) -- cryptic, philosophical, second-person voice
- **Animation handoff:** CSS animationend on line 2 gates the rAF scroll loop start, preventing scroll interference during entrance fade-in
- **Direct DOM mutation:** el.style.transform and el.style.opacity written in rAF loop (no React state, zero re-renders)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CSS modules mangle animation names**
- **Found during:** Task 2 GREEN phase
- **Issue:** The animationend handler checked for `animationName === 'fadeIn'` but CSS modules mangle keyframe names, so the check never matched and the rAF loop never started
- **Fix:** Removed animation name check from animationend handler -- any animationend on line2 triggers scroll loop start
- **Files modified:** src/components/Provocation.tsx
- **Verification:** SURF-02 test passes (opacity reaches 0 after scroll)
- **Committed in:** 623252c

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for correct animation handoff. No scope creep.

## Issues Encountered
None beyond the CSS module animation name mangling (documented above as deviation).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Surface section visual identity established -- provocation is the first thing visitors see
- scrollStore.sectionProgress integration proven for content animation
- Pattern established for future sections: CSS entrance -> rAF scroll exit
- Ready for Phase 4 Plan 2 or Phase 5 (mid-layer content)

## Self-Check: PASSED

All files exist and all commits verified.

---
*Phase: 04-surface-layer*
*Completed: 2026-03-10*
