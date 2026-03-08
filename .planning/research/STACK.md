# Technology Stack

**Project:** Ved Portfolio (3D Scrollytelling)
**Researched:** 2026-03-08

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 15.5.x | App framework, SSR, routing | Locked in PROJECT.md. Use 15 not 16 -- R3F 9 and the broader pmndrs ecosystem have proven compatibility with Next 15 + React 19. Next 16 introduces async request API breaking changes and drops `next lint`; zero benefit for a portfolio site and unnecessary migration risk. | HIGH |
| React | 19.x | UI library | Required by R3F 9 and Next.js 15. React 19 concurrent features help with heavy canvas + DOM mixing. | HIGH |
| TypeScript | 5.7+ | Type safety | Non-negotiable for a project with custom shaders, scroll physics, and audio state. Catches uniform type mismatches at compile time. | HIGH |

### 3D Rendering

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Three.js | 0.183.x (r183) | 3D engine | The only serious WebGL engine. R183 is current stable (published ~7 days ago). Monthly release cadence -- pin to a specific minor to avoid breakage. | HIGH |
| @react-three/fiber | 9.5.x | React renderer for Three.js | Declarative Three.js in JSX. v9 targets React 19. The `useFrame` hook is essential for 60fps shader uniform updates without React re-renders. | HIGH |
| @react-three/drei | 10.7.x | R3F helper library | `shaderMaterial` for custom GLSL, `Environment` for lighting, `useTexture` for asset loading. Massive time savings over raw Three.js. | HIGH |
| @react-three/postprocessing | 3.0.x | Post-processing effects | Bloom (amber glow on monolith), Vignette (cinematic depth), Noise (film grain texture). Merges effects into single pass for performance. | MEDIUM |

### Scroll & Animation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Lenis | 1.3.x | Smooth scroll physics | Lightweight, accessible smooth scroll. `autoRaf` option simplifies setup. Intercepts native scroll and applies momentum/easing without hijacking keyboard nav or screen readers. | HIGH |
| GSAP | 3.14.x | Animation engine | Industry standard for timeline-based animation. ScrollTrigger plugin drives scroll-linked DOM animations (text reveals, section transitions). Now fully free after Webflow acquisition. | HIGH |
| @gsap/react | 2.1.x | GSAP React bindings | `useGSAP()` hook handles animation cleanup automatically on unmount. Drop-in replacement for useEffect with proper GSAP context scoping. SSR-safe. | HIGH |

### Audio

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tone.js | 15.2.x | Web Audio synthesis | Full synthesis engine (oscillators, filters, envelopes) -- not just an audio player. Scroll-reactive synthesis means generating sound from scroll position, not playing back audio files. Handles AudioContext resume on user interaction. | MEDIUM |

### Styling & Typography

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | 4.x | Utility-first CSS | Fast iteration for DOM layer styling. JIT compilation keeps bundle small. Works alongside R3F canvas without conflicts. | HIGH |
| CSS Modules | (built-in) | Scoped component styles | For complex per-section scroll physics styles that need more than utility classes (e.g., `scroll-snap`, variable `will-change`). | HIGH |
| next/font | (built-in) | Font loading | Self-hosts DM Serif Display + Inter with zero layout shift. Google Fonts integration built into Next.js. | HIGH |

### Infrastructure

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vercel | - | Hosting & deployment | Locked in PROJECT.md. Zero-config Next.js deployment, edge functions, built-in analytics. | HIGH |
| Vercel Analytics | - | Basic analytics | Lightweight, privacy-respecting. No third-party scripts that compete with WebGL for main thread. | HIGH |

