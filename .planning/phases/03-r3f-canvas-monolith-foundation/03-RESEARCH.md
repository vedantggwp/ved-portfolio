# Phase 3: R3F Canvas + Monolith Foundation - Research

**Researched:** 2026-03-09
**Domain:** React Three Fiber, Three.js GLSL shaders, scroll-driven 3D animation
**Confidence:** HIGH

## Summary

This phase introduces a fixed R3F canvas behind the existing scrollable DOM content, hosting a custom GLSL-shaded monolith (obelisk) that morphs from abstract to complex as the user scrolls. The core technical challenges are: (1) layering R3F behind DOM without interfering with scroll/pointer events, (2) writing custom vertex/fragment shaders for geometry morphing and fresnel glow, and (3) bridging the existing mutable scroll store into R3F's useFrame loop without React re-renders.

R3F v9 (9.5.0) is the current stable release paired with React 19 and works with Next.js 13.1+ via `transpilePackages: ['three']`. The project already uses React 19.2.3 and Next.js 16.1.6, so R3F v9 is the correct choice. Drei v10.7.7 provides helpers but this phase primarily needs raw ShaderMaterial for custom GLSL. The monolith geometry should be built from a subdivided BoxGeometry (or custom BufferGeometry) with vertex displacement in the shader, not pre-modeled.

**Primary recommendation:** Use `@react-three/fiber@^9.5.0` with `three@^0.172.0`, a fixed-position Canvas with `pointer-events: none` and `eventSource` bound to the parent wrapper, custom `ShaderMaterial` for the monolith with uniforms driven by the scroll store read inside `useFrame`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-04 | Fixed R3F Canvas behind scrollable DOM sections | Canvas with `position: fixed`, `z-index: 0`, `pointer-events: none`; DOM content at higher z-index |
| MONO-01 | 3D obelisk geometry with custom GLSL vertex/fragment shaders | Subdivided BoxGeometry with tapered top via vertex shader displacement; ShaderMaterial with custom uniforms |
| MONO-02 | Monolith morphs from abstract/minimal to complex/faceted driven by scroll progress | `uMorphProgress` uniform (0-1) from scroll store drives vertex noise displacement and fragment complexity |
| MONO-03 | Imperceptible slow rotation | Small Y-axis rotation in useFrame: `mesh.rotation.y += delta * 0.02` |
| MONO-04 | Amber fresnel edge glow that intensifies with morph | Fresnel rim calculation in fragment shader: `1.0 - dot(normal, viewDir)` with amber color `vec3(1.0, 0.6, 0.1)` multiplied by `uMorphProgress` |
| MONO-05 | Final form still suggests unseen geometry -- never fully resolved | Cap morph progress at ~0.85 max displacement; add procedural detail that implies hidden internal structure |
| MONO-06 | Cinematic single-source warm lighting with subtle breathing | Single directional/point light with warm color; breathing via sinusoidal intensity modulation in useFrame |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-three/fiber | ^9.5.0 | React renderer for Three.js | Only production React 19 compatible Three.js renderer |
| three | ^0.172.0 | 3D engine | R3F v9 peer dependency; latest stable |
| @react-three/drei | ^10.7.7 | R3F helpers (optional for this phase) | Provides shaderMaterial helper, useTexture, etc. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/three | ^0.172.0 | TypeScript types for Three.js | Always -- strict mode requires it |
| glslify | (not needed) | GLSL module imports | Skip -- raw GLSL strings are simpler for this scope |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Raw ShaderMaterial | drei's shaderMaterial helper | drei helper is convenient but raw gives full control over uniforms and types |
| Custom BufferGeometry | Pre-modeled .glb obelisk | Custom geometry is simpler to morph procedurally; no asset loading needed |
| @14islands/r3f-scroll-rig | Manual scroll bridge | Extra dependency for a problem already solved by the existing scroll store |

