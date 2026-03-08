# Ved Portfolio

## What This Is

A 3D scrollytelling personal portfolio website that uses depth-based navigation and an evolving geometric monolith as a visual through-line. Built for job hunting and personal brand as a developer/builder who operates across domains (copywriting, strategy, AI, accessibility). The site should make people slow down, lean in, and want to work with Ved — not because of credentials, but because they feel he sees things they don't.

## Core Value

The site must communicate "I don't build what's expected. I build what's needed" through its structure, not its copy — the experience of using the site is itself proof of cross-domain thinking.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 3D monolith that evolves from abstract to complex across the scroll journey
- [ ] Depth-based scroll navigation (surface → mid-depth → deep → floor)
- [ ] Cinematic lighting with warm amber key light
- [ ] Three mid-depth "pockets" showing cross-domain pattern recognition
- [ ] Variable scroll physics per section (fluid/dense/still)
- [ ] Project showcases framed as discoveries, not portfolio cards
- [ ] Atmospheric audio layer with scroll-reactive synthesis
- [ ] Sound toggle as invitation (pulsing waveform icon), not permission request
- [ ] Mobile/low-power CSS parallax fallback (deliberate design, not degraded)
- [ ] Full accessibility: prefers-reduced-motion, keyboard nav, ARIA, screen reader support
- [ ] Contact floor: "You've gone deep. Most people don't."
- [ ] Provocation text on surface layer (uniquely Ved, not generic)
- [ ] Per-layer copy passes during build (copy shapes pacing, not bolted on at end)
- [ ] Transition "pressure changes" between layers with ambient light and scroll resistance
- [ ] Deploy to Vercel

### Out of Scope

- Blog or writing section — this is a portfolio, not a content platform
- CMS or admin panel — content is hardcoded, updated via code
- Contact form — email link is sufficient; forms attract spam
- Analytics dashboard — basic Vercel Analytics is enough
- Multi-language support — English only
- Dark/light theme toggle — the site IS the dark theme, by design
- Project filtering or search — curated selection, not a catalog

## Context

### Visual Identity
- **Palette:** Deep warm black (#0A0A0A), warm ivory (#F5F0E8), amber/gold accent (#C4964A), muted teal (#2A6B6B), deep navy (#1A1A3E)
- **Typography:** Editorial serif headers (DM Serif Display), clean sans body (Inter)
- **Aesthetic:** "Dark warmth with sharp edges" — Villeneuve cinematography, Teenage Engineering precision
- **Sonic:** Johannsson over Zimmer. Atmospheric, not decorative. Frahm for transitions.

### Personality Brief
- Intense. Strategic. Restless. Layered. Grounded.
- "Ved is not loud. Ved is magnetic."
- Venus in Virgo aesthetic: precision, not decoration. Every element earns its place.
- Monolith never fully resolves — still suggests unseen geometry at its final form

### Featured Projects
1. **NeuroEdge** — Accessibility auditing + neuromarketing intersection
2. **Springpod Discovery Simulator** — Gamified requirements discovery, 12-hour build
3. **FraudShieldAI** — Explainable AI fraud detection for SMBs
4. **Scrollwise** — Personal reading infrastructure (TikTok for saved knowledge)
5. (1-2 more TBD)

### Technical Direction
- Next.js 15 App Router, React Three Fiber 9, Three.js, Lenis, GSAP ScrollTrigger, Tone.js
- Fixed R3F Canvas behind scrollable DOM sections
- Mutable scroll store pattern (never React state for 60fps values)
- Custom GLSL vertex/fragment shaders for monolith

### Design Doc
Full design at `docs/plans/2026-03-08-scrollytelling-portfolio-design.md`

### Implementation Plan (pre-GSD)
Detailed 10-phase plan at `docs/plans/2026-03-08-scrollytelling-portfolio-plan.md`

## Constraints

- **Tech stack**: Next.js 15 + R3F + Lenis + GSAP + Tone.js — locked during design
- **Performance**: Lighthouse 90+ on desktop, graceful degradation on mobile
- **Accessibility**: WCAG AA compliance — NeuroEdge is an accessibility product, the portfolio must practice what it preaches
- **Hosting**: Vercel
- **No generic patterns**: No "Hi, I'm Ved. I build things." No tech-stack badges. No constellation graphs.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Depth-based scroll over timeline/grid | Maps to "layered" personality; creates the "slow down" moment | — Pending |
| Monolith as visual through-line | Recurring motif that evolves = proof of continued attention | — Pending |
| Variable scroll physics per section | Each domain has its own weight/texture | — Pending |
| Sound as reward, not requirement | Invitation model (waveform icon) respects user agency | — Pending |
| Mobile fallback as deliberate design | 2D CSS parallax that still communicates depth, not a broken 3D experience | — Pending |
| Copy passes per phase, not at end | Copy shapes pacing and layout; deferred copy fights visual structure | — Pending |
| prefers-reduced-motion in scaffold phase | Baked in from start, not retrofitted after all animations exist | — Pending |

---
*Last updated: 2026-03-08 after initialization*
