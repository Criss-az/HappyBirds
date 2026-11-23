import type { DatasetSummary, EpochPoint, ExperimentAdapter, GlobalMetrics, Recording, SpeciesReport } from '../types'

interface RawGeneral {
  accuracy: number
  precisionMacro?: number
  precision_macro?: number
  recallMacro?: number
  recall_macro?: number
  f1Macro?: number
  f1_macro?: number
  loss?: number
  test_loss?: number
}

interface RawResumen {
  totalRecordings: number
  species: Array<{ id: string; train?: number; validation?: number; test?: number; total: number }>
}

const num = (v: string | undefined) => (v === undefined || v === '' ? undefined : Number(v))
const first = (row: Record<string, string>, keys: string[]) => keys.map((k) => row[k]).find((v) => v !== undefined)

function metrics(m: RawGeneral | null): GlobalMetrics | null {
  if (!m) return null
  return {
    accuracy: m.accuracy,
    precisionMacro: m.precisionMacro ?? m.precision_macro ?? 0,
    recallMacro: m.recallMacro ?? m.recall_macro ?? 0,
    f1Macro: m.f1Macro ?? m.f1_macro ?? 0,
    loss: m.loss ?? m.test_loss ?? 0,
  }
}

function dataset(r: RawResumen | null): DatasetSummary | null {
  if (!r) return null
  return {
    total: r.totalRecordings,
    numSpecies: r.species.length,
    species: r.species.map((s) => ({
      species: s.id,
      total: s.total,
      train: s.train,
      validation: s.validation,
      test: s.test,
    })),
  }
}

/** Salida estándar del notebook de Keras (ver docs/contrato-modelo.md). */
export const kerasColabAdapter: ExperimentAdapter = async (files) => {
  const [general, porEspecie, resumen, historial] = await Promise.all([
    files.json<RawGeneral>('metricas_generales.json'),
    files.csv('metricas_por_especie.csv'),
    files.json<RawResumen>('dataset_resumen.json'),
    files.csv('historial_entrenamiento.csv'),
  ])

  const perSpecies: SpeciesReport[] = (porEspecie ?? []).map((r) => ({
    species: first(r, ['especie', 'species', 'clase', 'id']) ?? '',
    precision: num(r.precision) ?? 0,
    recall: num(r.recall) ?? 0,
    f1: num(first(r, ['f1', 'f1_score', 'f1-score'])) ?? 0,
    support: num(first(r, ['support', 'soporte', 'test_samples'])) ?? 0,
  }))
  // CSVLogger de Keras numera las épocas desde 0.
  const firstEpoch = num(first(historial?.[0] ?? {}, ['epoch', 'epoca'])) ?? 0
  const offset = firstEpoch === 0 ? 1 : 0
  const history: EpochPoint[] = (historial ?? []).map((r, i) => ({
    epoch: (num(first(r, ['epoch', 'epoca'])) ?? i) + offset,
    trainLoss: num(r.loss) ?? 0,
    valLoss: num(r.val_loss) ?? 0,
    trainAccuracy: num(r.accuracy) ?? 0,
    valAccuracy: num(r.val_accuracy) ?? 0,
  }))

  return {
    metrics: metrics(general),
    history,
    perSpecies,
    confusion: null,
    byQuality: [],
    byVocalization: [],
    dataset: dataset(resumen),
    loadRecordings: async () => {
      const rows = await files.csv('grabaciones.csv')
      return (rows ?? []).map((r): Recording => ({
        id: r.id,
        species: first(r, ['especie', 'species']) ?? '',
        quality: r.calidad,
        vocalization: first(r, ['tipo_vocalizacion_principal', 'tipo_vocalizacion']),
        durationSec: num(r.duracion_seg),
        split: first(r, ['split', 'particion']),
      }))
    },
  }
}
