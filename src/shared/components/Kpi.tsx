import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function Kpi({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon: LucideIcon
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">
        <span>{label}</span>
        <Icon icon={icon} className="icon-accent" />
      </div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  )
}
