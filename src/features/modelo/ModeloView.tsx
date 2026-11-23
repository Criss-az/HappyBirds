import { Award, Cpu, TrendingUp, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { SpeciesReport } from '../../services/experimentos/types'
import { useExperiments } from '../../services/experimentos/useExperiments'
import { Badge } from '../../shared/components/Badge'
import { Card } from '../../shared/components/Card'
import { BarChart, LineChart } from '../../shared/components/charts/Charts'
import { Kpi } from '../../shared/components/Kpi'
import { Notice } from '../../shared/components/Notice'
import { ExperimentBar } from './ExperimentBar'
import { ConfusionMatrix } from './ConfusionMatrix'

type SortKey = keyof SpeciesReport
const HEADS: Array<[SortKey, string]> = [
  ['species', 'Especie'],
  ['precision', 'Precision'],
  ['recall', 'Recall'],
  ['f1', 'F1-Score'],
  ['support', 'Soporte'],
]
const p = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`

export function ModeloView() {
  const { data, loading, error, selected } = useExperiments()
  const [sort, setSort] = useState<SortKey>('f1')
  const [asc, setAsc] = useState(true)

  const report = useMemo(() => {
    const rows = [...(data?.perSpecies ?? [])]
    rows.sort((a, b) => {
      const d = sort === 'species' ? a.species.localeCompare(b.species) : a[sort] - b[sort]
      return asc ? d : -d
    })
    return rows
  }, [data, sort, asc])

  if (loading) return <div className="empty-state">Cargando métricas del modelo…</div>
  if (error) return <Notice tone="error">No se pudieron cargar las métricas: {error}</Notice>
  if (!selected) return <div className="empty-state">Aún no hay Colabs registrados en modelo/artefactos.</div>

  const m = data?.metrics
  const history = data?.history ?? []
  const toggle = (key: SortKey) => {
    if (sort === key) setAsc(!asc)
    else {
      setSort(key)
      setAsc(key === 'species')
    }
  }

  return (
    <div className="section-stack">
      <ExperimentBar />
      <Notice>
        Estas métricas vienen de los archivos del notebook. Las predicciones de la pestaña Identificar Ave siguen
        simuladas hasta conectar el modelo.
      </Notice>
      {!m ? (
        <div className="empty-state">Este Colab todavía no exportó métricas generales.</div>
      ) : (
        <div className="kpi-grid">
          <Kpi
            label="Accuracy en Prueba"
            value={p(m.accuracy, 2)}
            icon={Award}
            sub={m.testRecordings ? `${m.testRecordings} grabaciones (${m.numClasses} clases)` : 'Conjunto de prueba'}
          />
          {m.top3 !== undefined && m.top5 !== undefined ? (
            <Kpi
              label="Top-3 / Top-5 Accuracy"
              value={`${p(m.top3)} / ${p(m.top5)}`}
              icon={TrendingUp}
              sub={m.numClasses ? `Azar uniforme: ${(100 / m.numClasses).toFixed(2)}%` : undefined}
            />
          ) : (
            <Kpi label="Recall Macro" value={p(m.recallMacro, 2)} icon={TrendingUp} />
          )}
          <Kpi
            label={m.f1Weighted !== undefined ? 'F1 Macro / Ponderado' : 'F1 Macro'}
            value={m.f1Weighted !== undefined ? `${p(m.f1Macro, 2)} / ${p(m.f1Weighted, 2)}` : p(m.f1Macro, 2)}
            icon={Award}
            sub={`Precision: ${p(m.precisionMacro)} · Recall: ${p(m.recallMacro)}`}
          />
          <Kpi
            label="Pérdida en Prueba"
            value={m.loss.toFixed(4)}
            icon={Cpu}
            sub={
              m.bestEpoch
                ? `Mejor época: ${m.bestEpoch}${m.params ? ` · ${m.params.toLocaleString('es-BO')} parámetros` : ''}`
                : undefined
            }
          />
        </div>
      )}

      {history.length > 0 && (
        <div className="grid-2">
          <Card title="Curva de Pérdida por Época" subtitle={`Entrenamiento vs Validación (${history.length} épocas)`}>
            <LineChart
              label="Pérdida por época"
              x={history.map((h) => h.epoch)}
              series={[
                { name: 'Entrenamiento', color: '--chart-secondary', values: history.map((h) => h.trainLoss) },
                { name: 'Validación', color: '--chart-accent', values: history.map((h) => h.valLoss) },
              ]}
            />
          </Card>
          <Card title="Curva de Accuracy por Época" subtitle="Entrenamiento vs Validación">
            <LineChart
              label="Accuracy por época"
              x={history.map((h) => h.epoch)}
              domain={[0, 1]}
              format={(v) => p(v, 2)}
              series={[
                { name: 'Entrenamiento', color: '--chart-secondary', values: history.map((h) => h.trainAccuracy) },
                { name: 'Validación', color: '--chart-primary', values: history.map((h) => h.valAccuracy) },
              ]}
            />
          </Card>
        </div>
      )}

      {((data?.byQuality.length ?? 0) > 0 || (data?.byVocalization.length ?? 0) > 0) && (
        <div className="grid-2">
          {(data?.byQuality.length ?? 0) > 0 && (
            <Card title="Desempeño por Calidad de Grabación" subtitle="Robustez frente a ruido de campo en prueba">
              <BarChart
                label="Accuracy y confianza por calidad"
                height={245}
                unit="%"
                max={100}
                data={(data?.byQuality ?? []).map((q) => ({
                  label: `${q.label} (n=${q.count})`,
                  values: [Number((q.accuracy * 100).toFixed(1)), Number(((q.avgConfidence ?? 0) * 100).toFixed(1))],
                }))}
                series={[
                  { name: 'Accuracy', color: '--chart-primary' },
                  { name: 'Confianza media', color: '--chart-secondary' },
                ]}
              />
            </Card>
          )}
          {(data?.byVocalization.length ?? 0) > 0 && (
            <Card title="Desempeño por Tipo de Vocalización" subtitle="Exactitud entre cantos, llamados, dúos, etc.">
              <BarChart
                label="Accuracy por tipo de vocalización"
                height={245}
                unit="%"
                max={100}
                rotate={(data?.byVocalization.length ?? 0) > 4}
                data={(data?.byVocalization ?? []).map((v) => ({
                  label: `${v.label} (n=${v.count})`,
                  values: [Number((v.accuracy * 100).toFixed(1))],
                }))}
                series={[{ name: 'Accuracy', color: '--chart-accent' }]}
              />
            </Card>
          )}
        </div>
      )}

      {data?.confusion && <ConfusionMatrix data={data.confusion} />}

      <div className={data?.confusion ? 'grid-2' : undefined}>
        {data?.confusion && (
          <Card
            title="Pares de Especies con Mayor Confusión"
            icon={TriangleAlert}
            iconTone="warning"
            subtitle="Errores más frecuentes en prueba"
            flush
          >
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Especie Real</th>
                    <th scope="col">Especie Predicha</th>
                    <th scope="col">Confusiones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.confusion.top.map((t) => (
                    <tr key={`${t.trueSpecies}-${t.predictedSpecies}`}>
                      <td className="italic-species">{t.trueSpecies}</td>
                      <td className="italic-species">{t.predictedSpecies}</td>
                      <td>
                        <Badge tone="danger">{t.count}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        {report.length > 0 ? (
          <Card title="Reporte de Clasificación por Especie" subtitle="Ordena con los encabezados" flush>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {HEADS.map(([key, label]) => (
                      <th
                        key={key}
                        className="sortable"
                        scope="col"
                        aria-sort={sort === key ? (asc ? 'ascending' : 'descending') : 'none'}
                      >
                        <button type="button" onClick={() => toggle(key)}>
                          {label}
                          {sort === key ? (asc ? ' ▲' : ' ▼') : ''}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.map((r) => (
                    <tr key={r.species}>
                      <td className="italic-species">{r.species}</td>
                      <td>{p(r.precision)}</td>
                      <td>{p(r.recall)}</td>
                      <td>
                        <Badge tone={r.f1 >= 0.75 ? 'green' : r.f1 >= 0.45 ? 'amber' : 'danger'}>{p(r.f1)}</Badge>
                      </td>
                      <td>{r.support}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="empty-state">Este Colab todavía no exportó métricas por especie.</div>
        )}
      </div>
    </div>
  )
}
