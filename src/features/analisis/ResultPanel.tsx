import { Bird, Plus } from 'lucide-react'
import type { AnalysisResult } from '../../types'
import { Badge } from '../../shared/components/Badge'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { Icon } from '../../shared/components/Icon'
import { Notice } from '../../shared/components/Notice'
import { formatBytes, formatDate, formatDuration, formatSeconds, pct } from '../../shared/lib/format'
import { Spectrogram } from './Spectrogram'
import { Waveform } from './Waveform'

const LOW_CONFIDENCE = 0.5

interface Props {
  result: AnalysisResult
  audioUrl?: string
  onNew: () => void
}

export function ResultPanel({ result, audioUrl, onNew }: Props) {
  const best = result.top[0]
  const f = result.features
  const low = best.probability < LOW_CONFIDENCE
  const hasLowWarning = result.warnings.some((w) => /confianza baja/i.test(w))

  return (
    <div className="section-stack">
      {result.simulated && <Notice>Resultado simulado: la interfaz aún no está conectada al modelo.</Notice>}
      {low && !hasLowWarning && <Notice>Confianza baja: toma esta especie como una sugerencia.</Notice>}
      {result.warnings.map((w) => (
        <Notice key={w}>{w}</Notice>
      ))}

      <Card
        title="Resultado de Identificación"
        subtitle={`${result.fileName} · ${formatDate(result.createdAt)}`}
        actions={
          <Button onClick={onNew}>
            <Icon icon={Plus} /> Nuevo análisis
          </Button>
        }
      >
        <div className="prediction-banner">
          <div className="result-main">
            <div className="result-photo" role="img" aria-label="Sin foto de la especie">
              <Icon icon={Bird} />
            </div>
            <div>
              <div className="result-eyebrow">Especie probable</div>
              <div className="result-common">{best.commonName}</div>
              <div className="italic-species muted">{best.scientificName}</div>
            </div>
          </div>
          <div>
            <div className="result-score">{pct(best.probability, 1)}</div>
            <div className="small subtle">Confianza Softmax</div>
          </div>
        </div>
        <div className="confidence-bar-bg">
          <div className="confidence-bar-fill" style={{ width: pct(best.probability) }} />
        </div>
      </Card>

      <Card title="Reproductor y Forma de Onda" subtitle={result.source === 'recording' ? 'Micrófono' : 'Archivo'}>
        <div className="window-stack">
          {audioUrl ? (
            <audio controls src={audioUrl} />
          ) : (
            <p className="small subtle">El audio original no se conserva al recargar la página.</p>
          )}
          {f.peaks ? (
            <Waveform peaks={f.peaks} />
          ) : (
            <p className="small subtle">Este análisis se guardó antes de que existiera la forma de onda.</p>
          )}
        </div>
      </Card>

      <div className="grid-2">
        <Card
          title="Espectrograma de Mel (dB)"
          subtitle={`Aproximación visual · ${f.spectrogram.h} bandas · desde el segundo ${formatSeconds(f.windowStartSec)}`}
        >
          <Spectrogram data={f.spectrogram} windowSec={f.windowSec} />
        </Card>

        <Card title={`Top-${result.top.length} Especies Más Probables`} subtitle="Distribución de probabilidad Softmax">
          <ol className="candidates">
            {result.top.map((c, i) => (
              <li key={c.id}>
                <div className="candidates__label">
                  <span>{c.commonName}</span>
                  <span>{pct(c.probability, 1)}</span>
                </div>
                <div className="confidence-bar-bg">
                  <div
                    className={`confidence-bar-fill ${i > 0 ? 'confidence-bar-fill--second' : ''}`}
                    style={{ width: pct(c.probability) }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="grid-2">
        <Card
          title="Fiabilidad de la Especie"
          subtitle={result.simulated ? 'Valores simulados' : 'Conjunto de prueba del modelo'}
          actions={result.simulated ? <Badge tone="amber">Simulado</Badge> : undefined}
        >
          <dl className="kv">
            <dt>F1 en prueba</dt>
            <dd>{result.speciesMetrics.f1.toFixed(2)}</dd>
            <dt>Recall en prueba</dt>
            <dd>{result.speciesMetrics.recall.toFixed(2)}</dd>
            <dt>Audios de prueba</dt>
            <dd>{result.speciesMetrics.testSamples}</dd>
          </dl>
        </Card>
        <Card title="Datos del Audio">
          <dl className="kv">
            <dt>Duración</dt>
            <dd>{formatDuration(f.durationSec)}</dd>
            <dt>Frecuencia de muestreo</dt>
            <dd>{(f.sampleRate / 1000).toFixed(1)} kHz</dd>
            <dt>Tamaño</dt>
            <dd>{formatBytes(result.sizeBytes)}</dd>
          </dl>
        </Card>
      </div>
    </div>
  )
}
