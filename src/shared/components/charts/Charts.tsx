import { useState, type ReactNode } from 'react'
import { useWidth } from './useWidth'

export interface Series {
  name: string
  color: string
}

const swatch = (color: string) => ({ backgroundColor: `var(${color})` })
const fill = (color: string) => ({ fill: `var(${color})` })
const stroke = (color: string) => ({ stroke: `var(${color})` })

function niceMax(value: number): number {
  if (value <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(value))
  const n = value / power
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * power
}

/** Cinco divisiones si el máximo empieza en 5 (0, 10, 20…); cuatro en los demás casos. */
function ticks(min: number, max: number) {
  const range = max - min
  const count = range / 10 ** Math.floor(Math.log10(range)) === 5 ? 5 : 4
  return Array.from({ length: count + 1 }, (_, i) => min + (range * i) / count)
}

const clip = (text: string, chars: number) => (text.length > chars ? `${text.slice(0, chars - 1)}…` : text)

const tickLabel = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(Math.abs(v) < 1 ? 2 : 1))

function Legend({ series }: { series: Series[] }) {
  if (series.length < 2) return null
  return (
    <div className="chart-legend" aria-hidden="true">
      {series.map((s) => (
        <span key={s.name}>
          <i className="chart-swatch" style={swatch(s.color)} />
          {s.name}
        </span>
      ))}
    </div>
  )
}

function DataTable({
  caption,
  heads,
  rows,
}: {
  caption: string
  heads: string[]
  rows: Array<Array<string | number>>
}) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {heads.map((h) => (
            <th key={h} scope="col">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Tooltip({ x, y, title, children }: { x: number; y: number; title: string; children: ReactNode }) {
  return (
    <div className="chart-tooltip" style={{ left: x, top: y }}>
      <strong>{title}</strong>
      {children}
    </div>
  )
}

interface BarProps {
  label: string
  data: Array<{ label: string; values: number[] }>
  series: Series[]
  stacked?: boolean
  height?: number
  unit?: string
  max?: number
  /** Etiquetas largas o numerosas se giran. */
  rotate?: boolean
}

export function BarChart({
  label,
  data,
  series,
  stacked = false,
  height = 260,
  unit = '',
  max,
  rotate = false,
}: BarProps) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const m = { top: 10, right: 10, bottom: rotate ? 72 : 28, left: rotate ? 62 : 42 }
  const w = Math.max(40, width - m.left - m.right)
  const h = height - m.top - m.bottom
  const peak = Math.max(0, ...data.map((d) => (stacked ? d.values.reduce((a, b) => a + b, 0) : Math.max(...d.values))))
  const top = max ?? niceMax(peak)
  const y = (v: number) => m.top + h - (v / top) * h
  const band = w / Math.max(1, data.length)
  const gap = Math.min(8, band * 0.2)
  const inner = band - gap
  const labelEvery = Math.max(1, Math.ceil((rotate ? 13 : 62) / band))

  return (
    <div className="chart" ref={ref} onMouseLeave={() => setHover(null)}>
      <svg width={width} height={height} role="img" aria-label={label}>
        {ticks(0, top).map((t) => (
          <g key={t}>
            <line className="chart-grid" x1={m.left} x2={m.left + w} y1={y(t)} y2={y(t)} />
            <text className="chart-text" x={m.left - 6} y={y(t) + 4} textAnchor="end">
              {tickLabel(t)}
              {unit}
            </text>
          </g>
        ))}
        <line className="chart-axis" x1={m.left} x2={m.left + w} y1={y(0)} y2={y(0)} />
        {data.map((d, i) => {
          const x0 = m.left + i * band + gap / 2
          let acc = 0
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)}>
              <rect x={m.left + i * band} y={m.top} width={band} height={h} fill="transparent" />
              {d.values.map((v, s) => {
                const barW = stacked ? inner : inner / d.values.length
                const x = stacked ? x0 : x0 + s * barW
                const base = stacked ? acc : 0
                acc += v
                return (
                  <rect
                    key={s}
                    x={x}
                    y={y(base + v)}
                    width={Math.max(1, barW - (stacked ? 0 : 1))}
                    height={Math.max(0, y(base) - y(base + v))}
                    style={fill(series[s].color)}
                  />
                )
              })}
              {i % labelEvery === 0 &&
                (rotate ? (
                  <text
                    className="chart-text"
                    textAnchor="end"
                    transform={`translate(${x0 + inner / 2 + 3} ${y(0) + 10}) rotate(-40)`}
                  >
                    {clip(d.label, 16)}
                  </text>
                ) : (
                  <text className="chart-text" x={x0 + inner / 2} y={y(0) + 16} textAnchor="middle">
                    {clip(d.label, Math.max(6, Math.floor(band / 6)))}
                  </text>
                ))}
            </g>
          )
        })}
      </svg>
      {hover !== null && data[hover] && (
        <Tooltip
          x={Math.min(width - 60, Math.max(60, m.left + hover * band + band / 2))}
          y={Math.max(56, y(stacked ? data[hover].values.reduce((a, b) => a + b, 0) : Math.max(...data[hover].values)))}
          title={data[hover].label}
        >
          {data[hover].values.map((v, s) => (
            <div key={series[s].name}>
              {series[s].name}: {v}
              {unit}
            </div>
          ))}
        </Tooltip>
      )}
      <Legend series={series} />
      <DataTable
        caption={label}
        heads={['Categoría', ...series.map((s) => s.name)]}
        rows={data.map((d) => [d.label, ...d.values.map((v) => `${v}${unit}`)])}
      />
    </div>
  )
}

