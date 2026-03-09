'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { PointLight } from 'three'

export function CinematicLighting() {
  const lightRef = useRef<PointLight>(null)

  useFrame(({ clock }) => {
    if (!lightRef.current) return
    const time = clock.elapsedTime
    // Sinusoidal breathing: oscillates intensity between 0.8 and 1.2
    lightRef.current.intensity = Math.sin(time * 0.5) * 0.2 + 1.0
  })

  return (
    <>
      <pointLight
        ref={lightRef}
        position={[3, 5, 4]}
        color="#ffaa44"
        intensity={1.0}
        distance={20}
        decay={2}
      />
      <ambientLight intensity={0.05} color="#1a1510" />
    </>
  )
}
