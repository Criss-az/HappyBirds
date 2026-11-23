import type { ReactNode } from 'react'

interface Props {
  tone?: 'warning' | 'error'
  children: ReactNode
}

export function Notice({ tone = 'warning', children }: Props) {
  if (tone === 'error') {
    return (
      <p className="error" role="alert">
        {children}
      </p>
    )
  }
  return <p className="notice">{children}</p>
}