**Installation:**
```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

**Next.js config update required:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: ['three'],
}
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── R3FCanvas.tsx          # Fixed canvas wrapper (client-only)
│   └── ScrollEngine.tsx       # Existing scroll engine
├── three/
│   ├── Monolith.tsx           # R3F mesh component with shader material
│   ├── MonolithShader.ts      # GLSL vertex + fragment strings + uniforms
│   ├── CinematicLighting.tsx  # Warm directional light with breathing
│   └── MonolithScene.tsx      # Scene composition (monolith + lights + camera)
├── lib/
│   ├── scroll-store.ts        # Existing mutable store
│   └── sections.ts            # Existing section definitions
└── hooks/
    └── useReducedMotion.ts    # Existing
```

### Pattern 1: Fixed Canvas Behind DOM
**What:** R3F Canvas rendered at `position: fixed; inset: 0; z-index: 0` with `pointer-events: none`. DOM content sits above at `z-index: 1+`.
**When to use:** Always for this project -- the canvas is purely visual background.
**Example:**
```typescript
// Source: R3F docs + community patterns
'use client'

import { Canvas } from '@react-three/fiber'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function R3FCanvas() {
  const prefersReduced = useReducedMotion()
  if (prefersReduced) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        style={{ pointerEvents: 'none' }}
      >
        <MonolithScene />
      </Canvas>
    </div>
  )
}
```

### Pattern 2: Scroll Store Bridge into useFrame
**What:** Read the mutable scroll store directly inside useFrame -- never subscribe via React state.
**When to use:** Every frame that needs scroll-driven values.
**Example:**
```typescript
// Source: R3F pitfalls docs
import { useFrame } from '@react-three/fiber'
import { scrollStore } from '@/lib/scroll-store'

function Monolith() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  useFrame((_, delta) => {
    // Read mutable store directly -- no React state, no re-renders
    const { progress } = scrollStore

    // Update shader uniform
    materialRef.current.uniforms.uMorphProgress.value = progress

    // Imperceptible rotation
    meshRef.current.rotation.y += delta * 0.02
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 3, 1, 32, 64, 32]} />
      <shaderMaterial ref={materialRef} {...shaderProps} />
    </mesh>
  )
}
```

### Pattern 3: Custom GLSL ShaderMaterial
**What:** Vertex shader displaces geometry based on scroll progress; fragment shader applies fresnel glow.
**When to use:** The monolith mesh.
**Example:**
```typescript
// Uniform definitions
const uniforms = {
  uTime: { value: 0 },
  uMorphProgress: { value: 0 },
  uRimColor: { value: new THREE.Color(1.0, 0.6, 0.1) }, // amber
  uRimPower: { value: 3.0 },
  uRimIntensity: { value: 1.5 },
}
```

```glsl
// Vertex shader (simplified)
uniform float uTime;
uniform float uMorphProgress;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;

// Simple 3D noise (include noise function)
void main() {
  vec3 pos = position;

  // Taper top to create obelisk shape
  float taper = 1.0 - smoothstep(0.0, 1.0, (pos.y + 1.5) / 3.0) * 0.6;
  pos.xz *= taper;

  // Scroll-driven morph: add noise displacement
  float noise = snoise(pos * 2.0 + uTime * 0.1);
  float displacement = noise * uMorphProgress * 0.3;
  pos += normal * displacement;

  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  vViewPosition = -mvPos.xyz;
  vDisplacement = displacement;

  gl_Position = projectionMatrix * mvPos;
}
```

```glsl
// Fragment shader (simplified)
uniform vec3 uRimColor;
uniform float uRimPower;
uniform float uRimIntensity;
uniform float uMorphProgress;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Fresnel rim glow
  float rim = 1.0 - max(0.0, dot(normal, viewDir));
  rim = pow(rim, uRimPower) * uRimIntensity * uMorphProgress;

  // Base color: dark with slight warm tint
  vec3 baseColor = vec3(0.05, 0.04, 0.03);

  // Add faceting detail based on morph
  baseColor += vec3(vDisplacement * 0.5) * uMorphProgress;

  vec3 finalColor = baseColor + uRimColor * rim;
  gl_FragColor = vec4(finalColor, 1.0);
}
```

