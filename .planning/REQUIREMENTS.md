# Requirements: Ved Portfolio

**Defined:** 2026-03-08
**Core Value:** The site must communicate "I don't build what's expected. I build what's needed" through its structure -- the experience is proof of cross-domain thinking.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: Site loads on a dark warm background (#0A0A0A) with editorial serif + sans-serif typography
- [x] **FOUND-02**: Smooth scroll via Lenis synced with GSAP ScrollTrigger without desync
- [x] **FOUND-03**: Mutable scroll store drives all 60fps values (never React state)
- [x] **FOUND-04**: Fixed R3F Canvas behind scrollable DOM sections
- [x] **FOUND-05**: prefers-reduced-motion detected and respected from first render
- [x] **FOUND-06**: SSR-safe boundaries -- all WebGL/audio components client-only

### Monolith

- [x] **MONO-01**: 3D obelisk geometry with custom GLSL vertex/fragment shaders
- [x] **MONO-02**: Monolith morphs from abstract/minimal to complex/faceted driven by scroll progress
- [x] **MONO-03**: Imperceptible slow rotation
- [x] **MONO-04**: Amber fresnel edge glow that intensifies with morph
- [x] **MONO-05**: Final form still suggests unseen geometry -- never fully resolved
- [x] **MONO-06**: Cinematic single-source warm lighting with subtle breathing

### Scroll Navigation

- [x] **SCRL-01**: Depth-based navigation: Surface -> Transition 1 -> Mid-Depth (3 pockets) -> Transition 2 -> Deep -> Floor
- [ ] **SCRL-02**: Camera moves forward (z-axis) on scroll creating dive-into-depth feeling
- [x] **SCRL-03**: Sections pin via ScrollTrigger with scrub
- [x] **SCRL-04**: Variable scroll physics per section -- fluid (teal), dense (amber), still (navy)
- [x] **SCRL-05**: Transition zones have scroll resistance (membrane effect) then release

### Surface Layer

- [x] **SURF-01**: Provocation text (uniquely Ved) fades in over the monolith -- not a bio
- [x] **SURF-02**: Text fades up and out as user begins scrolling
- [x] **SURF-03**: No name, title, or CTA on surface -- just the provocation

### Mid-Depth Layer

- [ ] **MID-01**: Three depth pockets with scroll-linked text reveals (fade in/out)
- [ ] **MID-02**: Pocket 1 (teal): copy-to-strategy-to-tech logic chain
- [ ] **MID-03**: Pocket 2 (amber): accessibility + neuromarketing intersection insight
- [ ] **MID-04**: Pocket 3 (navy): pre-solved problem / speed as symptom of deep thinking
- [ ] **MID-05**: Per-pocket fog/background color shifts
- [ ] **MID-06**: Monolith reappears in evolved form in each pocket

### Transitions

- [ ] **TRAN-01**: Transition 1: ambient light flash (amber radial gradient) at midpoint
- [ ] **TRAN-02**: Transition 1: particle dissolve/reform effect during scroll
- [ ] **TRAN-03**: Transition 2: heavier scroll resistance, lower register ambient shift
- [ ] **TRAN-04**: Background texture shifts to geological (basalt/obsidian) in Transition 2

### Deep Layer

- [ ] **DEEP-01**: Project showcases scroll in as discoveries with per-project scroll animation
- [ ] **DEEP-02**: Each project: provocative frame -> title -> description -> proof
- [ ] **DEEP-03**: Featured projects: NeuroEdge, Discovery Simulator, FraudShieldAI, Scrollwise
- [ ] **DEEP-04**: Monolith final form appears -- complex geometry, structured internal light

### Floor

- [ ] **FLOR-01**: "You've gone deep. Most people don't." + contact links (email, GitHub, LinkedIn)
- [ ] **FLOR-02**: Warm amber ambient light environment

### Audio

- [ ] **AUDI-01**: Sound toggle: pulsing waveform icon in corner -- invitation, not permission
- [ ] **AUDI-02**: Sub-bass drone with scroll-reactive filter (opens as user goes deeper)
- [ ] **AUDI-03**: Tonal shifts at depth thresholds
- [ ] **AUDI-04**: Long fade to silence at floor

### Accessibility

- [x] **A11Y-01**: prefers-reduced-motion: disable 3D, animations, particles -- show content statically
- [x] **A11Y-02**: Keyboard navigation through all scroll sections
- [x] **A11Y-03**: ARIA landmarks and screen reader alternatives for visual content
- [x] **A11Y-04**: Skip links ("Skip to projects", "Skip to contact")
- [x] **A11Y-05**: All text meets WCAG AA contrast ratios
- [x] **A11Y-06**: Focus styles on all interactive elements

### Mobile

- [ ] **MOBL-01**: WebGL capability detection -- don't load R3F Canvas on incapable devices
- [ ] **MOBL-02**: CSS parallax fallback that communicates depth without WebGL
- [ ] **MOBL-03**: Touch-optimized scroll physics
- [ ] **MOBL-04**: All content accessible and readable on mobile

### Performance

- [ ] **PERF-01**: Lighthouse Performance 90+ on desktop
- [x] **PERF-02**: Progressive loading per depth layer (lazy mount approaching sections)
- [x] **PERF-03**: Adaptive DPR based on frame rate (PerformanceMonitor)
- [ ] **PERF-04**: Monolith geometry LOD reduces on lower-power devices

### Deployment

- [ ] **DEPL-01**: Deployed to Vercel
- [ ] **DEPL-02**: GitHub repository (public)

## v2 Requirements

### Audio Enhancement
- **AUDI-05**: Per-pocket unique sonic textures (granular hum, crystalline shimmer, rhythmic pulse)
- **AUDI-06**: Transition chime sounds (piano note with reverb)

### Visual Polish
- **VIS-01**: Post-processing bloom on monolith glow
- **VIS-02**: Film grain overlay
- **VIS-03**: Depth-of-field post-processing

### Content
- **CONT-01**: GitHub profile README
- **CONT-02**: LinkedIn project showcases
- **CONT-03**: Additional 1-2 featured projects

## Out of Scope

| Feature | Reason |
|---------|--------|
| Blog / writing section | Portfolio, not content platform |
| CMS / admin panel | Content hardcoded, updated via code |
| Contact form | Email link sufficient; forms attract spam |
| Analytics dashboard | Vercel Analytics is enough |
| Multi-language | English only |
| Dark/light toggle | The site IS the dark theme by design |
| Project filtering/search | Curated selection, not a catalog |
| Custom cursor | Anti-pattern per research -- distracts from content |
| Scroll progress indicator | Undermines the depth discovery experience |
| Tech stack badges | Explicitly against design philosophy |
| Particle background on hero | "That's everybody. That's mediocrity wearing a hoodie." |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| FOUND-06 | Phase 1 | Complete |
| A11Y-01 | Phase 1 | Complete |
| A11Y-02 | Phase 1 | Complete |
| A11Y-03 | Phase 1 | Complete |
| A11Y-04 | Phase 1 | Complete |
| A11Y-05 | Phase 1 | Complete |
| A11Y-06 | Phase 1 | Complete |
| FOUND-02 | Phase 2 | Complete |
| FOUND-03 | Phase 2 | Complete |
| SCRL-01 | Phase 2 | Complete |
| SCRL-02 | Phase 2 | Pending |
| SCRL-03 | Phase 2 | Complete |
| SCRL-04 | Phase 2 | Complete |
| SCRL-05 | Phase 2 | Complete |
| PERF-02 | Phase 2 | Complete |
| PERF-03 | Phase 2 | Complete |
| FOUND-04 | Phase 3 | Complete |
| MONO-01 | Phase 3 | Complete |
| MONO-02 | Phase 3 | Complete |
| MONO-03 | Phase 3 | Complete |
| MONO-04 | Phase 3 | Complete |
| MONO-05 | Phase 3 | Complete |
| MONO-06 | Phase 3 | Complete |
| SURF-01 | Phase 4 | Complete |
| SURF-02 | Phase 4 | Complete |
| SURF-03 | Phase 4 | Complete |
| MID-01 | Phase 5 | Pending |
| MID-02 | Phase 5 | Pending |
| MID-03 | Phase 5 | Pending |
| MID-04 | Phase 5 | Pending |
| MID-05 | Phase 5 | Pending |
| MID-06 | Phase 5 | Pending |
| TRAN-01 | Phase 6 | Pending |
| TRAN-02 | Phase 6 | Pending |
| TRAN-03 | Phase 6 | Pending |
| TRAN-04 | Phase 6 | Pending |
| DEEP-01 | Phase 7 | Pending |
| DEEP-02 | Phase 7 | Pending |
| DEEP-03 | Phase 7 | Pending |
| DEEP-04 | Phase 7 | Pending |
| FLOR-01 | Phase 7 | Pending |
| FLOR-02 | Phase 7 | Pending |
| MOBL-01 | Phase 8 | Pending |
| MOBL-02 | Phase 8 | Pending |
| MOBL-03 | Phase 8 | Pending |
| MOBL-04 | Phase 8 | Pending |
| PERF-01 | Phase 8 | Pending |
| PERF-04 | Phase 8 | Pending |
| AUDI-01 | Phase 9 | Pending |
| AUDI-02 | Phase 9 | Pending |
| AUDI-03 | Phase 9 | Pending |
| AUDI-04 | Phase 9 | Pending |
| DEPL-01 | Phase 10 | Pending |
| DEPL-02 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 56 total
- Mapped to phases: 56
- Unmapped: 0

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-09 after roadmap restructuring (4 phases -> 10 phases)*
