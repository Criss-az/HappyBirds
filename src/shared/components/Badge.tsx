import type { ReactNode } from 'react'

interface Props {
  tone?: 'neutral' | 'green' | 'amber' | 'danger'
  children: ReactNode
}

export function Badge({ tone = 'neutral', children }: Props) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
