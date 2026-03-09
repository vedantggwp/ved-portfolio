'use client'

import { CinematicLighting } from './CinematicLighting'

export function MonolithScene() {
  return (
    <>
      <CinematicLighting />
      {/* Placeholder monolith -- will be replaced by GLSL shader in Plan 02 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="#0a0908" roughness={0.8} />
      </mesh>
    </>
  )
}
