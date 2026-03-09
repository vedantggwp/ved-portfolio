'use client'

import { Canvas } from '@react-three/fiber'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { MonolithScene } from '@/three/MonolithScene'

export function R3FCanvas() {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return null
  }

  return (
    <div
      data-r3f-canvas
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        style={{ pointerEvents: 'none' }}
      >
        <MonolithScene />
      </Canvas>
    </div>
  )
}
