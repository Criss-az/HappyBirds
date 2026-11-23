import type { AnalysisResult } from '../../types'
import { Button } from '../../shared/components/Button'
import { IconClose, IconPlus, IconTrash, Logo } from '../../shared/components/Icons'
import { formatDate, pct } from '../../shared/lib/format'

interface Props {
  items: AnalysisResult[]
  selectedId: string | null
  open: boolean
  onNew: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function Sidebar({ items, selectedId, open, onNew, onSelect, onDelete, onClose }: Props) {
  return (
    <aside className={`sidebar glass ${open ? 'is-open' : ''}`} aria-label="Historial de audios">
      <div className="sidebar__head">
        <div className="brand">
          <Logo />
          <span>Fénix</span>
        </div>
        <button className="icon-btn sidebar__close" onClick={onClose} aria-label="Cerrar menú">
          <IconClose />
        </button>
      </div>

      <Button block onClick={onNew}>
        <IconPlus size={18} /> Nuevo análisis
      </Button>

      <h2 className="sidebar__title">Historial</h2>
      {items.length === 0 ? (
        <p className="sidebar__empty">Aquí aparecerán los audios que analices.</p>
      ) : (
        <ul className="history">
          {items.map((it) => (
            <li key={it.id}>
              <button
                className={`history__item ${it.id === selectedId ? 'is-active' : ''}`}
                onClick={() => onSelect(it.id)}
              >
                <span className="history__name">{it.top[0].commonName}</span>
                <span className="history__meta">
                  {pct(it.top[0].probability)} ·{' '}
                  {it.fileName.length > 22 ? `${it.fileName.slice(0, 20)}…` : it.fileName}
                </span>
                <span className="history__date">{formatDate(it.createdAt)}</span>
              </button>
              <button
                className="icon-btn history__del"
                onClick={() => onDelete(it.id)}
                aria-label={`Eliminar ${it.fileName}`}
              >
                <IconTrash size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