### Pattern 4: Cinematic Breathing Light
**What:** Single warm light with sinusoidal intensity modulation.
**When to use:** The scene lighting setup.
**Example:**
```typescript
function CinematicLighting() {
  const lightRef = useRef<THREE.PointLight>(null!)

  useFrame(({ clock }) => {
    // Subtle breathing: intensity oscillates between 0.8 and 1.2
    const breath = Math.sin(clock.elapsedTime * 0.5) * 0.2 + 1.0
    lightRef.current.intensity = breath
  })

  return (
    <>
      <ambientLight intensity={0.05} color="#1a1510" />
      <pointLight
        ref={lightRef}
        position={[3, 5, 4]}
        intensity={1.0}
        color="#ffaa44"
        distance={20}
        decay={2}
      />
    </>
  )
}
```

### Anti-Patterns to Avoid
- **useState for scroll values in 3D:** Never `const [progress, setProgress] = useState(0)` -- this causes full React re-renders at 60fps. Always read `scrollStore` directly in `useFrame`.
- **Mounting/unmounting 3D objects per section:** Expensive buffer reallocation. Use visibility or opacity instead.
- **Creating new Vector3/Color in useFrame:** Allocate outside the loop, reuse with `.set()`.
- **External animation libraries for shader uniforms:** react-spring/framer-motion add overhead; direct mutation in useFrame is faster.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 3D noise in GLSL | Custom noise function | Ashima's webgl-noise (simplex3D) | Battle-tested, correct gradient noise; copy the GLSL function directly |
| Canvas resize handling | Window resize listener | R3F's built-in resize observer | Canvas auto-resizes; manual handling causes race conditions |
| DPR management | Custom pixel ratio logic | R3F `dpr={[1, 2]}` prop | Already handles adaptive DPR; project has PerformanceMonitor from Phase 2 |
| Object disposal | Manual geometry/material dispose | R3F auto-disposal on unmount | R3F tracks and disposes all Three.js objects automatically |
| Camera controls | Custom camera positioning | Static camera props on Canvas | No interactive camera needed -- this is a background visual |

**Key insight:** R3F handles all the boilerplate (resize, disposal, render loop, reconciliation). Focus effort on the GLSL shaders and scroll integration, not infrastructure.

## Common Pitfalls

### Pitfall 1: Canvas Blocks Scroll Events
**What goes wrong:** The R3F canvas intercepts pointer/wheel events, preventing Lenis scroll.
**Why it happens:** Canvas has default pointer event handling enabled.
**How to avoid:** Set `pointer-events: none` on both the wrapper div AND the canvas `style` prop. Since the monolith is non-interactive, no events are needed.
**Warning signs:** Scroll stops working when Canvas is mounted.

### Pitfall 2: SSR Crash from Three.js
**What goes wrong:** Next.js server-side rendering attempts to import Three.js, which requires `window`/`document`.
**Why it happens:** Three.js is browser-only; R3F components must be client-only.
**How to avoid:** Mark the R3F canvas component with `'use client'` directive. Use dynamic import with `ssr: false` if needed. The project already has SSR-safe boundaries from Phase 1 (FOUND-06).
**Warning signs:** "window is not defined" or "document is not defined" errors during build.

### Pitfall 3: transpilePackages Missing
**What goes wrong:** Three.js ESM imports fail in Next.js build.
**Why it happens:** Three.js ships ESM-only and Next.js needs explicit transpilation config.
**How to avoid:** Add `transpilePackages: ['three']` to `next.config.ts`. This is documented in R3F installation guide.
**Warning signs:** Build errors about unexpected token or ESM module syntax.

