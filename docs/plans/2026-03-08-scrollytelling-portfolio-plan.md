# Ved Portfolio — 3D Scrollytelling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 3D scrollytelling portfolio website with depth-based navigation, an evolving monolith motif, variable scroll physics, and atmospheric audio.

**Architecture:** Next.js 15 App Router with a fixed R3F Canvas behind scrollable DOM sections. Lenis drives smooth scrolling, GSAP ScrollTrigger pins sections and writes scroll progress to a mutable store that `useFrame` reads at 60fps. Each layer is built as an isolated scene before being stitched together.

**Tech Stack:** Next.js 15, React Three Fiber 9, Three.js, Lenis, GSAP ScrollTrigger, Tone.js, Vercel

**Design doc:** `docs/plans/2026-03-08-scrollytelling-portfolio-design.md`

---

## Phase 1: Project Scaffold + Monolith Foundation

> The monolith is the foundation, not a feature. It must feel right in isolation before anything layers on top.

### Task 1.1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `tailwind.config.ts`
- Create: `tsconfig.json`

**Step 1: Scaffold the project**

Run:
```bash
cd /Users/ved/Developer/ved-portfolio
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --skip-install
```
Expected: Project files created. Select defaults for prompts.

**Step 2: Install dependencies**

Run:
```bash
npm i @react-three/fiber @react-three/drei three lenis gsap @gsap/react tone three-custom-shader-material
npm i -D @types/three
```

**Step 3: Set up base layout with dark background**

Edit `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Ved Gaikwad",
  description: "Ved Gaikwad",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0A0A0A] text-[#F5F0E8] antialiased">
        {children}
      </body>
    </html>
  );
}
```

Edit `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background: #0A0A0A;
  color: #F5F0E8;
}

::selection {
  background: #C4964A;
  color: #0A0A0A;
}
```

**Step 4: Verify it runs**

Run: `npm run dev`
Expected: Dark page at localhost:3000

**Step 5: Commit**

```bash
git init && git add -A && git commit -m "feat: scaffold Next.js project with dark theme"
```

---

### Task 1.2: Create the Theme System

**Files:**
- Create: `src/lib/theme.ts`

**Step 1: Define the theme constants**

```ts
// src/lib/theme.ts

export const colors = {
  black: "#0A0A0A",
  charcoal: "#121210",
  ivory: "#F5F0E8",
  amber: "#C4964A",
  teal: "#2A6B6B",
  navy: "#1A1A3E",
} as const;

export const fonts = {
  serif: "var(--font-serif)",
  body: "var(--font-body)",
} as const;

// Scroll physics per section — Lenis lerp + duration
export const scrollPhysics = {
  surface: { lerp: 0.08, duration: 1.8 },
  pocketTeal: { lerp: 0.12, duration: 1.0 },   // fluid
  pocketAmber: { lerp: 0.06, duration: 2.0 },   // dense
  pocketNavy: { lerp: 0.04, duration: 2.5 },    // still
  deep: { lerp: 0.05, duration: 2.2 },
  floor: { lerp: 0.1, duration: 1.2 },
} as const;

// Fog configs per layer
export const fogConfig = {
  surface: { color: "#050505", near: 5, far: 80 },
  midDepth: { color: "#0A0A0A", near: 3, far: 60 },
  deep: { color: "#080808", near: 2, far: 50 },
} as const;
```

**Step 2: Add serif font to layout**

Edit `src/app/layout.tsx` to add a serif font:
```tsx
import { Inter, DM_Serif_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});
```
Add `${dmSerif.variable}` to the `<html>` className.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add theme system with colors, fonts, scroll physics"
```

---

### Task 1.3: Set Up R3F Canvas Shell

**Files:**
- Create: `src/components/canvas/Scene.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create the fixed Canvas wrapper**

```tsx
// src/components/canvas/Scene.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

export function Scene({ children }: { children?: React.ReactNode }) {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#0A0A0A"]} />
        <fog attach="fog" args={["#050505", 5, 80]} />
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
```

**Step 2: Wire into page**

```tsx
// src/app/page.tsx
import { Scene } from "@/components/canvas/Scene";

export default function Home() {
  return (
    <main>
      <Scene />
      {/* Scroll sections will go here */}
      <div className="h-[400vh]" />
    </main>
  );
}
```

**Step 3: Verify — dark canvas renders, page scrolls**

Run: `npm run dev`
Expected: Dark canvas fills viewport, page is scrollable

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add fixed R3F Canvas shell"
```

---

### Task 1.4: Build the Monolith — Geometry + Shader

**Files:**
- Create: `src/components/canvas/Monolith.tsx`
- Create: `src/shaders/monolith.vert.glsl`
- Create: `src/shaders/monolith.frag.glsl`

**Step 1: Create the vertex shader**

```glsl
// src/shaders/monolith.vert.glsl
uniform float uTime;
uniform float uMorph;       // 0=pristine obelisk, 1=complex faceted form

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

// Simplex 3D noise (include a noise function or import)
// Using a simple hash-based noise for brevity:
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

