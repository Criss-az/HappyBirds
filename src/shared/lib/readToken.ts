import { useSyncExternalStore } from 'react'

export type Rgb = [number, number, number]

/** Lee el valor actual de un token CSS. Sirve para canvas y otros lugares sin acceso a var(). */
export function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

let probe: CanvasRenderingContext2D | null = null

/** Convierte un token de color a RGB usando el propio navegador, sin importar su formato. */
export function readRgbToken(name: string): Rgb {
  probe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!probe) return [0, 0, 0]
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = readToken(name)
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

let version = 0
const listeners = new Set<() => void>()
let observer: MutationObserver | null = null

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!observer) {
    observer = new MutationObserver(() => {
      version++
      listeners.forEach((l) => l())
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      observer?.disconnect()
      observer = null
    }
  }
}

/** Cambia cada vez que cambia el tema, para volver a dibujar lo que depende de readToken. */
export function useThemeVersion(): number {
  return useSyncExternalStore(subscribe, () => version)
}
