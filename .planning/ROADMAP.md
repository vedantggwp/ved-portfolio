# Roadmap: Ved Portfolio

## Overview

A 3D scrollytelling portfolio built in four phases: infrastructure first (scroll system, accessibility scaffold, performance architecture), then the hero 3D monolith scene, then all content layers with simultaneous mobile fallback and deployment, and finally the atmospheric audio layer. Each phase delivers a functional, verifiable layer. Copy passes happen within each phase. Accessibility is baked in from Phase 1.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Scroll Infrastructure and Accessibility Scaffold** - Lenis-GSAP bridge, mutable scroll store, fixed R3F canvas shell, semantic HTML, accessibility primitives, performance monitoring
- [ ] **Phase 2: 3D Monolith and Scene** - Custom GLSL shaders, scroll-driven morph, cinematic lighting, transition atmospheric effects
- [ ] **Phase 3: Content Layers, Mobile Fallback, and Deploy** - All DOM content sections (surface through floor), CSS parallax mobile experience, GPU detection, performance targets, Vercel deployment
- [ ] **Phase 4: Audio Layer** - Tone.js scroll-reactive synthesis, sound toggle, tonal shifts, fade-to-silence

## Phase Details

### Phase 1: Scroll Infrastructure and Accessibility Scaffold
**Goal**: The scroll-driven architecture works end-to-end -- a user can scroll through colored placeholder sections at 60fps with correct pinning, and the site is accessible from first render
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, SCRL-01, SCRL-02, SCRL-03, SCRL-04, SCRL-05, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):
  1. Site loads with dark warm background, editorial serif headers, and sans-serif body text with correct font loading
  2. User can scroll through placeholder sections that pin and release correctly, with variable scroll speed per section and membrane-effect transitions between zones
  3. prefers-reduced-motion users see static content with no animation, no WebGL canvas, and full keyboard navigation with visible focus indicators
  4. Screen reader announces all section landmarks, skip links work ("Skip to projects", "Skip to contact"), and all placeholder text meets WCAG AA contrast
  5. Scroll values drive a mutable store readable at 60fps -- no frame drops during continuous scroll (verified via performance overlay)
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: 3D Monolith and Scene
**Goal**: The monolith is a compelling visual presence that evolves across the scroll journey, with cinematic lighting and atmospheric transitions -- proven on desktop and tested on mobile GPUs
**Depends on**: Phase 1
**Requirements**: MONO-01, MONO-02, MONO-03, MONO-04, MONO-05, MONO-06, TRAN-01, TRAN-02, TRAN-03, TRAN-04
**Success Criteria** (what must be TRUE):
  1. A 3D obelisk with custom GLSL shaders is visible behind DOM sections, slowly rotating, with an amber fresnel edge glow that intensifies as the user scrolls deeper
  2. The monolith visibly morphs from abstract/minimal geometry at the surface to complex/faceted geometry at the deep layer -- and its final form still suggests unseen geometry beyond what is shown
  3. Transition zones produce observable atmospheric shifts: amber radial gradient flash and particle dissolve at Transition 1, heavier scroll resistance and geological background texture at Transition 2
  4. Cinematic single-source warm lighting breathes subtly, and the overall scene runs at 60fps on desktop without shader compilation stalls
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Content Layers, Mobile Fallback, and Deploy
**Goal**: Every content section is populated with real copy and project showcases, the mobile experience is a deliberate CSS parallax design (not degraded 3D), and the site is live on Vercel hitting Lighthouse 90+
**Depends on**: Phase 2
**Requirements**: SURF-01, SURF-02, SURF-03, MID-01, MID-02, MID-03, MID-04, MID-05, MID-06, DEEP-01, DEEP-02, DEEP-03, DEEP-04, FLOR-01, FLOR-02, MOBL-01, MOBL-02, MOBL-03, MOBL-04, PERF-01, PERF-04, DEPL-01, DEPL-02
**Success Criteria** (what must be TRUE):
  1. Surface layer shows provocation text (uniquely Ved, no name/title/CTA) that fades up and out on scroll -- the text makes a visitor pause
  2. Three mid-depth pockets each reveal scroll-linked text with distinct fog/color shifts (teal, amber, navy) and the monolith reappears in evolved form in each pocket
  3. Deep layer presents NeuroEdge, Discovery Simulator, FraudShieldAI, and Scrollwise as scroll-animated discoveries (provocative frame, title, description, proof) -- not portfolio cards
  4. Floor displays "You've gone deep. Most people don't." with contact links (email, GitHub, LinkedIn) in warm amber ambient light, and the monolith shows its complex final form with structured internal light
  5. On mobile or low-power devices, a CSS parallax experience communicates depth without WebGL -- all content is accessible, readable, and touch-optimized with no broken 3D artifacts
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Audio Layer
**Goal**: An atmospheric audio layer rewards users who opt in, deepening the sense of descent through scroll-reactive synthesis
**Depends on**: Phase 3
**Requirements**: AUDI-01, AUDI-02, AUDI-03, AUDI-04
**Success Criteria** (what must be TRUE):
  1. A pulsing waveform icon in the corner invites the user to enable sound -- it communicates "there is something to hear" without requesting permission or autoplaying
  2. When enabled, a sub-bass drone plays with a scroll-reactive filter that opens as the user goes deeper, tonal shifts occur at depth thresholds, and sound fades to silence at the floor
  3. Audio respects prefers-reduced-motion and works correctly across Chrome, Firefox, and Safari (including Safari AudioContext interruption handling)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scroll Infrastructure and Accessibility Scaffold | 0/2 | Not started | - |
| 2. 3D Monolith and Scene | 0/2 | Not started | - |
| 3. Content Layers, Mobile Fallback, and Deploy | 0/3 | Not started | - |
| 4. Audio Layer | 0/1 | Not started | - |
