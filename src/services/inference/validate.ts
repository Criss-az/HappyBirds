import type { PredictionResponse } from '../../types'

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const isRatio = (v: unknown) => isNumber(v) && v >= 0 && v <= 1

/** Devuelve la lista de incumplimientos del contrato. Vacía si la respuesta es válida. */
export function contractErrors(value: unknown): string[] {
  if (!isRecord(value)) return ['la respuesta no es un objeto JSON']
  const errors: string[] = []

  if (!Array.isArray(value.top) || value.top.length === 0) {
    errors.push('"top" debe ser una lista con al menos una especie')
  } else {
    value.top.forEach((c: unknown, i) => {
      if (!isRecord(c)) {
        errors.push(`top[${i}] no es un objeto`)
        return
      }
      for (const key of ['id', 'commonName', 'scientificName']) {
        if (!isText(c[key])) errors.push(`top[${i}].${key} debe ser un texto no vacío`)
      }
      if (!isRatio(c.probability)) errors.push(`top[${i}].probability debe ser un número entre 0 y 1`)
    })
  }

  const m = value.speciesMetrics
  if (!isRecord(m)) {
    errors.push('falta "speciesMetrics"')
  } else {
    if (!isRatio(m.f1)) errors.push('speciesMetrics.f1 debe ser un número entre 0 y 1')
    if (!isRatio(m.recall)) errors.push('speciesMetrics.recall debe ser un número entre 0 y 1')
    if (!Number.isInteger(m.testSamples) || (m.testSamples as number) < 0) {
      errors.push('speciesMetrics.testSamples debe ser un entero mayor o igual a 0')
    }
  }

  const w = value.window
  if (!isRecord(w)) {
    errors.push('falta "window"')
  } else {
    if (!isNumber(w.startSec) || w.startSec < 0) errors.push('window.startSec debe ser un número mayor o igual a 0')
    if (!isNumber(w.durationSec) || w.durationSec <= 0) errors.push('window.durationSec debe ser un número mayor a 0')
  }

  if (!isText(value.modelVersion)) errors.push('"modelVersion" debe ser un texto no vacío')
  if (!Array.isArray(value.warnings) || !value.warnings.every((x) => typeof x === 'string')) {
    errors.push('"warnings" debe ser una lista de textos')
  }
  return errors
}

export function assertPredictionResponse(value: unknown): asserts value is PredictionResponse {
  const errors = contractErrors(value)
  if (errors.length > 0) {
    throw new Error(`La respuesta del modelo no cumple el contrato: ${errors.slice(0, 3).join('; ')}.`)
  }
}
