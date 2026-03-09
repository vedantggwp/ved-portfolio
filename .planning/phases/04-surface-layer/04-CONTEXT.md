# Phase 4: Surface Layer - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Provocation text overlay on the surface section — the first thing visitors see. Text fades in over the monolith on load, holds, then fades out with parallax drift on scroll. No name, title, or CTA. The surface communicates "lean in" not "here's my resume." No new sections, no scroll changes — just the DOM content layer for the existing surface section.

</domain>

<decisions>
## Implementation Decisions

### Provocation Copy
- Two-line couplet (setup + payoff)
- Tone: cryptic/philosophical — rewards re-reading, makes visitors pause and interpret
- Voice: second-person — addresses the visitor directly, pulls them in
- Claude drafts 3-5 options during planning using PROJECT.md personality brief as raw material
- Must be "uniquely Ved" — no generic inspirational quotes, no tech platitudes
- Reference material: "I don't build what's expected. I build what's needed" / "sees things they don't" / "magnetic, not loud"

### Typography
- NOT DM Serif Display or Inter for the provocation — these are the site's workhorse fonts, the provocation needs its own voice
- Claude researches distinctive font options during planning — must match "Venus in Virgo precision," Villeneuve cinematography, Teenage Engineering aesthetic
- Font must be: intentional, non-decorative, non-generic, not the default AI-project serif
- Present 3 options with rationale for user selection before implementation
- Color: warm ivory (#F5F0E8) against dark background (#0A0A0A)

### Positioning
- Centered over the monolith's midsection — text and monolith share the same vertical axis
- Text is the focal point; monolith with amber edge glow becomes the backdrop
- Sizing: large enough to command attention but not shouting — Claude's discretion on exact scale

### Fade Choreography — Entrance
- Slow materialization: opacity 0% → 100% over ~2-3 seconds on page load
- Staggered: line 1 materializes first, ~0.5s pause, line 2 follows
- Cinematic feel — "like discovering something that was already there"
- Matches "Ved is not loud. Ved is magnetic." — text reveals itself, doesn't announce

### Fade Choreography — Exit
- Parallax drift: text scrolls at ~50-70% of page scroll speed (lingers in space while user dives past)
- Simultaneous opacity fade to transparent as scroll progresses
- Scroll-linked (driven by scrollStore.sectionProgress), not time-based
- The provocation hangs in space, reinforcing the depth metaphor

### Reduced-Motion Version
- Static text at full opacity, no fade-in animation, no parallax drift
- Text still centered over the surface section
- Standard scroll behavior (no pinning, per Phase 2 reduced-motion decisions)
- Intentionally sparse — no added "scroll to explore" hint

### Claude's Discretion
- Exact font size and line spacing for the provocation
- Entrance animation easing curve
- Parallax speed ratio within the 50-70% range
- Whether the two lines share a container or are positioned independently
- z-index layering between text and R3F canvas
- Any subtle text-shadow or glow treatment to ensure readability over the monolith

</decisions>

<specifics>
## Specific Ideas

- "Venus in Virgo aesthetic: precision, not decoration. Every element earns its place." — the provocation font must embody this
- Villeneuve cinematography reference: his films open with long, patient shots that demand attention — the slow materialization mirrors this
- The parallax drift should feel like the thought is hanging in space while you dive past it — not rushing away
- "The experience of using the site is proof of cross-domain thinking" — the surface layer's restraint (no bio, no CTA, just a provocation) IS the proof

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scrollStore.sectionProgress`: drives parallax drift and opacity fade (already available from Phase 2)
- `scrollStore.progress`: could drive global-aware effects if needed
- `useReducedMotion` hook: gates all animation/parallax behavior
- `SectionShell` for surface section: `id="surface"`, `role="banner"`, heading "Introduction"
- `VisuallyHidden` component: available for screen-reader-only text if needed

### Established Patterns
- Mutable scroll store for 60fps animations (never React state)
- Client-only boundaries via `'use client'` directives
- `SECTIONS` config in `sections.ts` — surface section already defined
- CSS custom properties for typography scale (`--text-xs` through `--text-display`)

### Integration Points
- Surface section in `page.tsx` currently renders `null` children — provocation component goes here
- Text must layer above R3F Canvas (CSS z-index or pointer-events management)
- Phase 2 scroll engine already handles surface section pinning — text animation hooks into existing pin
- Font loading: new distinctive font needs `next/font` integration alongside existing DM Serif Display + Inter

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-surface-layer*
*Context gathered: 2026-03-09*
