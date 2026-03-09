import type { Section } from '@/lib/sections'
import { VisuallyHidden } from '@/components/VisuallyHidden'

type SectionShellProps = {
  readonly section: Section
}

const SKIP_LINK_TARGETS = new Set(['projects', 'contact'])

export function SectionShell({ section }: SectionShellProps) {
  const isPresentation = section.role === 'presentation'
  const isSkipTarget = SKIP_LINK_TARGETS.has(section.id)

  // Only add explicit role when it differs from the implicit <section> role.
  // <section> with aria-label implicitly has role="region", so we skip that.
  // banner, contentinfo, and presentation are non-implicit and need explicit role.
  const needsExplicitRole = section.role !== 'region'

  return (
    <section
      id={section.id}
      role={needsExplicitRole ? section.role : undefined}
      aria-label={!isPresentation ? section.label : undefined}
      tabIndex={isSkipTarget ? -1 : undefined}
      style={{ minHeight: 'var(--section-min-height)' }}
    >
      {section.heading !== null && (
        <VisuallyHidden as="h2">{section.heading}</VisuallyHidden>
      )}
    </section>
  )
}
