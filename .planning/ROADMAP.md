# Roadmap: Ved Portfolio

## Overview

A 10-phase build of a 3D scrollytelling portfolio with depth-based navigation and an evolving geometric monolith. Phases progress from scaffold through each depth layer to polish and deploy. Each phase delivers a focused, verifiable slice of the experience. Copy passes happen within content phases. Accessibility is baked in from Phase 1.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Scaffold + Fonts + A11Y Primitives** - Next.js project with typography, dark palette, SSR-safe boundaries, and accessibility foundations
- [ ] **Phase 2: Scroll Engine** - Lenis + GSAP ScrollTrigger with mutable scroll store, variable physics, and progressive loading
- [ ] **Phase 3: R3F Canvas + Monolith Foundation** - Fixed canvas layer with GLSL monolith geometry, scroll-driven morph, and cinematic lighting
- [ ] **Phase 4: Surface Layer** - Provocation text over the monolith with scroll-linked fade
- [ ] **Phase 5: Mid-Depth Layer** - Three depth pockets with per-pocket color shifts and monolith evolution
- [ ] **Phase 6: Transitions** - Pressure-change zones between layers with scroll resistance and visual effects
- [ ] **Phase 7: Deep Layer + Floor** - Project showcases as discoveries and the contact floor
- [ ] **Phase 8: Mobile Fallback + Performance** - WebGL detection, CSS parallax fallback, Lighthouse 90+, geometry LOD
- [ ] **Phase 9: Audio Layer** - Tone.js sound toggle, scroll-reactive drone, tonal shifts, fade to silence
- [ ] **Phase 10: Polish + Deploy** - Final pass, Vercel deployment, public GitHub repo

## Phase Details

### Phase 1: Scaffold + Fonts + A11Y Primitives
**Goal**: A blank page that looks right, loads safely, and respects every user from day one
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-05, FOUND-06, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06
**Success Criteria** (what must be TRUE):
  1. Page renders dark warm background (#0A0A0A) with DM Serif Display headers and Inter body text
  2. Users with prefers-reduced-motion see static content with no animations or 3D
  3. Keyboard-only users can tab through all sections with visible focus indicators
  4. Screen readers announce ARIA landmarks and skip links work ("Skip to projects", "Skip to contact")
  5. All text passes WCAG AA contrast checks against the dark background
**Plans**: 2 plans

Plans:
- [ ] 01-01: Next.js scaffold, fonts, dark palette, SSR-safe client boundaries
- [ ] 01-02: Accessibility primitives (reduced-motion, keyboard nav, ARIA, skip links, focus styles, contrast)

### Phase 2: Scroll Engine
**Goal**: Smooth depth-based scrolling with variable physics and 60fps performance
**Depends on**: Phase 1
**Requirements**: FOUND-02, FOUND-03, SCRL-01, SCRL-02, SCRL-03, SCRL-04, SCRL-05, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):
  1. Page scrolls smoothly via Lenis with no jank or desync with GSAP ScrollTrigger
  2. Scrolling through different sections produces noticeably different scroll feel (fluid/dense/still)
  3. Transition zones between layers have a membrane-like resistance before releasing
  4. Sections approaching the viewport lazy-mount; sections far away are not in the DOM
  5. Frame rate stays at 60fps during scroll (mutable store, no React re-renders for scroll values)
**Plans**: 2 plans

Plans:
- [ ] 02-01: Lenis + GSAP ScrollTrigger integration, mutable scroll store, section pinning
- [ ] 02-02: Variable scroll physics per section, transition resistance, progressive loading, adaptive DPR

### Phase 3: R3F Canvas + Monolith Foundation
**Goal**: The monolith exists as a living 3D object that evolves with scroll depth
**Depends on**: Phase 2
**Requirements**: FOUND-04, MONO-01, MONO-02, MONO-03, MONO-04, MONO-05, MONO-06
**Success Criteria** (what must be TRUE):
  1. A fixed R3F canvas sits behind all scrollable DOM content
  2. A 3D obelisk with custom GLSL shaders is visible and rotates imperceptibly
  3. Scrolling from top to bottom morphs the monolith from abstract/minimal to complex/faceted
  4. Amber fresnel edge glow intensifies as the monolith becomes more complex
  5. The monolith's final form still suggests hidden geometry -- it never looks "complete"
**Plans**: 2 plans

Plans:
- [ ] 03-01: Fixed R3F canvas layer behind DOM, cinematic lighting setup
- [ ] 03-02: GLSL monolith geometry, scroll-driven morph, rotation, fresnel glow, final form

### Phase 4: Surface Layer
**Goal**: The first thing visitors see is a provocation, not a bio
**Depends on**: Phase 3
**Requirements**: SURF-01, SURF-02, SURF-03
**Success Criteria** (what must be TRUE):
  1. On load, provocation text fades in over the monolith -- no name, title, or CTA visible
  2. As the user begins scrolling, the text fades up and out of view
  3. The surface feels intentionally sparse -- it communicates "lean in" not "here's my resume"
**Plans**: 1 plan

Plans:
- [ ] 04-01: Provocation text overlay with scroll-linked fade animation

