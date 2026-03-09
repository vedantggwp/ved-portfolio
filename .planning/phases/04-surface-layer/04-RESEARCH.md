# Phase 4: Surface Layer - Research

**Researched:** 2026-03-09
**Domain:** CSS typography overlay, scroll-linked animation, next/font integration
**Confidence:** HIGH

## Summary

Phase 4 adds a provocation text overlay to the surface section -- a two-line couplet that fades in on load and parallax-drifts out on scroll. The technical scope is narrow: one new React component, one new Google Font via `next/font`, CSS animations for entrance, and `requestAnimationFrame` reading from the existing `scrollStore` for scroll-linked parallax and fade-out.

The surface section currently renders `null` children in `page.tsx`. The provocation component slots in there as a `'use client'` component. The R3F canvas sits at `z-index: 0` with `pointer-events: none` in a fixed container, while the `<main>` wrapper is at `z-index: 1` -- so the text naturally layers above the monolith without z-index tricks. The scroll store already provides `sectionProgress` for the surface section (0-1 range during pin), which drives both parallax offset and opacity fade.

**Primary recommendation:** Build a single `Provocation` client component using CSS `@keyframes` for the staggered entrance fade and a `useEffect` + `rAF` loop reading `scrollStore.sectionProgress` for scroll-linked parallax/opacity. No GSAP needed for the text animations -- CSS handles the entrance, raw rAF handles the scroll-linked exit.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Two-line couplet (setup + payoff), cryptic/philosophical tone, second-person voice
- Claude drafts 3-5 provocation options during planning using PROJECT.md personality brief
- Font must NOT be DM Serif Display or Inter -- needs its own voice
- Font must match "Venus in Virgo precision," Villeneuve cinematography, Teenage Engineering aesthetic
- Present 3 font options with rationale for user selection before implementation
- Color: warm ivory (#F5F0E8) against dark background (#0A0A0A)
- Centered over monolith midsection, shared vertical axis
- Entrance: opacity 0->100% over ~2-3 seconds, staggered (line 1 first, ~0.5s pause, line 2)
- Exit: parallax drift at ~50-70% scroll speed, simultaneous opacity fade to transparent
- Exit is scroll-linked via `scrollStore.sectionProgress`, not time-based
- Reduced motion: static text at full opacity, no fade-in, no parallax, standard scroll

### Claude's Discretion
- Exact font size and line spacing
- Entrance animation easing curve
- Parallax speed ratio within 50-70% range
- Whether two lines share a container or are positioned independently
- z-index layering between text and R3F canvas
- Subtle text-shadow or glow for readability over monolith

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SURF-01 | Provocation text (uniquely Ved) fades in over the monolith -- not a bio | Font research (3 options), CSS @keyframes entrance animation, Provocation component architecture |
| SURF-02 | Text fades up and out as user begins scrolling | scrollStore.sectionProgress drives rAF loop for parallax translateY + opacity |
| SURF-03 | No name, title, or CTA on surface -- just the provocation | Component renders only the couplet; verified by omission and e2e test |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next/font/google | 16.1.6 | Self-hosted Google Font loading | Already used for DM Serif Display + Inter; zero-layout-shift, no external requests |
| React | 19.2.3 | Component, useEffect, useRef | Already in project |
| CSS Modules / globals.css | n/a | @keyframes entrance animation | No runtime cost; CSS animations are GPU-composited |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| scrollStore | n/a (project lib) | Read sectionProgress for parallax/fade | Scroll-linked exit animation |
| useReducedMotion | n/a (project hook) | Gate all animations | Reduced motion variant |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS @keyframes for entrance | GSAP timeline | Overkill for a two-element staggered fade; adds JS bundle for something CSS handles natively |
| rAF loop for scroll exit | GSAP ScrollTrigger onUpdate | ScrollTrigger already fires for the section but updating DOM text styles should stay decoupled from the engine; direct rAF is lighter |
| Framer Motion | n/a | Not in project; massive bundle; wrong tool for scroll-linked effects |

**Installation:**
No new npm packages needed. Only a new `next/font/google` import for the chosen font.

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    Provocation.tsx        # 'use client' -- entrance + scroll-linked exit
    Provocation.module.css # @keyframes, positioning, typography
  app/
    layout.tsx             # Add new font CSS variable (--font-provocation)
    page.tsx               # Pass <Provocation /> as surface section child
    globals.css            # Add --font-provocation to :root font stack
```

### Pattern 1: CSS Entrance + rAF Scroll Exit
**What:** Separate entrance animation (CSS @keyframes, fires once on mount) from exit animation (JS rAF loop reading scrollStore).
**When to use:** When entrance is time-based and exit is scroll-linked -- mixing these in one system creates unnecessary coupling.
**Example:**
```typescript
// Provocation.tsx
'use client'

import { useEffect, useRef } from 'react'
import { scrollStore } from '@/lib/scroll-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import styles from './Provocation.module.css'

export function Provocation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = containerRef.current
    if (!el) return

    let rafId: number

    const tick = () => {
      const p = scrollStore.sectionProgress
      // Parallax: text moves at 60% of scroll speed (lingers)
      const yOffset = p * 40 // vh units worth of drift
      const opacity = 1 - p

      el.style.transform = `translateY(-${yOffset}vh)`
      el.style.opacity = String(Math.max(0, opacity))

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [prefersReduced])

  return (
    <div
      ref={containerRef}
      className={prefersReduced ? styles.static : styles.animated}
      aria-label="Provocation"
    >
      <p className={styles.line1}>Line one of the couplet</p>
      <p className={styles.line2}>Line two of the couplet</p>
    </div>
  )
}
```

```css
/* Provocation.module.css */
.animated {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 2;
  will-change: transform, opacity;
}

