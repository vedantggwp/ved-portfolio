# Architecture Research

**Domain:** 3D Scrollytelling Portfolio Website
**Researched:** 2026-03-08
**Confidence:** HIGH

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser Viewport                             │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │              Fixed R3F Canvas (z-index: -1)               │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────┐  ┌───────────────────┐   │   │
│  │  │  Monolith    │  │  Fog /   │  │  Scene Lighting   │   │   │
│  │  │  (Shaders)   │  │  Env     │  │  (per-layer)      │   │   │
│  │  └──────┬───────┘  └────┬─────┘  └────────┬──────────┘   │   │
│  │         │               │                  │              │   │
│  │         └───────────────┴──────────────────┘              │   │
│  │                         │                                 │   │
│  │              useFrame reads from ──┐                      │   │
│  └─────────────────────────────────────┼─────────────────────┘   │
│                                        │                         │
│  ┌─────────────────────────────────────┼─────────────────────┐   │
│  │           Mutable Scroll Store      │                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌─────┴────┐               │   │
│  │  │ progress │  │ velocity │  │ section  │               │   │
│  │  │ (0..1)   │  │          │  │ id       │               │   │
│  │  └──────────┘  └──────────┘  └──────────┘               │   │
│  └────────────────────────┬──────────────────────────────────┘   │
│                           │ writes to                            │
│  ┌────────────────────────┴──────────────────────────────────┐   │
│  │              Scroll Engine (Lenis + GSAP)                  │   │
│  │  Lenis ──→ ScrollTrigger.update() ──→ pin/scrub triggers  │   │
│  │  GSAP ticker ──→ lenis.raf(time)                          │   │
│  └────────────────────────┬──────────────────────────────────┘   │
│                           │ drives                               │
│  ┌────────────────────────┴──────────────────────────────────┐   │
│  │            Scrollable DOM Sections (z-index: 1)            │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │  │ Surface │ │Mid-Depth│ │  Deep   │ │  Floor  │        │   │
│  │  │ Section │ │ Pockets │ │Projects │ │ Contact │        │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │              Audio Layer (Tone.js)                         │   │
│  │  Reads scroll store ──→ crossfades layers ──→ Web Audio   │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │              Accessibility Layer                           │   │
│  │  prefers-reduced-motion ──→ disables 3D, enables fallback │   │
│  │  ARIA live regions ──→ announces section changes           │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| R3F Canvas | Fixed full-viewport WebGL rendering surface | `<Canvas>` in a `fixed inset-0 -z-10` div, rendered once, never unmounted |
| Monolith | Evolving geometric form driven by scroll progress | Custom `<mesh>` with GLSL vertex/fragment shaders, `uMorph` uniform driven by scroll |
| Scene Manager | Swaps lighting, fog, environment per scroll section | `useFrame` reads current section from store, interpolates scene parameters |
| Scroll Store | Single source of truth for scroll state, readable at 60fps without re-renders | Plain mutable object (NOT React state, NOT zustand subscriptions in render) |
| Lenis | Smooth scroll with configurable physics per section | Singleton instance, lerp/duration changed dynamically per section |
| GSAP ScrollTrigger | Pin sections, scrub animations, fire section callbacks | ScrollTrigger instances per DOM section, writes progress to scroll store |
| DOM Sections | Scrollable content overlaying the canvas | Tall `<section>` elements with text, each mapped to a ScrollTrigger |
| Audio Engine | Scroll-reactive ambient soundscape | Tone.js Players/Synths, crossfade gains mapped to scroll store progress |
| Accessibility Layer | Reduced-motion fallback, keyboard nav, screen reader support | CSS `@media (prefers-reduced-motion)`, ARIA live regions, skip links |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Single page — mounts Canvas + DOM sections
│   └── globals.css             # Base styles, CSS custom properties
├── components/
│   ├── canvas/                 # Everything inside <Canvas>
│   │   ├── Scene.tsx           # Canvas wrapper with camera, fog, lights
│   │   ├── Monolith.tsx        # The evolving monolith mesh + shader material
│   │   ├── SceneManager.tsx    # Reads scroll store, interpolates scene params
│   │   ├── SurfaceEnv.tsx      # Surface layer 3D environment
│   │   ├── MidDepthEnv.tsx     # Mid-depth 3D environment
│   │   ├── DeepEnv.tsx         # Deep layer 3D environment
│   │   └── FloorEnv.tsx        # Floor layer 3D environment
│   ├── sections/               # Scrollable DOM content
│   │   ├── SurfaceSection.tsx  # Opening provocation
│   │   ├── PocketSection.tsx   # Reusable mid-depth pocket (takes config)
│   │   ├── ProjectSection.tsx  # Reusable project discovery card
│   │   └── FloorSection.tsx    # Contact floor
│   ├── audio/                  # Audio system
│   │   ├── AudioProvider.tsx   # Context + Tone.js initialization
│   │   ├── AudioToggle.tsx     # Waveform icon UI
│   │   └── useScrollAudio.ts   # Hook: maps scroll store to audio params
│   └── ui/                     # Shared UI components
│       ├── ReducedMotionGate.tsx # Conditional 3D vs fallback rendering
│       └── SkipLink.tsx        # Accessibility skip navigation
├── shaders/                    # GLSL shader files
│   ├── monolith.vert.glsl      # Monolith vertex shader
│   ├── monolith.frag.glsl      # Monolith fragment shader
│   └── transition.frag.glsl    # Depth transition dissolve effect
├── stores/                     # State management
│   ├── scrollStore.ts          # Mutable scroll state (NOT zustand)
│   └── siteStore.ts            # UI state (zustand — audio on/off, section labels)
├── hooks/                      # Custom hooks
│   ├── useScrollEngine.ts      # Initializes Lenis + GSAP, writes to scrollStore
│   ├── useScrollProgress.ts    # Reads scrollStore in useFrame for canvas
│   ├── usePrefersReducedMotion.ts # Media query hook
│   └── useMonolithUniforms.ts  # Maps scroll progress to shader uniforms
└── lib/                        # Utilities and constants
    ├── theme.ts                # Colors, fonts, scroll physics constants
    ├── sections.ts             # Section definitions (heights, IDs, physics)
    └── glsl.ts                 # GLSL import helper (raw loader config)
