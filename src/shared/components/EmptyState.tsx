import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface Props {
  icon: LucideIcon
  title: string
  children?: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon, title, children, action }: Props) {
  return (
    <div className="empty">
      <Icon icon={icon} />
      <div className="empty__title">{title}</div>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}
