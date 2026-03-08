# Pitfalls Research

**Domain:** 3D scrollytelling portfolio (WebGL, R3F, scroll-linked animation)
**Researched:** 2026-03-08
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: React State in the Render Loop Kills 60fps

**What goes wrong:**
Using `useState` or `useContext` for values that change every frame (scroll position, camera lerp, shader uniforms) triggers React reconciliation on every tick. The R3F render loop runs at 60fps but React's diffing algorithm is not designed for per-frame updates. Frame rate drops to 15-30fps with visible stutter.

**Why it happens:**
React's mental model makes `useState` the default for "values that change." Developers reach for it instinctively. The PROJECT.md already flags this ("mutable scroll store pattern, never React state for 60fps values") but the temptation returns whenever a new component needs scroll position.

**How to avoid:**
- Use a mutable ref store (Zustand with `useRef`-backed transient updates, or a plain module-level object) for all scroll-derived values.
- Access values inside `useFrame` via refs, never via state subscriptions.
- Rule of thumb: if a value changes more than 4x/second, it must not be React state.
- Use `drei`'s `useScroll` or a custom Lenis hook that writes to a ref, not state.

**Warning signs:**
- React DevTools showing constant re-renders on the Canvas tree during scroll.
- CPU flame graph dominated by React reconciliation during scroll.
- `useFrame` callback accessing `.current` on a state-derived value.

**Phase to address:**
Phase 1 (Scaffold) -- establish the mutable scroll store pattern before any scroll-linked logic exists. Every subsequent phase inherits this pattern.

---

### Pitfall 2: Lenis + GSAP ScrollTrigger Desynchronization

**What goes wrong:**
Lenis provides smooth-scrolled `scrollTop` values, but GSAP ScrollTrigger reads the native `window.scrollY` by default. Without explicit synchronization, ScrollTrigger triggers fire at wrong positions, pinned sections "bounce" up and down, and resize causes all trigger positions to shift. On mobile, performance craters because both Lenis and ScrollTrigger fight over scroll events.

**Why it happens:**
Lenis and GSAP are independent libraries with separate scroll tracking. The integration requires manual wiring: Lenis's `scroll` event must call `ScrollTrigger.update()`, and Lenis's RAF must be added to GSAP's ticker. This is a fragile handshake that breaks silently on misconfiguration.

**How to avoid:**
- Wire Lenis into GSAP's ticker explicitly:
  ```typescript
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
- Use `ScrollTrigger.scrollerProxy()` if Lenis wraps a container (not `window`).
- On resize, call `ScrollTrigger.refresh()` after Lenis recalculates.
- Test with rapid scroll + resize combinations early.

**Warning signs:**
- ScrollTrigger `onEnter`/`onLeave` firing at visually wrong positions.
- Pinned sections flickering or "jumping" on scroll direction change.
- Animations correct on first load but wrong after browser resize.

**Phase to address:**
Phase 2 (Scroll System) -- the Lenis+GSAP integration must be rock-solid before any scroll-triggered content is built. Create a test harness with colored sections and log trigger points.

---

### Pitfall 3: WebGL Canvas is a Black Box to Assistive Technology

**What goes wrong:**
The `<canvas>` element renders pixels. Screen readers see nothing -- no text, no structure, no landmarks. If the monolith evolution, layer transitions, and project "discoveries" are purely canvas-rendered, blind users experience an empty page. This is especially damaging when the portfolio promotes an accessibility product (NeuroEdge).

**Why it happens:**
WebGL/Three.js has zero built-in accessibility. Unlike HTML where semantic elements provide structure, canvas content must be manually mirrored in a parallel accessible DOM. Most 3D portfolio tutorials ignore accessibility entirely.

**How to avoid:**
- Keep ALL text and meaningful content as HTML DOM elements overlaid on the canvas, never rendered as 3D text meshes.
- Maintain a parallel accessible structure: use `aria-label` on section containers describing what the visual experience shows.
- Add `role="img"` and `aria-label` to the canvas element itself describing the monolith's current state.
- Implement skip-to-content links that bypass the visual experience.
- Ensure `prefers-reduced-motion` disables all scroll-linked animation AND provides a static fallback layout.
- Keyboard navigation must work for all interactive elements (project links, contact).

**Warning signs:**
- Running VoiceOver/NVDA on the site and hearing nothing meaningful.
- Any text rendered via `drei`'s `<Text3D>` without an equivalent DOM element.
- Project cards or links that only exist as 3D meshes.

**Phase to address:**
Phase 1 (Scaffold) -- establish the HTML-over-canvas architecture from day one. Every DOM section must have proper semantics. The `prefers-reduced-motion` media query must be in the scaffold CSS. Phase 8 (Polish) should include a dedicated screen reader audit.

---

### Pitfall 4: Custom GLSL Shaders Break on Mobile GPUs

**What goes wrong:**
Shaders that work perfectly on desktop (macOS Metal, Windows DirectX via ANGLE) fail silently or render garbage on mobile GPUs (Adreno, Mali, PowerVR). Common failures: `mediump` precision causes banding/artifacts, `for` loops with non-constant bounds cause compilation failure, certain math functions produce different results, and shader compilation itself can take seconds on low-end devices.

**Why it happens:**
Desktop GPUs silently upgrade `mediump`/`lowp` to `highp`. Developers never see precision issues until testing on actual mobile hardware. Each mobile GPU family has a different GLSL compiler with different edge cases. WebGL error reporting is minimal -- shaders just produce wrong output.

**How to avoid:**
- Always use `precision highp float;` in fragment shaders unless proven unnecessary.
- Avoid dynamic loop bounds; use `#define` constants for iteration limits.
- Test on at least one Android device (Adreno GPU) and one older iPhone during shader development.
- Keep the monolith shader simple: prefer noise-based vertex displacement over complex raymarching.
- Use `renderer.info` to monitor draw calls and shader compilation time.
- Consider BrowserStack or similar for cross-device shader testing.

