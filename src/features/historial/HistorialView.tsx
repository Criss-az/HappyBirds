import { Eye, History, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AnalysisResult } from '../../types'
import { href } from '../../app/useHashRoute'
import { Badge } from '../../shared/components/Badge'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { Icon } from '../../shared/components/Icon'
import { formatDate, pct } from '../../shared/lib/format'

export function HistorialView({ items, onDelete }: { items: AnalysisResult[]; onDelete: (id: string) => void }) {
  const [species, setSpecies] = useState('')
  const options = useMemo(() => [...new Set(items.map((i) => i.top[0].commonName))].sort(), [items])
  const active = options.includes(species) ? species : ''
  const rows = active ? items.filter((i) => i.top[0].commonName === active) : items

  return (
    <div className="section-stack">
      <Card
        title="Historial de Análisis"
        icon={History}
        subtitle={`${rows.length} de ${items.length} análisis guardados en este navegador`}
        flush
        actions={
          items.length > 0 ? (
            <select
              className="select"
              aria-label="Filtrar por especie"
              value={active}
              onChange={(e) => setSpecies(e.target.value)}
            >
              <option value="">Todas las especies</option>
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : undefined
        }
      >
        {items.length === 0 ? (
          <div className="window-body empty-state">
            Todavía no hay análisis. <a href={href('analizar')}>Identifica tu primer audio</a>.
          </div>
        ) : (
          <div className="table-wrap table-wrap--tall">
            <table className="stack-table">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Archivo</th>
                  <th scope="col">Especie</th>
                  <th scope="col">Confianza</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Fecha" className="nowrap">
                      {formatDate(r.createdAt)}
                    </td>
                    <td data-label="Archivo">{r.fileName}</td>
                    <td data-label="Especie">
                      <strong>{r.top[0].commonName}</strong>
                      <div className="italic-species small muted">{r.top[0].scientificName}</div>
                    </td>
                    <td data-label="Confianza">
                      <Badge tone={r.top[0].probability < 0.5 ? 'amber' : 'green'}>
                        {pct(r.top[0].probability, 1)}
                      </Badge>
                      {r.simulated && <div className="small subtle">Simulado</div>}
                    </td>
                    <td data-label="Acciones">
                      <div className="controls-row">
                        <a className="btn btn-icon" href={href('analizar', r.id)} aria-label={`Ver ${r.fileName}`}>
                          <Icon icon={Eye} />
                        </a>
                        <Button
                          variant="danger"
                          iconOnly
                          aria-label={`Eliminar ${r.fileName}`}
                          onClick={() => onDelete(r.id)}
                        >
                          <Icon icon={Trash2} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
