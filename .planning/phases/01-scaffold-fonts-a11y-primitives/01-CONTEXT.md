# Phase 1: Scaffold + Fonts + A11Y Primitives - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Next.js 15 App Router project setup with typography (DM Serif Display + Inter), dark warm palette (#0A0A0A), SSR-safe client boundaries, and full accessibility foundations (reduced-motion, keyboard nav, ARIA landmarks, skip links, focus styles, WCAG AA contrast). No scroll engine, no 3D, no content — just the shell that everything else builds on.

</domain>

<decisions>
## Implementation Decisions

### Section Structure
- Scaffold all depth layers as placeholder `<section>` elements: Surface, Transition 1, Mid-depth pocket 1, Mid-depth pocket 2, Mid-depth pocket 3, Transition 2, Deep, Floor
- Each section gets an `id`, ARIA landmark role, and semantic heading (visually hidden where needed)
- Sections are empty shells — Phase 2+ fills in content without restructuring the DOM
- This provides skip link targets and keyboard nav anchors from day one

### Reduced-Motion Fallback
- When `prefers-reduced-motion: reduce` is active: no animations, no 3D canvas, no particles
- Show all text content statically on the dark background with good typography
- No static images or CSS shapes substituting for the monolith — content IS the experience
- This becomes the baseline that every future phase must respect: if it animates, it must degrade

### Typography Scale
- Fluid `clamp()` sizing with a modular scale — no breakpoint jumps
- CSS custom properties for the full type scale (e.g., `--text-xs` through `--text-display`)
- DM Serif Display for `h1` and `h2` headings
- Inter for `h3`–`h6`, body text, and all other elements
- Font weights: DM Serif Display 400 (regular only), Inter 400/500/600

### Keyboard Navigation
- Two skip links: "Skip to projects" and "Skip to contact" — no per-layer skip links
- Tab stops on interactive elements only (links, future sound toggle placeholder)
- Visible focus rings styled with amber accent (#C4964A) — 2px outline with offset
- Focus order follows DOM order (natural depth progression)

### Claude's Discretion
- Exact clamp() values and modular scale ratio
- CSS custom property naming convention
- next/font optimization configuration details
- Exact ARIA role assignments per section
- SSR boundary implementation pattern (dynamic imports vs 'use client' boundaries)

</decisions>

<specifics>
## Specific Ideas

- "The experience of using the site is proof of cross-domain thinking" — the scaffold must feel intentional even when empty
- Reduced-motion is not a degraded experience — it's a first-class citizen (Ved builds an accessibility product, the portfolio must practice what it preaches)
- Focus rings use amber accent to match the site's warm aesthetic, not default browser blue

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no code exists yet

### Established Patterns
- None yet — this phase establishes the foundational patterns all other phases inherit

### Integration Points
- Sections scaffolded here become ScrollTrigger pin targets in Phase 2
- SSR-safe boundaries set up here wrap the R3F Canvas in Phase 3
- Reduced-motion detection established here gates all future animation/3D code
- Typography scale defined here is used by every content phase (4, 5, 7)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-scaffold-fonts-a11y-primitives*
*Context gathered: 2026-03-09*