**Warning signs:**
- Shader looks correct on desktop but shows banding, flickering, or solid black on mobile.
- Console warnings about shader compilation time exceeding thresholds.
- Using `lowp` or `mediump` qualifiers anywhere in fragment shaders.

**Phase to address:**
Phase 3 (Monolith/Shaders) -- test on mobile immediately after first shader implementation. Do not wait until Phase 9 (Mobile) to discover shader incompatibility.

---

### Pitfall 5: Scroll Hijacking That Frustrates Rather Than Enchants

**What goes wrong:**
Variable scroll physics (fluid/dense/still per section) sounds compelling in design but creates a frustrating UX in practice. Users lose sense of position, can't predict how much scrolling reaches a section, feel "trapped" in dense zones, and bounce. Studies show scrolljacking increases bounce rates by ~15%. Recruiters evaluating the portfolio have 30-60 seconds of patience.

**Why it happens:**
Designers optimize for the ideal first-time experience. But most visitors are scanning, not immersing. Variable scroll speed breaks the user's proprioceptive model (the physical relationship between finger/wheel movement and page movement). What feels "cinematic" to the creator feels "broken" to the user.

**How to avoid:**
- Keep scroll speed modifications SUBTLE: no more than 0.7x-1.3x variation from natural speed. Avoid full stops.
- Never prevent the user from scrolling past a section. "Dense" should mean "more content per scroll distance," not "you are stuck here."
- Provide a visible progress indicator (vertical dots, depth meter) so users know where they are.
- Include keyboard shortcut to jump between sections (and advertise it).
- The "pressure changes" between layers should be atmospheric (lighting, sound, parallax speed) not mechanical (scroll speed changes).
- Test with someone who has never seen the site and time their journey.

**Warning signs:**
- Users scrolling rapidly trying to "escape" a section.
- High bounce rate in analytics despite good initial engagement.
- Anyone describing the experience as "laggy" when it is actually intentional friction.
- Usability testers reaching for the scrollbar instead of the wheel.

**Phase to address:**
Phase 2 (Scroll System) -- implement scroll physics with real user testing before building content on top. Phase 8 (Polish) -- second round of usability testing with fresh eyes.

---

### Pitfall 6: SSR Hydration Mismatch with Canvas Components

**What goes wrong:**
Next.js App Router server-renders components by default. The R3F `<Canvas>` element and its children reference `window`, `document`, `WebGLRenderingContext`, and other browser APIs that do not exist on the server. This causes hydration mismatches, console errors, and in some cases, the entire page failing to render.

