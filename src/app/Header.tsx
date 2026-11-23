import { AudioLines, Bird, ChartColumn, Database, History, Info, Lock, Moon, Sun, type LucideIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { APP_NAME, APP_TAGLINE } from '../shared/config/brand'
import { Icon } from '../shared/components/Icon'
import { href, type RouteName } from './useHashRoute'
import type { Theme } from './useTheme'

const TABS: Array<{ id: RouteName; label: string; icon: LucideIcon; badge?: string }> = [
  { id: 'analizar', label: 'Identificar Ave', icon: AudioLines },
  { id: 'historial', label: 'Historial', icon: History },
  { id: 'dataset', label: 'Dataset', icon: Database },
  { id: 'modelo', label: 'Métricas del Modelo', icon: ChartColumn },
  { id: 'no-supervisado', label: 'No Supervisado', icon: Lock, badge: 'Próximamente' },
  { id: 'acerca', label: 'Acerca de', icon: Info },
]

interface Props {
  active: RouteName
  simulated: boolean
  theme: Theme
  onToggleTheme: () => void
}

export function Header({ active, simulated, theme, onToggleTheme }: Props) {
  const next = theme === 'light' ? 'Modo oscuro' : 'Modo claro'
  const nav = useRef<HTMLElement>(null)

  // En celular las pestañas se desplazan: la activa siempre queda a la vista.
  useEffect(() => {
    const bar = nav.current
    const tab = bar?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!bar || !tab) return
    bar.scrollLeft = tab.offsetLeft - bar.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2
  }, [active])
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-top">
          <div className="brand-block">
            <div className="brand-icon">
              <Icon icon={Bird} size="md" />
            </div>
            <div>
              <h1 className="brand-title">{APP_NAME}</h1>
              <p className="brand-subtitle">{APP_TAGLINE}</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="status-pill" role="status">
              <span className={`status-dot ${simulated ? 'warning' : 'online'}`} />
              <span>{simulated ? 'Predicciones simuladas' : 'Modelo conectado por API'}</span>
            </div>
            <button type="button" className="theme-toggle-btn" onClick={onToggleTheme} aria-label={`Cambiar a ${next}`}>
              <Icon icon={theme === 'light' ? Moon : Sun} />
              <span>{next}</span>
            </button>
          </div>
        </div>
        <nav ref={nav} className="nav-tabs" aria-label="Navegación principal">
          {TABS.map((tab) => (
            <a
              key={tab.id}
              href={href(tab.id)}
              className={`nav-tab ${active === tab.id ? 'active' : ''}`}
              aria-current={active === tab.id ? 'page' : undefined}
            >
              <Icon icon={tab.icon} />
              <span>{tab.label}</span>
              {tab.badge && <span className="tab-badge">{tab.badge}</span>}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
