# Phase 2: Scroll Engine - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Lenis smooth scroll + GSAP ScrollTrigger integration with mutable scroll store for 60fps performance. Variable scroll physics per depth layer, transition zone resistance mechanics, section pinning, and progressive lazy-loading. No visual effects (Phase 6), no 3D (Phase 3), no content (Phase 4+) — just the scroll infrastructure that everything else builds on.

</domain>

<decisions>
## Implementation Decisions

### Variable Scroll Feel
- ~30% speed variation between sections — noticeable but smooth, subconscious not jarring
- Progressive deepening: scroll starts light at surface, gets heavier as user descends
- Reverses on ascend: scrolling up feels lighter and faster (surfacing = relief)
- Deep layer (projects + floor): calm and steady — constant measured pace, no fighting the scroll
- "Like walking through rooms with different air density"

### Transition Membrane
- Build-and-release mechanic: resistance increases progressively through transition, then "pops" through with a brief ease
- Transition 2 (mid-to-deep) is ~50% heavier than Transition 1 (surface-to-mid) — reinforces depth progression
- Ascending through transitions: ~50% of downward resistance — surfacing should feel like relief
- Physics only in Phase 2 — no visual feedback during resistance (visuals are Phase 6's job)

### Section Duration & Pacing
- Content-proportional scroll durations:
  - Surface: short (1x) — brief hook
  - Pockets: medium (1.5x each) — content needs reading
  - Transitions: brief (0.5x) — passage, not destination
  - Projects: long (2x each) — reading time for discoveries
  - Floor: short (0.75x) — the payoff
- Pin content sections: pockets and projects pin in viewport while scroll drives internal animations
- Transitions scroll through continuously (no pinning)
- No scroll progress indicators within pinned sections — discovery-first, no UI chrome breaking immersion
- Surface pins with fade-in: provocation text fades in, holds for a beat, then scroll releases and text fades out

### Reduced-Motion Behavior
- Disable Lenis entirely when prefers-reduced-motion is active — native browser scroll
- No variable physics, no pinning, no transition resistance
- Keep proportional section heights — spatial pacing preserved even without scroll effects
- All content flows naturally with standard scroll

### Claude's Discretion
- Exact Lenis configuration values (lerp, duration, wheel multiplier)
- GSAP ScrollTrigger scrub values and easing curves per section
- Mutable scroll store implementation pattern (zustand vs vanilla ref store)
- Progressive loading threshold distances (how far ahead/behind to mount/unmount)
- Adaptive DPR implementation details (PerformanceMonitor integration)
- Exact scroll distance multipliers within the ~30% variation range

</decisions>

<specifics>
## Specific Ideas

- "Like diving — the deeper you go, the more resistance you feel"
- Transition membrane should feel satisfying — build-and-release creates a tactile "pop" through the boundary
- Surface pin with fade-in is cinematic — forces a moment of attention before the journey begins
- Deep layer is "the ocean floor" — calm, steady, peaceful. Not slow enough to frustrate.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SectionShell` component (`src/components/SectionShell.tsx`): Renders all 8 sections — will need to integrate with ScrollTrigger pin targets
- `useReducedMotion` hook (`src/hooks/useReducedMotion.ts`): Gates scroll engine initialization
- `SECTIONS` config (`src/lib/sections.ts`): Section IDs map to ScrollTrigger trigger elements
- `SkipLinks` component (`src/components/SkipLinks.tsx`): Must still work with pinned sections

### Established Patterns
- Immutable section config in `sections.ts` — scroll physics config should follow same pattern
- Client-only boundaries for browser APIs — Lenis/GSAP initialization must be client-side
- CSS custom properties for theming — section heights could use `--section-height-*` variables

### Integration Points
- `SectionShell` sections become ScrollTrigger pin targets (add `data-scroll-*` attributes or ref forwarding)
- Mutable scroll store will be consumed by: R3F monolith (Phase 3), text animations (Phase 4-5), audio layer (Phase 9)
- Progressive loading wraps section children — `SectionShell` may need a lazy-mount wrapper
- Transition resistance mechanics will be augmented with visual effects in Phase 6

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-scroll-engine*
*Context gathered: 2026-03-09*
