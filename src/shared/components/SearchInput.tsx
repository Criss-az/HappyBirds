import { Search, X } from 'lucide-react'
import { cx } from '../lib/cx'
import { Icon } from './Icon'

interface Props {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, ariaLabel, placeholder = 'Buscar…', className }: Props) {
  return (
    <div className={cx('search', className)}>
      <Icon icon={Search} />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="search__clear" aria-label="Borrar búsqueda" onClick={() => onChange('')}>
          <Icon icon={X} />
        </button>
      )}
    </div>
  )
}