### Pitfall 4: Shader Uniform Updates Causing Re-renders
**What goes wrong:** Updating uniforms via React state triggers component re-renders, dropping frame rate.
**Why it happens:** Developer passes uniform values as props instead of mutating refs.
**How to avoid:** Store material ref via `useRef`, mutate `materialRef.current.uniforms.uFoo.value` directly in `useFrame`.
**Warning signs:** React DevTools shows rapid re-renders; frame rate drops below 30fps.

### Pitfall 5: Morph Looks "Complete" at Max Scroll
**What goes wrong:** The monolith at full scroll looks finished/resolved, losing the "hidden geometry" mystery.
**Why it happens:** Linear morph progress from 0 to 1 with no held-back detail.
**How to avoid:** Cap visible morph at ~85% of noise amplitude. Add secondary high-frequency noise layer that only partially reveals. Use non-uniform displacement (more on some faces, less on others).
**Warning signs:** The monolith at full scroll looks like a fully defined crystal/rock with no mystery.

### Pitfall 6: Normal Recalculation After Vertex Displacement
**What goes wrong:** Fresnel glow looks flat or wrong on displaced geometry because normals don't match deformed surface.
**Why it happens:** Original normals from BoxGeometry don't account for vertex shader displacement.
**How to avoid:** Compute displaced normals in vertex shader using finite difference method (sample noise at neighboring positions and cross-product). Alternatively, use `derivatives` extension (`dFdx`/`dFdy`) in fragment shader.
**Warning signs:** Rim glow appears uniform instead of following the deformed surface contours.

## Code Examples

### Complete R3F Canvas Integration in Layout
```typescript
// src/app/layout.tsx
import dynamic from 'next/dynamic'

const R3FCanvas = dynamic(() => import('@/components/R3FCanvas').then(m => m.R3FCanvas), {
  ssr: false,
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
      <body>
        <SkipLinks />
        <R3FCanvas />
        <ScrollEngine>
          <main style={{ position: 'relative', zIndex: 1 }}>{children}</main>
        </ScrollEngine>
      </body>
    </html>
  )
}
```

### Simplex Noise GLSL (Ashima)
```glsl
// Source: https://github.com/ashima/webgl-noise
// Include the full snoise(vec3) function from ashima/webgl-noise
// This is ~60 lines of GLSL; embed directly in vertex shader string
```

### Obelisk Taper via Vertex Shader
```glsl
// Taper the top of a subdivided box to create obelisk shape
// pos.y ranges from -1.5 to +1.5 for a box of height 3
float heightNorm = (pos.y + 1.5) / 3.0; // 0 at bottom, 1 at top
float taper = 1.0 - heightNorm * 0.65;   // bottom=1.0, top=0.35
pos.xz *= taper;
```

