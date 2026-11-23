import { useCallback, useEffect, useRef, useState } from 'react'
import type { Source } from '../../types'
import { Button } from '../../shared/components/Button'
import { IconFile, IconMic, IconStop, IconUpload } from '../../shared/components/Icons'
import { Notice } from '../../shared/components/Notice'
import { formatBytes, formatDuration } from '../../shared/lib/format'
import { MAX_RECORD_SEC, useRecorder } from './useRecorder'

interface Props {
  busy: boolean
  stage: string
  error: string | null
  onAnalyze: (file: File, source: Source) => void
}

const ACCEPT = 'audio/*,.wav,.mp3,.ogg,.flac,.m4a,.opus,.webm'

export function UploadView({ busy, stage, error, onAnalyze }: Props) {
  const [staged, setStaged] = useState<{ file: File; source: Source; url: string } | null>(null)
  const [dragging, setDragging] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const stage_ = useCallback((file: File, source: Source) => {
    setStaged((prev) => {
      if (prev) URL.revokeObjectURL(prev.url)
      return { file, source, url: URL.createObjectURL(file) }
    })
  }, [])

  useEffect(
    () => () => {
      if (staged) URL.revokeObjectURL(staged.url)
    },
    [staged],
  )

  const rec = useRecorder((f) => stage_(f, 'recording'))

  const pick = (files: FileList | null) => {
    const f = files?.[0]
    if (f) stage_(f, 'upload')
  }

  return (
    <div className="view">
      <header className="view__head">
        <h1>Reconoce un ave por su canto</h1>
        <p>Sube una grabación o usa el micrófono. El modelo estimará la especie y mostrará el detalle del análisis.</p>
      </header>

      <div
        className={`drop glass ${dragging ? 'is-drag' : ''} ${busy ? 'is-busy' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          pick(e.dataTransfer.files)
        }}
      >
        {busy ? (
          <div className="drop__busy" role="status" aria-live="polite">
            <div className="wave">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <p>{stage || 'Analizando…'}</p>
          </div>
        ) : staged ? (
          <div className="staged">
            <div className="staged__file">
              <IconFile />
              <div>
                <strong>{staged.file.name}</strong>
                <span>
                  {formatBytes(staged.file.size)} · {staged.source === 'recording' ? 'Grabación' : 'Archivo'}
                </span>
              </div>
            </div>
            <audio controls src={staged.url} />
            <div className="row">
              <Button onClick={() => onAnalyze(staged.file, staged.source)}>Analizar audio</Button>
              <Button variant="ghost" onClick={() => setStaged(null)}>
                Quitar
              </Button>
            </div>
          </div>
        ) : rec.recording ? (
          <div className="drop__rec" role="status">
            <span className="rec-dot" />
            <p className="rec-time">
              {formatDuration(rec.elapsed)} <small>/ {formatDuration(MAX_RECORD_SEC)}</small>
            </p>
            <Button onClick={rec.stop}>
              <IconStop size={18} /> Detener
            </Button>
          </div>
        ) : (
          <>
            <button className="drop__main" onClick={() => input.current?.click()}>
              <span className="drop__icon">
                <IconUpload size={28} />
              </span>
              <strong>Cargar audio</strong>
              <span>Arrastra un archivo aquí o haz clic para elegirlo</span>
            </button>
            <div className="drop__or">
              <span>o</span>
            </div>
            <Button variant="ghost" onClick={rec.start}>
              <IconMic size={18} /> Grabar con el micrófono
            </Button>
            <input
              ref={input}
              type="file"
              accept={ACCEPT}
              hidden
              onChange={(e) => {
                pick(e.target.files)
                e.target.value = ''
              }}
            />
          </>
        )}
      </div>

      {(error || rec.error) && <Notice tone="error">{error ?? rec.error}</Notice>}
    </div>
  )
}
