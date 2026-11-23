export interface ExperimentAudio {
  sampleRate?: number
  ventanaSec?: number
  bandasMel?: number
  fminHz?: number
  fmaxHz?: number
}

/** Contenido de experimento.json, la ficha de cada Colab. */
export interface ExperimentMeta {
  id: string
  nombre: string
  descripcion?: string
  formato: string
  framework?: string
  /** "ejemplo" muestra la insignia "Datos de ejemplo". */
  origen: 'artefactos' | 'ejemplo'
  fuente?: string
  audio?: ExperimentAudio
}

export interface GlobalMetrics {
  accuracy: number
  precisionMacro: number
  recallMacro: number
  f1Macro: number
  loss: number
  top3?: number
  top5?: number
  f1Weighted?: number
  testRecordings?: number
  numClasses?: number
  bestEpoch?: number
  params?: number
}

export interface EpochPoint {
  epoch: number
  trainLoss: number
  valLoss: number
  trainAccuracy: number
  valAccuracy: number
}

export interface SpeciesReport {
  species: string
  precision: number
  recall: number
  f1: number
  support: number
}

export interface ConfusionData {
  labels: string[]
  matrix: number[][]
  top: Array<{ trueSpecies: string; predictedSpecies: string; count: number }>
}

export interface SegmentPerformance {
  label: string
  count: number
  accuracy: number
  avgConfidence?: number
}

export interface DatasetSpecies {
  species: string
  total: number
  qualityA?: number
  qualityB?: number
  qualityC?: number
  avgDurationSec?: number
  medianDurationSec?: number
  train?: number
  validation?: number
  test?: number
}

export interface DatasetSummary {
  total: number
  numSpecies: number
  quality?: Record<string, number>
  vocalization?: Record<string, number>
  formats?: Record<string, number>
  duration?: { medianSec: number; minSec: number; maxSec: number; totalHours: number }
  histogram?: Array<{ range: string; count: number }>
  species: DatasetSpecies[]
  audit?: { rawRows: number; sourceFile?: string; excluded: Array<{ label: string; count: number }> }
}

export interface Recording {
  id: string
  species: string
  quality?: string
  vocalization?: string
  durationSec?: number
  split?: string
}

/** Forma común de cualquier Colab. Lo que un notebook no exporte queda en null o vacío. */
export interface ExperimentData {
  metrics: GlobalMetrics | null
  history: EpochPoint[]
  perSpecies: SpeciesReport[]
  confusion: ConfusionData | null
  byQuality: SegmentPerformance[]
  byVocalization: SegmentPerformance[]
  dataset: DatasetSummary | null
  loadRecordings: () => Promise<Recording[]>
}

export interface ArtifactReader {
  has(name: string): boolean
  json<T>(name: string): Promise<T | null>
  csv(name: string): Promise<Array<Record<string, string>> | null>
}

export type ExperimentAdapter = (files: ArtifactReader) => Promise<ExperimentData>
