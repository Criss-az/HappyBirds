import type { InferenceService } from '../../types'
import { httpInference } from './http'
import { mockInference } from './mock'

function selectProvider(): InferenceService {
  const provider = (import.meta.env.VITE_INFERENCE_PROVIDER ?? 'mock').trim().toLowerCase()
  if (provider === 'http') return httpInference
  if (provider !== 'mock') console.warn(`VITE_INFERENCE_PROVIDER="${provider}" no existe. Se usa "mock".`)
  return mockInference
}

/** Punto único de integración con el modelo. El contrato está en docs/contrato-modelo.md. */
export const inference: InferenceService = selectProvider()