```

### Structure Rationale

- **canvas/ vs sections/:** Hard boundary between "inside WebGL" and "DOM world." They communicate only through the scroll store, never directly. This prevents accidental coupling and makes it possible to swap the 3D layer for a CSS fallback without touching content.
- **shaders/:** Separate directory because GLSL files need raw string imports (webpack/turbopack raw loader), and keeping them isolated makes build config cleaner.
- **stores/scrollStore.ts as plain object:** This is the most critical architectural decision. Zustand with subscriptions would cause React re-renders. A plain mutable object read inside `useFrame` keeps the render loop at 60fps. UI state (audio toggle, current section label) can use zustand because those update infrequently.
- **hooks/:** Each hook owns one concern. `useScrollEngine` is the only place Lenis and GSAP are initialized. `useScrollProgress` is the only bridge from store to canvas.

## Architectural Patterns

### Pattern 1: Mutable Scroll Store (Critical Path)

**What:** A plain JavaScript object holding scroll state that is mutated directly (not through React state or reducers). Canvas components read it inside `useFrame` without subscribing. DOM components that need section labels use a separate zustand store updated infrequently.

**When to use:** Any value that changes at 60fps (scroll position, velocity, normalized progress). Never use React `useState` or zustand subscriptions for these.

**Trade-offs:** Breaks React's immutability model, but this is the established pattern in the R3F ecosystem. The official R3F performance docs explicitly recommend this approach for high-frequency updates.

**Example:**
```typescript
// stores/scrollStore.ts
// Plain mutable object — NOT React state, NOT zustand
export const scrollStore = {
  progress: 0,        // 0..1 overall scroll progress
  velocity: 0,        // current scroll velocity
  section: "surface",  // current section ID
  sectionProgress: 0,  // 0..1 within current section
};

// hooks/useScrollEngine.ts — Lenis callback writes here
lenis.on("scroll", ({ progress, velocity }) => {
  scrollStore.progress = progress;
  scrollStore.velocity = velocity;
});

