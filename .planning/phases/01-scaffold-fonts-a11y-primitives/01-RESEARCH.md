# Phase 1: Scaffold + Fonts + A11Y Primitives - Research

**Researched:** 2026-03-09
**Domain:** Next.js 15 App Router, Typography, Accessibility Foundations
**Confidence:** HIGH

## Summary

This phase scaffolds a Next.js 15 App Router project with self-hosted Google Fonts (DM Serif Display + Inter), a dark warm palette (#0A0A0A), SSR-safe client component boundaries, and comprehensive accessibility primitives. The project is greenfield -- no existing code.

The technical surface area is well-understood: Next.js font optimization via `next/font/google` is mature, fluid typography with CSS `clamp()` is standard practice, and WCAG AA compliance on a near-black background is straightforward (white on #0A0A0A yields 19.7:1 contrast ratio, amber #C4964A yields 7.36:1 -- both exceed AA requirements). The main design challenge is scaffolding section shells that serve as future ScrollTrigger pin targets (Phase 2) and R3F canvas containers (Phase 3) without coupling to those implementations.

**Primary recommendation:** Use `next/font/google` for zero-layout-shift font loading, CSS custom properties for the entire design token system (colors, type scale, spacing), and a `useReducedMotion()` hook with SSR-safe `matchMedia` detection that gates all future animation code paths.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Scaffold all depth layers as placeholder `<section>` elements: Surface, Transition 1, Mid-depth pocket 1, Mid-depth pocket 2, Mid-depth pocket 3, Transition 2, Deep, Floor
- Each section gets an `id`, ARIA landmark role, and semantic heading (visually hidden where needed)
- Sections are empty shells -- Phase 2+ fills in content without restructuring the DOM
- This provides skip link targets and keyboard nav anchors from day one
- When `prefers-reduced-motion: reduce` is active: no animations, no 3D canvas, no particles
- Show all text content statically on the dark background with good typography
- No static images or CSS shapes substituting for the monolith -- content IS the experience
- This becomes the baseline that every future phase must respect: if it animates, it must degrade
- Fluid `clamp()` sizing with a modular scale -- no breakpoint jumps
- CSS custom properties for the full type scale (e.g., `--text-xs` through `--text-display`)
- DM Serif Display for `h1` and `h2` headings
- Inter for `h3`-`h6`, body text, and all other elements
- Font weights: DM Serif Display 400 (regular only), Inter 400/500/600
- Two skip links: "Skip to projects" and "Skip to contact" -- no per-layer skip links
- Tab stops on interactive elements only (links, future sound toggle placeholder)
- Visible focus rings styled with amber accent (#C4964A) -- 2px outline with offset
- Focus order follows DOM order (natural depth progression)

### Claude's Discretion
- Exact clamp() values and modular scale ratio
- CSS custom property naming convention
- next/font optimization configuration details
- Exact ARIA role assignments per section
- SSR boundary implementation pattern (dynamic imports vs 'use client' boundaries)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Site loads on dark warm background (#0A0A0A) with editorial serif + sans-serif typography | next/font/google for DM Serif Display + Inter, CSS custom properties for palette and type scale |
| FOUND-05 | prefers-reduced-motion detected and respected from first render | SSR-safe useReducedMotion hook with matchMedia, CSS media query fallback |
| FOUND-06 | SSR-safe boundaries -- all WebGL/audio components client-only | 'use client' boundary pattern, next/dynamic with ssr:false for future heavy components |
| A11Y-01 | prefers-reduced-motion: disable 3D, animations, particles -- show content statically | Combined CSS + JS approach: CSS media query for immediate styles, React hook for component-level gating |
| A11Y-02 | Keyboard navigation through all scroll sections | Section shells with proper DOM order, focusable skip link targets |
| A11Y-03 | ARIA landmarks and screen reader alternatives for visual content | Semantic HTML with role attributes on each section, visually-hidden headings |
| A11Y-04 | Skip links ("Skip to projects", "Skip to contact") | Two skip links in DOM before main content, targeting section IDs |
| A11Y-05 | All text meets WCAG AA contrast ratios | White on #0A0A0A = 19.7:1, Amber #C4964A on #0A0A0A = 7.36:1 -- both pass AA and AAA |
| A11Y-06 | Focus styles on all interactive elements | Custom amber focus ring: 2px outline, 2px offset, #C4964A color |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.x (latest 15) | Framework | Locked decision from project. App Router with React Server Components |
| react | 19.x | UI library | Ships with Next.js 15 |
| typescript | 5.x | Type safety | Standard for Next.js projects |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/font/google | built-in | Font optimization | Self-hosts Google Fonts, zero layout shift |

### No Additional Dependencies Needed

This phase requires zero npm packages beyond what `create-next-app` provides. Typography uses `next/font/google` (built-in). Design tokens use CSS custom properties. Accessibility uses semantic HTML and native browser APIs (`matchMedia`). No animation library, no UI library, no CSS framework beyond what ships with Next.js.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS custom properties | Tailwind CSS | Tailwind adds complexity; raw CSS properties are simpler for a custom design system and integrate cleanly with future GSAP/R3F phases |
| next/font/google | @fontsource packages | next/font is built-in, handles optimization automatically, prevents FOUT/FOIT |
| CSS media queries for reduced-motion | framer-motion MotionConfig | No animation library needed in Phase 1; CSS + matchMedia hook is lighter |

**Installation:**
```bash
npx create-next-app@latest ved-portfolio --typescript --app --src-dir --no-tailwind --no-eslint --import-alias "@/*"
```

Note: `--no-tailwind` because the project uses CSS custom properties for its design token system. ESLint can be configured separately if needed. The `--src-dir` flag creates the `src/` directory structure.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout: fonts, metadata, skip links, body class
│   ├── page.tsx            # Server component: renders all section shells
│   └── globals.css         # Design tokens, type scale, reset, focus styles, reduced-motion
├── components/
│   ├── SkipLinks.tsx       # Skip navigation links (server component)
│   ├── SectionShell.tsx    # Reusable section wrapper with ARIA (server component)
│   └── VisuallyHidden.tsx  # Screen-reader-only text utility (server component)
├── hooks/
│   └── useReducedMotion.ts # SSR-safe prefers-reduced-motion hook (client)
└── lib/
    └── sections.ts         # Section config: id, label, aria role, heading
```

### Pattern 1: Font Loading with next/font/google
**What:** Self-host DM Serif Display and Inter with zero layout shift
**When to use:** Root layout only -- fonts are loaded once and applied via CSS custom properties
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/getting-started/fonts
import { DM_Serif_Display, Inter } from 'next/font/google'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

// In layout.tsx:
<html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
```

### Pattern 2: CSS Design Token System
**What:** All colors, typography, and spacing as CSS custom properties
**When to use:** globals.css -- consumed by every component
**Example:**
```css
:root {
  /* Palette */
  --color-bg: #0A0A0A;
  --color-text: #F5F5F5;
  --color-accent: #C4964A;
  --color-text-muted: #A0A0A0;

  /* Typography - fluid clamp() with ~1.25 major second ratio */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  --text-base: clamp(1rem, 0.925rem + 0.4vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.1rem + 0.65vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.25rem + 1vw, 2rem);
  --text-3xl: clamp(2rem, 1.5rem + 1.5vw, 2.5rem);
  --text-4xl: clamp(2.5rem, 1.75rem + 2vw, 3.5rem);
  --text-display: clamp(3rem, 2rem + 3vw, 5rem);

  /* Font families (set by next/font CSS variables) */
  --font-heading: var(--font-serif), 'Georgia', serif;
  --font-body: var(--font-sans), system-ui, sans-serif;

  /* Focus */
  --focus-ring-color: var(--color-accent);
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
}
```

### Pattern 3: SSR-Safe Reduced Motion Detection
**What:** Combined CSS + JS approach for reduced motion
**When to use:** CSS media query for immediate visual changes; React hook for component-level logic gating
**Example:**
```typescript
// hooks/useReducedMotion.ts
'use client'
import { useState, useEffect } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mql.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}
```
```css
/* CSS fallback -- works before JS hydrates */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Pattern 4: Section Shell Architecture
**What:** Placeholder sections that become ScrollTrigger targets in Phase 2
**When to use:** page.tsx -- all sections rendered as server components
**Example:**
```typescript
// lib/sections.ts
export const SECTIONS = [
  { id: 'surface', label: 'Surface', role: 'banner', heading: 'Introduction' },
  { id: 'transition-1', label: 'Transition', role: 'presentation', heading: null },
  { id: 'pocket-1', label: 'Strategy', role: 'region', heading: 'Copy to Strategy to Tech' },
  { id: 'pocket-2', label: 'Accessibility', role: 'region', heading: 'Accessibility Meets Neuromarketing' },
  { id: 'pocket-3', label: 'Depth', role: 'region', heading: 'Speed as Symptom of Deep Thinking' },
  { id: 'transition-2', label: 'Transition', role: 'presentation', heading: null },
  { id: 'projects', label: 'Projects', role: 'region', heading: 'Projects' },
  { id: 'contact', label: 'Contact', role: 'contentinfo', heading: 'Contact' },
] as const
```

### Pattern 5: Skip Links
**What:** Two skip links at the top of the DOM, visible on focus
**When to use:** Before main content in layout.tsx
**Example:**
```typescript
// components/SkipLinks.tsx
export function SkipLinks() {
  return (
    <nav aria-label="Skip links">
      <a href="#projects" className="skip-link">Skip to projects</a>
      <a href="#contact" className="skip-link">Skip to contact</a>
    </nav>
  )
}
```
```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  z-index: 9999;
  padding: 8px 16px;
  background: var(--color-accent);
  color: var(--color-bg);
  font-family: var(--font-body);
  font-weight: 600;
  text-decoration: none;
  border-radius: 4px;
}
.skip-link:focus {
  top: 16px;
}
```

### Anti-Patterns to Avoid
- **Using Tailwind for this project:** The design system is bespoke with CSS custom properties that will be consumed by GSAP and R3F in later phases. Tailwind would add unnecessary abstraction.
- **Putting 'use client' on layout.tsx:** The root layout should remain a server component. Only leaf components that need browser APIs (useReducedMotion) should be client components.
- **Using `role="main"` on `<main>`:** The `<main>` element already has implicit `role="main"`. Redundant ARIA roles create noise.
- **Font loading via `<link>` tags:** Bypasses next/font optimization. Always use `next/font/google` imports.
- **Default browser focus styles:** The default blue outline clashes with the dark warm palette. Custom amber focus rings are a locked decision.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading & optimization | Custom font-face declarations, preload links | `next/font/google` | Handles subsetting, self-hosting, font-display, prevents FOUT/FOIT, zero config |
| Visually hidden text | Custom CSS every time | Reusable `.visually-hidden` class | Well-known pattern, easy to get wrong (clip-path + position + overflow) |
| Contrast ratio checking | Manual hex math | WebAIM Contrast Checker during development | Human error in manual calculation; tool verification is instant |
| Reduced motion detection | Custom event listener management | Reusable hook with proper cleanup | Easy to leak event listeners or forget SSR safety |

**Key insight:** Phase 1 is almost entirely semantic HTML + CSS custom properties + one React hook. The temptation is to over-engineer with libraries. Resist it -- every dependency added here ships to every user on every page.

## Common Pitfalls

### Pitfall 1: Font Variable Naming Collision
**What goes wrong:** CSS variable `--font-serif` conflicts with a Tailwind or framework default
**Why it happens:** Common variable names overlap with library internals
**How to avoid:** Use project-scoped names: `--font-serif` and `--font-sans` are safe when not using Tailwind. Verify no conflicts after scaffold.
**Warning signs:** Fonts not applying despite correct CSS

### Pitfall 2: Hydration Mismatch with useReducedMotion
**What goes wrong:** Server renders with `prefersReduced = false`, client detects `true`, causes hydration warning
**Why it happens:** `matchMedia` is not available during SSR
**How to avoid:** Initialize state to `false` (the non-reduced default). The brief flash before JS hydrates is covered by the CSS `@media (prefers-reduced-motion: reduce)` rule which applies immediately.
**Warning signs:** React hydration mismatch warnings in dev console

### Pitfall 3: Skip Links Not Receiving Focus
**What goes wrong:** Clicking skip link scrolls to section but focus doesn't move
**Why it happens:** Target element needs `tabindex="-1"` to receive programmatic focus
**How to avoid:** Add `tabindex="-1"` to section elements that are skip link targets (specifically `#projects` and `#contact`)
**Warning signs:** Screen reader users land on skip link target but can't navigate from there

### Pitfall 4: Fluid Typography Not Scaling on Zoom
**What goes wrong:** Text using `vw` units doesn't scale when user zooms browser
**Why it happens:** Viewport units are locked to viewport dimensions, not zoom level
**How to avoid:** Always use `clamp()` with `rem` for min/max values. The preferred (middle) value uses `vw` but is bounded by `rem` values that DO respect zoom.
**Warning signs:** Text doesn't get larger when user zooms to 200%

### Pitfall 5: ARIA Roles on Non-Interactive Elements
**What goes wrong:** Adding `role="button"` or interactive roles to `<section>` elements
**Why it happens:** Confusion between landmark roles and widget roles
**How to avoid:** Sections get landmark roles only: `banner`, `region`, `contentinfo`, `presentation`. Never widget roles like `button`, `tab`, `dialog`.
**Warning signs:** Screen reader announces sections as interactive elements

### Pitfall 6: DM Serif Display Weight Mismatch
**What goes wrong:** Requesting weight 700 from DM Serif Display causes font loading failure
**Why it happens:** DM Serif Display only supports weight 400 (regular). No bold variant exists.
**How to avoid:** Only request `weight: '400'` for DM Serif Display. For emphasis in headings, use size and color contrast, not bold weight.
**Warning signs:** Font fallback to Georgia/serif on headings, console errors about missing font weight

## Code Examples

### Complete Root Layout
```typescript
// Source: https://nextjs.org/docs/app/getting-started/fonts
// src/app/layout.tsx
import { DM_Serif_Display, Inter } from 'next/font/google'
import { SkipLinks } from '@/components/SkipLinks'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata = {
  title: 'Ved Gaikwad',
  description: 'Portfolio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
      <body>
        <SkipLinks />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### Focus Ring Styles
```css
/* globals.css */
:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Visually Hidden Utility
```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@import url('fonts.googleapis.com/...')` | `next/font/google` built-in | Next.js 13+ (2022) | Zero external requests, automatic subsetting |
| Media query breakpoints for font size | `clamp()` fluid typography | 2021+ (wide browser support) | No breakpoint jumps, continuous scaling |
| `outline: none` (remove focus) | `:focus-visible` | 2022+ (wide browser support) | Focus visible only for keyboard users, not mouse |
| Custom prefers-reduced-motion polyfill | Native `matchMedia` + CSS media query | Standard since 2019 | All modern browsers support natively |

**Deprecated/outdated:**
- `@next/font` package: Merged into `next/font` in Next.js 13.2+. Use `next/font/google` directly.
- `font-display: optional` for body fonts: Can cause invisible text. Use `display: 'swap'` for both fonts.

## Open Questions

1. **Exact modular scale ratio**
   - What we know: Major Second (1.125), Minor Third (1.2), and Major Third (1.25) are all common ratios for editorial typography
   - What's unclear: Which ratio best suits the editorial + dark aesthetic at all viewport sizes
   - Recommendation: Start with 1.25 (Major Third) -- gives enough differentiation between heading levels on large screens without being too aggressive. The `clamp()` bounds prevent extreme sizes. Can be tuned after visual review.

2. **Section minimum heights**
   - What we know: Sections need to be tall enough to serve as future ScrollTrigger pin targets
   - What's unclear: Exact `min-height` values per section for Phase 2 compatibility
   - Recommendation: Use `min-height: 100vh` for all sections initially. Phase 2 will override with ScrollTrigger pin durations. The CSS custom property `--section-min-height: 100vh` makes this easy to adjust.

3. **ARIA role for transition sections**
   - What we know: Transitions are purely visual/spatial, not semantic content
   - What's unclear: Whether `role="presentation"` or `aria-hidden="true"` is more appropriate
   - Recommendation: Use `role="presentation"` -- they exist in the DOM for scroll behavior but carry no semantic content. Do NOT use `aria-hidden` as that would hide child content from screen readers if content is ever added.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright (latest) |
| Config file | none -- see Wave 0 |
| Quick run command | `npx playwright test --grep @smoke` |
| Full suite command | `npx playwright test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Dark background #0A0A0A renders, DM Serif on h1/h2, Inter on body | smoke | `npx playwright test tests/scaffold.spec.ts --grep "dark background and fonts"` | Wave 0 |
| FOUND-05 | Reduced motion preference detected and respected | e2e | `npx playwright test tests/a11y.spec.ts --grep "reduced motion"` | Wave 0 |
| FOUND-06 | No client-side errors in SSR, no hydration mismatches | smoke | `npx playwright test tests/scaffold.spec.ts --grep "SSR safe"` | Wave 0 |
| A11Y-01 | No animations when prefers-reduced-motion is set | e2e | `npx playwright test tests/a11y.spec.ts --grep "no animations"` | Wave 0 |
| A11Y-02 | Tab through all sections in DOM order | e2e | `npx playwright test tests/a11y.spec.ts --grep "keyboard navigation"` | Wave 0 |
| A11Y-03 | ARIA landmarks present on all sections | e2e | `npx playwright test tests/a11y.spec.ts --grep "ARIA landmarks"` | Wave 0 |
| A11Y-04 | Skip links navigate to #projects and #contact | e2e | `npx playwright test tests/a11y.spec.ts --grep "skip links"` | Wave 0 |
| A11Y-05 | All text passes WCAG AA contrast | manual-only | Axe/Lighthouse audit -- contrast depends on rendered colors | N/A |
| A11Y-06 | Focus ring visible on interactive elements | e2e | `npx playwright test tests/a11y.spec.ts --grep "focus styles"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx playwright test --grep @smoke`
- **Per wave merge:** `npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `playwright.config.ts` -- Playwright configuration
- [ ] `tests/scaffold.spec.ts` -- covers FOUND-01, FOUND-06
- [ ] `tests/a11y.spec.ts` -- covers FOUND-05, A11Y-01 through A11Y-06
- [ ] Framework install: `npm init playwright@latest` -- Playwright not yet installed

## Sources

### Primary (HIGH confidence)
- [Next.js Font Optimization docs](https://nextjs.org/docs/app/getting-started/fonts) - Font loading patterns, next/font/google API, multiple font setup
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Verified #FFFFFF on #0A0A0A = 19.7:1, #C4964A on #0A0A0A = 7.36:1
- [W3C WCAG 2.1 Contrast Understanding](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) - AA requires 4.5:1 normal text, 3:1 large text
- [Google Fonts DM Serif Display](https://fonts.google.com/specimen/DM+Serif+Display) - Only weight 400 available

### Secondary (MEDIUM confidence)
- [Smashing Magazine - Modern Fluid Typography](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/) - clamp() patterns and modular scale approach
- [Modern CSS Solutions - Fluid Type Scale](https://moderncss.dev/generating-font-size-css-rules-and-creating-a-fluid-type-scale/) - CSS custom property type scale generation

### Tertiary (LOW confidence)
- None -- all findings verified with primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Next.js 15 + next/font/google is well-documented, no external dependencies needed
- Architecture: HIGH - Section shell pattern is vanilla HTML + CSS, no complex library integration
- Pitfalls: HIGH - All pitfalls are well-known patterns with documented solutions
- Accessibility: HIGH - WCAG AA requirements are objective and measurable, contrast ratios verified with tools

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable technologies, 30-day validity)