void main() {
  vUv = uv;
  vNormal = normal;
  vec3 pos = position;

  // Twist deformation — increases with morph
  float twistAmount = uMorph * sin(pos.y * 2.0 + uTime * 0.3) * 0.4;
  float c = cos(twistAmount);
  float s = sin(twistAmount);
  pos.xz = mat2(c, -s, s, c) * pos.xz;

  // Facet displacement — layered noise at increasing frequency
  float n1 = noise(pos * 3.0 + uTime * 0.15) * 0.12;
  float n2 = noise(pos * 8.0 + uTime * 0.1) * 0.05;
  float displacement = uMorph * (n1 + n2 * uMorph);
  pos += normal * displacement;

  vDisplacement = displacement;
  vPosition = pos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

**Step 2: Create the fragment shader**

```glsl
// src/shaders/monolith.frag.glsl
uniform float uTime;
uniform float uMorph;
uniform vec3 uBaseColor;     // #121210
uniform vec3 uGlowColor;    // #C4964A (amber)

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  // Base color — warm dark
  vec3 color = uBaseColor;

  // Fresnel edge glow — stronger as morph increases
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
  color += uGlowColor * fresnel * uMorph * 0.6;

  // Internal light bleeding through — based on displacement
  float internalLight = smoothstep(0.0, 0.08, abs(vDisplacement)) * uMorph;
  color += uGlowColor * internalLight * 0.4;

  // Subtle surface variation
  float grain = fract(sin(dot(vUv * 400.0, vec2(12.9898, 78.233))) * 43758.5453);
  color += grain * 0.015;

  gl_FragColor = vec4(color, 1.0);
}
```

**Step 3: Create the Monolith component**

```tsx
// src/components/canvas/Monolith.tsx
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

// Import shaders as raw strings
import vertexShader from "@/shaders/monolith.vert.glsl";
import fragmentShader from "@/shaders/monolith.frag.glsl";

const MonolithMaterial = shaderMaterial(
  {
    uTime: 0,
    uMorph: 0,
    uBaseColor: new THREE.Color("#121210"),
    uGlowColor: new THREE.Color("#C4964A"),
  },
  vertexShader,
  fragmentShader,
);

extend({ MonolithMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      monolithMaterial: any;
    }
  }
}

interface MonolithProps {
  morph?: number; // 0-1, driven by scroll later
  position?: [number, number, number];
  scale?: number;
}

export function Monolith({ morph = 0, position = [0, 0, 0], scale = 1 }: MonolithProps) {
  const matRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Obelisk geometry — tall, tapered box
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 4, 1, 32, 128, 32);
    // Taper the top
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const taperFactor = 1.0 - (y / 4.0) * 0.3; // narrow at top
      pos.setX(i, pos.getX(i) * taperFactor);
      pos.setZ(i, pos.getZ(i) * taperFactor);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uTime = state.clock.elapsedTime;
    matRef.current.uMorph = morph;

    // Imperceptible rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0008;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={position} scale={scale}>
      <monolithMaterial ref={matRef} />
    </mesh>
  );
}
```

**Step 4: Configure Next.js for GLSL imports**

Edit `next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glsl$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
```

Create `src/shaders/glsl.d.ts`:
```ts
declare module "*.glsl" {
  const value: string;
  export default value;
}
```

**Step 5: Add Monolith to Scene and test**

Edit `src/app/page.tsx`:
```tsx
import { Scene } from "@/components/canvas/Scene";
import { Monolith } from "@/components/canvas/Monolith";

export default function Home() {
  return (
    <main>
      <Scene>
        <ambientLight intensity={0.1} />
        <pointLight position={[3, 5, 4]} intensity={0.8} color="#C4964A" />
        <Monolith />
      </Scene>
      <div className="h-[400vh]" />
    </main>
  );
}
```

**Step 6: Verify — monolith renders with warm light, rotates slowly**

Run: `npm run dev`
Expected: Dark obelisk shape with amber edge glow, rotating imperceptibly

**Step 7: Test morph by temporarily hardcoding `morph={0.5}`**

Verify the twist and displacement activate. Then revert to `morph={0}`.

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: build monolith with custom vertex/fragment shaders"
```

---

### Task 1.5: Add Lighting Rig

**Files:**
- Create: `src/components/canvas/Lighting.tsx`

**Step 1: Create cinematic lighting setup**

```tsx
// src/components/canvas/Lighting.tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Lighting() {
  const keyLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    // Subtle light breathing
    if (keyLightRef.current) {
      keyLightRef.current.intensity = 0.7 + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <>
      {/* Ambient — very low, just enough to see edges */}
      <ambientLight intensity={0.05} />

      {/* Key light — warm amber, single source feel */}
      <pointLight
        ref={keyLightRef}
        position={[3, 5, 4]}
        intensity={0.8}
        color="#C4964A"
        distance={30}
        decay={2}
      />

      {/* Fill light — cool, subtle */}
      <pointLight
        position={[-4, 2, -3]}
        intensity={0.15}
        color="#2A6B6B"
        distance={20}
        decay={2}
      />
    </>
  );
}
```

**Step 2: Replace inline lights in page.tsx with Lighting component**

**Step 3: Verify — monolith has cinematic single-source lighting**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add cinematic lighting rig with breathing key light"
```

---

### Task 1.6: Reduced Motion Foundation

> prefers-reduced-motion must be baked in from the start, not retrofitted.

**Files:**
- Create: `src/hooks/useReducedMotion.ts`
- Create: `src/lib/motion.ts`

**Step 1: Create reduced motion hook**

```ts
// src/hooks/useReducedMotion.ts
"use client";

import { useState, useEffect } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
```

**Step 2: Create a motion-aware wrapper for scroll animations**

```ts
// src/lib/motion.ts
// Centralized motion config — every animation component imports this

export function getMotionConfig() {
  if (typeof window === "undefined") return { reduced: false };
  return {
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}
```

**Step 3: Add CSS-level reduced motion to globals.css**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add prefers-reduced-motion foundation"
```

> **Convention for all subsequent tasks:** Every animation component must check `getMotionConfig().reduced` and gracefully degrade — show content statically without scroll-linked transforms, disable 3D scene (show static monolith screenshot), disable particle effects.

---

## Phase 2: Scroll Engine + Depth Navigation

> Build the scroll infrastructure. Each layer gets pinned sections before 3D content fills them.

### Task 2.1: Set Up Lenis + GSAP Sync

**Files:**
- Create: `src/components/scroll/SmoothScroll.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create the SmoothScroll provider**

