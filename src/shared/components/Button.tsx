import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../lib/cx'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'neutral' | 'danger'
  iconOnly?: boolean
}

export function Button({ variant = 'default', iconOnly = false, className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={cx('btn', variant !== 'default' && `btn-${variant}`, iconOnly && 'btn-icon', className)}
      {...rest}
    />
  )
}
