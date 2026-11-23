import { FlaskConical } from 'lucide-react'
import { useExperiments } from '../../services/experimentos/useExperiments'
import { Badge } from '../../shared/components/Badge'
import { Icon } from '../../shared/components/Icon'
import { Notice } from '../../shared/components/Notice'

/** Selector de Colab, compartido por Dataset y Métricas. */
export function ExperimentBar() {
  const { experiments, selected, select, problems } = useExperiments()
  if (!selected) return null
  const a = selected.audio
  return (
    <>
      <div className="experiment-bar">
        <label>
          <Icon icon={FlaskConical} className="icon-accent" />
          Colab / experimento
          <select className="select" value={selected.id} onChange={(e) => select(e.target.value)}>
            {experiments.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </label>
        <div className="pill-list">
          {selected.origen === 'ejemplo' ? (
            <Badge tone="amber">Datos de ejemplo</Badge>
          ) : (
            <Badge tone="green">Artefactos del notebook</Badge>
          )}
          {selected.framework && <Badge>{selected.framework}</Badge>}
          {a?.sampleRate && <Badge>{a.sampleRate.toLocaleString('es-BO')} Hz</Badge>}
          {a?.ventanaSec && <Badge>Ventana {a.ventanaSec} s</Badge>}
          {a?.bandasMel && <Badge>{a.bandasMel} bandas Mel</Badge>}
        </div>
      </div>
      {problems.map((p) => (
        <Notice key={p}>{p}</Notice>
      ))}
    </>
  )
}