```tsx
// src/components/scroll/SmoothScroll.tsx
"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      autoRaf={false}
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
```

**Step 2: Wrap layout body with SmoothScroll**

Edit `src/app/layout.tsx` to wrap `{children}` with `<SmoothScroll>`.

**Step 3: Verify smooth scrolling works**

Run: `npm run dev`, scroll the page
Expected: Smooth, inertial scrolling

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: integrate Lenis smooth scroll with GSAP ticker"
```

---

### Task 2.2: Create Scroll Store + Section Pinning

**Files:**
- Create: `src/lib/scroll-store.ts`
- Create: `src/components/scroll/ScrollDriver.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create the mutable scroll store**

```ts
// src/lib/scroll-store.ts
// Mutable object — NEVER put these in React state.
// Written by ScrollTrigger, read by useFrame at 60fps.

export const scrollStore = {
  // Global
  globalProgress: 0,       // 0-1 across entire page

  // Per-layer progress (0-1 within each layer)
  surfaceProgress: 0,
  transition1Progress: 0,
  midDepthProgress: 0,
  pocket1Progress: 0,
  pocket2Progress: 0,
  pocket3Progress: 0,
  transition2Progress: 0,
  deepProgress: 0,
  floorProgress: 0,

  // Camera targets
  cameraZ: 10,

  // Current active layer (for lighting/fog shifts)
  activeLayer: "surface" as
    | "surface"
    | "transition1"
    | "midDepth"
    | "transition2"
    | "deep"
    | "floor",
};
```

**Step 2: Create the ScrollDriver component**

```tsx
// src/components/scroll/ScrollDriver.tsx
"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollStore } from "@/lib/scroll-store";
import { scrollPhysics } from "@/lib/theme";

gsap.registerPlugin(ScrollTrigger);

export function ScrollDriver() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Helper to update Lenis physics on section enter
    const setPhysics = (key: keyof typeof scrollPhysics) => {
      lenis.options.lerp = scrollPhysics[key].lerp;
      lenis.options.duration = scrollPhysics[key].duration;
    };

    const triggers: ScrollTrigger[] = [];

    // Surface layer
    triggers.push(
      ScrollTrigger.create({
        trigger: "#surface",
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          scrollStore.surfaceProgress = self.progress;
          scrollStore.cameraZ = 10 - self.progress * 5; // 10 → 5
          scrollStore.activeLayer = "surface";
        },
        onEnter: () => setPhysics("surface"),
        onEnterBack: () => setPhysics("surface"),
      }),
    );

    // Transition 1
    triggers.push(
      ScrollTrigger.create({
        trigger: "#transition-1",
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          scrollStore.transition1Progress = self.progress;
          scrollStore.cameraZ = 5 - self.progress * 3; // 5 → 2
          scrollStore.activeLayer = "transition1";
        },
      }),
    );

    // Pocket 1 — Teal / Fluid
    triggers.push(
      ScrollTrigger.create({
        trigger: "#pocket-1",
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          scrollStore.pocket1Progress = self.progress;
          scrollStore.activeLayer = "midDepth";
        },
        onEnter: () => setPhysics("pocketTeal"),
        onEnterBack: () => setPhysics("pocketTeal"),
      }),
    );

    // Pocket 2 — Amber / Dense
    triggers.push(
      ScrollTrigger.create({
        trigger: "#pocket-2",
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          scrollStore.pocket2Progress = self.progress;
        },
        onEnter: () => setPhysics("pocketAmber"),
        onEnterBack: () => setPhysics("pocketAmber"),
      }),
    );

    // Pocket 3 — Navy / Still
    triggers.push(
      ScrollTrigger.create({
        trigger: "#pocket-3",
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          scrollStore.pocket3Progress = self.progress;
        },
        onEnter: () => setPhysics("pocketNavy"),
        onEnterBack: () => setPhysics("pocketNavy"),
      }),
    );

    // Transition 2
    triggers.push(
      ScrollTrigger.create({
        trigger: "#transition-2",
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          scrollStore.transition2Progress = self.progress;
          scrollStore.cameraZ = 2 - self.progress * 3; // 2 → -1
          scrollStore.activeLayer = "transition2";
        },
      }),
    );

    // Deep layer
    triggers.push(
      ScrollTrigger.create({
        trigger: "#deep",
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          scrollStore.deepProgress = self.progress;
          scrollStore.activeLayer = "deep";
        },
        onEnter: () => setPhysics("deep"),
        onEnterBack: () => setPhysics("deep"),
      }),
    );

    // Floor
    triggers.push(
      ScrollTrigger.create({
        trigger: "#floor",
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          scrollStore.floorProgress = self.progress;
          scrollStore.activeLayer = "floor";
        },
        onEnter: () => setPhysics("floor"),
        onEnterBack: () => setPhysics("floor"),
      }),
    );

    return () => triggers.forEach((t) => t.kill());
  }, [lenis]);

  return null;
}
```

**Step 3: Create DOM scroll sections in page.tsx**

```tsx
// src/app/page.tsx
import { Scene } from "@/components/canvas/Scene";
import { Monolith } from "@/components/canvas/Monolith";
import { Lighting } from "@/components/canvas/Lighting";
import { ScrollDriver } from "@/components/scroll/ScrollDriver";

export default function Home() {
  return (
    <main>
      <Scene>
        <Lighting />
        <Monolith />
      </Scene>

      <ScrollDriver />

      {/* DOM scroll sections — heights determine scroll duration per layer */}
      <section id="surface" className="h-screen" />
      <section id="transition-1" className="h-[150vh]" />
      <section id="pocket-1" className="h-[200vh]" />
      <section id="pocket-2" className="h-[200vh]" />
      <section id="pocket-3" className="h-[200vh]" />
      <section id="transition-2" className="h-[150vh]" />
      <section id="deep" className="h-[300vh]" />
      <section id="floor" className="h-screen" />
    </main>
  );
}
```