**Why it happens:**
Next.js 15 App Router defaults to Server Components. Developers forget to add `'use client'` to canvas-containing components, or import Three.js modules in server component scope. Even with `'use client'`, mismatches occur if the server renders a placeholder while the client renders the canvas.

**How to avoid:**
- Use `next/dynamic` with `{ ssr: false }` for the entire R3F canvas component tree.
- Create a dedicated `ClientCanvas` wrapper that is dynamically imported.
- Keep a clean boundary: server components handle layout/SEO/metadata, client components handle all 3D/interactive content.
- Never import `three`, `@react-three/fiber`, or `@react-three/drei` in a Server Component file.

**Warning signs:**
- Console errors mentioning "Hydration failed because the initial UI does not match."
- Flash of broken layout on initial page load.
- `window is not defined` errors in build logs.

**Phase to address:**
Phase 1 (Scaffold) -- the server/client component boundary must be established at project creation. The `dynamic(() => import('./ClientCanvas'), { ssr: false })` pattern is the first thing wired.

---

### Pitfall 7: Audio Autoplay Policy Creates Silent Confusion

**What goes wrong:**
Browsers block audio autoplay by policy. If Tone.js `AudioContext` is started without a user gesture, it remains `suspended` -- all scheduled audio silently fails. The scroll-reactive synthesis layer produces nothing. Worse, if audio initialization is attempted on scroll (not click), it fails on most browsers. Users who do click the sound toggle may hear nothing if `Tone.start()` was called at the wrong lifecycle moment.

**Why it happens:**
Autoplay policy enforcement varies by browser: Chrome requires a click/tap, Safari may interrupt the AudioContext on phone calls or headphone changes, Firefox has its own rules. Developers test in environments where autoplay is allowed (localhost, whitelisted domains) and miss the issue.

**How to avoid:**
- Call `Tone.start()` exclusively inside the sound toggle click handler, never on page load or scroll.
- Show a pulsing waveform icon (as planned) that invites interaction before any audio logic runs.
- After `Tone.start()`, check `Tone.context.state === 'running'` before scheduling audio.
- Handle Safari's `interrupted` state: listen for `statechange` events on the AudioContext and re-resume.
- Degrade gracefully: the site must be fully functional and compelling without any audio.

**Warning signs:**
- Audio works on localhost but not on the deployed Vercel URL.
- `Tone.context.state` logging `suspended` after what should be a user gesture.
- Audio works on Chrome but not Safari.

**Phase to address:**
Phase 6 (Audio) -- but the sound toggle UI should exist as a non-functional placeholder from Phase 1 so the click handler wiring is trivial when audio is implemented.

---

### Pitfall 8: Performance Death by a Thousand Draw Calls

**What goes wrong:**
The monolith, lighting, environment, particles, project cards, and transition effects each add draw calls and geometry uploads. On desktop this may run at 60fps, but mobile WebGL has strict draw call budgets. Exceeding ~100 draw calls on mid-range mobile devices causes frame drops to single digits. The site becomes a slideshow.

**Why it happens:**
Each new visual element feels small in isolation. But Three.js creates a separate draw call for each mesh with a unique material. Developers add features incrementally without monitoring the cumulative GPU cost. By the time mobile testing happens, refactoring geometry and materials is expensive.

**How to avoid:**
- Monitor draw calls continuously: display `renderer.info.render.calls` in a dev overlay from day one.
- Set hard budgets: target 50 draw calls on mobile, 150 on desktop.
- Use instanced meshes for repeated geometry (particles, background elements).
- Merge static geometry with `BufferGeometryUtils.mergeGeometries()`.
- Share materials between meshes wherever possible.
- Use `drei`'s `<PerformanceMonitor>` to dynamically reduce quality on struggling devices.
- Implement the mobile CSS fallback as a genuine alternative, not a degraded 3D experience.

**Warning signs:**
- `renderer.info.render.calls` exceeding 100 during a frame.
- `renderer.info.memory.geometries` growing over time (memory leak).
- GPU utilization spikes visible in Chrome DevTools Performance tab.
- Frame time exceeding 16ms in the `useFrame` callback.

**Phase to address:**
Phase 1 (Scaffold) -- add the draw call overlay to the dev environment. Phase 3 (Monolith) and Phase 4 (Sections) -- enforce budgets as geometry is added. Phase 9 (Mobile) -- the CSS fallback must be a first-class experience.

