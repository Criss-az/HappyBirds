import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../lib/cx'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  block?: boolean
}

export function Button({ variant = 'primary', block = false, className, type = 'button', ...rest }: Props) {
  return <button type={type} className={cx('btn', `btn--${variant}`, block && 'btn--block', className)} {...rest} />
}