**Step 4: Verify — sections pin and scroll progress updates**

Open browser devtools, add a temporary `console.log` in `onUpdate` for surface.
Expected: Progress goes 0→1 as you scroll through pinned section.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add scroll store and ScrollTrigger section pinning"
```

---

### Task 2.3: Connect Scroll to Camera + Monolith

**Files:**
- Create: `src/components/canvas/CameraRig.tsx`
- Modify: `src/components/canvas/Monolith.tsx`

**Step 1: Create the CameraRig that reads scrollStore**

```tsx
// src/components/canvas/CameraRig.tsx
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";

export function CameraRig() {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      scrollStore.cameraZ,
      0.05,
    );
  });

  return null;
}
```

**Step 2: Update Monolith to read morph from scrollStore**

Change the Monolith component to compute morph from scroll progress:
```tsx
useFrame((state) => {
  if (!matRef.current) return;
  matRef.current.uTime = state.clock.elapsedTime;

  // Morph evolves across the full journey
  const morph =
    scrollStore.surfaceProgress * 0.2 +
    scrollStore.pocket1Progress * 0.15 +
    scrollStore.pocket2Progress * 0.15 +
    scrollStore.pocket3Progress * 0.15 +
    scrollStore.deepProgress * 0.35;
  matRef.current.uMorph = morph;

  if (meshRef.current) {
    meshRef.current.rotation.y += 0.0008;
  }
});
```

Remove the `morph` prop — it now reads from scrollStore directly.

**Step 3: Add CameraRig to Scene**

**Step 4: Verify — scrolling dives camera forward and monolith morphs**

Expected: Camera moves closer as you scroll. Monolith gains complexity.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: connect scroll to camera depth and monolith morph"
```

---

## Phase 3: Surface Layer (The Provocation)

> Build the first thing anyone sees. Must create the "This is different" moment.

### Task 3.1: Surface Layer — Typography + Fade-In

**Files:**
- Create: `src/components/layers/Surface.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create the Surface component with provocation text**

```tsx
// src/components/layers/Surface.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Surface() {
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!textRef.current) return;
    // Fade in the provocation after 1.5s
    gsap.fromTo(
      textRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 2, delay: 1.5, ease: "power2.out" },
    );
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <p
        ref={textRef}
        className="max-w-2xl text-center font-serif text-2xl tracking-[0.15em] text-[#F5F0E8] opacity-0 md:text-3xl"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {/* TBD — placeholder provocation */}
        The most interesting systems are the ones you almost didn&apos;t notice.
      </p>
    </div>
  );
}
```

**Step 2: Add to surface section in page.tsx**

Place `<Surface />` inside the `#surface` section with `relative` positioning.

**Step 3: Verify — text fades in elegantly over the monolith**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add surface layer with provocation text fade-in"
```

---

### Task 3.2: Surface Scroll-Out — Text Fades, Camera Dives

**Files:**
- Modify: `src/components/layers/Surface.tsx`

**Step 1: Add scroll-linked fade-out**

Use GSAP ScrollTrigger to fade the text as the user starts scrolling:

```tsx
useEffect(() => {
  if (!textRef.current) return;

  // Fade in
  gsap.fromTo(
    textRef.current,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 2, delay: 1.5, ease: "power2.out" },
  );

  // Fade out on scroll
  ScrollTrigger.create({
    trigger: "#surface",
    start: "top top",
    end: "bottom top",
    scrub: 1,
    onUpdate: (self) => {
      if (!textRef.current) return;
      // Fade out in the first 40% of scroll
      const fadeProgress = Math.min(self.progress / 0.4, 1);
      textRef.current.style.opacity = String(1 - fadeProgress);
      textRef.current.style.transform = `translateY(${fadeProgress * -40}px)`;
    },
  });

  return () => ScrollTrigger.getAll().forEach((t) => t.kill());
}, []);
```

**Step 2: Verify — text fades up and out as you begin scrolling**

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add scroll-linked text fade-out on surface layer"
```

---

## Phase 4: Mid-Depth Layer — The Three Pockets

> Build each pocket as its own working environment before connecting transitions.

### Task 4.1: Pocket Layout Component

**Files:**
- Create: `src/components/layers/Pocket.tsx`

**Step 1: Create a reusable pocket component**

```tsx
// src/components/layers/Pocket.tsx
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface PocketProps {
  id: string;
  pattern: string;
  description: string;
  colorAccent: string; // tailwind text color class
  triggerId: string;
}

export function Pocket({ id, pattern, description, colorAccent, triggerId }: PocketProps) {
  const patternRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!patternRef.current || !descRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: `#${triggerId}`,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        if (!patternRef.current || !descRef.current) return;
        // Pattern fades in during 0-30%
        const patternOpacity = Math.min(self.progress / 0.3, 1);
        patternRef.current.style.opacity = String(patternOpacity);

        // Description fades in during 20-50%
        const descOpacity = Math.max(0, Math.min((self.progress - 0.2) / 0.3, 1));
        descRef.current.style.opacity = String(descOpacity);

        // Both fade out during 70-100%
        if (self.progress > 0.7) {
          const fadeOut = 1 - (self.progress - 0.7) / 0.3;
          patternRef.current.style.opacity = String(Math.min(patternOpacity, fadeOut));
          descRef.current.style.opacity = String(Math.min(descOpacity, fadeOut));
        }
      },
    });

    return () => trigger.kill();
  }, [triggerId]);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-8 px-8">
      <p
        ref={patternRef}
        className={`max-w-xl text-center font-serif text-xl tracking-wide opacity-0 md:text-2xl ${colorAccent}`}
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {pattern}
      </p>
      <p
        ref={descRef}
        className="max-w-lg text-center text-base leading-relaxed text-[#F5F0E8]/70 opacity-0 md:text-lg"
      >
        {description}
      </p>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: create reusable Pocket component with scroll-linked text reveals"