// Inside R3F canvas — useFrame reads it
useFrame(() => {
  monolithRef.current.material.uniforms.uMorph.value =
    scrollStore.progress;
});
```

### Pattern 2: Fixed Canvas + Scrollable DOM Overlay

**What:** A single R3F `<Canvas>` is positioned `fixed inset-0` at z-index -1. Scrollable DOM sections sit on top at z-index 1 with transparent or semi-transparent backgrounds. The DOM scrolls normally; the canvas reacts to scroll position via the store.

**When to use:** This is the standard architecture for scroll-driven 3D websites. The alternative (R3F's built-in `<ScrollControls>`) is simpler but gives less control over scroll physics and cannot integrate with Lenis/GSAP.

**Trade-offs:** DOM content and 3D are fully decoupled, which is good for maintenance and accessibility (screen readers see DOM, not canvas). Downside: aligning DOM elements to 3D positions is harder (not needed for this project since content layers are sequential, not positional).

**Example:**
```tsx
// app/page.tsx
export default function Home() {
  return (
    <main>
      {/* Fixed behind everything */}
      <Scene>
        <Monolith />
        <SceneManager />
      </Scene>

      {/* Scrolls over the canvas */}
      <div className="relative z-10">
        <SurfaceSection />
        <PocketSection config={pocketTeal} />
        <PocketSection config={pocketAmber} />
        <PocketSection config={pocketNavy} />
        <ProjectSection project={neuroedge} />
        <ProjectSection project={springpod} />
        <FloorSection />
      </div>
    </main>
  );
}
```

### Pattern 3: Lenis + GSAP ScrollTrigger Bridge

**What:** Lenis owns smooth scrolling (physics, inertia, touch handling). GSAP ScrollTrigger owns pinning, scrubbing, and progress callbacks. They are synchronized by wiring Lenis's scroll event to `ScrollTrigger.update()` and adding Lenis's RAF to GSAP's ticker.

**When to use:** When you need both smooth scroll physics AND section pinning/scrubbing. Using only Lenis gives smooth scroll but no pin/scrub. Using only GSAP gives pin/scrub but no smooth inertia.

**Trade-offs:** Two scroll systems must stay in sync. If misconfigured, scroll positions drift. The bridge pattern is well-documented but requires careful initialization order: Lenis first, then GSAP ticker integration.

**Example:**
```typescript
// hooks/useScrollEngine.ts
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useScrollEngine() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, duration: 1.8 });

    // Bridge: Lenis scroll events update ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Bridge: GSAP ticker drives Lenis RAF
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Write to mutable store
    lenis.on("scroll", ({ progress, velocity }) => {
      scrollStore.progress = progress;
      scrollStore.velocity = velocity;
    });

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);
}
```

### Pattern 4: Scroll-Reactive Audio via Gain Crossfading

**What:** Multiple Tone.js audio sources (Players or synths) run simultaneously. Their gain nodes are mapped to scroll progress ranges so that as the user scrolls into a section, that section's audio fades in while the previous fades out. Audio context is only started after user interaction (the waveform toggle).

**When to use:** When ambient audio must respond to scroll position smoothly, without audible cuts or pops.

**Trade-offs:** Multiple simultaneous audio sources consume more resources than a single track. Mitigate by using lightweight sources (oscillators, short loops) rather than long high-quality audio files. Web Audio API requires user gesture to start — the toggle handles this naturally.

**Example:**
```typescript
// components/audio/useScrollAudio.ts
useFrame(() => {
  if (!audioEnabled) return;
  const { sectionProgress, section } = scrollStore;

  // Crossfade: fade out previous, fade in current
  layers.forEach((layer) => {
    const target = layer.id === section ? sectionProgress : 0;
    layer.gain.gain.linearRampToValueAtTime(
      target * layer.maxVolume,
      Tone.now() + 0.1
    );
  });
});
```

## Data Flow

### Primary Data Flow: Scroll to Visuals

```
User Scrolls (native browser scroll)
    │
    ▼
Lenis (intercepts, applies physics: lerp, duration, inertia)
    │
    ├──→ ScrollTrigger.update() (GSAP recalculates pin/scrub positions)
    │        │
    │        ├──→ ScrollTrigger callbacks fire per section
    │        │        │
    │        │        ▼
    │        │    scrollStore.section = "midDepth"
    │        │    scrollStore.sectionProgress = 0.42
    │        │
    │        └──→ GSAP scrub animations (DOM opacity, transforms)
    │
    └──→ scrollStore.progress = 0.35
         scrollStore.velocity = 2.1
              │
              ▼
         useFrame() (runs every frame, ~60fps)
              │
              ├──→ Monolith: uMorph = progress, uTime += delta
              ├──→ Camera: position.z = lerp(10, 2, progress)
              ├──→ Fog: near/far interpolated per section
              ├──→ Lights: color/intensity per section
              └──→ Audio: gain crossfade per section
```

### Secondary Data Flow: User Interaction to UI State

```
User clicks audio toggle
    │
    ▼
zustand siteStore.audioEnabled = true
    │
    ├──→ Tone.start() (Web Audio context starts)
    ├──→ AudioToggle re-renders (icon state change)
    └──→ useScrollAudio begins reading scrollStore
