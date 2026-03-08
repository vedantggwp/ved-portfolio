# Project Research Summary

**Project:** Ved Portfolio (3D Scrollytelling)
**Domain:** Interactive 3D portfolio website with scroll-driven narrative
**Researched:** 2026-03-08
**Confidence:** HIGH

## Executive Summary

This is a single-page 3D scrollytelling portfolio built with Next.js 15, React Three Fiber, and scroll-linked animation (Lenis + GSAP). The core concept is a depth metaphor -- visitors scroll from "surface" to "floor," encountering an evolving 3D monolith driven by custom GLSL shaders. Experts in this domain build these sites around a fixed WebGL canvas with scrollable DOM content overlaid on top, using a mutable store pattern (not React state) to feed scroll position into the render loop at 60fps. The R3F + Lenis + GSAP stack is the established choice for this class of project, with well-documented integration patterns.

The recommended approach is to build the scroll infrastructure first (Lenis-GSAP bridge, mutable scroll store, fixed canvas shell), then layer in 3D content and DOM sections, and finally add polish features like audio synthesis and advanced shaders. Accessibility must be scaffolded from day one -- not retrofitted -- because Ved's portfolio promotes an accessibility product (NeuroEdge), making a broken screen reader experience hypocritical. The mobile experience requires a deliberate CSS parallax alternative, not a degraded 3D fallback; this should be built alongside desktop sections, not deferred to a late phase.

The primary risks are: (1) Lenis + GSAP ScrollTrigger desynchronization, which silently breaks scroll-triggered animations and requires careful bridge wiring; (2) React state in the render loop killing frame rate -- a common mistake that must be prevented architecturally in phase 1; (3) mobile GPU shader failures that only surface on real hardware; and (4) the mobile fallback being treated as an afterthought, resulting in 50%+ of visitors seeing a broken experience. All four are preventable with the patterns documented in the research.

## Key Findings

### Recommended Stack

The stack centers on the pmndrs ecosystem (R3F 9 + drei 10 + postprocessing 3) running on Next.js 15 with React 19. Lenis handles smooth scroll physics while GSAP ScrollTrigger manages section pinning and scrubbed animations -- these two must be explicitly synchronized via a bridge pattern. Tone.js provides scroll-reactive audio synthesis (v2+ feature). Zustand manages infrequent UI state; a plain mutable object handles 60fps scroll values. See `.planning/research/STACK.md` for full version matrix and integration code.

**Core technologies:**
- **Next.js 15 + React 19:** App framework with SSR. Not Next 16 -- R3F ecosystem is proven on 15, and 16 introduces breaking changes with no benefit here.
- **R3F 9 + Three.js r183 + drei 10:** Declarative 3D rendering. Pin Three.js to exact minor version (breaking changes in minors). R3F's `useFrame` is the performance-critical hook.
- **Lenis 1.3 + GSAP 3.14:** Smooth scroll + section pinning/scrubbing. The Lenis-GSAP bridge is the most fragile integration -- must set `lagSmoothing(0)` and wire `ScrollTrigger.update` to Lenis events.
- **Tone.js 15:** Web Audio synthesis for scroll-reactive ambient sound. Deferred to v2+. Requires user gesture to start AudioContext.
- **Tailwind 4 + CSS Modules:** Static CSS for DOM styling. No CSS-in-JS runtime overhead competing with WebGL.
- **Zustand 5 (UI) + plain mutable object (scroll):** Split state strategy. Never use React state or zustand subscriptions for values changing at 60fps.

### Expected Features

**Must have (table stakes):**
- Fast initial load (<3s) with progressive 3D loading behind a skeleton state
- Mobile CSS parallax fallback (50%+ of traffic is mobile, R3F should not load on mobile)
- Smooth 60fps scroll on desktop (Lenis + GSAP + mutable store)
- Clear project showcases (3-5 projects with problem/approach/outcome framing)
- Full accessibility: `prefers-reduced-motion`, keyboard nav, ARIA landmarks, screen reader support
- Contact floor with email link (no contact form)
- Lighthouse 90+ on desktop

