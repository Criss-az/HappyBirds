import { FlaskConical } from 'lucide-react'
import { useExperiments } from '../../services/experimentos/useExperiments'
import { Badge } from '../../shared/components/Badge'
import { Icon } from '../../shared/components/Icon'
import { Notice } from '../../shared/components/Notice'

/** Resume el Colab activo. Se cambia desde la barra lateral. */
export function ExperimentInfo() {
  const { selected, problems } = useExperiments()
  if (!selected) return null
  const a = selected.audio
  return (
    <>
      <div className="experiment-bar">
        <div className="experiment-bar__name">
          <Icon icon={FlaskConical} className="icon-accent" />
          <span>
            <small>Colab activo</small>
            <strong>{selected.nombre}</strong>
          </span>
        </div>
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
