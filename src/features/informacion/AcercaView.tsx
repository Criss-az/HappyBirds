import { BookOpen, Lightbulb, TriangleAlert, Users } from 'lucide-react'
import { useExperiments } from '../../services/experimentos/useExperiments'
import { Card } from '../../shared/components/Card'
import { APP_NAME } from '../../shared/config/brand'

const TEAM = [
  'Alba Zapata Cristhian',
  'Chinchilla Condori Jhilmer',
  'Flores Mamani Daniel Teodoro',
  'Lora Quilla Santiago Leonardo',
  'Lizarazu Fernández Josue Joel',
  'Padilla Alexander J.',
  'Sejas Mamani Jairo Joshua',
  'Uzeda Rocha Mauricio',
]

export function AcercaView() {
  const { selected } = useExperiments()
  const a = selected?.audio
  return (
    <div className="section-stack">
      <div className="grid-2">
        <Card title="Metodología" icon={BookOpen}>
          <div className="window-stack prose">
            <p>
              {APP_NAME} usa aprendizaje supervisado con Deep Learning: una red convolucional (CNN) clasifica
              espectrogramas de Mel y termina en Softmax, con una probabilidad por especie.
            </p>
            {selected && a && (
              <dl className="kv">
                <dt>Colab seleccionado</dt>
                <dd>{selected.nombre}</dd>
                {a.ventanaSec && (
                  <>
                    <dt>Ventana</dt>
                    <dd>{a.ventanaSec} s</dd>
                  </>
                )}
                {a.sampleRate && (
                  <>
                    <dt>Muestreo</dt>
                    <dd>{a.sampleRate.toLocaleString('es-BO')} Hz, mono</dd>
                  </>
                )}
                {a.bandasMel && (
                  <>
                    <dt>Bandas Mel</dt>
                    <dd>{a.bandasMel}</dd>
                  </>
                )}
              </dl>
            )}
          </div>
        </Card>
        <Card title="Limitaciones" icon={TriangleAlert} iconTone="warning">
          <div className="prose">
            <ul>
              <li>La probabilidad no está calibrada: no es una medida exacta de certeza.</li>
              <li>El modelo solo conoce las especies con las que se entrenó y siempre propone alguna de ellas.</li>
              <li>Con pocos audios de prueba, las métricas por especie varían mucho.</li>
              <li>El espectrograma de la interfaz es una aproximación visual, no la entrada real de la CNN.</li>
            </ul>
          </div>
        </Card>
      </div>
      <div className="grid-2">
        <Card title="Para Mejores Resultados" icon={Lightbulb}>
          <div className="prose">
            <ul>
              <li>Entre 5 y 10 segundos de canto.</li>
              <li>Poco ruido de fondo, sin voces.</li>
              <li>Una sola ave dominante.</li>
              <li>Formatos: WAV, MP3, OGG, FLAC, M4A y WEBM.</li>
            </ul>
          </div>
        </Card>
        <Card title="Equipo · Grupo 7" icon={Users}>
          <div className="prose">
            <ul>
              {TEAM.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
      <Card title="Créditos">
        <p className="prose">
          Diseño y artefactos del primer modelo: proyecto machineLearningP2 del equipo. Grabaciones del dataset:
          Xeno-canto, con la licencia de cada autor. Iconos: Lucide (licencia ISC).
        </p>
      </Card>
    </div>
  )
}