```

---

### Task 4.2: Wire Three Pockets Into Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add Pocket instances for each depth pocket**

```tsx
<section id="pocket-1" className="relative h-[200vh]">
  <Pocket
    id="pocket-1"
    triggerId="pocket-1"
    pattern="Copywriting taught me that every system has a narrative. Agencies taught me that narratives are systems. AI taught me to build both at once."
    description="Copy → strategy → tech isn't a career pivot. It's the same skill applied at increasing resolution."
    colorAccent="text-[#2A6B6B]"
  />
</section>

<section id="pocket-2" className="relative h-[200vh]">
  <Pocket
    id="pocket-2"
    triggerId="pocket-2"
    pattern="Inclusive design and persuasive design are the same problem viewed from different angles."
    description="NeuroEdge combined accessibility auditing and neuromarketing — two fields nobody was putting in the same room."
    colorAccent="text-[#C4964A]"
  />
</section>

<section id="pocket-3" className="relative h-[200vh]">
  <Pocket
    id="pocket-3"
    triggerId="pocket-3"
    pattern="I'd already solved this problem three times in different domains. The code was just the last translation."
    description="A 12-hour build isn't fast. It's what happens when the thinking is already done."
    colorAccent="text-[#1A1A3E]"
  />
</section>
```

**Step 2: Verify each pocket's text fades in/out independently**

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: wire three depth pockets with copy and scroll animations"
```

---

### Task 4.3: Per-Pocket 3D Environment Shifts

**Files:**
- Create: `src/components/canvas/DepthEnvironment.tsx`

**Step 1: Create environment component that shifts fog/light per pocket**

```tsx
// src/components/canvas/DepthEnvironment.tsx
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";
import { colors } from "@/lib/theme";

const fogColors = {
  surface: new THREE.Color("#050505"),
  teal: new THREE.Color("#0A1A1A"),
  amber: new THREE.Color("#1A1208"),
  navy: new THREE.Color("#0A0A1E"),
  deep: new THREE.Color("#080808"),
};

export function DepthEnvironment() {
  const { scene } = useThree();

  useFrame(() => {
    if (!scene.fog || !(scene.fog instanceof THREE.Fog)) return;

    const layer = scrollStore.activeLayer;
    let targetColor: THREE.Color;

    switch (layer) {
      case "surface":
      case "transition1":
        targetColor = fogColors.surface;
        break;
      case "midDepth":
        // Blend between pocket colors based on which pocket is active
        if (scrollStore.pocket1Progress > 0 && scrollStore.pocket1Progress < 1) {
          targetColor = fogColors.teal;
        } else if (scrollStore.pocket2Progress > 0 && scrollStore.pocket2Progress < 1) {
          targetColor = fogColors.amber;
        } else {
          targetColor = fogColors.navy;
        }
        break;
      case "transition2":
      case "deep":
      case "floor":
        targetColor = fogColors.deep;
        break;
      default:
        targetColor = fogColors.surface;
    }

    (scene.fog as THREE.Fog).color.lerp(targetColor, 0.03);
    scene.background = (scene.fog as THREE.Fog).color.clone();
  });

  return null;
}
```

**Step 2: Add to Scene component**

**Step 3: Verify — fog color shifts as you scroll through pockets**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add per-pocket fog and background color transitions"
```

---

## Phase 5: Transitions — The Pressure Changes

> The liminal spaces where emotional impact lives.

### Task 5.1: Transition 1 — Surface to Mid-Depth

**Files:**
- Create: `src/components/layers/Transition.tsx`

**Step 1: Build a transition overlay component**

```tsx
// src/components/layers/Transition.tsx
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface TransitionProps {
  triggerId: string;
}

export function Transition({ triggerId }: TransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: `#${triggerId}`,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        if (!overlayRef.current) return;
        // Flash of amber light at the midpoint
        const flash = Math.exp(-Math.pow((self.progress - 0.5) * 6, 2));
        overlayRef.current.style.background =
          `radial-gradient(ellipse at center, rgba(196,150,74,${flash * 0.15}) 0%, transparent 70%)`;
      },
    });

    return () => trigger.kill();
  }, [triggerId]);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none absolute inset-0"
    />
  );
}
```

**Step 2: Add to transition sections in page.tsx**

```tsx
<section id="transition-1" className="relative h-[150vh]">
  <Transition triggerId="transition-1" />
</section>
```

**Step 3: Verify — amber radial flash during transition scroll**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add transition overlays with amber light flash"
```

---

### Task 5.2: Monolith Particle Dissolve/Reform (Transition 1 3D Effect)

**Files:**
- Create: `src/components/canvas/ParticleField.tsx`

**Step 1: Create a particle system that activates during transitions**

