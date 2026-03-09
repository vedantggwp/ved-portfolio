'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type LazySectionProps = {
  readonly children?: ReactNode
  readonly rootMargin?: string
}

/**
 * IntersectionObserver-based lazy mount wrapper for section content.
 * Mounts children when section approaches viewport (default: 2 viewports ahead).
 * NEVER unmounts once mounted -- unmounting breaks ScrollTrigger measurements.
 *
 * Usage: Wrap section children INSIDE SectionShell, not the shell itself.
 * The SectionShell with its height must always be in the DOM for ScrollTrigger.
 */
export function LazySection({
  children,
  rootMargin = '200% 0px',
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || mounted) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setMounted(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [rootMargin, mounted])

  return (
    <div ref={ref} data-lazy-mounted={mounted || undefined}>
      {mounted ? children : null}
    </div>
  )
}