.static {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 2;
}

.line1 {
  font-family: var(--font-provocation);
  font-size: var(--text-3xl);
  color: #F5F0E8;
  opacity: 0;
  animation: fadeIn 2.5s ease-out 0.5s forwards;
}

.line2 {
  font-family: var(--font-provocation);
  font-size: var(--text-3xl);
  color: #F5F0E8;
  opacity: 0;
  animation: fadeIn 2.5s ease-out 1s forwards;
}

/* Reduced motion: no animation, full opacity */
.static .line1,
.static .line2 {
  opacity: 1;
  animation: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Pattern 2: Font Loading via next/font CSS Variable
**What:** Add the provocation font alongside existing fonts in layout.tsx using next/font/google, exposed as a CSS variable.
**When to use:** Any time a new font is introduced in the project.
**Example:**
```typescript
// layout.tsx addition
import { Cormorant } from 'next/font/google' // example -- actual font TBD

const provocationFont = Cormorant({
  weight: '300',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-provocation',
})

// Add to <html> className:
// className={`${dmSerif.variable} ${inter.variable} ${provocationFont.variable}`}
```

### Anti-Patterns to Avoid
- **Using React state for scroll-driven values:** scrollStore is mutable for a reason -- `useState` would trigger 60fps re-renders. Read from scrollStore in rAF, write directly to `el.style`.
- **GSAP for the entrance fade:** A staggered opacity animation is trivially handled by CSS `animation-delay`. Adding GSAP creates a dependency on the scroll engine for something that should be independent.
- **Positioning text with `fixed` instead of `absolute`:** The surface section is pinned by ScrollTrigger. Text inside the pinned section should be `absolute` within the section, not `fixed` to viewport. The pin handles the "staying in place" behavior.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading/optimization | Manual @font-face with preload | `next/font/google` | Handles subsetting, self-hosting, font-display, CSS variable injection, zero CLS |
| Scroll progress tracking | Custom scroll listener | `scrollStore.sectionProgress` | Already computed by ScrollEngine's ScrollTrigger per section |
| Reduced motion detection | Manual matchMedia | `useReducedMotion` hook | Already exists, handles SSR hydration and change events |
| GPU-composited animations | JS-driven opacity/transform per frame for entrance | CSS `@keyframes` + `will-change` | Browser optimizes CSS animations onto compositor thread |

**Key insight:** This phase has almost zero new infrastructure. Everything needed (scroll store, reduced motion hook, section shell, font loading pattern) already exists. The work is composition, not construction.

## Common Pitfalls

### Pitfall 1: CSS animation replays on scroll-driven style changes
**What goes wrong:** Setting `el.style.opacity` in the rAF loop can interfere with the CSS entrance animation if both target the same property.
**Why it happens:** CSS `animation` and inline styles fight for the same property. Once the JS rAF loop starts setting opacity, it overrides the animation.
**How to avoid:** Start the rAF loop only after the entrance animation completes. Use the `animationend` event on the second line (the later one) to trigger the rAF loop. Before that event fires, CSS controls opacity.
**Warning signs:** Text flickers or jumps from 0 to 1 opacity on load.

### Pitfall 2: Parallax drift feels jittery on high-DPI displays
**What goes wrong:** Using `top` or `margin-top` for the parallax offset causes layout recalculation every frame.
**Why it happens:** Only `transform` and `opacity` are compositor-friendly. Anything else triggers layout.
**How to avoid:** Use `translateY` for all positional drift. Add `will-change: transform, opacity` to the container.
**Warning signs:** Dropped frames visible in Chrome DevTools Performance panel.

### Pitfall 3: Text invisible over dark monolith geometry
**What goes wrong:** Warm ivory (#F5F0E8) text over the dark monolith surface lacks contrast where the monolith's amber glow overlaps.
**Why it happens:** The monolith has amber fresnel edge glow that could create low-contrast zones.
**How to avoid:** Add a subtle text-shadow (e.g., `0 0 30px rgba(0,0,0,0.6)`) to create a dark halo around the text. Test with the actual monolith rendered.
**Warning signs:** Text feels "washed out" or hard to read in screenshots.

### Pitfall 4: Entrance animation visible on route re-navigation
**What goes wrong:** If the user navigates away and back, the CSS animation replays.
**Why it happens:** CSS animations replay when elements remount. In Next.js, client-side navigation can remount page components.
**How to avoid:** For v1 this is acceptable since this is a single-page portfolio with no routing. Document as a known behavior if routes are added later.

### Pitfall 5: Reduced motion users see no text at all
**What goes wrong:** If the CSS animation is disabled but opacity isn't explicitly set to 1, text stays at opacity 0.
**Why it happens:** The initial CSS sets `opacity: 0` with the animation bringing it to 1. Reduced motion disables the animation but not the initial state.
**How to avoid:** The `.static` variant class must explicitly set `opacity: 1` and `animation: none`. The globals.css `prefers-reduced-motion` rule already forces `animation-duration: 0.01ms` but relying on this alone is fragile.
**Warning signs:** Empty surface section in reduced-motion e2e tests.

## Code Examples

### Integrating provocation into page.tsx
```typescript
// page.tsx -- minimal change
import { Provocation } from '@/components/Provocation'

// In the map:
{section.id === 'surface' ? <Provocation /> : <LazySection />}
```

### Listening for animation completion before starting scroll effects
```typescript
useEffect(() => {
  if (prefersReduced) return
  const el = containerRef.current
  if (!el) return

  const line2 = el.querySelector('[data-line="2"]') as HTMLElement
  if (!line2) return

  const startScrollEffects = () => {
    let rafId: number
    const tick = () => {
      const p = scrollStore.sectionProgress
      el.style.transform = `translateY(-${p * 40}vh)`
      el.style.opacity = String(Math.max(0, 1 - p))
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    // Cleanup stored for unmount
    cleanupRef.current = () => cancelAnimationFrame(rafId)
  }

  line2.addEventListener('animationend', startScrollEffects, { once: true })
  return () => {
    line2.removeEventListener('animationend', startScrollEffects)
    cleanupRef.current?.()
  }
}, [prefersReduced])
```

### SectionShell positioning context
The `SectionShell` renders a `<section>` with `minHeight: var(--section-min-height)`. For the provocation to be positioned `absolute` within it, the section needs `position: relative`. This can be added to the surface section specifically:
```css
#surface {
  position: relative;
  overflow: hidden; /* prevent parallax drift from showing outside */
}
```

## Font Research: Three Distinctive Options

Based on the locked decision that the font must NOT be DM Serif Display or Inter, must match "Venus in Virgo precision," Villeneuve cinematography, and Teenage Engineering aesthetic, here are three researched options. All are on Google Fonts and work with `next/font/google`.

### Option A: Cormorant (Light 300)
- **Character:** High-contrast display Garamond with extreme refinement. Hairline strokes feel like precision instruments. The Light weight is almost dangerously thin -- it commands attention through restraint.
- **Why it fits:** "Venus in Virgo precision" -- every stroke is deliberate. The extreme contrast between thick and thin strokes mirrors the monolith's tension between minimal and complex. Villeneuve-grade: his title cards use similarly refined, high-contrast serifs.
- **Risk:** At very large sizes on low-DPI screens, hairline strokes may anti-alias poorly.
- **Google Fonts:** `Cormorant` (not Cormorant Garamond -- the base family has sharper letterforms)

### Option B: Instrument Serif (Regular 400)
- **Character:** Condensed, confident, modern display serif. Designed specifically for headlines. Clean without being sterile, distinctive without being decorative.
- **Why it fits:** Teenage Engineering aesthetic -- functional precision, no ornamentation. The condensed proportions feel architectural. It reads as "this was chosen with intention" rather than "this is a nice serif."
- **Risk:** Being relatively new (2023), it may be less battle-tested for very large display sizes. Single weight only.

### Option C: Libre Caslon Display (Regular 400)
- **Character:** A display Caslon inspired by 1960s hand-lettered American Caslons rather than 18th-century printing specimens. Warmer and more characterful than standard Caslon revivals.
- **Why it fits:** The hand-lettered heritage gives it a "discovered, not designed" quality that matches "like discovering something that was already there." It has warmth without being decorative -- the serif equivalent of warm ivory on dark.
- **Risk:** Only one weight available. The vintage-modern character could read as too "warm" for the precision aesthetic.

**Recommendation (Claude's discretion within font selection):** Present all three to the user. Cormorant Light is the strongest match for the precision/cinematic brief, but Instrument Serif is the safest bet for the Teenage Engineering side of the aesthetic.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @font-face + preload link | next/font/google | Next.js 13+ (2023) | Zero CLS, self-hosted, no external requests |
| GSAP for all animations | CSS @keyframes for time-based, rAF for scroll-linked | Current best practice | Reduces JS bundle, enables compositor-thread animations |
| IntersectionObserver for scroll effects | ScrollTrigger with mutable store | Phase 2 established | Already in project, sectionProgress available |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 |
| Config file | playwright.config.ts |
| Quick run command | `npx playwright test tests/surface.spec.ts --headed` |
| Full suite command | `npx playwright test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SURF-01 | Provocation text visible over monolith on load | e2e | `npx playwright test tests/surface.spec.ts -g "provocation text visible" -x` | No -- Wave 0 |
| SURF-01 | Text uses distinctive font (not DM Serif Display / Inter) | e2e | `npx playwright test tests/surface.spec.ts -g "distinctive font" -x` | No -- Wave 0 |
| SURF-02 | Text fades out and drifts up on scroll | e2e | `npx playwright test tests/surface.spec.ts -g "fade on scroll" -x` | No -- Wave 0 |
| SURF-03 | No name, title, or CTA on surface | e2e | `npx playwright test tests/surface.spec.ts -g "no bio elements" -x` | No -- Wave 0 |
| A11Y-01 | Reduced motion: static text, no animation | e2e | `npx playwright test tests/surface.spec.ts -g "reduced motion" -x` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx playwright test tests/surface.spec.ts -x`
- **Per wave merge:** `npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/surface.spec.ts` -- covers SURF-01, SURF-02, SURF-03, A11Y-01 (reduced motion)
- [ ] No new framework install needed -- Playwright already configured

## Open Questions

1. **Which font will the user select?**
   - What we know: Three options researched (Cormorant, Instrument Serif, Libre Caslon Display)
   - What's unclear: User preference
   - Recommendation: Present during planning, user picks before implementation begins

2. **Exact provocation copy**
   - What we know: Two-line couplet, cryptic/philosophical, second-person, uniquely Ved
   - What's unclear: Actual words
   - Recommendation: Claude drafts 3-5 options during planning per CONTEXT.md decision

3. **Will parallax offset values need tuning?**
   - What we know: 50-70% scroll speed range is locked; exact value is Claude's discretion
   - What's unclear: What "feels right" with the actual monolith backdrop
   - Recommendation: Start at 60%, tune during implementation based on visual feel

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/SectionShell.tsx`, `src/lib/scroll-store.ts`, `src/lib/scroll-physics.ts`, `src/hooks/useReducedMotion.ts` -- direct code inspection
- `package.json` -- verified dependency versions (Next.js 16.1.6, React 19.2.3, Three.js 0.183.2, GSAP 3.14.2)

### Secondary (MEDIUM confidence)
- [Next.js Font Optimization docs](https://nextjs.org/docs/app/getting-started/fonts) -- next/font/google usage patterns
- [Google Fonts - Cormorant](https://fonts.google.com/specimen/Cormorant) -- font specimen and weight availability
- [Google Fonts - Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) -- font specimen
- [Google Fonts - Libre Caslon Display](https://fonts.google.com/specimen/Libre+Caslon+Display) -- font specimen

### Tertiary (LOW confidence)
- [Best Serif Fonts 2026 roundups](https://fontfyi.com/blog/best-serif-fonts-2026/) -- community font recommendations (used for discovery, not authority)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all tools already in the project, no new dependencies
- Architecture: HIGH -- pattern is straightforward (CSS entrance + rAF scroll exit), verified against existing codebase patterns
- Pitfalls: HIGH -- common CSS animation + scroll interaction issues are well-documented
- Font research: MEDIUM -- options identified and available on Google Fonts, but subjective aesthetic match requires user validation

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable -- no fast-moving dependencies)
