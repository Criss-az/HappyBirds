import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ExperimentData, Recording } from '../../services/experimentos/types'
import { Badge } from '../../shared/components/Badge'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { EmptyState } from '../../shared/components/EmptyState'
import { Icon } from '../../shared/components/Icon'
import { SearchInput } from '../../shared/components/SearchInput'
import { Select } from '../../shared/components/Select'

const PAGE = 25
const SPLIT_LABEL: Record<string, string> = { train: 'Entrenamiento', val: 'Validación', test: 'Prueba' }

export function RecordingsTable({ data }: { data: ExperimentData }) {
  const [rows, setRows] = useState<Recording[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [split, setSplit] = useState('')
  const [quality, setQuality] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    let active = true
    setRows(null)
    setFailed(false)
    data
      .loadRecordings()
      .then((r) => active && setRows(r))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [data])

  const splits = useMemo(() => [...new Set((rows ?? []).flatMap((r) => r.split || []))].sort(), [rows])
  const qualities = useMemo(() => [...new Set((rows ?? []).flatMap((r) => r.quality || []))].sort(), [rows])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (rows ?? []).filter(
      (r) =>
        (!split || r.split === split) &&
        (!quality || r.quality === quality) &&
        (!q || `${r.id} ${r.species} ${r.vocalization ?? ''}`.toLowerCase().includes(q)),
    )
  }, [rows, query, split, quality])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const current = Math.min(page, pages - 1)
  const visible = filtered.slice(current * PAGE, (current + 1) * PAGE)
  const reset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v)
      setPage(0)
    }

  if (failed) return <div className="error-banner">No se pudo leer el CSV de grabaciones.</div>
  if (rows === null) return <div className="empty-state">Cargando grabaciones del CSV…</div>
  if (rows.length === 0) return null

  return (
    <Card
      title="Grabaciones del Dataset"
      subtitle={`${filtered.length.toLocaleString('es-BO')} de ${rows.length.toLocaleString('es-BO')} filas del CSV`}
      flush
      actions={
        <div className="controls-row">
          <SearchInput
            ariaLabel="Buscar por ID, especie o tipo"
            placeholder="Buscar ID, especie o tipo…"
            value={query}
            onChange={reset(setQuery)}
          />
          {splits.length > 0 && (
            <Select
              ariaLabel="Filtrar por partición"
              value={split}
              onChange={reset(setSplit)}
              options={[
                { value: '', label: 'Todas las particiones' },
                ...splits.map((v) => ({ value: v, label: SPLIT_LABEL[v] ?? v })),
              ]}
            />
          )}
          {qualities.length > 0 && (
            <Select
              ariaLabel="Filtrar por calidad"
              value={quality}
              onChange={reset(setQuality)}
              options={[
                { value: '', label: 'Todas las calidades' },
                ...qualities.map((v) => ({ value: v, label: `Calidad ${v}` })),
              ]}
            />
          )}
        </div>
      }
    >
      {filtered.length === 0 ? (
        <EmptyState icon={SearchX} title="Sin resultados">
          Ninguna grabación coincide con estos filtros. Prueba quitar alguno.
        </EmptyState>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Especie</th>
                  <th scope="col">Calidad</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Duración</th>
                  <th scope="col">Partición</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    <td className="nowrap">XC{r.id}</td>
                    <td className="italic-species">{r.species}</td>
                    <td>
                      {r.quality ? (
                        <Badge tone={r.quality === 'A' ? 'green' : r.quality === 'B' ? 'neutral' : 'amber'}>
                          {r.quality}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{r.vocalization || '—'}</td>
                    <td className="nowrap">{r.durationSec !== undefined ? `${r.durationSec} s` : '—'}</td>
                    <td>{r.split ? (SPLIT_LABEL[r.split] ?? r.split) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>
              Página {current + 1} de {pages}
            </span>
            <div className="controls-row">
              <Button variant="neutral" disabled={current === 0} onClick={() => setPage(current - 1)}>
                <Icon icon={ChevronLeft} /> Anterior
              </Button>
              <Button variant="neutral" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
                Siguiente <Icon icon={ChevronRight} />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
