import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface Props {
  title: ReactNode
  subtitle?: ReactNode
  icon?: LucideIcon
  iconTone?: 'accent' | 'warning'
  actions?: ReactNode
  /** Sin padding, para tablas que ocupan todo el ancho. */
  flush?: boolean
  children: ReactNode
}

/** Ventana clásica con barra de título. */
export function Card({ title, subtitle, icon, iconTone = 'accent', actions, flush = false, children }: Props) {
  return (
    <section className="window-card">
      <div className="window-bar">
        <div>
          <h3 className="window-title">
            {icon && <Icon icon={icon} className={`icon-${iconTone}`} />}
            {title}
          </h3>
          {subtitle && <p className="window-subtitle">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {flush ? children : <div className="window-body">{children}</div>}
    </section>
  )
}
