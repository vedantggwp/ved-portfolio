"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface WebGLDistortionImageProps {
  src: string;
  alt: string;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uTime;
  
  varying vec2 vUv;
  
  void main() {
    vec2 p = vUv;
    
    // Liquid distortion effect
    float distX = sin(p.y * 10.0 + uTime) * 0.05 * uHover;
    float distY = cos(p.x * 10.0 + uTime) * 0.05 * uHover;
    
    // Mouse repel
    float dist = distance(p, uMouse);
    float force = smoothstep(0.4, 0.0, dist) * uHover;
    
    vec2 pDistorted = p + vec2(distX, distY) + force * 0.1 * (p - uMouse);
    
    // RGB split on hover
    float r = texture2D(tDiffuse, pDistorted + vec2(0.01 * uHover, 0.0)).r;
    float g = texture2D(tDiffuse, pDistorted).g;
    float b = texture2D(tDiffuse, pDistorted - vec2(0.01 * uHover, 0.0)).b;
    
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

function Scene({ src }: { src: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const texture = useTexture(src);
  
  const uniforms = useMemo(
    () => ({
      tDiffuse: { value: texture },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
    }),
    [texture]
  );
  
  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Smoothly interpolate hover state
      const targetHover = mesh.current?.userData.hovered ? 1 : 0;
      material.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.current.uniforms.uHover.value,
        targetHover,
        0.1
      );
    }
  });

  return (
    <mesh 
      ref={mesh}
      onPointerOver={() => {
        if (mesh.current) mesh.current.userData.hovered = true;
      }}
      onPointerOut={() => {
        if (mesh.current) mesh.current.userData.hovered = false;
      }}
      onPointerMove={(e) => {
        if (material.current) {
          material.current.uniforms.uMouse.value.x = e.uv?.x ?? 0.5;
          material.current.uniforms.uMouse.value.y = e.uv?.y ?? 0.5;
        }
      }}
    >
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export function WebGLDistortionImage({ src, alt }: WebGLDistortionImageProps) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} aria-label={alt}>
      <Canvas style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'auto' }}>
        <color attach="background" args={['#12121A']} />
        <Scene src={src} />
      </Canvas>
    </div>
  );
}
