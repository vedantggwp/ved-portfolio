"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform vec3 uColorVoid;
  uniform vec3 uColorWex;
  uniform vec3 uColorQuas;
  
  varying vec2 vUv;
  
  // Noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                       -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 p = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 pAspect = vec2(p.x * aspect, p.y);
    vec2 mAspect = vec2(uMouse.x * aspect, uMouse.y);
    
    // Distance to mouse
    float dist = distance(pAspect, mAspect);
    
    // Base slow-moving noise floor
    float n1 = snoise(p * 3.0 + uTime * 0.08);
    
    // Ripple effect tied to mouse
    float rippleRadius = 0.5;
    float rippleWidth = 0.05;
    float force = smoothstep(rippleRadius, rippleRadius - rippleWidth, dist) * 
                  smoothstep(0.0, rippleWidth * 2.0, dist);
    
    // Combine noise and force
    float noise = snoise(p * 4.0 - vec2(0.0, uTime * 0.15) + force * 2.0);
    noise = noise * 0.5 + 0.5;
    
    // Secondary noise layer for color variation
    float noise2 = snoise(p * 2.0 + vec2(uTime * 0.05, 0.0));
    noise2 = noise2 * 0.5 + 0.5;
    
    // Color mixing — void base with subtle wex and quas energy wisps
    vec3 color = uColorVoid;
    color = mix(color, uColorWex, noise * (0.03 + force * 0.15));
    color = mix(color, uColorQuas, noise2 * (0.02 + force * 0.08));
    
    // Vignette — darken edges
    float vignette = length(p - 0.5);
    color = mix(color, uColorVoid * 0.5, vignette * 0.6);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

function FluidPlane() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uColorVoid: { value: new THREE.Color("#0A0A0F") },
      uColorWex: { value: new THREE.Color("#9B6DFF") },
      uColorQuas: { value: new THREE.Color("#4A9EBF") },
    }),
    [size]
  );
  
  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      const mx = (state.pointer.x + 1) / 2;
      const my = (state.pointer.y + 1) / 2;
      
      material.current.uniforms.uMouse.value.x = THREE.MathUtils.lerp(
        material.current.uniforms.uMouse.value.x,
        mx,
        0.05
      );
      material.current.uniforms.uMouse.value.y = THREE.MathUtils.lerp(
        material.current.uniforms.uMouse.value.y,
        my,
        0.05
      );
    }
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
}

export function WebGLFluidCursor() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: -1,
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    >
      {mounted && (
        <Canvas
          camera={{ position: [0, 0, 1] }}
          gl={{ alpha: true, antialias: false }}
          eventSource={document.body}
          eventPrefix="client"
        >
          <FluidPlane />
        </Canvas>
      )}
    </div>
  );
}
