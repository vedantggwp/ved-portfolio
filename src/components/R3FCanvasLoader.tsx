'use client'

import dynamic from 'next/dynamic'

const R3FCanvas = dynamic(
  () => import('./R3FCanvas').then((m) => m.R3FCanvas),
  { ssr: false }
)

export function R3FCanvasLoader() {
  return <R3FCanvas />
}