**Should have (v1.x, post-launch):**
- Custom GLSL shaders for monolith morphing (upgrade from basic geometry)
- Variable scroll physics per section (subtle speed variation, max 0.7x-1.3x range)
- Cinematic lighting shifts tied to scroll depth
- Section "pressure change" transitions (atmospheric, not mechanical)

**Defer (v2+):**
- Scroll-reactive audio synthesis (Tone.js) -- highest complexity, lowest recruiter impact
- Advanced monolith geometry states per section
- Scroll velocity-reactive visual effects (motion blur, chromatic aberration)

**Anti-features (do not build):**
- Dark/light theme toggle (the dark palette IS the brand)
- Particle effects / constellation backgrounds (cliche)
- Scroll hijacking / full-page snap (users hate losing scroll control)
- Custom cursor, blog section, contact form, chatbot

### Architecture Approach

The architecture follows a fixed-canvas-plus-scrollable-DOM-overlay pattern. A single R3F `<Canvas>` is positioned fixed at z-index -1 and never unmounts. Scrollable DOM sections sit at z-index 1 with transparent backgrounds. The scroll engine (Lenis + GSAP) writes to a mutable plain-object store; the R3F `useFrame` loop reads this store every frame to update shader uniforms, camera, fog, and lighting without triggering React re-renders. DOM animations are handled entirely by GSAP ScrollTrigger's scrub/pin system. Audio and accessibility are independent layers that read from the same scroll store. See `.planning/research/ARCHITECTURE.md` for full component diagram and data flow.

**Major components:**
1. **Scroll Engine (Lenis + GSAP bridge)** -- owns scroll physics, writes to mutable store, single source of truth
2. **R3F Canvas + Monolith** -- fixed full-viewport WebGL surface, reads scroll store in `useFrame`, custom GLSL shaders
3. **DOM Sections** -- scrollable HTML content with GSAP ScrollTrigger pins/scrubs, semantic structure for accessibility
4. **Mutable Scroll Store** -- plain JS object (not React state, not zustand), read by canvas/audio/accessibility at 60fps
5. **Accessibility Layer** -- `prefers-reduced-motion` gate, ARIA live regions, keyboard nav, CSS parallax fallback
6. **Audio Layer (v2+)** -- Tone.js synthesis, gain crossfading by scroll section, opt-in via user gesture

### Critical Pitfalls

1. **React state in the render loop** -- Using `useState` for scroll position triggers 60 re-renders/second, killing frame rate. Prevent by establishing the mutable store pattern in phase 1 and grepping for `useState` in the canvas tree.
2. **Lenis + GSAP desync** -- Without the explicit bridge (`lenis.on('scroll', ScrollTrigger.update)` + ticker wiring + `lagSmoothing(0)`), pinned sections fire at wrong positions. Build and test the bridge in isolation before any content depends on it.
3. **Canvas invisible to assistive technology** -- All text must be DOM elements overlaying the canvas, never 3D text meshes. Add ARIA labels, skip links, and `role="img"` on the canvas element from day one.
4. **GLSL shaders breaking on mobile GPUs** -- Always use `precision highp float`, avoid dynamic loop bounds, test on real mobile hardware during shader development (not after).
5. **Mobile fallback as afterthought** -- Design the CSS parallax mobile experience as a parallel track, not a degraded version. Build it alongside desktop sections. Detect by GPU capability, not screen width alone.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation and Scaffold
**Rationale:** The scroll store, Lenis-GSAP bridge, and canvas shell are dependencies for everything else. Accessibility scaffolding must be baked in from day one (retrofitting is exponentially harder). SSR boundaries must be established immediately to avoid hydration errors.
**Delivers:** Next.js project with fixed R3F canvas (empty), mutable scroll store, Lenis-GSAP bridge, `prefers-reduced-motion` detection, semantic HTML scaffold, skip links, dev performance overlay (draw call counter).
**Addresses:** Fast initial load scaffold, keyboard nav structure, ARIA landmarks, SSR hydration safety.
**Avoids:** React state in render loop (pattern established), SSR hydration mismatch (dynamic import boundary set), draw call blindness (overlay from day one).