---

### Pitfall 9: Mobile "Fallback" Treated as Afterthought

**What goes wrong:**
The mobile CSS parallax fallback is designed last, built hastily, and ends up looking like a broken version of the desktop experience rather than a deliberate design. Mobile users (50%+ of portfolio traffic, especially from LinkedIn/Twitter links) see a pale imitation instead of a crafted experience.

**Why it happens:**
The 3D desktop experience is exciting to build. The mobile fallback feels like a chore. "We'll handle mobile later" becomes "we ran out of time for mobile." The CSS parallax version requires its own design decisions -- it cannot be an automated degradation of the 3D version.

**How to avoid:**
- Design the mobile experience as a parallel track, not a fallback. It should have its own visual identity within the brand.
- Detect capability early: check `navigator.gpu`, `renderer.capabilities`, device memory, and touch support. Do not just check screen width.
- The mobile version should use CSS `transform: translate3d()` for GPU-accelerated parallax without WebGL.
- Build the mobile experience in the same phase as initial 3D work, not as a final phase.
- Test on actual mobile devices throughout, not just Chrome DevTools mobile emulation.

**Warning signs:**
- No mobile design mockups exist alongside the desktop design.
- Mobile testing delayed to a dedicated "mobile phase."
- Using `window.innerWidth < 768` as the sole detection mechanism.

**Phase to address:**
Phase 1 (Scaffold) -- detection logic and capability flags. Phase 4 (Sections) -- build both paths simultaneously. Phase 9 should be refinement, not creation.

---

### Pitfall 10: Monolith Shader Complexity Spirals Out of Control

**What goes wrong:**
The monolith is the visual centerpiece. It is tempting to add increasingly complex shader effects: raymarching, subsurface scattering, procedural geometry, volumetrics. Each addition feels incremental but the combined shader becomes a 500-line GLSL monster that is impossible to debug, runs poorly on lower-end GPUs, and no one else can maintain.

**Why it happens:**
Shader programming is addictive. There is always "one more effect" that would look incredible. Unlike application code, there are no linters, type checkers, or tests for GLSL. Complexity is invisible until performance crashes.

**How to avoid:**
- Set a complexity budget for the monolith shader: target under 100 lines of fragment shader code.
- Use noise-based techniques (simplex noise displacement, Fresnel glow) over raymarching or volumetrics.
- The monolith evolution should be driven by uniform changes (morph targets, scale, displacement amplitude) not fundamentally different shaders per section.
- Profile the shader with Spector.js to identify expensive operations.
- If an effect requires more than 2 texture lookups per fragment, reconsider.

**Warning signs:**
- Fragment shader exceeding 100 lines.
- Multiple `texture2D` / `texture` calls in the fragment shader.
- Nested loops in fragment shader code.
- GPU frame time exceeding 8ms for the monolith alone.

**Phase to address:**
Phase 3 (Monolith/Shaders) -- define the shader complexity budget before writing any GLSL. Review against the budget at phase completion.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `drei` `<ScrollControls>` instead of Lenis+GSAP | Faster setup, built-in R3F integration | Cannot do variable scroll physics, limited DOM control, locks you into R3F's scroll model | Never (for this project's requirements) |
| Hardcoding scroll breakpoints in pixels | Quick to implement | Breaks on different viewport sizes, requires manual recalculation | Never -- use percentage-based or intersection-observer triggers |
| Inlining shader code as template strings | No build tooling needed | No syntax highlighting, no GLSL linting, hard to read | MVP only -- move to `.glsl` files with raw-loader before Phase 4 |
| Skipping the performance monitor overlay | Faster dev iteration | Performance regressions go unnoticed until mobile testing | Never -- add it in Phase 1 |
| Using `drei` `<Text>` for all 3D text | Easy API, good DX | Each text instance adds draw calls, SDF rendering has quirks at small sizes | Only for small labels, never for body text |

## Integration Gotchas

