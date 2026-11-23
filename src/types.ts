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
  speciesMetrics: { f1: number; recall: number; testSamples: number }
  warnings: string[]
  simulated: boolean
}

export interface AnalyzeRequest {
  file: File
  source: Source
  features: AudioFeatures
}

export interface InferenceService {
  analyze(req: AnalyzeRequest): Promise<AnalysisResult>
}
