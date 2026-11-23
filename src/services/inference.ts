import type { InferenceService } from '../types'
import { mockInference } from './mockInference'

/**
 * Punto único de integración con el modelo.
 * Hoy usa la simulación. Cuando exista el backend, devolver un servicio HTTP
 * que cumpla InferenceService (ver docs/PLAN.md, sección "Contrato de la API").
 */
export const inference: InferenceService = mockInference