Common mistakes when connecting the stack components.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| R3F + Next.js App Router | Importing Three.js in Server Components | Wrap all R3F code in `'use client'` components, use `dynamic()` with `{ ssr: false }` |
| Lenis + GSAP ScrollTrigger | Not calling `ScrollTrigger.update()` on Lenis scroll events | Wire `lenis.on('scroll', ScrollTrigger.update)` and add Lenis RAF to GSAP ticker |
| Tone.js + Browser | Calling `Tone.start()` outside a user gesture handler | Only call `Tone.start()` inside a click/tap event handler, verify `context.state === 'running'` |
| GSAP + React | Using GSAP timeline in `useEffect` without cleanup | Return `() => tl.kill()` from `useEffect`, use `gsap.context()` for React component scoping |
| R3F + window resize | ScrollTrigger not recalculating after canvas resize | Call `ScrollTrigger.refresh()` in a debounced resize handler after Lenis recalculates |
| Vercel + large 3D assets | Committing `.glb`/`.gltf` models to git | Use Vercel's CDN edge caching, or host assets on a separate CDN with cache headers |

## Performance Traps

Patterns that work at small scale but fail as complexity grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Creating new materials in `useFrame` | GC stutters every few seconds, memory climbs | Create materials once in `useMemo`, update uniforms via refs | Immediately -- even one per-frame allocation causes GC pressure |
| Mounting/unmounting 3D objects on scroll | Stutter at section boundaries, geometry upload spikes | Keep all objects mounted, toggle `visible` property | After 3-4 section transitions |
| Unoptimized textures (PNG, 4096x4096) | Slow initial load, GPU memory exhaustion on mobile | Use KTX2/Basis compressed textures, max 1024px on mobile | With 3+ textures on mobile |
| Re-creating GSAP ScrollTriggers on every render | Memory leak, triggers accumulate, scroll behavior degrades | Create once in `useEffect` with cleanup, use `gsap.context()` | After 2-3 React re-renders |
| Full-resolution rendering on high-DPI mobile | GPU cannot maintain 60fps at 3x pixel ratio | Cap DPR at 1.5 on mobile, 2 on desktop via `<Canvas dpr={[1, 2]}>` | On any phone with DPR > 2 |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Loading shader code from external URLs | XSS via shader injection (unlikely but possible WebGL exploits) | Bundle all GLSL as static assets, never load dynamically from user input |
| Exposing source maps with shader code in production | Intellectual property leakage of custom shader effects | Disable source maps in production Next.js config |
| Analytics scripts blocking render thread | Lighthouse score drops, scroll jank from third-party JS | Load analytics async, defer non-critical scripts, use Vercel Analytics (lightweight) |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading indicator for 3D assets | Users see blank black screen for 2-5 seconds, assume site is broken | Use `<Suspense>` with a branded loading state that matches the site aesthetic |
| Sound auto-playing or requesting permission on load | Users immediately close the tab | Sound toggle as subtle invitation, audio is a reward for engagement |
| No way to skip the "experience" | Recruiters in a hurry cannot find contact info | Sticky minimal nav with section anchors, visible contact link at all times |
| Scroll progress not visible | Users don't know how long the experience is or where they are | Subtle depth indicator (atmospheric, not a progress bar) |
| Animations that replay on scroll-back | Feels broken; content should stay revealed | Use `once: true` on ScrollTrigger or track "has been seen" state |
| Over-reliance on hover effects | Touch devices have no hover; content becomes inaccessible | Use `:hover` as enhancement only, ensure all states are accessible via tap/focus |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Scroll animations:** Often missing `prefers-reduced-motion` handling -- verify with `matchMedia('(prefers-reduced-motion: reduce)')` that all animation is disabled
- [ ] **Canvas accessibility:** Often missing ARIA labels -- verify VoiceOver/NVDA reads meaningful section descriptions
- [ ] **Mobile fallback:** Often missing landscape orientation handling -- verify on phones rotated to landscape
- [ ] **Audio layer:** Often missing Safari `interrupted` state recovery -- verify after a phone call interrupts Safari on iOS
- [ ] **Performance:** Often missing low-end device testing -- verify on a 3-year-old Android phone, not just iPhone 15
- [ ] **Loading state:** Often missing slow-network testing -- verify on throttled 3G in DevTools
- [ ] **SEO:** Often missing Open Graph meta tags -- verify link preview on LinkedIn/Twitter (critical for a portfolio)
- [ ] **Keyboard nav:** Often missing focus styles -- verify all interactive elements have visible `:focus-visible` outlines
- [ ] **Contact section:** Often missing mailto link testing -- verify the email link works on mobile (opens mail app)
- [ ] **Shader uniforms:** Often missing resize handling -- verify monolith looks correct after browser resize

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| React state in render loop | MEDIUM | Refactor to ref-based store; requires touching every component that reads scroll values |
| Lenis+GSAP desync | LOW | Add the sync wiring; usually a 20-line fix once diagnosed |
| Canvas inaccessible | HIGH | Retrofit parallel DOM structure; may require rethinking layout architecture |
| Shader mobile failure | MEDIUM | Simplify shader, add precision declarations, reduce complexity |
| Scroll hijacking UX | LOW | Reduce speed variation range, add progress indicator |
| SSR hydration errors | LOW | Wrap in dynamic import with `ssr: false`; straightforward fix |
| Audio autoplay blocked | LOW | Move `Tone.start()` to click handler; small refactor |
| Draw call explosion | HIGH | Requires geometry merging, material sharing, possibly rewriting scene structure |
| Mobile as afterthought | HIGH | Requires designing and building an entirely separate experience late in project |
| Shader complexity spiral | MEDIUM | Rewrite shader to simpler approach; lose time but not architecture |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| React state in render loop | Phase 1 (Scaffold) | `useFrame` callbacks never call `setState`; grep for `useState` in canvas tree |
| Lenis+GSAP desync | Phase 2 (Scroll System) | Colored section test harness logs correct trigger positions on scroll + resize |
| Canvas inaccessible | Phase 1 (Scaffold) + Phase 8 (Polish) | VoiceOver reads all sections; keyboard can reach all links |
| Shader mobile failure | Phase 3 (Monolith) | Shader renders correctly on one Android + one iOS device |
| Scroll hijacking UX | Phase 2 (Scroll System) | One external tester completes the scroll journey without expressing frustration |
| SSR hydration errors | Phase 1 (Scaffold) | `next build` produces zero hydration warnings |
| Audio autoplay blocked | Phase 6 (Audio) | Audio works on Chrome, Safari, Firefox after clicking toggle on deployed URL |
| Draw call explosion | Phase 1 (Scaffold) onward | Dev overlay shows < 50 draw calls on mobile viewport |
| Mobile as afterthought | Phase 4 (Sections) | Mobile CSS parallax version exists alongside each 3D section |
| Shader complexity spiral | Phase 3 (Monolith) | Fragment shader under 100 lines; GPU frame time under 8ms |