### Phase 2: Scroll System and Section Structure
**Rationale:** DOM sections with ScrollTrigger pinning/scrubbing must work correctly before any visual content is layered on top. The Lenis-GSAP bridge must be validated with a test harness (colored sections + logged trigger points) before trusting it with real content.
**Delivers:** 4 scrollable DOM sections (Surface, Mid-Depth, Deep, Floor) with correct ScrollTrigger pins, scroll progress writing to store, basic section transitions, typography and font loading.
**Uses:** Lenis, GSAP ScrollTrigger, zustand (for section labels), next/font.
**Avoids:** Lenis-GSAP desync (test harness validates), scroll hijacking (subtle physics only, 0.7x-1.3x range).

### Phase 3: 3D Monolith and Canvas Scene
**Rationale:** Depends on working scroll store and canvas shell from phases 1-2. The monolith is the hero differentiator. Start with simple geometry and noise-based shaders; keep fragment shader under 100 lines. Test on mobile hardware immediately.
**Delivers:** Monolith mesh with scroll-driven GLSL shaders (vertex displacement, Fresnel glow), camera movement tied to scroll, fog and basic lighting per section.
**Uses:** R3F, Three.js, drei `shaderMaterial`, custom GLSL.
**Avoids:** Shader complexity spiral (100-line budget), mobile GPU failures (test on real devices), draw call explosion (monitor via overlay).

### Phase 4: Content Sections and Mobile Parallax
**Rationale:** With scroll system and 3D scene working, populate actual content. Build the mobile CSS parallax fallback simultaneously -- not later. Each section gets both a desktop (3D overlay) and mobile (CSS parallax) treatment.
**Delivers:** Project showcases (NeuroEdge, Springpod, FraudShieldAI, Scrollwise), provocation text on surface, contact floor, mobile CSS parallax for all sections, GPU capability detection.
**Addresses:** Project showcases, contact CTA, mobile responsiveness, provocation copy.
**Avoids:** Mobile as afterthought (parallel build), over-reliance on hover effects (tap/focus alternatives).

### Phase 5: Post-Processing, Lighting, and Polish
**Rationale:** Visual polish layers (bloom, vignette, cinematic lighting shifts) require the core scene and content to be stable. These are v1.x differentiators that elevate the experience.
**Delivers:** Post-processing effects (bloom on monolith, vignette), scroll-driven lighting temperature shifts, section pressure transitions (atmospheric), depth progress indicator.
**Uses:** @react-three/postprocessing, R3F lighting.
**Avoids:** Performance death by draw calls (budget enforcement), shader complexity creep.

### Phase 6: Accessibility Audit and Performance
**Rationale:** With all content and visuals in place, run a dedicated accessibility audit (VoiceOver/NVDA) and performance pass. This phase is verification and optimization, not creation.
**Delivers:** WCAG AA compliance verification, bundle optimization (dynamic imports, tree-shaking, texture compression), Lighthouse 90+ desktop, DPR capping on mobile, Open Graph meta tags for LinkedIn/Twitter previews.
**Addresses:** Screen reader compatibility, performant loading, SEO/social previews.

### Phase 7: Audio Layer (v2)
**Rationale:** Scroll-reactive audio is the highest-complexity, lowest-priority feature for recruiter impressions. Build only after v1 is polished and deployed. Requires user gesture (click handler on waveform toggle) to start AudioContext.
**Delivers:** Tone.js integration, scroll-reactive ambient synthesis, gain crossfading per section, Safari `interrupted` state handling.
**Uses:** Tone.js, scroll store, zustand (audio toggle state).
**Avoids:** Audio autoplay policy violations (click-only initialization).

### Phase Ordering Rationale

- **Phases 1-2 first** because the scroll store and Lenis-GSAP bridge are architectural dependencies for every subsequent phase. Getting these wrong means rebuilding everything on top.
- **Phase 3 before Phase 4** because the monolith shader needs early mobile testing; discovering GPU incompatibility after content is built wastes time.
- **Phase 4 builds mobile alongside desktop** because the research unanimously flags mobile-as-afterthought as a HIGH recovery cost pitfall.
- **Phase 5 after content** because post-processing and lighting polish require stable geometry and section boundaries.
- **Phase 6 as verification** because accessibility and performance are easier to audit when content is frozen.
- **Phase 7 is deferred** because audio adds the most complexity with the least recruiter impact.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Lenis-GSAP bridge initialization order -- fragile integration with specific wiring requirements. Research well-documented but implementation is tricky.
- **Phase 3:** GLSL shader design for the monolith -- needs specific noise function selection, morph target strategy, and mobile GPU testing approach.
- **Phase 4:** GPU capability detection strategy -- `navigator.gpu`, `renderer.capabilities`, device memory, framerate sampling. No single canonical approach.
- **Phase 7:** Tone.js scroll-reactive synthesis -- sparse examples of continuous scroll-to-audio mapping. Most Tone.js examples are trigger-based, not continuous.

