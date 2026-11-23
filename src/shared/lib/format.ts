export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

/** Segundos con un decimal solo si hace falta: 3 → "3", 4,6 → "4,6". */
export function formatSeconds(sec: number): string {
  return sec.toLocaleString('es-BO', { maximumFractionDigits: 1 })
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function pct(p: number, digits = 0): string {
  return `${(p * 100).toFixed(digits)}%`
}
