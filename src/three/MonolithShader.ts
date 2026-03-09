import * as THREE from 'three'

/**
 * Monolith shader uniform definitions.
 * Returns fresh uniform objects each call to avoid shared state between instances.
 */
export function createMonolithUniforms() {
  return {
    uTime: { value: 0 },
    uMorphProgress: { value: 0 },
    uRimColor: { value: new THREE.Color(1.0, 0.6, 0.1) },
    uRimPower: { value: 3.0 },
    uRimIntensity: { value: 1.5 },
  }
}

export type MonolithUniforms = ReturnType<typeof createMonolithUniforms>

/**
 * Vertex shader: Obelisk taper, simplex noise morph displacement,
 * finite-difference normal correction, and varyings for fresnel.
 *
 * Includes Ashima simplex 3D noise (webgl-noise) embedded inline.
 */
export const monolithVertexShader = /* glsl */ `
uniform float uTime;
uniform float uMorphProgress;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;
varying vec3 vWorldPosition;

//
// Ashima simplex 3D noise - https://github.com/ashima/webgl-noise
// Copyright (C) 2011 Ashima Arts. MIT License.
//
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 10.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  // Permutations
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  float n_ = 0.142857142857; // 1.0/7.0
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
// End Ashima simplex noise

/**
 * Sample displacement noise at a given position.
 * Capped morph at 0.85 for MONO-05 (never fully resolved).
 */
float sampleDisplacement(vec3 pos, float morphProgress, float time) {
  float cappedMorph = min(morphProgress, 0.85);
  float primaryNoise = snoise(pos * 2.0 + time * 0.1);
  float primary = primaryNoise * cappedMorph * 0.3;

  // Secondary high-frequency layer: hints at hidden internal structure
  float secondary = snoise(pos * 8.0 + time * 0.05) * morphProgress * 0.05;

  return primary + secondary;
}

void main() {
  vec3 pos = position;

  // Taper top to create obelisk shape
  // pos.y ranges from -1.5 to +1.5 for boxGeometry height=3
  float heightNorm = (pos.y + 1.5) / 3.0; // 0 at bottom, 1 at top
  float taper = 1.0 - heightNorm * 0.65;   // bottom=1.0, top=0.35
  pos.xz *= taper;

  // Displacement along normal
  float disp = sampleDisplacement(pos, uMorphProgress, uTime);
  pos += normal * disp;

  // Finite-difference normal correction for displaced geometry
  float eps = 0.01;
  vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
  // Handle degenerate case when normal is parallel to up
  if (length(cross(normal, vec3(0.0, 1.0, 0.0))) < 0.001) {
    tangent = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
  }
  vec3 bitangent = normalize(cross(normal, tangent));

  // Neighboring positions for finite difference
  vec3 posT = position;
  posT.xz *= taper;
  vec3 posT_offset = posT + tangent * eps;
  float dispT = sampleDisplacement(posT_offset, uMorphProgress, uTime);
  vec3 neighborT = posT_offset + normal * dispT;

  vec3 posB = position;
  posB.xz *= taper;
  vec3 posB_offset = posB + bitangent * eps;
  float dispB = sampleDisplacement(posB_offset, uMorphProgress, uTime);
  vec3 neighborB = posB_offset + normal * dispB;

  // Corrected normal from cross product of finite-difference vectors
  vec3 correctedNormal = normalize(cross(neighborT - pos, neighborB - pos));

  // Varyings
  vNormal = normalize(normalMatrix * correctedNormal);
  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  vViewPosition = -mvPos.xyz;
  vDisplacement = disp;
  vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

  gl_Position = projectionMatrix * mvPos;
}
`

/**
 * Fragment shader: Dark base color, fresnel rim glow (amber),
 * faceting detail, and non-uniform face variation.
 */
export const monolithFragmentShader = /* glsl */ `
uniform vec3 uRimColor;
uniform float uRimPower;
uniform float uRimIntensity;
uniform float uMorphProgress;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;
varying vec3 vWorldPosition;

// Simplified hash for face variation (no need for full simplex in fragment)
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// Smooth noise from hash for low-frequency face variation
float valueNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f); // smoothstep

  float n000 = hash(i);
  float n100 = hash(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash(i + vec3(1.0, 1.0, 1.0));

  return mix(
    mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
    mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
    f.z
  );
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Fresnel rim glow -- intensifies with morph progress
  float rim = 1.0 - max(0.0, dot(normal, viewDir));
  rim = pow(rim, uRimPower) * uRimIntensity * uMorphProgress;

  // Base color: dark warm
  vec3 baseColor = vec3(0.05, 0.04, 0.03);

  // Faceting detail from displacement
  baseColor += vec3(vDisplacement * 0.5) * uMorphProgress;

  // Non-uniform face variation: low-frequency noise makes some faces
  // more displaced than others, contributing to "unseen geometry" feel
  float faceVariation = valueNoise(vWorldPosition * 1.5 + uTime * 0.02);
  baseColor += vec3(faceVariation * 0.04) * uMorphProgress;

  // Final color
  vec3 finalColor = baseColor + uRimColor * rim;

  gl_FragColor = vec4(finalColor, 1.0);
}
`