### Dev Tooling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ESLint | 9.x | Linting | Flat config format. Use `eslint-plugin-react-hooks` to catch missing deps in useFrame/useGSAP. | HIGH |
| Prettier | 3.x | Code formatting | Consistency across GLSL template literals and JSX. | HIGH |
| @react-three/test-renderer | 9.x | R3F testing | Unit test 3D scenes without a browser. Test shader uniform updates and scroll-driven state changes. | MEDIUM |
| Playwright | 1.51+ | E2E testing | Visual regression testing for scroll positions. `page.mouse.wheel()` for scroll simulation. | HIGH |

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| glslify | 7.x | GLSL module system | Import noise functions and other GLSL modules into custom shaders. Use `glslify-loader` with webpack or the `glsl` tagged template literal. |
| three-custom-shader-material (CSM) | 6.x | Extend Three.js materials | When you need custom vertex displacement on the monolith but still want Three.js lighting/shadows. Extends MeshStandardMaterial with custom GLSL. |
| zustand | 5.x | State management | Mutable scroll store pattern. `create` with `subscribeWithSelector` for scroll position, audio state, active section. Never use React state for 60fps values. |
| framer-motion | 12.x | DOM micro-animations | Optional. Only for complex DOM element enter/exit animations that GSAP handles less elegantly (layout animations, shared layout). Avoid for scroll-driven work -- GSAP owns that. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15 | Astro + React islands | Astro is excellent for static sites but this project needs a fixed R3F canvas persisting across route-like scroll sections. Next.js App Router with a single layout canvas is the right architecture. |
| Framework | Next.js 15 | Next.js 16 | R3F 9 ecosystem is battle-tested on Next 15 + React 19. Next 16 adds Turbopack speed but introduces async API breaking changes with no benefit for this use case. |
| 3D Engine | R3F | vanilla Three.js | Raw Three.js means manual scene graph management, resize handling, and disposal. R3F handles all of this declaratively. The project has complex scroll-linked state -- imperative Three.js would be a maintenance nightmare. |
| 3D Engine | R3F | Spline / Theatre.js | Spline is for no-code 3D. Theatre.js is for visual animation editing. This project needs custom GLSL shaders and per-frame scroll-driven updates -- code-first is the right approach. |
| Smooth Scroll | Lenis | GSAP ScrollSmoother | ScrollSmoother requires wrapping content in specific `#smooth-wrapper` / `#smooth-content` divs. Lenis is framework-agnostic and lighter. Both work with ScrollTrigger, but Lenis has less layout constraint. |
| Smooth Scroll | Lenis | Locomotive Scroll | Locomotive Scroll v5 exists but Lenis has become the community standard. Better maintained, more accessible, lighter weight. |
| Audio | Tone.js | Howler.js | Howler is for audio playback (sound effects, music). This project needs real-time synthesis -- generating atmospheric sound from scroll position, not playing pre-recorded files. Tone.js is the Web Audio framework. |
| Audio | Tone.js | Web Audio API (raw) | Raw Web Audio API is verbose and requires managing AudioContext, gain nodes, oscillators manually. Tone.js abstracts this while keeping full control. |
| State | zustand | Jotai / Valtio | Valtio (proxy-based) is also good for mutable stores but zustand is the pmndrs standard and integrates perfectly with R3F ecosystem. Jotai is atomic -- wrong model for a continuous scroll value. |
| CSS | Tailwind | styled-components | CSS-in-JS adds runtime overhead. On a page with WebGL, every byte of main thread budget matters. Tailwind compiles to static CSS. |
| Post-processing | @react-three/postprocessing | Raw EffectComposer | The R3F wrapper auto-merges effects into minimal passes. Raw Three.js EffectComposer chains passes sequentially -- worse performance for multiple effects. |

## Critical Integration Notes

### Lenis + GSAP ScrollTrigger Sync

This is the most fragile integration in the stack. Known issues from community reports:

```typescript
// CORRECT: Lenis -> ScrollTrigger sync
const lenis = new Lenis();

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
```

- **Must** set `lagSmoothing(0)` or ScrollTrigger positions drift
- **Must** use Lenis's `on('scroll')` event, not a separate scroll listener
- Window resize can desync pinned elements -- call `ScrollTrigger.refresh()` on resize
- Reported performance issues on slower machines when combining ReactLenis wrapper + many ScrollTrigger instances. Prefer vanilla Lenis instance over the React wrapper for this project.

### R3F Canvas + DOM Scroll Architecture

```
[Fixed R3F Canvas]     ← position: fixed, z-index: 0
[Scrollable DOM]       ← position: relative, z-index: 1, pointer-events: none (selectively enabled)
  [Section: Surface]   ← text overlays with pointer-events: auto
  [Section: Mid-depth]
  [Section: Deep]
  [Section: Floor]
```

