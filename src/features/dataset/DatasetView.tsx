import { CircleCheck, Clock, FileAudio, Layers, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useExperiments } from '../../services/experimentos/useExperiments'
import { Badge } from '../../shared/components/Badge'
import { Card } from '../../shared/components/Card'
import { BarChart, DonutChart, type Series } from '../../shared/components/charts/Charts'
import { Icon } from '../../shared/components/Icon'
import { Kpi } from '../../shared/components/Kpi'
import { Notice } from '../../shared/components/Notice'
import { ExperimentBar } from '../modelo/ExperimentBar'
import { RecordingsTable } from './RecordingsTable'

const QUALITY: Record<string, string> = { A: '--chart-quality-a', B: '--chart-quality-b', C: '--chart-quality-c' }
const STACK: Series[] = [
  { name: 'Calidad A', color: '--chart-quality-a' },
  { name: 'Calidad B', color: '--chart-quality-b' },
  { name: 'Calidad C', color: '--chart-quality-c' },
]
const SPLITS: Series[] = [
  { name: 'Entrenamiento', color: '--chart-quality-a' },
  { name: 'Validación', color: '--chart-quality-b' },
  { name: 'Prueba', color: '--chart-quality-c' },
]

export function DatasetView() {
  const { data, loading, error, selected } = useExperiments()
  const [filter, setFilter] = useState('')
  const dataset = data?.dataset ?? null

  const species = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const rows = dataset?.species ?? []
    return q ? rows.filter((r) => r.species.toLowerCase().includes(q)) : rows
  }, [dataset, filter])

  if (loading) return <div className="empty-state">Cargando estadísticas del dataset…</div>
  if (error) return <Notice tone="error">No se pudo cargar el dataset: {error}</Notice>
  if (!selected) {
    return <div className="empty-state">Aún no hay Colabs registrados en modelo/artefactos.</div>
  }

  const hasQuality = Boolean(dataset?.species.some((s) => s.qualityA !== undefined))
  const hasSplits = Boolean(dataset?.species.some((s) => s.train !== undefined))
  const voc = Object.entries(dataset?.vocalization ?? {})
  const q = dataset?.quality

  return (
    <div className="section-stack">
      <ExperimentBar />
      {!dataset || !data ? (
        <div className="empty-state">Este Colab todavía no exportó un resumen del dataset.</div>
      ) : (
        <>
          {dataset.audit && (
            <div className="audit-banner">
              <div>
                <strong className="window-title">
                  <Icon icon={CircleCheck} className="icon-accent" />
                  Depuración: {dataset.audit.rawRows.toLocaleString('es-BO')} registros crudos → {dataset.total}{' '}
                  grabaciones válidas ({dataset.numSpecies} especies)
                </strong>
                {dataset.audit.sourceFile && (
                  <div className="small muted">
                    Archivo generado: <code>{dataset.audit.sourceFile}</code>
                  </div>
                )}
              </div>
              <div className="pill-list">
                {dataset.audit.excluded.map((e) => (
                  <Badge key={e.label} tone="amber">
                    {e.label}: {e.count}
                  </Badge>
                ))}
                {dataset.formats && (
                  <Badge tone="green">
                    {Object.entries(dataset.formats)
                      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                      .join(' · ')}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="kpi-grid">
            <Kpi
              label="Grabaciones"
              value={dataset.total.toLocaleString('es-BO')}
              icon={FileAudio}
              sub="Registros válidos"
            />
            <Kpi label="Especies" value={dataset.numSpecies} icon={Layers} sub="Clases supervisadas" />
            {q && (
              <Kpi
                label="Calidad A / B / C"
                value={`${q.A ?? 0} / ${q.B ?? 0} / ${q.C ?? 0}`}
                icon={CircleCheck}
                sub="Etiquetas de Xeno-canto"
              />
            )}
            {dataset.duration && (
              <Kpi
                label="Mediana de Duración"
                value={`${dataset.duration.medianSec} s`}
                icon={Clock}
                sub={`Rango: ${dataset.duration.minSec}s – ${dataset.duration.maxSec}s (${dataset.duration.totalHours} h)`}
              />
            )}
          </div>

          {(q || voc.length > 0) && (
            <div className="grid-2">
              {q && (
                <Card title="Distribución por Calidad" subtitle="A (alta), B (intermedia) y C (mayor ruido ambiental)">
                  <DonutChart
                    label="Grabaciones por calidad"
                    data={Object.entries(q).map(([k, value]) => ({
                      name: `Calidad ${k}`,
                      value,
                      color: QUALITY[k] ?? '--chart-secondary',
                    }))}
                  />
                </Card>
              )}
              {voc.length > 0 && (
                <Card title="Tipos de Vocalización" subtitle="Tipos registrados en el CSV">
                  <BarChart
                    label="Grabaciones por tipo de vocalización"
                    data={voc.map(([label, value]) => ({ label, values: [value] }))}
                    series={[{ name: 'Grabaciones', color: '--chart-primary' }]}
                    rotate={voc.length > 5}
                  />
                </Card>
              )}
            </div>
          )}

          <div className={dataset.histogram ? 'grid-2' : undefined}>
            {dataset.histogram && (
              <Card title="Distribución de Duraciones" subtitle="Audios por rango de duración">
                <BarChart
                  label="Audios por rango de duración"
                  data={dataset.histogram.map((h) => ({ label: h.range, values: [h.count] }))}
                  series={[{ name: 'Audios', color: '--chart-primary' }]}
                  rotate
                />
              </Card>
            )}
            <Card
              title={hasQuality ? 'Muestras por Especie (Calidad Apilada)' : 'Muestras por Especie'}
              subtitle={`${species.length} de ${dataset.species.length} especies`}
              actions={
                <div className="controls-row">
                  <Icon icon={Search} className="subtle" />
                  <input
                    className="input"
                    aria-label="Filtrar especie"
                    placeholder="Filtrar especie…"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
              }
            >
              {species.length === 0 ? (
                <div className="empty-state">Ninguna especie coincide con el filtro.</div>
              ) : (
                <BarChart
                  label="Grabaciones por especie"
                  stacked={hasQuality || hasSplits}
                  rotate
                  data={species.map((s) => ({
                    label: s.species,
                    values: hasQuality
                      ? [s.qualityA ?? 0, s.qualityB ?? 0, s.qualityC ?? 0]
                      : hasSplits
                        ? [s.train ?? 0, s.validation ?? 0, s.test ?? 0]
                        : [s.total],
                  }))}
                  series={hasQuality ? STACK : hasSplits ? SPLITS : [{ name: 'Grabaciones', color: '--chart-primary' }]}
                />
              )}
            </Card>
          </div>

          <Card
            title={`Catálogo de las ${dataset.numSpecies} Especies`}
            subtitle={`Mostrando ${species.length} especies`}
            flush
          >
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Especie</th>
                    <th scope="col">Total</th>
                    {hasQuality && (
                      <>
                        <th scope="col">Calidad A</th>
                        <th scope="col">Calidad B</th>
                        <th scope="col">Calidad C</th>
                        <th scope="col">Duración Media (s)</th>
                        <th scope="col">Duración Mediana (s)</th>
                      </>
                    )}
                    {hasSplits && (
                      <>
                        <th scope="col">Entrenamiento</th>
                        <th scope="col">Validación</th>
                        <th scope="col">Prueba</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {species.map((r, i) => (
                    <tr key={r.species}>
                      <td>{i + 1}</td>
                      <td className="italic-species">{r.species}</td>
                      <td>
                        <strong>{r.total}</strong>
                      </td>
                      {hasQuality && (
                        <>
                          <td>{r.qualityA}</td>
                          <td>{r.qualityB}</td>
                          <td>{r.qualityC}</td>
                          <td>{r.avgDurationSec}</td>
                          <td>{r.medianDurationSec}</td>
                        </>
                      )}
                      {hasSplits && (
                        <>
                          <td>{r.train}</td>
                          <td>{r.validation}</td>
                          <td>{r.test}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <RecordingsTable data={data} />
        </>
      )}
    </div>
  )
}
