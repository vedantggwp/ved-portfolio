'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, ShaderMaterial } from 'three'
import {
  createMonolithUniforms,
  monolithVertexShader,
  monolithFragmentShader,
} from './MonolithShader'
import { scrollStore } from '@/lib/scroll-store'

/**
 * GLSL Monolith -- procedurally morphing obelisk with scroll-driven displacement,
 * amber fresnel glow, and imperceptible Y-axis rotation.
 *
 * Reads scrollStore.progress directly in useFrame (no React state, no re-renders).
 */
export function Monolith() {
  const meshRef = useRef<Mesh>(null!)
  const materialRef = useRef<ShaderMaterial>(null!)
  const uniformsRef = useRef(createMonolithUniforms())

  // Expose debug info for testing (dev only, tree-shaken in production builds)
  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__monolithDebug = {
      getMorphProgress: () =>
        materialRef.current?.uniforms.uMorphProgress.value ?? 0,
    }
    return () => {
      delete (window as unknown as Record<string, unknown>).__monolithDebug
    }
  }, [])

  useFrame(({ clock }, delta) => {
    const mat = materialRef.current
    const mesh = meshRef.current
    if (!mat || !mesh) return

    // Time for subtle animation
    mat.uniforms.uTime.value = clock.elapsedTime

    // Scroll progress drives morph (0 at surface, 1 at floor)
    mat.uniforms.uMorphProgress.value = scrollStore.progress

    // Imperceptible rotation (~1 degree per 3 seconds)
    mesh.rotation.y += delta * 0.02
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 3, 1, 32, 64, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={monolithVertexShader}
        fragmentShader={monolithFragmentShader}
        uniforms={uniformsRef.current}
      />
    </mesh>
  )
}