- Canvas stays fixed; DOM scrolls over it
- Scroll progress drives R3F scene via zustand store (mutable, never React state)
- DOM sections use `mix-blend-mode` or transparent backgrounds to reveal 3D beneath
- `pointer-events: none` on scroll container, `pointer-events: auto` on interactive elements

### Mutable Scroll Store (Performance Critical)

```typescript
// zustand store -- values update at 60fps, never trigger React re-renders
const useScrollStore = create(() => ({
  progress: 0,        // 0-1 overall scroll progress
  velocity: 0,        // scroll speed for physics
  section: 0,         // current depth section index
  direction: 1,       // 1 = down, -1 = up
}));

// In R3F useFrame -- read directly, no subscription
function Monolith() {
  useFrame(() => {
    const { progress, velocity } = useScrollStore.getState();
    // Update shader uniforms directly via ref
    meshRef.current.material.uniforms.uProgress.value = progress;
    meshRef.current.material.uniforms.uVelocity.value = velocity;
  });
}
```

### Tone.js AudioContext Resume

```typescript
// AudioContext must be resumed after user gesture (browser policy)
// Wire to the sound toggle button, not to scroll
const startAudio = async () => {
  await Tone.start(); // resumes AudioContext
  // Initialize synths, filters, etc.
};
```

## Installation

```bash
# Core framework
npm install next@15 react@19 react-dom@19

# 3D rendering
npm install three@0.183 @react-three/fiber@9 @react-three/drei@10 @react-three/postprocessing@3

# Scroll & animation
npm install lenis@1.3 gsap@3.14 @gsap/react@2.1

# Audio
npm install tone@15

# State management
npm install zustand@5

# Styling
npm install -D tailwindcss@4 @tailwindcss/postcss

# Dev tooling
npm install -D typescript @types/three @types/react eslint prettier
npm install -D @react-three/test-renderer playwright
```

## Version Pinning Strategy

Pin **Three.js** to exact minor version (`0.183.x`). Three.js ships breaking changes in minor versions due to its pre-1.0 status. R3F and drei must be compatible with the pinned Three.js version.

Pin **R3F ecosystem** packages together (`@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`). They share Three.js peer dependency ranges.

Use **caret ranges** for everything else (`^15.5.0`, `^3.14.0`). These follow semver properly.

## Sources

- [React Three Fiber npm](https://www.npmjs.com/package/@react-three/fiber) - v9.5.0, React 19 compatible
- [Three.js npm](https://www.npmjs.com/package/three) - v0.183.2, published March 2026
- [Lenis npm](https://www.npmjs.com/package/lenis) - v1.3.18, active development
- [GSAP npm](https://www.npmjs.com/package/gsap) - v3.14.2, free license post-Webflow acquisition
- [@gsap/react npm](https://www.npmjs.com/package/@gsap/react) - v2.1.2, useGSAP hook
- [Tone.js npm](https://www.npmjs.com/package/tone) - v15.2.7
- [@react-three/drei npm](https://www.npmjs.com/package/@react-three/drei) - v10.7.7
- [@react-three/postprocessing npm](https://www.npmjs.com/package/@react-three/postprocessing) - v3.0.4
- [Next.js 15 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-15)
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) - why we avoid it
- [GSAP ScrollTrigger + Lenis forum discussion](https://gsap.com/community/forums/topic/40426-patterns-for-synchronizing-scrolltrigger-and-lenis-in-reactnext/)
- [Codrops: GLSL shaders with R3F](https://tympanus.net/codrops/2024/12/02/how-to-code-a-shader-based-reveal-effect-with-react-three-fiber-glsl/)
- [drei shaderMaterial docs](https://drei.docs.pmnd.rs/shaders/shader-material)
- [React Postprocessing: Bloom](https://react-postprocessing.docs.pmnd.rs/effects/bloom)
- [React Postprocessing: Vignette](https://react-postprocessing.docs.pmnd.rs/effects/vignette)
- [Three.js 2026 changes overview](https://www.utsubo.com/blog/threejs-2026-what-changed)
