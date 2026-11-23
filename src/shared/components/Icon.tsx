import type { LucideIcon } from 'lucide-react'
import { cx } from '../lib/cx'

interface Props {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg' | 'tile'
  className?: string
}

/** Icono decorativo de Lucide. Tamaño y grosor salen de tokens; el color, de currentColor. */
export function Icon({ icon: Glyph, size = 'sm', className }: Props) {
  return <Glyph className={cx('icon', `icon--${size}`, className)} aria-hidden="true" />
}