```tsx
// src/components/canvas/ParticleField.tsx
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";

const PARTICLE_COUNT = 2000;

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Start clustered around monolith shape
      positions[i * 3] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

      // Random scatter velocities
      velocities[i * 3] = (Math.random() - 0.5) * 3;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 3;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }

    return { positions, velocities };
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;

    // Dissolve during transition 1 (progress 0→1), reform after
    const dissolve = scrollStore.transition1Progress;

    // Use stored base positions (immutable) + velocities * dissolve
    // No Math.random() per frame — that causes jitter
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos.setX(i, positions[i * 3] + velocities[i * 3] * dissolve);
      pos.setY(i, positions[i * 3 + 1] + velocities[i * 3 + 1] * dissolve);
      pos.setZ(i, positions[i * 3 + 2] + velocities[i * 3 + 2] * dissolve);
    }
    pos.needsUpdate = true;

    // Fade particles in/out based on transition
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = dissolve > 0.01 && dissolve < 0.99 ? 1 : 0;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#C4964A"
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
```

**Step 2: Add to Scene**

**Step 3: Verify — particles scatter during transition 1**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add particle dissolve/reform effect for transitions"
```

---

## Phase 6: Deep Layer — Project Showcases

> Each project is a discovery. Build as independent cards, then connect.

### Task 6.1: Project Card Component

**Files:**
- Create: `src/components/layers/ProjectCard.tsx`
- Create: `src/lib/projects.ts`

**Step 1: Define project data**

```ts
// src/lib/projects.ts

export interface Project {
  id: string;
  frame: string;        // The provocative one-liner
  title: string;
  description: string;
  proof: string;
  tech: string[];
  links?: { label: string; url: string }[];
}

export const projects: readonly Project[] = [
  {
    id: "neuroedge",
    frame: "Everyone audits what's broken. Nobody was asking what's invisible.",
    title: "NeuroEdge",
    description: "Accessibility auditing meets neuromarketing. The insight that inclusive design and persuasive design are the same problem viewed from different angles.",
    proof: "Combined two fields nobody was putting in the same room.",
    tech: ["TypeScript", "React", "AI/ML"],
  },
  {
    id: "springpod-simulator",
    frame: "I'd already solved requirements discovery as a strategist, a copywriter, and a consultant. The code was the fourth translation.",
    title: "Discovery Simulator",
    description: "Gamified client-interview simulator for business requirements discovery. Built in 12 hours — not because of speed, but because the thinking was already done.",
    proof: "12-hour build powered by cross-domain pattern recognition.",
    tech: ["TypeScript", "Next.js", "Gamification"],
  },
  {
    id: "fraudshield",
    frame: "Enterprise fraud detection is a solved problem. Making it legible to a small business owner — that's the actual problem.",
    title: "FraudShieldAI",
    description: "Explainable AI fraud detection for SMBs. The challenge wasn't the model — it was making the model's reasoning human-readable.",
    proof: "Explainable AI that a non-technical business owner can act on.",
    tech: ["Python", "Machine Learning", "Explainable AI"],
  },
  {
    id: "scrollwise",
    frame: "You save hundreds of bookmarks, highlights, and posts across apps. They die in a folder.",
    title: "Scrollwise",
    description: "Personal reading infrastructure. Turns your saved knowledge into a curated feed you actually revisit — TikTok for your own thinking.",
    proof: "Solved the bookmarks-graveyard problem.",
    tech: ["TypeScript", "Next.js", "React 19", "Dexie"],
  },
] as const;
```

**Step 2: Create the ProjectCard component**

```tsx
// src/components/layers/ProjectCard.tsx
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/lib/projects";