### Phase 5: Mid-Depth Layer
**Goal**: Three depth pockets reveal cross-domain pattern recognition
**Depends on**: Phase 4
**Requirements**: MID-01, MID-02, MID-03, MID-04, MID-05, MID-06
**Success Criteria** (what must be TRUE):
  1. Three distinct pockets scroll into view with text that fades in and out per pocket
  2. Each pocket has a unique background color shift (teal, amber, navy) with fog
  3. Pocket content communicates specific cross-domain insights (copy-to-strategy, a11y-neuromarketing, speed-as-depth)
  4. The monolith reappears in each pocket in a more evolved form than the last
**Plans**: 2 plans

Plans:
- [ ] 05-01: Pocket layout with scroll-linked text reveals and per-pocket color/fog shifts
- [ ] 05-02: Monolith evolution per pocket, pocket copy passes

### Phase 6: Transitions
**Goal**: Moving between layers feels like crossing a physical boundary
**Depends on**: Phase 5
**Requirements**: TRAN-01, TRAN-02, TRAN-03, TRAN-04
**Success Criteria** (what must be TRUE):
  1. Transition 1 (surface-to-mid) produces an amber radial gradient flash at its midpoint
  2. Particles dissolve and reform during Transition 1 scroll
  3. Transition 2 (mid-to-deep) has heavier scroll resistance and a lower-register ambient shift
  4. Background texture shifts to geological (basalt/obsidian feel) during Transition 2
**Plans**: 1 plan

Plans:
- [ ] 06-01: Transition zones with light flash, particle effects, scroll resistance, texture shifts

### Phase 7: Deep Layer + Floor
**Goal**: Projects feel discovered, not listed -- and the floor rewards those who went all the way
**Depends on**: Phase 6
**Requirements**: DEEP-01, DEEP-02, DEEP-03, DEEP-04, FLOR-01, FLOR-02
**Success Criteria** (what must be TRUE):
  1. Each project scrolls into view as a discovery with per-project animation (not a grid of cards)
  2. Project structure follows: provocative frame -> title -> description -> proof
  3. NeuroEdge, Discovery Simulator, FraudShieldAI, and Scrollwise are showcased
  4. The monolith's final complex form with structured internal light is visible in the deep layer
  5. The floor displays "You've gone deep. Most people don't." with contact links in warm amber light
**Plans**: 2 plans

Plans:
- [ ] 07-01: Project showcase components with scroll-linked discovery animations
- [ ] 07-02: Floor section with contact links, monolith final form, warm ambient light

### Phase 8: Mobile Fallback + Performance
**Goal**: The site works everywhere and scores 90+ on Lighthouse
**Depends on**: Phase 7
**Requirements**: MOBL-01, MOBL-02, MOBL-03, MOBL-04, PERF-01, PERF-04
**Success Criteria** (what must be TRUE):
  1. Devices without WebGL capability get a CSS parallax fallback that still communicates depth
  2. All content is accessible and readable on mobile viewports
  3. Touch scroll physics feel natural on mobile
  4. Lighthouse Performance score is 90+ on desktop
  5. Monolith geometry reduces detail on lower-power devices
**Plans**: 2 plans

Plans:
- [ ] 08-01: WebGL detection, CSS parallax fallback, touch scroll physics, mobile content layout
- [ ] 08-02: Lighthouse performance audit and optimization, geometry LOD

### Phase 9: Audio Layer
**Goal**: Sound rewards curiosity -- it deepens the experience for those who opt in
**Depends on**: Phase 7
**Requirements**: AUDI-01, AUDI-02, AUDI-03, AUDI-04
**Success Criteria** (what must be TRUE):
  1. A pulsing waveform icon in the corner invites users to enable sound -- no modal or autoplay
  2. Enabling sound plays a sub-bass drone whose filter opens as the user scrolls deeper
  3. Tonal shifts occur at depth layer boundaries
  4. Sound fades to silence at the floor
**Plans**: 1 plan

Plans:
- [ ] 09-01: Tone.js integration, waveform toggle, scroll-reactive drone, tonal shifts, floor fade

### Phase 10: Polish + Deploy
**Goal**: The site is live, public, and represents Ved's best work
**Depends on**: Phase 8, Phase 9
**Requirements**: DEPL-01, DEPL-02
**Success Criteria** (what must be TRUE):
  1. Site is deployed and accessible at a Vercel URL
  2. GitHub repository is public with clean commit history
**Plans**: 1 plan

Plans:
- [ ] 10-01: Final polish pass, Vercel deployment, public GitHub repo

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 & 9 (parallel) -> 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold + Fonts + A11Y Primitives | 0/2 | Not started | - |
| 2. Scroll Engine | 1/2 | In progress | - |
| 3. R3F Canvas + Monolith Foundation | 0/2 | Not started | - |
| 4. Surface Layer | 0/1 | Not started | - |
| 5. Mid-Depth Layer | 0/2 | Not started | - |
| 6. Transitions | 0/1 | Not started | - |
| 7. Deep Layer + Floor | 0/2 | Not started | - |
| 8. Mobile Fallback + Performance | 0/2 | Not started | - |
| 9. Audio Layer | 0/1 | Not started | - |
| 10. Polish + Deploy | 0/1 | Not started | - |
