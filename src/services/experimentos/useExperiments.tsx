import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { listExperiments, loadExperiment } from './index'
import type { ExperimentData, ExperimentMeta } from './types'

const KEY = 'happybirds.experiment'

interface Value {
  experiments: ExperimentMeta[]
  problems: string[]
  selected: ExperimentMeta | null
  select: (id: string) => void
  data: ExperimentData | null
  loading: boolean
  error: string | null
}

const Context = createContext<Value | null>(null)

function storedId(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [experiments, setExperiments] = useState<ExperimentMeta[]>([])
  const [problems, setProblems] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(storedId)
  const [loaded, setLoaded] = useState<{ id: string; data: ExperimentData } | null>(null)
  const [failure, setFailure] = useState<{ id: string | null; message: string } | null>(null)
  const [listed, setListed] = useState(false)

  useEffect(() => {
    let active = true
    listExperiments()
      .then((r) => {
        if (!active) return
        setExperiments(r.items)
        setProblems(r.problems)
      })
      .catch(() => active && setFailure({ id: null, message: 'No se pudo leer la carpeta de modelos.' }))
      .finally(() => active && setListed(true))
    return () => {
      active = false
    }
  }, [])

  const selected = experiments.find((e) => e.id === selectedId) ?? experiments[0] ?? null

  useEffect(() => {
    if (!selected) return
    let active = true
    loadExperiment(selected)
      .then((data) => {
        if (!active) return
        setLoaded({ id: selected.id, data })
        setFailure(null)
      })
      .catch((e: unknown) => {
        if (active) setFailure({ id: selected.id, message: e instanceof Error ? e.message : 'No se pudo cargar.' })
      })
    return () => {
      active = false
    }
  }, [selected])

  const value = useMemo<Value>(() => {
    const data = loaded && loaded.id === selected?.id ? loaded.data : null
    const error = failure && (failure.id === null || failure.id === selected?.id) ? failure.message : null
    return {
      experiments,
      problems,
      selected,
      select: (id) => {
        setSelectedId(id)
        try {
          localStorage.setItem(KEY, id)
        } catch {
          /* sin almacenamiento: la selección dura hasta recargar */
        }
      },
      data,
      loading: !error && (!listed || (Boolean(selected) && !data)),
      error,
    }
  }, [experiments, problems, selected, loaded, failure, listed])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useExperiments(): Value {
  const value = useContext(Context)
  if (!value) throw new Error('useExperiments debe usarse dentro de ExperimentProvider.')
  return value
}
