import { Check, ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../lib/cx'
import { Icon } from './Icon'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  ariaLabel: string
  id?: string
  placeholder?: string
  disabled?: boolean
  block?: boolean
  align?: 'start' | 'end'
  className?: string
}

interface Position {
  left: number
  minWidth: number
  maxHeight: number
  top?: number
  bottom?: number
}

/** Lista desplegable propia (patrón combobox de solo selección): teclado, lectores de pantalla y táctil. */
export function Select({
  value,
  onChange,
  options,
  ariaLabel,
  id,
  placeholder = 'Elegir…',
  disabled = false,
  block = false,
  align = 'start',
  className,
}: Props) {
  const uid = useId()
  const listId = `${uid}-lista`
  const button = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const typed = useRef({ text: '', timer: 0 })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState<Position | null>(null)

  const selected = options.findIndex((o) => o.value === value)
  const current = options[selected]

  const place = useCallback(() => {
    const el = button.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const below = window.innerHeight - r.bottom - 12
    const above = r.top - 12
    const flip = below < 200 && above > below
    const base = { left: r.left, minWidth: r.width, maxHeight: Math.max(120, Math.min(320, flip ? above : below)) }
    setPos(flip ? { ...base, bottom: window.innerHeight - r.top + 4 } : { ...base, top: r.bottom + 4 })
  }, [])

  // Con el menú ya medido, evita que se salga por los costados de la pantalla.
  useLayoutEffect(() => {
    const el = list.current
    const el2 = button.current
    if (!open || !el || !el2) return
    const r = el2.getBoundingClientRect()
    const width = el.offsetWidth
    const wanted = align === 'end' ? r.right - width : r.left
    const left = Math.max(8, Math.min(wanted, window.innerWidth - width - 8))
    if (Math.abs(left - (pos?.left ?? left)) > 0.5) setPos((p) => (p ? { ...p, left } : p))
  }, [open, align, pos])

  useEffect(() => {
    if (!open) return
    place()
    const close = (e: PointerEvent) => {
      const t = e.target as Node
      if (!button.current?.contains(t) && !list.current?.contains(t)) setOpen(false)
    }
    const onScroll = (e: Event) => {
      if (!list.current?.contains(e.target as Node)) place()
    }
    document.addEventListener('pointerdown', close)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', close)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, place])

  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [open, active, pos])

  useEffect(() => {
    const t = typed.current
    return () => window.clearTimeout(t.timer)
  }, [])

  const show = () => {
    place()
    setActive(Math.max(0, selected))
    setOpen(true)
  }
  const choose = (i: number) => {
    const o = options[i]
    if (o) onChange(o.value)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        show()
      }
      return
    }
    const last = options.length - 1
    const move = (i: number) => {
      e.preventDefault()
      setActive(Math.max(0, Math.min(last, i)))
    }
    switch (e.key) {
      case 'ArrowDown':
        return move(active + 1)
      case 'ArrowUp':
        return move(active - 1)
      case 'Home':
        return move(0)
      case 'End':
        return move(last)
      case 'Enter':
      case ' ':
        e.preventDefault()
        return choose(active)
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        return setOpen(false)
      case 'Tab':
        return setOpen(false)
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          const t = typed.current
          window.clearTimeout(t.timer)
          t.text += e.key.toLowerCase()
          t.timer = window.setTimeout(() => (t.text = ''), 600)
          const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(t.text))
          if (hit >= 0) setActive(hit)
        }
    }
  }

  return (
    <div className={cx('field', block && 'field--block', className)}>
      <button
        ref={button}
        id={id}
        type="button"
        role="combobox"
        className="select-btn"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${uid}-o${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
      >
        <span className={cx('select-value', !current && 'select-value--empty')}>{current?.label ?? placeholder}</span>
        <Icon icon={ChevronDown} className="select-chevron" />
      </button>
      {open &&
        pos &&
        createPortal(
          <ul
            ref={list}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className="select-popup"
            style={pos}
            onMouseDown={(e) => e.preventDefault()}
          >
            {options.map((o, i) => (
              <li
                key={o.value}
                id={`${uid}-o${i}`}
                role="option"
                className="select-option"
                aria-selected={i === selected}
                data-active={i === active}
                onMouseMove={() => active !== i && setActive(i)}
                onClick={() => choose(i)}
              >
                <span>{o.label}</span>
                {i === selected && <Icon icon={Check} />}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  )
}
