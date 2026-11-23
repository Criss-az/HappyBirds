import type { AnalysisResult } from '../types'
import { formatBytes, formatDate, formatDuration, pct } from '../lib/format'
import { IconAlert, IconPlus } from './Icons'
import { Spectrogram } from './Spectrogram'

interface Props {
  result: AnalysisResult
  audioUrl?: string
  onNew: () => void
}

function Ring({ value }: { value: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <svg className="ring" viewBox="0 0 120 120" role="img" aria-label={`Probabilidad ${pct(value)}`}>
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#d6246e" />
          <stop offset="1" stopColor="#ffb347" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r={r} className="ring__bg" />
      <circle cx="60" cy="60" r={r} className="ring__fg" strokeDasharray={`${c * value} ${c}`} transform="rotate(-90 60 60)" />
      <text x="60" y="66" textAnchor="middle" className="ring__text">{pct(value)}</text>
    </svg>
  )
}

export function ResultView({ result, audioUrl, onNew }: Props) {
  const best = result.top[0]
  const f = result.features
  return (
    <div className="view">
      <header className="view__head view__head--row">
        <div>
          <h1>Resultado del análisis</h1>
          <p>{result.fileName} · {formatDate(result.createdAt)}</p>
        </div>
        <button className="btn btn--ghost" onClick={onNew}><IconPlus size={18} /> Nuevo análisis</button>
      </header>

      {result.warnings.map((w) => (
        <p className="notice" key={w}><IconAlert size={18} /> {w}</p>
      ))}

      <section className="card glass hero">
        <Ring value={best.probability} />
        <div className="hero__text">
          <span className="eyebrow">Especie más probable</span>
          <h2>{best.commonName}</h2>
          <p className="sci">{best.scientificName}</p>
        </div>
      </section>

      <div className="grid-2">
        <section className="card glass">
          <h3>Candidatas</h3>
          <ol className="bars">
            {result.top.map((c) => (
              <li key={c.id}>
                <div className="bars__label">
                  <span>{c.commonName}</span>
                  <span>{pct(c.probability, 1)}</span>
                </div>
                <div className="bars__track"><div className="bars__fill" style={{ width: pct(c.probability) }} /></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="card glass">
          <h3>Fiabilidad de la especie en el modelo</h3>
          <dl className="kv">
            <dt>F1 en prueba</dt><dd>{result.speciesMetrics.f1.toFixed(2)}</dd>
            <dt>Recall en prueba</dt><dd>{result.speciesMetrics.recall.toFixed(2)}</dd>
            <dt>Audios de prueba</dt><dd>{result.speciesMetrics.testSamples}</dd>
          </dl>
          <p className="hint">Con pocos audios de prueba estas métricas varían mucho.</p>
        </section>
      </div>

      <section className="card glass">
        <h3>Espectrograma Mel analizado</h3>
        <Spectrogram data={f.spectrogram} windowSec={f.windowSec} />
        <p className="hint">Ventana de {f.windowSec.toFixed(0)} s desde el segundo {f.windowStartSec.toFixed(1)}, la de mayor energía del audio.</p>
        {audioUrl ? <audio controls src={audioUrl} /> : <p className="hint">El audio original no se conserva al recargar la página.</p>}
      </section>

      <section className="card glass">
        <h3>Datos del audio</h3>
        <dl className="kv kv--grid">
          <dt>Duración</dt><dd>{formatDuration(f.durationSec)}</dd>
          <dt>Frecuencia de muestreo</dt><dd>{(f.sampleRate / 1000).toFixed(1)} kHz</dd>
          <dt>Tamaño</dt><dd>{formatBytes(result.sizeBytes)}</dd>
          <dt>Origen</dt><dd>{result.source === 'recording' ? 'Micrófono' : 'Archivo'}</dd>
        </dl>
      </section>

      {result.simulated && <p className="hint center">Resultado simulado: la interfaz aún no está conectada al modelo.</p>}
    </div>
  )
}
