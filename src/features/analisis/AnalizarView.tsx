import {
  AudioLines,
  CircleAlert,
  CircleCheck,
  Circle,
  FileAudio,
  LoaderCircle,
  Mic,
  Square,
  Upload,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import type { AnalysisResult } from '../../types'
import { href } from '../../app/useHashRoute'
import { Badge } from '../../shared/components/Badge'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { Icon } from '../../shared/components/Icon'
import { Notice } from '../../shared/components/Notice'
import { formatBytes, formatDate, formatDuration, pct } from '../../shared/lib/format'
import { ResultPanel } from './ResultPanel'
import type { AnalysisSession, AnalysisStep } from './useAnalysisSession'
import { MAX_RECORD_SEC } from './useRecorder'

const ACCEPT = 'audio/*,.wav,.mp3,.ogg,.flac,.m4a,.opus,.webm'
const STATUS_LABEL = { pendiente: 'Pendiente', 'en-curso': 'En curso', listo: 'Listo', error: 'Error' }
const STATUS_ICON = { pendiente: Circle, 'en-curso': LoaderCircle, listo: CircleCheck, error: CircleAlert }

function Steps({ steps }: { steps: AnalysisStep[] }) {
  return (
    <Card title="Estado del Análisis">
      <ol className="steps" aria-live="polite">
        {steps.map((s) => (
          <li key={s.label} className={`step step--${s.status}`}>
            <Icon icon={STATUS_ICON[s.status]} className={s.status === 'en-curso' ? 'spin' : undefined} />
            <div>
              <strong>{s.label}</strong>
              <small>{STATUS_LABEL[s.status]}</small>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}

function Recent({ items }: { items: AnalysisResult[] }) {
  return (
    <Card
      title="Últimas Predicciones"
      flush
      actions={
        <a className="btn" href={href('historial')}>
          Ver historial
        </a>
      }
    >
      {items.length === 0 ? (
        <div className="window-body subtle">Aquí aparecerán los audios que analices.</div>
      ) : (
        <ul className="recent">
          {items.slice(0, 3).map((r) => (
            <li key={r.id}>
              <a href={href('analizar', r.id)}>
                <div>
                  <strong>{r.top[0].commonName}</strong>
                  <small>
                    {r.fileName} · {formatDate(r.createdAt)}
                  </small>
                </div>
                <Badge tone={r.top[0].probability < 0.5 ? 'amber' : 'green'}>{pct(r.top[0].probability)}</Badge>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

interface Props {
  session: AnalysisSession
  items: AnalysisResult[]
  resultId: string | null
  onNew: () => void
}

export function AnalizarView({ session, items, resultId, onNew }: Props) {
  const { staged, stage, clearStaged, busy, steps, error, analyze, recorder: rec, audioUrl } = session
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const result = resultId ? (items.find((i) => i.id === resultId) ?? null) : null

  if (result) {
    return (
      <div className="detector-center-wrap">
        <ResultPanel result={result} audioUrl={audioUrl(result.id)} onNew={onNew} />
      </div>
    )
  }

  const pick = (files: FileList | null) => {
    const f = files?.[0]
    if (f && !busy && !rec.recording) stage(f, 'upload')
  }
  const showSteps = busy || steps.some((s) => s.status === 'error')
  const message = error ?? rec.error

  return (
    <div className="detector-center-wrap">
      <div className="detector-intro">
        <h2>Identificar Especie por Canto o Llamado</h2>
        <p>
          Sube una grabación de campo o escucha directamente desde el micrófono para estimar a qué especie de ave de
          Bolivia corresponde el sonido.
        </p>
      </div>

      {resultId && <Notice>Ese análisis ya no está en el historial.</Notice>}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!rec.recording && !busy) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          pick(e.dataTransfer.files)
        }}
      >
        <Card
          title="Entrada de Sonido"
          icon={AudioLines}
          subtitle={`Formatos: WAV, MP3, OGG, FLAC, M4A, WEBM o captura en vivo (máx. ${MAX_RECORD_SEC} s)`}
        >
          <input
            ref={input}
            type="file"
            accept={ACCEPT}
            hidden
            aria-label="Elegir archivo de audio"
            onChange={(e) => {
              pick(e.target.files)
              e.target.value = ''
            }}
          />
          <div className="primary-action-grid">
            <button
              type="button"
              className={`action-tile primary ${dragging ? 'dragging' : ''}`}
              disabled={rec.recording || busy}
              onClick={() => input.current?.click()}
            >
              <Icon icon={Upload} size="tile" />
              <span className="action-tile-title">Subir archivo de audio</span>
              <span className="action-tile-desc">Haz clic para seleccionar o arrastra aquí un archivo</span>
            </button>
            <button
              type="button"
              className={`action-tile ${rec.recording ? 'recording' : ''}`}
              disabled={busy}
              onClick={rec.recording ? rec.stop : rec.start}
            >
              <Icon icon={rec.recording ? Square : Mic} size="tile" className="icon-accent" />
              <span className="action-tile-title">{rec.recording ? 'Detener grabación' : 'Grabar audio'}</span>
              <span className="action-tile-desc">
                {rec.recording
                  ? `Grabando (${formatDuration(rec.elapsed)} / ${formatDuration(MAX_RECORD_SEC)})`
                  : 'Graba el canto desde el micrófono de tu equipo'}
              </span>
            </button>
          </div>

          {rec.recording && (
            <div className="mic-panel" role="status">
              <div className="mic-panel-row">
                <span className="mic-time">
                  Escuchando micrófono… {formatDuration(rec.elapsed)} / {formatDuration(MAX_RECORD_SEC)}
                </span>
              </div>
              <div
                className="mic-meter-track"
                role="meter"
                aria-label="Nivel de entrada del micrófono"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(rec.level * 100)}
              >
                <div className="mic-meter-fill" style={{ width: `${Math.round(rec.level * 100)}%` }} />
              </div>
            </div>
          )}

          {staged && !rec.recording && (
            <div className="staged">
              <div className="staged__file">
                <Icon icon={FileAudio} size="md" className="icon-accent" />
                <div>
                  <span className="staged__name">{staged.file.name}</span>
                  <span className="small muted">
                    {formatBytes(staged.file.size)} · {staged.source === 'recording' ? 'Grabación' : 'Archivo'}
                  </span>
                </div>
              </div>
              <audio controls src={staged.url} />
              <div className="controls-row">
                <Button variant="primary" disabled={busy} onClick={() => void analyze()}>
                  <Icon icon={AudioLines} /> Analizar audio
                </Button>
                <Button variant="neutral" disabled={busy} onClick={clearStaged}>
                  <Icon icon={X} /> Quitar
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {showSteps && <Steps steps={steps} />}
      {message && <Notice tone="error">{message}</Notice>}
      <Recent items={items} />
    </div>
  )
}
