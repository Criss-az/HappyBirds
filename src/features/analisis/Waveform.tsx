import { useEffect, useRef } from 'react'
import { useWidth } from '../../shared/components/charts/useWidth'
import { readToken, useThemeVersion } from '../../shared/lib/readToken'

const HEIGHT = 64

/** Dibuja los picos guardados en el resultado. */
export function Waveform({ peaks }: { peaks: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [box, width] = useWidth<HTMLDivElement>()
  const theme = useThemeVersion()

  useEffect(() => {
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const ratio = window.devicePixelRatio || 1
    c.width = Math.round(width * ratio)
    c.height = Math.round(HEIGHT * ratio)
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.clearRect(0, 0, width, HEIGHT)
    const bin = atob(peaks)
    const mid = HEIGHT / 2
    ctx.fillStyle = readToken('--chart-grid')
    ctx.fillRect(0, mid, width, 1)
    ctx.fillStyle = readToken('--chart-primary')
    const bars = Math.min(bin.length, Math.floor(width / 3))
    const step = width / Math.max(1, bars)
    for (let i = 0; i < bars; i++) {
      const from = Math.floor((i * bin.length) / bars)
      const to = Math.max(from + 1, Math.floor(((i + 1) * bin.length) / bars))
      let peak = 0
      for (let k = from; k < to; k++) peak = Math.max(peak, bin.charCodeAt(k))
      const amp = Math.max(0.03, peak / 255)
      const h = amp * (HEIGHT - 6)
      ctx.globalAlpha = 0.45 + 0.55 * amp
      ctx.fillRect(i * step, mid - h / 2, Math.max(1.5, step - 1), h)
    }
    ctx.globalAlpha = 1
  }, [peaks, width, theme])

  return (
    <div className="waveform-box">
      <div className="spec-caption">
        <span>Forma de onda</span>
        <span>Audio completo</span>
      </div>
      <div ref={box}>
        <canvas
          ref={canvas}
          className="waveform-canvas"
          style={{ height: HEIGHT }}
          role="img"
          aria-label="Forma de onda del audio analizado"
        />
      </div>
    </div>
  )
}