```

### Key Data Flows

1. **Scroll-to-3D (hot path):** Lenis scroll event writes to mutable scrollStore. R3F `useFrame` reads scrollStore every frame and updates shader uniforms, camera, fog, and lighting. Zero React re-renders on this path. This is the performance-critical loop.

2. **Scroll-to-DOM (warm path):** GSAP ScrollTrigger handles DOM animations (opacity, transforms, pinning) via its own scrub/tween system. Does not go through React state. ScrollTrigger callbacks update scrollStore.section for coarse section tracking.

3. **Scroll-to-Audio (warm path):** Audio hook reads scrollStore inside a `useFrame` or `requestAnimationFrame` loop. Maps section progress to gain values. Uses Web Audio API's `linearRampToValueAtTime` for smooth transitions (avoids clicks/pops).

4. **UI state (cold path):** Infrequent updates (audio toggle, section label for accessibility) go through zustand. These trigger React re-renders, which is fine because they happen rarely (on section change, not every frame).

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single page (this project) | Monolithic page, all sections in one route. Canvas never unmounts. This is correct. |
| 5-10 project pages | Still a single scroll page. Projects are data-driven sections, not routes. |
| Complex 3D scenes | LOD (level of detail) on Monolith geometry. Progressive mesh loading. Texture atlas instead of individual textures. |
| Mobile / low-power | Detect via `navigator.hardwareConcurrency` or framerate sampling. Drop to CSS parallax fallback. |

### Scaling Priorities

1. **First bottleneck: Mobile GPU** — The monolith shader and environment effects will strain low-power GPUs. Solution: `usePrefersReducedMotion` hook plus GPU capability detection. Serve CSS-only depth parallax to devices that cannot maintain 30fps.

2. **Second bottleneck: Initial load** — R3F + Three.js + GSAP + Tone.js is a heavy bundle. Solution: Dynamic import the Canvas component (`next/dynamic` with `ssr: false`). Lazy-load Tone.js only when audio is activated. Tree-shake Three.js (avoid importing from `three` directly — use specific paths).

## Anti-Patterns

### Anti-Pattern 1: Scroll Position in React State

**What people do:** `const [scrollY, setScrollY] = useState(0)` updated on every scroll event.
**Why it's wrong:** Every scroll event triggers a React re-render of the entire component tree. At 60fps smooth scroll, this is 60 re-renders per second. R3F canvas children re-render, causing Three.js objects to be recreated. Performance drops to single-digit FPS.
**Do this instead:** Use a mutable plain object (`scrollStore`) read inside `useFrame`. Zero re-renders. This is the R3F-endorsed pattern.

### Anti-Pattern 2: Multiple Canvas Instances

**What people do:** Mount a separate `<Canvas>` per section, hoping to lazy-load 3D content.
**Why it's wrong:** Each Canvas creates a separate WebGL context. Browsers limit contexts (typically 8-16). Switching between contexts is expensive. No shared resources (textures, geometries) between contexts.
**Do this instead:** One fixed Canvas for the entire page. Show/hide 3D content within that canvas based on scroll position. Use `visible={false}` on Three.js objects outside viewport — they still exist but skip rendering.

### Anti-Pattern 3: Animating Lenis Parameters Per-Frame

**What people do:** Change Lenis `lerp` and `duration` inside `useFrame` or on every scroll event to create variable scroll physics.
**Why it's wrong:** Lenis recalculates its internal state when parameters change. Changing them 60 times per second causes jittery scroll behavior and wastes CPU.
**Do this instead:** Change Lenis parameters only on section transitions (when `scrollStore.section` changes). Use GSAP ScrollTrigger's `onEnter`/`onLeave` callbacks to trigger parameter changes at section boundaries.

### Anti-Pattern 4: Tone.js Initialization Without User Gesture

**What people do:** Call `Tone.start()` on page load or in a `useEffect`.
**Why it's wrong:** Web Audio API requires a user gesture to start the audio context. Browsers will silently block it, and audio will not play. Some browsers show console warnings; others fail silently.
**Do this instead:** Initialize Tone.js only inside the audio toggle's click handler. The waveform icon click is the user gesture. Store the "audio enabled" flag in zustand so the rest of the app knows whether to read scroll-audio mappings.

### Anti-Pattern 5: GSAP ScrollTrigger Without Lenis Bridge

**What people do:** Use Lenis for smooth scroll and GSAP ScrollTrigger independently, expecting them to "just work" together.
**Why it's wrong:** Lenis hijacks the scroll position. ScrollTrigger reads native scroll position. Without the bridge (`lenis.on("scroll", ScrollTrigger.update)` and `gsap.ticker.add(lenis.raf)`), ScrollTrigger pins and scrubs will be out of sync with the actual scroll position. Sections will pin at wrong positions or not at all.
**Do this instead:** Always wire the Lenis-GSAP bridge in a single initialization hook. Test pin positions with ScrollTrigger's debug markers (`markers: true`) early in development.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vercel | `next build` + `vercel deploy` | Static export if no API routes needed. R3F canvas is client-only. |
| Google Fonts | `next/font/google` | DM Serif Display + Inter. Font files are self-hosted by Next.js, no external requests at runtime. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| DOM sections <-> R3F Canvas | Mutable scrollStore (read-only from canvas side) | Canvas never writes to store. Only the scroll engine writes. Canvas only reads in useFrame. |
| Scroll Engine <-> ScrollStore | Direct mutation in Lenis callback | Single writer (scroll engine), multiple readers (canvas, audio, accessibility). No locking needed — single-threaded JS. |
| Audio <-> ScrollStore | Read in RAF loop | Audio reads scrollStore.section and scrollStore.sectionProgress. Crossfades gain nodes. |
| Accessibility <-> zustand siteStore | React subscription | Section change updates an ARIA live region via zustand. Infrequent updates — React re-renders are fine. |
| 3D Layer <-> CSS Fallback | ReducedMotionGate component | Conditionally renders `<Scene>` (3D) or `<CSSParallaxFallback>` (2D). Shares the same DOM sections underneath. |

## Build Order (Dependency Chain)

The architecture has clear dependency layers that dictate build order:

```
Phase 1: Foundation (no dependencies)
  ├── Next.js scaffold + theme system
  ├── Fixed R3F Canvas shell (empty)
  └── Mutable scrollStore + useScrollEngine hook (Lenis + GSAP bridge)

