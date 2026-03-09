import { SECTIONS } from '@/lib/sections'
import { SectionShell } from '@/components/SectionShell'
import { LazySection } from '@/components/LazySection'

export default function Home() {
  return (
    <>
      {SECTIONS.map((section) => (
        <SectionShell key={section.id} section={section}>
          {section.id === 'surface' ? null : <LazySection />}
        </SectionShell>
      ))}
    </>
  )
}
