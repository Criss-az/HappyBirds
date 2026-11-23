export type Source = 'upload' | 'recording'

export interface Candidate {
  id: string
  commonName: string
  scientificName: string
  probability: number
}

export interface SpectrogramData {
  w: number
  h: number
  /** Valores 0–255 en base64, fila por fila (la fila 0 es la frecuencia más baja). */
  b64: string
}

export interface AudioFeatures {
  durationSec: number
  sampleRate: number
  windowStartSec: number
  windowSec: number
  spectrogram: SpectrogramData
  /** Unos 200 picos de la forma de onda (0–255) en base64. No existe en historial antiguo. */
  peaks?: string
}

export interface SpeciesMetrics {
  f1: number
  recall: number
  testSamples: number
}

export interface PredictionWindow {
  startSec: number
  durationSec: number
}

/** Respuesta JSON de POST /predict. Ver docs/contrato-modelo.md. */
export interface PredictionResponse {
  /** Al menos una especie. */
  top: Candidate[]
  speciesMetrics: SpeciesMetrics
  window: PredictionWindow
  modelVersion: string
  warnings: string[]
}

export interface AnalysisResult {
  id: string
  createdAt: string
  source: Source
  fileName: string
  mimeType: string
  sizeBytes: number
  features: AudioFeatures
  /** Ordenadas de mayor a menor probabilidad. */
  top: Candidate[]
  /** Métricas de la especie ganadora en el conjunto de prueba del modelo. */
  speciesMetrics: SpeciesMetrics
  warnings: string[]
  simulated: boolean
  /** Versión del modelo que respondió. No existe en resultados simulados ni en historial antiguo. */
  modelVersion?: string
  /** Ventana que usó el modelo, según su respuesta. */
  modelWindow?: PredictionWindow
  /** Formato original, solo si no se pudo convertir a WAV y se envió el archivo tal cual. */
  sourceFormat?: string
}

export interface AnalyzeRequest {
  file: File
  source: Source
  features: AudioFeatures
}

export interface InferenceService {
  analyze(req: AnalyzeRequest): Promise<AnalysisResult>
}
