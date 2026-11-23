import { CalendarClock, Layers, Lock } from 'lucide-react'
import { Badge } from '../../shared/components/Badge'
import { Card } from '../../shared/components/Card'
import { Icon } from '../../shared/components/Icon'

const PLANNED = [
  'Extracción de embeddings acústicos sin utilizar etiquetas de especie',
  'Reducción dimensional exploratoria (PCA / UMAP)',
  'Agrupamiento no supervisado (K-Means / HDBSCAN) y evaluación con Silhouette Score',
  'Visualización interactiva de clústeres acústicos en esta pestaña',
]

export function NoSupervisadoView() {
  return (
    <div className="section-stack">
      <div className="placeholder-box">
        <div className="pill-list">
          <Badge tone="amber">
            <Icon icon={Lock} /> Espacio reservado
          </Badge>
          <Badge>
            <Icon icon={CalendarClock} /> Siguiente entrega
          </Badge>
        </div>
        <h2 className="placeholder-title">Próximamente: Aprendizaje No Supervisado</h2>
        <p className="prose">
          El modelo no supervisado todavía no está implementado ni entrenado. Esta sección queda reservada para la
          siguiente entrega del proyecto.
        </p>
      </div>
      <Card title="Componentes Planificados" icon={Layers} iconTone="warning">
        <div className="prose">
          <ul>
            {PLANNED.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  )
}
