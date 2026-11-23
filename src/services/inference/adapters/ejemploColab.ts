import type { PredictionResponse } from '../../../types'
import type { PredictionAdapter } from './index'

/** Forma hipotética de la salida de un Colab. Sirve de plantilla: cámbiala por la de tu notebook. */
interface SalidaColab {
  predicciones: Array<{ clase: string; nombre_comun: string; nombre_cientifico: string; probabilidad: number }>
  metricas: { f1: number; recall: number; n_prueba: number }
  ventana: { inicio: number; duracion: number }
  version: string
  avisos?: string[]
}

export const ejemploColabAdapter: PredictionAdapter = (raw) => {
  const r = raw as SalidaColab
  const response: PredictionResponse = {
    top: r.predicciones.map((p) => ({
      id: p.clase,
      commonName: p.nombre_comun,
      scientificName: p.nombre_cientifico,
      probability: p.probabilidad,
    })),
    speciesMetrics: { f1: r.metricas.f1, recall: r.metricas.recall, testSamples: r.metricas.n_prueba },
    window: { startSec: r.ventana.inicio, durationSec: r.ventana.duracion },
    modelVersion: r.version,
    warnings: r.avisos ?? [],
  }
  return response
}