interface LineProps {
  label: string
  x: number[]
  series: Array<Series & { values: number[] }>
  height?: number
  domain?: [number, number]
  format?: (v: number) => string
}

export function LineChart({ label, x, series, height = 260, domain, format = (v) => v.toFixed(3) }: LineProps) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const m = { top: 10, right: 12, bottom: 26, left: 42 }
  const w = Math.max(40, width - m.left - m.right)
  const h = height - m.top - m.bottom
  const all = series.flatMap((s) => s.values)
  const [min, max] = domain ?? [0, niceMax(Math.max(0, ...all))]
  const px = (i: number) => m.left + (x.length > 1 ? (i / (x.length - 1)) * w : w / 2)
  const py = (v: number) => m.top + h - ((v - min) / (max - min || 1)) * h
  const every = Math.max(1, Math.ceil(x.length / Math.max(2, Math.floor(w / 42))))

  const pick = (clientX: number, el: SVGSVGElement) => {
    const r = el.getBoundingClientRect()
    const ratio = (clientX - r.left - m.left) / w
    setHover(Math.max(0, Math.min(x.length - 1, Math.round(ratio * (x.length - 1)))))
  }

  return (
    <div className="chart" ref={ref} onMouseLeave={() => setHover(null)}>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={label}
        onMouseMove={(e) => pick(e.clientX, e.currentTarget)}
        onClick={(e) => pick(e.clientX, e.currentTarget)}
      >
        {ticks(min, max).map((t) => (
          <g key={t}>
            <line className="chart-grid" x1={m.left} x2={m.left + w} y1={py(t)} y2={py(t)} />
            <text className="chart-text" x={m.left - 6} y={py(t) + 4} textAnchor="end">
              {tickLabel(t)}
            </text>
          </g>
        ))}
        <line className="chart-axis" x1={m.left} x2={m.left + w} y1={py(min)} y2={py(min)} />
        {x.map(
          (v, i) =>
            i % every === 0 && (
              <text key={v} className="chart-text" x={px(i)} y={py(min) + 16} textAnchor="middle">
                {v}
              </text>
            ),
        )}
        {series.map((s) => (
          <polyline
            key={s.name}
            points={s.values.map((v, i) => `${px(i)},${py(v)}`).join(' ')}
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            style={stroke(s.color)}
          />
        ))}
        {hover !== null && (
          <>
            <line className="chart-axis" x1={px(hover)} x2={px(hover)} y1={m.top} y2={py(min)} />
            {series.map((s) => (
              <circle key={s.name} cx={px(hover)} cy={py(s.values[hover])} r={3.5} style={fill(s.color)} />
            ))}
          </>
        )}
      </svg>
      {hover !== null && (
        <Tooltip x={Math.min(width - 70, Math.max(70, px(hover)))} y={70} title={`Época ${x[hover]}`}>
          {series.map((s) => (
            <div key={s.name}>
              {s.name}: {format(s.values[hover])}
            </div>
          ))}
        </Tooltip>
      )}
      <Legend series={series} />
      <DataTable
        caption={label}
        heads={['Época', ...series.map((s) => s.name)]}
        rows={x.map((v, i) => [v, ...series.map((s) => format(s.values[i]))])}
      />
    </div>
  )
}

function arc(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const p = (r: number, a: number) => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`
  const large = a1 - a0 > Math.PI ? 1 : 0
  return `M${p(r1, a0)}A${r1} ${r1} 0 ${large} 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 ${large} 0 ${p(r0, a0)}Z`
}

export function DonutChart({ label, data }: { label: string; data: Array<Series & { value: number }> }) {
  const size = 200
  const total = data.reduce((a, d) => a + d.value, 0)
  const span = (2 * Math.PI) / Math.max(1, total)
  const pad = data.length > 1 ? 0.025 : 0
  let angle = -Math.PI / 2

  return (
    <div className="chart">
      <svg height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        {data.map((d) => {
          const a0 = angle
          angle += d.value * span
          if (d.value <= 0) return null
          const end = d.value === total ? a0 + 2 * Math.PI - 0.001 : angle - pad
          return (
            <path key={d.name} d={arc(size / 2, size / 2, 52, 88, a0, end)} style={fill(d.color)}>
              <title>{`${d.name}: ${d.value}`}</title>
            </path>
          )
        })}
      </svg>
      <div className="chart-legend" aria-hidden="true">
        {data.map((d) => (
          <span key={d.name}>
            <i className="chart-swatch" style={swatch(d.color)} />
            {d.name}: {d.value}
          </span>
        ))}
      </div>
      <DataTable caption={label} heads={['Categoría', 'Cantidad']} rows={data.map((d) => [d.name, d.value])} />
    </div>
  )
}