Phases with standard patterns (skip research-phase):
- **Phase 2:** ScrollTrigger pin/scrub is extremely well-documented with hundreds of examples.
- **Phase 5:** R3F postprocessing (bloom, vignette) is straightforward with official docs and examples.
- **Phase 6:** Lighthouse optimization and WCAG auditing have established playbooks.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified on npm with current versions. R3F 9 + Next.js 15 + React 19 compatibility confirmed. GSAP licensing confirmed free post-Webflow. |
| Features | HIGH | Feature priorities grounded in recruiter behavior research, WCAG requirements, and competitive analysis of award-winning 3D portfolios. |
| Architecture | HIGH | Fixed-canvas + scroll-overlay is the established pattern (14islands, darkroom engineering, Codrops tutorials). Mutable store is R3F-endorsed. |
| Pitfalls | HIGH | All 10 pitfalls sourced from official docs, GSAP forums, R3F GitHub issues, and NN/g UX research. Recovery costs assessed based on community reports. |

**Overall confidence:** HIGH

### Gaps to Address

- **Tone.js continuous scroll mapping:** Most examples are event-triggered (play on click). Continuous gain-crossfading driven by scroll position needs prototyping during Phase 7 planning.
- **GPU capability detection thresholds:** No canonical set of thresholds for "serve CSS fallback vs. serve WebGL." Will need empirical testing on target devices during Phase 4.
- **Three.js r183 specific changes:** r183 was published ~7 days ago. Breaking changes versus r182 need verification against R3F 9 compatibility when installing.
- **Variable scroll physics UX:** The 0.7x-1.3x speed range is a guideline from NN/g research, but optimal values for this specific content need user testing during Phase 2.

## Sources

### Primary (HIGH confidence)
- [R3F Official Pitfalls Documentation](https://docs.pmnd.rs/react-three-fiber/advanced/pitfalls)
- [R3F npm v9.5.0](https://www.npmjs.com/package/@react-three/fiber)
- [Three.js npm v0.183.2](https://www.npmjs.com/package/three)
- [Lenis GitHub](https://github.com/darkroomengineering/lenis)
- [GSAP npm v3.14.2](https://www.npmjs.com/package/gsap)
- [GSAP Forum: ScrollTrigger + Lenis Synchronization](https://gsap.com/community/forums/topic/40426-patterns-for-synchronizing-scrolltrigger-and-lenis-in-reactnext/)
- [W3C WCAG 2.1 SC 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [NN/g: Scrolljacking 101](https://www.nngroup.com/articles/scrolljacking-101/)

### Secondary (MEDIUM confidence)
- [Codrops: GLSL shaders with R3F](https://tympanus.net/codrops/2024/12/02/how-to-code-a-shader-based-reveal-effect-with-react-three-fiber-glsl/)
- [Frontend Masters: Virtual Scroll-Driven 3D Scenes](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/)
- [Codrops: Reactive Depth with R3F](https://tympanus.net/codrops/2026/02/17/reactive-depth-building-a-scroll-driven-3d-image-tube-with-react-three-fiber/)
- [14islands r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig)
- [Lenis + R3F Performance Discussion](https://github.com/darkroomengineering/lenis/discussions/431)
- [ProFy Portfolio Survey](https://profy.dev/article/portfolio-websites-survey)

### Tertiary (LOW confidence)
- [Tone.js Wiki: Autoplay Policy](https://github.com/Tonejs/Tone.js/wiki/Autoplay) -- accurate but sparse on continuous scroll-audio patterns
- [Three.js 2026 changes overview](https://www.utsubo.com/blog/threejs-2026-what-changed) -- third-party summary, verify against changelog

---
*Research completed: 2026-03-08*
*Ready for roadmap: yes*