## Sources

- [R3F Official Pitfalls Documentation](https://docs.pmnd.rs/react-three-fiber/advanced/pitfalls)
- [GSAP Forum: Performance Issues with GSAP + R3F](https://gsap.com/community/forums/topic/43299-performance-issues-on-desktop-and-mobile-devices-using-gsap-with-react-three-fiber/)
- [GSAP Forum: ScrollTrigger + Lenis Synchronization](https://gsap.com/community/forums/topic/40426-patterns-for-synchronizing-scrolltrigger-and-lenis-in-reactnext/)
- [Lenis GitHub: Performance with R3F on Mobile](https://github.com/darkroomengineering/lenis/discussions/431)
- [MDN: WebGL Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- [WebGL Fundamentals: Cross-Platform Issues](https://webglfundamentals.org/webgl/lessons/webgl-cross-platform-issues.html)
- [Tone.js Wiki: Autoplay Policy](https://github.com/Tonejs/Tone.js/wiki/Autoplay)
- [Three.js Accessibility (Pip Lev)](https://medium.com/@piplev/three-js-accessibility-c4f45d83f2c6)
- [Accessible WebGL (Anneka Goss)](https://annekagoss.medium.com/accessible-webgl-43d15f9caa21)
- [NN/g: Scrolljacking 101](https://www.nngroup.com/articles/scrolljacking-101/)
- [Codrops: Efficient Three.js Scenes](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/)
- [Shadertoy Unofficial: GLSL Compatibility Issues](https://shadertoyunofficial.wordpress.com/2016/07/22/compatibility-issues-in-shadertoy-webglsl/)

---
*Pitfalls research for: 3D scrollytelling portfolio (R3F + Lenis + GSAP + Tone.js + Next.js 15)*
*Researched: 2026-03-08*
