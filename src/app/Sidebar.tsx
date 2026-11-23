import { History, Moon, Plus, Sun, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { AnalysisResult } from '../types'
import { useExperiments } from '../services/experimentos/useExperiments'
import { Badge } from '../shared/components/Badge'
import { Button } from '../shared/components/Button'
import { Icon } from '../shared/components/Icon'
import { BirdMark } from '../shared/components/Logo'
import { Segmented } from '../shared/components/Segmented'
import { Select } from '../shared/components/Select'
import { APP_NAME } from '../shared/config/brand'
import { formatDate, pct } from '../shared/lib/format'
import { NAV_GROUPS, ROUTE_META } from './routes'
import { href, type Route } from './useHashRoute'
import type { Theme } from './useTheme'

interface Props {
  route: Route
  items: AnalysisResult[]
  simulated: boolean
  theme: Theme
  onTheme: (t: Theme) => void
  open: boolean
  onClose: () => void
  onNew: () => void
}

export function Sidebar({ route, items, simulated, theme, onTheme, open, onClose, onNew }: Props) {
  const { experiments, selected, select } = useExperiments()
  const closeBtn = useRef<HTMLButtonElement>(null)

  // En celular el menú es un cajón: al abrirlo el foco entra en él y Escape lo cierra.
  useEffect(() => {
    if (!open) return
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <aside id="menu" className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Menú principal">
      <div className="sidebar__head">
        <a className="brand" href={href('analizar')}>
          <BirdMark size={40} />
          <span>
            <span className="brand__name">{APP_NAME}</span>
            <span className="brand__tag">Aves de Bolivia</span>
          </span>
        </a>
        <button
          ref={closeBtn}
          type="button"
          className="icon-btn sidebar__close"
          aria-label="Cerrar menú"
          onClick={onClose}
        >
          <Icon icon={X} size="md" />
        </button>
      </div>

      <div className="sidebar__scroll">
        <Button variant="primary" onClick={onNew}>
          <Icon icon={Plus} /> Nuevo análisis
        </Button>

        <nav aria-label="Secciones">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="nav-section">
              <p className="nav-group">{group.label}</p>
              <ul className="nav-list">
                {group.routes.map((name) => {
                  const meta = ROUTE_META[name]
                  const current = route.name === name
                  return (
                    <li key={name}>
                      <a className="nav-link" href={href(name)} aria-current={current ? 'page' : undefined}>
                        <Icon icon={meta.icon} size="md" />
                        <span>{meta.label}</span>
                        {meta.badge && <Badge tone="amber">{meta.badge}</Badge>}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <section className="nav-section" aria-label="Recientes">
          <p className="nav-group">Recientes</p>
          {items.length === 0 ? (
            <p className="nav-empty">Aquí aparecerán los audios que analices.</p>
          ) : (
            <ul className="nav-list">
              {items.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <a
                    className="recent-link"
                    href={href('analizar', r.id)}
                    aria-current={route.name === 'analizar' && route.param === r.id ? 'page' : undefined}
                  >
                    <Icon icon={History} />
                    <span>
                      <strong>{r.top[0].commonName}</strong>
                      <small>
                        {pct(r.top[0].probability)} · {formatDate(r.createdAt)}
                      </small>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="sidebar__foot">
        <div>
          <label className="control-label" htmlFor="colab-activo">
            Colab activo
          </label>
          <Select
            id="colab-activo"
            ariaLabel="Colab activo"
            block
            disabled={experiments.length === 0}
            placeholder="Sin Colabs registrados"
            value={selected?.id ?? ''}
            onChange={select}
            options={experiments.map((e) => ({ value: e.id, label: e.nombre }))}
          />
        </div>
        <div>
          <span className="control-label" id="tema-label">
            Apariencia
          </span>
          <Segmented
            ariaLabel="Apariencia"
            value={theme}
            onChange={onTheme}
            options={[
              { value: 'light', label: 'Claro', icon: Sun },
              { value: 'dark', label: 'Oscuro', icon: Moon },
            ]}
          />
        </div>
        <div className="status-pill" role="status">
          <span className={`status-dot ${simulated ? 'warning' : 'online'}`} />
          <span>{simulated ? 'Predicciones simuladas' : 'Modelo conectado por API'}</span>
        </div>
      </div>
    </aside>
  )
}
