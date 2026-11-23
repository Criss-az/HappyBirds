import { useCallback } from 'react'
import type { AnalysisResult } from './types'
import { Header } from './app/Header'
import { useHashRoute } from './app/useHashRoute'
import { useTheme } from './app/useTheme'
import { AnalizarView } from './features/analisis/AnalizarView'
import { useAnalysisSession } from './features/analisis/useAnalysisSession'
import { DatasetView } from './features/dataset/DatasetView'
import { HistorialView } from './features/historial/HistorialView'
import { useHistory } from './features/historial/useHistory'
import { AcercaView } from './features/informacion/AcercaView'
import { ModeloView } from './features/modelo/ModeloView'
import { NoSupervisadoView } from './features/no-supervisado/NoSupervisadoView'
import { ExperimentProvider } from './services/experimentos/useExperiments'
import { isSimulatedProvider } from './services/inference/provider'
import { APP_FOOTER } from './shared/config/brand'

export default function App() {
  const { route, navigate } = useHashRoute()
  const { theme, toggle } = useTheme()
  const { items, add, remove } = useHistory()

  const onDone = useCallback(
    (result: AnalysisResult) => {
      add(result)
      navigate('analizar', result.id)
    },
    [add, navigate],
  )
  const session = useAnalysisSession(onDone)

  const onDelete = (id: string) => {
    session.forget(id)
    remove(id)
  }

  return (
    <ExperimentProvider>
      <div className="app-shell">
        <a
          className="skip-link"
          href="#contenido"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('contenido')?.focus()
          }}
        >
          Saltar al contenido
        </a>
        <Header active={route.name} simulated={isSimulatedProvider} theme={theme} onToggleTheme={toggle} />
        <main className="main-content" id="contenido" tabIndex={-1}>
          {route.name === 'analizar' && (
            <AnalizarView session={session} items={items} resultId={route.param} onNew={() => navigate('analizar')} />
          )}
          {route.name === 'historial' && <HistorialView items={items} onDelete={onDelete} />}
          {route.name === 'dataset' && <DatasetView />}
          {route.name === 'modelo' && <ModeloView />}
          {route.name === 'no-supervisado' && <NoSupervisadoView />}
          {route.name === 'acerca' && <AcercaView />}
        </main>
        <footer className="app-footer">{APP_FOOTER}</footer>
      </div>
    </ExperimentProvider>
  )
}
