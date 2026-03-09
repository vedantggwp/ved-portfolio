import type { ReactNode, ElementType } from 'react'

type VisuallyHiddenProps = {
  readonly children: ReactNode
  readonly as?: ElementType
}

export function VisuallyHidden({ children, as: Tag = 'span' }: VisuallyHiddenProps) {
  return <Tag className="visually-hidden">{children}</Tag>
}
