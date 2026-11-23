import type { LucideIcon } from 'lucide-react'
import { Icon } from './Icon'

interface Option<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
}

interface Props<T extends string> {
  value: T
  onChange: (value: T) => void
  options: Array<Option<T>>
  ariaLabel: string
}

export function Segmented<T extends string>({ value, onChange, options, ariaLabel }: Props<T>) {
  return (
    <div className="segmented" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.icon && <Icon icon={o.icon} />}
          {o.label}
        </button>
      ))}
    </div>
  )
}
