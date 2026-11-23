import { useEffect, useRef } from 'react'
import type { SpectrogramData } from '../../types'
import { formatSeconds } from '../../shared/lib/format'
import { readRgbToken, useThemeVersion, type Rgb } from '../../shared/lib/readToken'
import { WINDOW_SEC } from './spectrogram'

const STOP_TOKENS = ['--spectro-0', '--spectro-1', '--spectro-2', '--spectro-3', '--spectro-4']

function color(stops: Rgb[], v: number): Rgb {
  const x = v * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(x))
  const f = x - i
  const a = stops[i]
  const b = stops[i + 1]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}

export function Spectrogram({ data, windowSec }: { data: SpectrogramData; windowSec: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const theme = useThemeVersion()
  // Los datos siempre cubren 5 s; con audios más cortos solo se dibujan las columnas con sonido.
  const columns = Math.max(1, Math.min(data.w, Math.round((data.w * windowSec) / WINDOW_SEC)))

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const stops = STOP_TOKENS.map(readRgbToken)
    const bin = atob(data.b64)
    const img = ctx.createImageData(columns, data.h)
    for (let y = 0; y < data.h; y++) {
      for (let x = 0; x < columns; x++) {
        const v = bin.charCodeAt(y * data.w + x) / 255
        const [r, g, b] = color(stops, v)
        const o = ((data.h - 1 - y) * columns + x) * 4
        img.data[o] = r
        img.data[o + 1] = g
        img.data[o + 2] = b
        img.data[o + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
  }, [data, columns, theme])

  return (
    <figure className="spec">
      <canvas
        ref={ref}
        width={columns}
        height={data.h}
        className="spec__canvas"
        role="img"
        aria-label="Espectrograma Mel de la ventana analizada"
      />
      <figcaption className="spec__axis">
        <span>0 s</span>
        <span>Tiempo</span>
        <span>{formatSeconds(windowSec)} s</span>
      </figcaption>
    </figure>
  )
}
