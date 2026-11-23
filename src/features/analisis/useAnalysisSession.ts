import { useCallback, useEffect, useRef, useState } from 'react'
import type { AnalysisResult, Source } from '../../types'
import { inference } from '../../services/inference'
import { extractFeatures } from './spectrogram'
import { useRecorder } from './useRecorder'

export type StepStatus = 'pendiente' | 'en-curso' | 'listo' | 'error'
export interface AnalysisStep {
  label: string
  status: StepStatus
}

export interface StagedAudio {
  file: File
  source: Source
  url: string
}

const LABELS = ['Preprocesamiento', 'Clasificación', 'Resultado']
const idle = (): AnalysisStep[] => LABELS.map((label) => ({ label, status: 'pendiente' }))
const progress = (current: number, failed = false): AnalysisStep[] =>
  LABELS.map((label, i) => ({
    label,
    status: i < current ? 'listo' : i > current ? 'pendiente' : failed ? 'error' : 'en-curso',
  }))

/** Vive en App para que grabación, archivo y análisis sobrevivan al cambiar de pestaña. */
export function useAnalysisSession(onDone: (result: AnalysisResult) => void) {
  const [staged, setStaged] = useState<StagedAudio | null>(null)
  const [busy, setBusy] = useState(false)
  const [steps, setSteps] = useState<AnalysisStep[]>(idle)
  const [error, setError] = useState<string | null>(null)
  const urls = useRef(new Map<string, string>())
  const stagedUrl = useRef<string | null>(null)

  const stage = useCallback((file: File, source: Source) => {
    if (stagedUrl.current) URL.revokeObjectURL(stagedUrl.current)
    const url = URL.createObjectURL(file)
    stagedUrl.current = url
    setStaged({ file, source, url })
    setError(null)
    setSteps(idle())
  }, [])

  const clearStaged = useCallback(() => {
    if (stagedUrl.current) URL.revokeObjectURL(stagedUrl.current)
    stagedUrl.current = null
    setStaged(null)
    setError(null)
    setSteps(idle())
  }, [])

  useEffect(
    () => () => {
      if (stagedUrl.current) URL.revokeObjectURL(stagedUrl.current)
    },
    [],
  )

  const onRecorded = useCallback((file: File) => stage(file, 'recording'), [stage])
  const recorder = useRecorder(onRecorded)

  const analyze = useCallback(async () => {
    if (!staged || busy) return
    const { file, source } = staged
    setBusy(true)
    setError(null)
    let current = 0
    setSteps(progress(0))
    try {
      const features = await extractFeatures(file)
      current = 1
      setSteps(progress(1))
      const result = await inference.analyze({ file, source, features })
      current = 2
      setSteps(progress(2))
      urls.current.set(result.id, URL.createObjectURL(file))
      onDone(result)
      setSteps(idle())
      if (stagedUrl.current) URL.revokeObjectURL(stagedUrl.current)
      stagedUrl.current = null
      setStaged(null)
    } catch (e) {
      setSteps(progress(current, true))
      setError(e instanceof Error ? e.message : 'No se pudo analizar el audio.')
    } finally {
      setBusy(false)
    }
  }, [staged, busy, onDone])

  const forget = useCallback((id: string) => {
    const url = urls.current.get(id)
    if (url) URL.revokeObjectURL(url)
    urls.current.delete(id)
  }, [])

  const audioUrl = useCallback((id: string) => urls.current.get(id), [])

  return { staged, stage, clearStaged, busy, steps, error, analyze, recorder, audioUrl, forget }
}

export type AnalysisSession = ReturnType<typeof useAnalysisSession>
