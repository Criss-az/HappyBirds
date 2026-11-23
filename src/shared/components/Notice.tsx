import { CircleAlert, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface Props {
  tone?: 'warning' | 'error'
  children: ReactNode
}

export function Notice({ tone = 'warning', children }: Props) {
  if (tone === 'error') {
    return (
      <div className="error-banner" role="alert">
        <Icon icon={CircleAlert} />
        <span>{children}</span>
      </div>
    )
  }
  return (
    <div className="notice-row" role="status">
      <Icon icon={TriangleAlert} />
      <span>{children}</span>
    </div>
  )
}
