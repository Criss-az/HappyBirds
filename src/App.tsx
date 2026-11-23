import { Menu } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { AnalysisResult } from './types'
import { ROUTE_META, groupOf } from './app/routes'
import { Sidebar } from './app/Sidebar'
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
import { Icon } from './shared/components/Icon'
import { BirdMark } from './shared/components/Logo'
import { PageHeader } from './shared/components/PageHeader'
import { APP_FOOTER, APP_NAME } from './shared/config/brand'

export default function App() {
  const { route, navigate } = useHashRoute()
  const { theme, setTheme } = useTheme()
  const { items, add, remove } = useHistory()
  const [menuOpen, setMenuOpen] = useState(false)

  const onDone = useCallback(
    (result: AnalysisResult) => {
      add(result)
      navigate('analizar', result.id)
    },
    [add, navigate],
  )
  const session = useAnalysisSession(onDone)

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  // Al navegar, el cajón se cierra y la página vuelve arriba.
  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [route.name, route.param])

  const onDelete = (id: string) => {
    session.forget(id)
    remove(id)
  }

  const meta = ROUTE_META[route.name]
  const showingResult = route.name === 'analizar' && route.param !== null && items.some((i) => i.id === route.param)

  return (
    <ExperimentProvider>
      <div className="app-backdrop" aria-hidden="true" />
      <div className="shell">
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
        <Sidebar
          route={route}
          items={items}
          simulated={isSimulatedProvider}
          theme={theme}
          onTheme={setTheme}
          open={menuOpen}
          onClose={closeMenu}
          onNew={() => navigate('analizar')}
        />
        {menuOpen && <button type="button" className="scrim" aria-label="Cerrar menú" onClick={closeMenu} />}

        <div className="content">
          <header className="topbar">
            <button
              type="button"
              className="icon-btn"
              aria-label="Abrir menú"
              aria-controls="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Icon icon={Menu} size="md" />
            </button>
            <span className="topbar__brand">
              <BirdMark size={28} />
              {APP_NAME}
            </span>
            <span className="topbar__page">{meta.label}</span>
          </header>

          <main className="main-content" id="contenido" tabIndex={-1}>
            <PageHeader
              eyebrow={groupOf(route.name)}
              title={showingResult ? 'Resultado del análisis' : meta.title}
              description={showingResult ? undefined : meta.description}
            />
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
      </div>
    </ExperimentProvider>
  )
}