gsap.registerPlugin(ScrollTrigger);

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerId = `project-${project.id}`;

  useEffect(() => {
    if (!cardRef.current) return;
    const el = cardRef.current;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      end: "top 20%",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        el.style.opacity = String(Math.min(progress / 0.3, 1));
        el.style.transform = `translateY(${(1 - progress) * 60}px)`;
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <div ref={cardRef} className="mx-auto max-w-2xl px-6 py-24 opacity-0">
      {/* The Frame */}
      <p
        className="mb-8 font-serif text-xl leading-relaxed tracking-wide text-[#C4964A] md:text-2xl"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        &ldquo;{project.frame}&rdquo;
      </p>

      {/* Title */}
      <h3 className="mb-4 text-lg font-medium tracking-wider text-[#F5F0E8] uppercase">
        {project.title}
      </h3>

      {/* Description */}
      <p className="mb-6 leading-relaxed text-[#F5F0E8]/70">
        {project.description}
      </p>

      {/* Proof */}
      <p className="text-sm tracking-wide text-[#F5F0E8]/50">
        {project.proof}
      </p>

      {/* Subtle divider */}
      <div className="mt-16 h-px w-16 bg-[#C4964A]/30" />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add project data and ProjectCard component"
```

---

### Task 6.2: Wire Projects Into Deep Layer

**Files:**
- Create: `src/components/layers/Deep.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create Deep layer container**

```tsx
// src/components/layers/Deep.tsx
import { ProjectCard } from "./ProjectCard";
import { projects } from "@/lib/projects";

export function Deep() {
  return (
    <div className="relative py-32">
      {projects.map((project, i) => (
        <ProjectCard key={project.id} project={project} index={i} />
      ))}
    </div>
  );
}
```

**Step 2: Replace the #deep section placeholder with Deep component**

**Step 3: Adjust #deep section height to accommodate all projects (remove fixed height, let content determine it — update ScrollDriver accordingly)**

**Step 4: Verify — projects scroll in with frame → title → description**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: wire project showcases into deep layer"
```

---

## Phase 7: The Floor — Contact

### Task 7.1: Floor Component

**Files:**
- Create: `src/components/layers/Floor.tsx`

**Step 1: Build the floor**

```tsx
// src/components/layers/Floor.tsx
"use client";

export function Floor() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <p
        className="text-center font-serif text-xl tracking-wide text-[#F5F0E8]/80 md:text-2xl"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        You&apos;ve gone deep. Most people don&apos;t.
      </p>

      <div className="mt-8 flex items-center gap-8 text-sm tracking-widest text-[#F5F0E8]/50 uppercase">
        <a
          href="mailto:ved@example.com"
          className="transition-colors hover:text-[#C4964A]"
        >
          Email
        </a>
        <span className="text-[#C4964A]/30">·</span>
        <a
          href="https://github.com/vedantggwp"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-[#C4964A]"
        >
          GitHub
        </a>
        <span className="text-[#C4964A]/30">·</span>
        <a
          href="https://linkedin.com/in/vedantgaikwad"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-[#C4964A]"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}
```

**Step 2: Wire into #floor section**

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add floor/contact section"
```

---

## Phase 8: Sonic Layer

> Designed alongside, implemented after visuals are solid.

### Task 8.1: Audio Engine

**Files:**
- Create: `src/components/audio/AudioEngine.tsx`
- Create: `src/components/audio/SoundToggle.tsx`

**Step 1: Create the audio engine with scroll-reactive synthesis**

```tsx
// src/components/audio/AudioEngine.tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);

export function AudioEngine({ enabled }: { enabled: boolean }) {
  const initialized = useRef(false);
  const droneRef = useRef<Tone.Synth | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);

  useEffect(() => {
    if (!enabled || initialized.current) return;
    initialized.current = true;

    const setup = async () => {
      await Tone.start();

      const reverb = new Tone.Reverb({ decay: 10, wet: 0.7 }).toDestination();
      const filter = new Tone.Filter(200, "lowpass").connect(reverb);
      const drone = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 4, decay: 2, sustain: 0.8, release: 6 },
        volume: -30,
      }).connect(filter);

      droneRef.current = drone;
      filterRef.current = filter;
      reverbRef.current = reverb;

      // Start sub-bass drone
      drone.triggerAttack("C1");

      // Scroll-reactive filter opening
      ScrollTrigger.create({
        trigger: "#surface",
        start: "top top",
        endTrigger: "#floor",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          if (filterRef.current) {
            // Filter opens as you go deeper: 200Hz → 2000Hz
            filterRef.current.frequency.value = 200 + self.progress * 1800;
          }
        },
      });
    };

    setup();

    return () => {
      droneRef.current?.triggerRelease();
      droneRef.current?.dispose();
      filterRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, [enabled]);

  return null;
}
```

**Step 2: Create the sound toggle (pulsing waveform icon)**

```tsx
// src/components/audio/SoundToggle.tsx
"use client";

import { useState } from "react";
import { AudioEngine } from "./AudioEngine";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);

  return (
    <>
      <AudioEngine enabled={enabled} />
      <button
        onClick={() => setEnabled((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F0E8]/5 backdrop-blur-sm transition-colors hover:bg-[#F5F0E8]/10"
        aria-label={enabled ? "Disable sound" : "Enable sound"}
        title={enabled ? "Sound on" : "Sound off"}
      >
        {/* Simple waveform icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={enabled ? "animate-pulse" : "opacity-40"}
        >
          <rect x="1" y="6" width="2" height="4" rx="1" fill="#F5F0E8" />
          <rect x="5" y="4" width="2" height="8" rx="1" fill="#F5F0E8" />
          <rect x="9" y="2" width="2" height="12" rx="1" fill="#F5F0E8" />
          <rect x="13" y="5" width="2" height="6" rx="1" fill="#F5F0E8" />
        </svg>
      </button>
    </>
  );
}
```

**Step 3: Add SoundToggle to page.tsx**

**Step 4: Verify — clicking toggle starts sub-bass drone, filter opens as you scroll**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add audio engine with scroll-reactive drone and sound toggle"
```

---

## Phase 9: Mobile Fallback

> A deliberate design, not a degraded version.

### Task 9.1: Detect WebGL Support + Create Fallback

**Files:**
- Create: `src/hooks/useWebGLSupport.ts`
- Create: `src/components/canvas/FallbackScene.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create WebGL detection hook**

```ts
// src/hooks/useWebGLSupport.ts
"use client";

import { useState, useEffect } from "react";

export function useWebGLSupport(): boolean {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
```

**Step 2: Create CSS parallax fallback**

```tsx
// src/components/canvas/FallbackScene.tsx
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function FallbackScene() {
  const monolithRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!monolithRef.current) return;

    ScrollTrigger.create({
      trigger: "#surface",
      start: "top top",
      endTrigger: "#floor",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        if (!monolithRef.current) return;
        const scale = 1 + self.progress * 0.5;
        const rotate = self.progress * 15;
        const glow = self.progress * 0.3;
        monolithRef.current.style.transform =
          `scale(${scale}) rotate(${rotate}deg)`;
        monolithRef.current.style.boxShadow =
          `0 0 ${glow * 100}px ${glow * 40}px rgba(196,150,74,${glow})`;
      },
    });
  }, []);

  return (
    <div className="fixed inset-0 -z-10 flex items-center justify-center">
      {/* CSS monolith */}
      <div
        ref={monolithRef}
        className="h-48 w-12 bg-gradient-to-b from-[#1A1A1A] to-[#121210]"
        style={{
          clipPath: "polygon(20% 0%, 80% 0%, 90% 100%, 10% 100%)",
        }}
      />
      {/* Depth layers via CSS parallax */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A]" />
    </div>
  );
}
```

**Step 3: Conditionally render Scene vs FallbackScene in page.tsx**

```tsx
// In page.tsx (simplified):
const webgl = useWebGLSupport();
// ...
{webgl ? <Scene>...</Scene> : <FallbackScene />}
```

Note: page.tsx will need `"use client"` or this logic moves to a client wrapper component.

**Step 4: Test by temporarily forcing `supported = false`**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add CSS parallax mobile fallback with monolith"
```

---

### Task 9.2: Mobile-Specific Touch Optimizations

**Files:**
- Modify: `src/components/scroll/SmoothScroll.tsx`

**Step 1: Adjust Lenis options for touch devices**

```tsx
// In SmoothScroll.tsx, detect touch and adjust:
const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

<ReactLenis
  root
  ref={lenisRef}
  autoRaf={false}
  options={{
    lerp: isTouchDevice ? 0.15 : 0.1,
    duration: isTouchDevice ? 0.8 : 1.2,
    smoothWheel: true,
    touchMultiplier: 1.5,
  }}
>
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: optimize scroll physics for touch devices"
```

---

### Task 9.3: Accessibility

> NeuroEdge is an accessibility product. This site must practice what it preaches.

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/layers/Surface.tsx`
- Modify: `src/components/layers/Pocket.tsx`
- Modify: `src/components/layers/ProjectCard.tsx`
- Modify: `src/components/canvas/Scene.tsx`

**Step 1: Add ARIA landmarks and screen reader content**

- Wrap scroll sections in `<section>` with `aria-label` attributes
- Add `role="img" aria-label="..."` to the Canvas container describing the monolith
- Add visually-hidden text alternatives for each depth pocket's visual metaphor
- Ensure all interactive elements (sound toggle, contact links) have focus styles

**Step 2: Keyboard navigation for scroll sections**

- Add skip links at the top: "Skip to projects", "Skip to contact"
- Ensure Tab order follows the visual depth order
- Test with keyboard-only navigation

**Step 3: Reduced motion — full graceful degradation**

- When `prefers-reduced-motion: reduce` is active:
  - 3D Canvas shows a static monolith image instead of WebGL
  - Scroll sections display without pinning (natural document flow)
  - Text appears statically (no fade-in/out animations)
  - Particle effects disabled
  - Audio engine still available (sound is not motion)
- Verify with: System Preferences → Accessibility → Display → Reduce motion

**Step 4: Color contrast verification**

- Verify all text meets WCAG AA contrast ratios against backgrounds
- Amber on dark: `#C4964A` on `#0A0A0A` = 5.2:1 (passes AA)
- Ivory on dark: `#F5F0E8` on `#0A0A0A` = 16.8:1 (passes AAA)
- Check `/70` and `/50` opacity variants — may need adjustment

**Step 5: Run automated accessibility audit**

Run: `npx pa11y http://localhost:3000`
Target: 0 errors

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add accessibility — ARIA, keyboard nav, reduced motion, contrast"
```

---

## Phase 10: Polish + Deploy

### Task 10.1: Performance Audit

**Files:**
- Modify: `src/components/canvas/Scene.tsx`

**Step 1: Add PerformanceMonitor from drei**

```tsx
import { PerformanceMonitor } from "@react-three/drei";

// Inside Scene:
const [dpr, setDpr] = useState(1.5);

<Canvas dpr={dpr}>
  <PerformanceMonitor
    onDecline={() => setDpr(1)}
    onIncline={() => setDpr(2)}
  >
    {children}
  </PerformanceMonitor>
</Canvas>
```

**Step 2: Add lazy loading for deep layer 3D content**

Use IntersectionObserver to only mount heavy components when approaching.

**Step 3: Run Lighthouse audit**

Run: `npm run build && npx serve out`
Target: Performance 90+, Accessibility 95+

**Step 4: Commit**

```bash
git add -A && git commit -m "perf: add adaptive DPR and lazy loading"
```

---

### Task 10.2: Deploy to Vercel

**Step 1: Push to GitHub**

```bash
gh repo create ved-portfolio --public --source=. --push
```

**Step 2: Deploy**

```bash
npx vercel --prod
```

**Step 3: Verify live site**

**Step 4: Commit any deployment config**

```bash
git add -A && git commit -m "chore: add Vercel deployment config"
```

---

## Copy Pass Convention

> Copy shapes pacing and layout. Each phase gets a copy pass before moving on.

At the end of each layer phase (3, 4, 6, 7), review and finalize copy for that layer:
- **Phase 3:** Provocation line — must be uniquely Ved, not a placeholder
- **Phase 4:** Pocket pattern lines and descriptions — test pacing against scroll speed
- **Phase 6:** Project frames, descriptions, proof lines — each must earn its words
- **Phase 7:** Floor line is locked ("You've gone deep. Most people don't.")

Do not defer all copy to Phase 10. Copy that fights the visual structure will require layout rework.

---

## Phase Summary

| Phase | What's Visible After | Tasks |
|-------|---------------------|-------|
| **1. Scaffold + Monolith** | Monolith rotating in dark space with cinematic lighting | 1.1–1.6 |
| **2. Scroll Engine** | Camera dives forward on scroll, monolith morphs | 2.1–2.3 |
| **3. Surface Layer** | Provocation text fades in/out over monolith + copy pass | 3.1–3.2 |
| **4. Mid-Depth Pockets** | Three text reveals with per-pocket fog colors + copy pass | 4.1–4.3 |
| **5. Transitions** | Amber light flashes + particle dissolve between layers | 5.1–5.2 |
| **6. Deep Layer** | Project showcases scroll in as discoveries + copy pass | 6.1–6.2 |
| **7. Floor** | "You've gone deep" contact section (copy locked) | 7.1 |
| **8. Sonic Layer** | Sub-bass drone with scroll-reactive filter | 8.1 |
| **9. Mobile + A11y** | CSS parallax fallback + full accessibility | 9.1–9.3 |
| **10. Polish + Deploy** | Live on Vercel with adaptive performance | 10.1–10.2 |
