import { useCallback, useEffect, useState } from 'react'
import type { AnalysisResult } from '../types'

const KEY = 'fenix.history.v1'
const MAX_ITEMS = 30

function load(): AnalysisResult[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AnalysisResult[]) : []
  } catch {
    return []
  }
}

export function useHistory() {
  const [items, setItems] = useState<AnalysisResult[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* cuota llena o almacenamiento bloqueado: el historial queda solo en memoria */
    }
  }, [items])

  const add = useCallback((r: AnalysisResult) => setItems((p) => [r, ...p].slice(0, MAX_ITEMS)), [])
  const remove = useCallback((id: string) => setItems((p) => p.filter((i) => i.id !== id)), [])
  return { items, add, remove }
}
