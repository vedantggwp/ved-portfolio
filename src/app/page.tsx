import { SECTIONS } from '@/lib/sections'
import { SectionShell } from '@/components/SectionShell'

export default function Home() {
  return (
    <>
      {SECTIONS.map((section) => (
        <SectionShell key={section.id} section={section} />
      ))}
    </>
  )
}