### useFrame with Time + Scroll
```typescript
useFrame(({ clock }, delta) => {
  const mat = materialRef.current
  const mesh = meshRef.current

  // Time for subtle animation
  mat.uniforms.uTime.value = clock.elapsedTime

  // Scroll progress drives morph (0 at surface, 1 at floor)
  mat.uniforms.uMorphProgress.value = scrollStore.progress

  // Imperceptible rotation (~1 degree per 3 seconds)
  mesh.rotation.y += delta * 0.02
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| R3F v8 + React 18 | R3F v9 + React 19 | 2025 | Must use v9 for React 19.2 compat |
| drei shaderMaterial (old API) | Raw THREE.ShaderMaterial or extend() | R3F v9 | extend() is the new pattern for custom elements |
| THREE.Geometry | THREE.BufferGeometry | r126 (2021) | Only BufferGeometry exists now |
| MeshProps type import | ThreeElements['mesh'] | R3F v9 | Hardcoded prop types removed |

**Deprecated/outdated:**
- `@react-three/fiber@8`: Incompatible with React 19
- drei `shaderMaterial` from drei: Still works but raw ShaderMaterial gives more control for custom GLSL
- `THREE.Geometry`: Removed in r126; use `BufferGeometry` only

## Open Questions

1. **Three.js version pinning with R3F 9.5.0**
   - What we know: R3F v9 works with Three.js r170+. STATE.md notes "Three.js r183 compatibility with R3F 9 needs verification at install time."
   - What's unclear: Exact maximum Three.js version that R3F 9.5.0 supports.
   - Recommendation: Install `three@^0.172.0` (safe known-good range) and test. Pin if issues arise.

2. **Normal recalculation strategy for displaced geometry**
   - What we know: Two approaches -- finite difference in vertex shader, or dFdx/dFdy in fragment shader.
   - What's unclear: Which performs better with this specific geometry complexity.
   - Recommendation: Start with finite difference (more correct for fresnel); optimize later if needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 |
| Config file | `playwright.config.ts` |
| Quick run command | `npx playwright test tests/r3f.spec.ts --project=chromium` |
| Full suite command | `npx playwright test --project=chromium` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-04 | Fixed R3F canvas behind DOM | e2e | `npx playwright test tests/r3f.spec.ts -g "canvas behind DOM" -x` | No -- Wave 0 |
| MONO-01 | 3D obelisk with GLSL shaders visible | e2e (visual) | `npx playwright test tests/r3f.spec.ts -g "monolith visible" -x` | No -- Wave 0 |
| MONO-02 | Scroll morph from simple to complex | e2e | `npx playwright test tests/r3f.spec.ts -g "scroll morph" -x` | No -- Wave 0 |
| MONO-03 | Imperceptible rotation | manual-only | Visual inspection -- rotation too slow for automated detection | N/A |
| MONO-04 | Amber fresnel glow intensifies | e2e (screenshot) | `npx playwright test tests/r3f.spec.ts -g "fresnel glow" -x` | No -- Wave 0 |
| MONO-05 | Final form suggests hidden geometry | manual-only | Subjective visual quality -- requires human judgment | N/A |
| MONO-06 | Cinematic warm lighting with breathing | e2e (canvas presence) | `npx playwright test tests/r3f.spec.ts -g "lighting" -x` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx playwright test tests/r3f.spec.ts --project=chromium`
- **Per wave merge:** `npx playwright test --project=chromium`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/r3f.spec.ts` -- covers FOUND-04, MONO-01, MONO-02, MONO-04, MONO-06
- [ ] Tests will verify: canvas element exists with correct z-index/positioning, WebGL context is active, scroll triggers uniform changes (via exposed debug values on window)
- [ ] Note: MONO-03 and MONO-05 are manual-only (imperceptible rotation speed and subjective "hidden geometry" quality)

## Sources

### Primary (HIGH confidence)
- [R3F Installation Docs](https://r3f.docs.pmnd.rs/getting-started/installation) - version compatibility, Next.js setup
- [R3F Performance Pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls) - useFrame patterns, re-render avoidance
- [R3F v9 Migration Guide](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide) - breaking changes, new API
- [Three.js ShaderMaterial Docs](https://threejs.org/docs/pages/ShaderMaterial.html) - uniform API, shader setup

### Secondary (MEDIUM confidence)
- [Rim Lighting Shader Tutorial](https://threejsroadmap.com/blog/rim-lighting-shader) - fresnel GLSL implementation verified against Three.js docs
- [R3F npm](https://www.npmjs.com/package/@react-three/fiber) - version 9.5.0 confirmed
- [drei npm](https://www.npmjs.com/package/@react-three/drei) - version 10.7.7 confirmed

### Tertiary (LOW confidence)
- Three.js r183 specific compatibility with R3F 9.5.0 -- needs install-time verification (flagged in STATE.md)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - R3F v9 + React 19 compatibility confirmed via official docs and npm
- Architecture: HIGH - fixed canvas behind DOM is a well-documented R3F pattern; scroll store bridge follows project's established mutable store pattern
- Pitfalls: HIGH - SSR issues, pointer events blocking, and shader uniform re-render traps are well-documented
- GLSL specifics: MEDIUM - fresnel calculation is standard; morph + normal recalculation approach needs validation during implementation

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable ecosystem, 30-day validity)
