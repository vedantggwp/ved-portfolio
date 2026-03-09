export type Section = {
  readonly id: string
  readonly label: string
  readonly role: string
  readonly heading: string | null
}

export const SECTIONS: readonly Section[] = [
  { id: 'surface', label: 'Surface', role: 'banner', heading: 'Introduction' },
  { id: 'transition-1', label: 'Transition', role: 'presentation', heading: null },
  { id: 'pocket-1', label: 'Strategy', role: 'region', heading: 'Copy to Strategy to Tech' },
  { id: 'pocket-2', label: 'Accessibility', role: 'region', heading: 'Accessibility Meets Neuromarketing' },
  { id: 'pocket-3', label: 'Depth', role: 'region', heading: 'Speed as Symptom of Deep Thinking' },
  { id: 'transition-2', label: 'Transition', role: 'presentation', heading: null },
  { id: 'projects', label: 'Projects', role: 'region', heading: 'Projects' },
  { id: 'contact', label: 'Contact', role: 'contentinfo', heading: 'Contact' },
] as const
