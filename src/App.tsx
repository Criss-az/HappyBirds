import { useCallback, useRef, useState } from 'react'
import type { Source } from './types'
import { extractFeatures } from './lib/spectrogram'
import { inference } from './services/inference'
import { useHistory } from './hooks/useHistory'
import { Sidebar } from './components/Sidebar'
import { InfoPanel } from './components/InfoPanel'
import { UploadView } from './components/UploadView'
import { ResultView } from './components/ResultView'
import { IconMenu } from './components/Icons'

export default function App() {
  const { items, add, remove } = useHistory()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const urls = useRef(new Map<string, string>())

  const selected = items.find((i) => i.id === selectedId) ?? null

  const analyze = useCallback(
    async (file: File, source: Source) => {
      setBusy(true)
      setError(null)
      try {
        setStage('Leyendo audio y generando el espectrograma…')
        const features = await extractFeatures(file)
        setStage('Clasificando con el modelo…')
        const result = await inference.analyze({ file, source, features })
        urls.current.set(result.id, URL.createObjectURL(file))
        add(result)
        setSelectedId(result.id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo analizar el audio.')
      } finally {
        setBusy(false)
        setStage('')
      }
    },
    [add],
  )

  const remove_ = (id: string) => {
    const u = urls.current.get(id)
    if (u) URL.revokeObjectURL(u)
    urls.current.delete(id)
    remove(id)
    if (id === selectedId) setSelectedId(null)
  }

  const go = (id: string | null) => {
    setSelectedId(id)
    setError(null)
    setMenuOpen(false)
  }

  return (
    <div className="app">
      <Sidebar
        items={items}
        selectedId={selectedId}
        open={menuOpen}
        onNew={() => go(null)}
        onSelect={go}
        onDelete={remove_}
        onClose={() => setMenuOpen(false)}
      />
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

      <main className="main">
        <button className="icon-btn menu-btn glass" onClick={() => setMenuOpen(true)} aria-label="Abrir historial">
          <IconMenu />
        </button>
        {selected ? (
          <ResultView result={selected} audioUrl={urls.current.get(selected.id)} onNew={() => go(null)} />
        ) : (
          <UploadView busy={busy} stage={stage} error={error} onAnalyze={analyze} />
        )}
      </main>

      <InfoPanel />
    </div>
  )
}
