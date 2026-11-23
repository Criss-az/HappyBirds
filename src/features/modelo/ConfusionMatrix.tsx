import { Grid3x3 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ConfusionData } from '../../services/experimentos/types'
import { Badge } from '../../shared/components/Badge'
import { Card } from '../../shared/components/Card'

function background(val: number, max: number, diagonal: boolean) {
  if (val === 0) return 'var(--cm-empty)'
  const strength = Math.round(Math.min(1, (diagonal ? 0.35 : 0.32) + (diagonal ? 0.65 : 0.68) * (val / max)) * 100)
  return `color-mix(in srgb, var(${diagonal ? '--cm-hit' : '--cm-miss'}) ${strength}%, var(--cm-empty))`
}

export function ConfusionMatrix({ data }: { data: ConfusionData }) {
  const [hover, setHover] = useState<{ i: number; j: number } | null>(null)
  const [highlight, setHighlight] = useState('')
  const { labels, matrix } = data
  const max = useMemo(() => Math.max(1, ...matrix.flat()), [matrix])
  const count = hover ? matrix[hover.i][hover.j] : 0

  return (
    <Card
      title={`Matriz de Confusión (${labels.length} × ${labels.length})`}
      icon={Grid3x3}
      subtitle="Verde = aciertos en diagonal · Rojo = confusiones. Pasa el cursor o toca una celda."
      actions={
        <select
          className="select"
          aria-label="Resaltar especie"
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
        >
          <option value="">Resaltar especie: Ninguna</option>
          {labels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      }
    >
      <div className="cm-container" tabIndex={0} role="region" aria-label="Matriz de confusión, desplazable">
        <div className="cm-grid" style={{ gridTemplateColumns: `repeat(${labels.length}, 17px)` }}>
          {matrix.map((row, i) =>
            row.map((val, j) => {
              const dimmed = highlight && labels[i] !== highlight && labels[j] !== highlight
              return (
                <div
                  key={`${i}-${j}`}
                  className="cm-cell"
                  style={{ backgroundColor: background(val, max, i === j), opacity: dimmed ? 0.22 : 1 }}
                  onMouseEnter={() => setHover({ i, j })}
                  onClick={() => setHover({ i, j })}
                />
              )
            }),
          )}
        </div>
      </div>
      <div className="cm-tooltip" aria-live="polite">
        {hover ? (
          <>
            <Badge tone={hover.i === hover.j ? 'green' : count > 0 ? 'danger' : 'neutral'}>Conteo: {count}</Badge>
            <span>
              Real: <strong className="italic-species">{labels[hover.i]}</strong> → Predicha:{' '}
              <strong className="italic-species">{labels[hover.j]}</strong>
            </span>
          </>
        ) : (
          <span className="subtle">Inspecciona una celda para ver la especie real y la predicha.</span>
        )}
      </div>
    </Card>
  )
}