Phase 2: Core Loop (depends on Phase 1)
  ├── Monolith geometry + shaders (needs Canvas)
  ├── DOM sections with ScrollTrigger pins (needs scroll engine)
  └── SceneManager reading scrollStore (needs store + Canvas)

Phase 3: Content (depends on Phase 2)
  ├── Surface layer (provocation text + monolith initial state)
  ├── Mid-depth pockets (three pockets with variable scroll physics)
  └── Deep layer projects (project discovery sections)

Phase 4: Polish (depends on Phase 3)
  ├── Transition effects between layers (shader dissolves, pressure changes)
  ├── Audio layer (Tone.js, crossfading, toggle UI)
  └── Floor section (contact)

Phase 5: Accessibility + Performance (depends on Phase 3, parallel with Phase 4)
  ├── prefers-reduced-motion detection + CSS fallback
  ├── ARIA live regions for section announcements
  ├── Mobile GPU detection + progressive degradation
  └── Bundle optimization (dynamic imports, tree-shaking)
```

**Key dependency insight:** The scroll store and scroll engine must exist before anything else can be built, because both the 3D canvas and DOM sections depend on them. The monolith and DOM sections can then be built in parallel. Audio is fully independent of 3D — it only reads the scroll store — so it can be built late without blocking anything.

## Sources

- [R3F Performance Pitfalls (official docs)](https://r3f.docs.pmnd.rs/advanced/pitfalls) — mutable ref pattern, avoiding re-renders
- [R3F transient updates discussion (GitHub #126)](https://github.com/pmndrs/react-three-fiber/issues/126) — zustand + useFrame pattern origin
- [Lenis (darkroomengineering)](https://github.com/darkroomengineering/lenis) — smooth scroll library, GSAP integration docs
- [GSAP ScrollTrigger + Lenis sync pattern](https://gsap.com/community/forums/topic/40426-patterns-for-synchronizing-scrolltrigger-and-lenis-in-reactnext/) — bridge initialization
- [Lenis + R3F mobile performance discussion](https://github.com/darkroomengineering/lenis/discussions/431) — performance considerations
- [14islands r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig) — reference architecture for scroll-synced 3D
- [Frontend Masters: Virtual Scroll-Driven 3D Scenes](https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/) — fixed canvas + scroll overlay pattern
- [Tone.js](https://tonejs.github.io/) — Web Audio framework, user gesture requirements
- [Codrops: Reactive Depth with R3F](https://tympanus.net/codrops/2026/02/17/reactive-depth-building-a-scroll-driven-3d-image-tube-with-react-three-fiber/) — scroll-driven shader architecture

---
*Architecture research for: 3D Scrollytelling Portfolio Website*
*Researched: 2026-03-08*
