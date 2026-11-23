import { useEffect, useRef } from 'react'
import type { SpectrogramData } from '../types'

const STOPS: [number, number, number][] = [
  [18, 6, 28],
  [74, 20, 112],
  [194, 24, 91],
  [255, 90, 138],
  [255, 208, 138],
]

function color(v: number): [number, number, number] {
  const x = v * (STOPS.length - 1)
  const i = Math.min(STOPS.length - 2, Math.floor(x))
  const f = x - i
  const a = STOPS[i]
  const b = STOPS[i + 1]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}

export function Spectrogram({ data, windowSec }: { data: SpectrogramData; windowSec: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const bin = atob(data.b64)
    const img = ctx.createImageData(data.w, data.h)
    for (let y = 0; y < data.h; y++) {
      for (let x = 0; x < data.w; x++) {
        const v = bin.charCodeAt(y * data.w + x) / 255
        const [r, g, b] = color(v)
        const o = ((data.h - 1 - y) * data.w + x) * 4
        img.data[o] = r
        img.data[o + 1] = g
        img.data[o + 2] = b
        img.data[o + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
  }, [data])

  return (
    <figure className="spec">
      <canvas ref={ref} width={data.w} height={data.h} className="spec__canvas" role="img" aria-label="Espectrograma Mel de la ventana analizada" />
      <figcaption className="spec__axis">
        <span>0 s</span>
        <span>Tiempo</span>
        <span>{windowSec.toFixed(0)} s</span>
      </figcaption>
    </figure>
  )
}
