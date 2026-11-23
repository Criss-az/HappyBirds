import type { HTMLAttributes } from 'react'
import { cx } from '../lib/cx'

/** Contenedor neutro: borde, fondo de superficie, radio y padding por tokens. */
export function Card({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={cx('card', className)} {...rest} />
}
