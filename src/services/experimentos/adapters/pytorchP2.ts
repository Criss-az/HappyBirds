import type {
  ConfusionData,
  DatasetSummary,
  EpochPoint,
  ExperimentAdapter,
  GlobalMetrics,
  Recording,
  SpeciesReport,
} from '../types'

interface RawMetrics {
  test_loss: number
  accuracy: number
  top3_accuracy?: number
  top5_accuracy?: number
  precision_macro: number
  recall_macro: number
  f1_macro: number
  f1_weighted?: number
  num_test_recordings?: number
  num_classes?: number
  best_epoch?: number
  model_params?: number
}

interface RawStats {
  total_clean_records: number
  num_species: number
  quality_distribution?: Record<string, number>
  vocalization_distribution?: Record<string, number>
  audio_format_distribution?: Record<string, number>
  duration_stats?: { median_sec: number; min_sec: number; max_sec: number; total_hours: number }
  duration_histogram?: Array<{ range: string; count: number }>
  species_breakdown?: Array<{
    especie: string
    total: number
    quality_a: number
    quality_b: number
    quality_c: number
    avg_duration_sec: number
    median_duration_sec: number
  }>
  cleaning_audit?: {
    raw_total_rows: number
    output_csv?: string
    exclusion_summary?: Record<string, number>
  }
}

interface RawQuality {
  by_quality?: Array<{ calidad: string; count: number; accuracy: number; avg_confidence?: number }>
  by_vocalization?: Array<{ tipo_vocalizacion: string; count: number; accuracy: number; avg_confidence?: number }>
}

const EXCLUSION_LABELS: Record<string, string> = {
  mystery_mystery: 'Mystery mystery',
  missing_file: 'Archivos faltantes',
  corrupted_or_unreadable: 'Archivos corruptos',
}

function metrics(m: RawMetrics | null): GlobalMetrics | null {
  if (!m) return null
  return {
    accuracy: m.accuracy,
    precisionMacro: m.precision_macro,
    recallMacro: m.recall_macro,
    f1Macro: m.f1_macro,
    loss: m.test_loss,
    top3: m.top3_accuracy,
    top5: m.top5_accuracy,
    f1Weighted: m.f1_weighted,
    testRecordings: m.num_test_recordings,
    numClasses: m.num_classes,
    bestEpoch: m.best_epoch,
    params: m.model_params,
  }
}

function dataset(s: RawStats | null): DatasetSummary | null {
  if (!s) return null
  const d = s.duration_stats
  const audit = s.cleaning_audit
  return {
    total: s.total_clean_records,
    numSpecies: s.num_species,
    quality: s.quality_distribution,
    vocalization: s.vocalization_distribution,
    formats: s.audio_format_distribution,
    duration: d && { medianSec: d.median_sec, minSec: d.min_sec, maxSec: d.max_sec, totalHours: d.total_hours },
    histogram: s.duration_histogram,
    species: (s.species_breakdown ?? []).map((r) => ({
      species: r.especie,
      total: r.total,
      qualityA: r.quality_a,
      qualityB: r.quality_b,
      qualityC: r.quality_c,
      avgDurationSec: r.avg_duration_sec,
      medianDurationSec: r.median_duration_sec,
    })),
    audit: audit && {
      rawRows: audit.raw_total_rows,
      sourceFile: audit.output_csv,
      excluded: Object.entries(audit.exclusion_summary ?? {}).map(([k, count]) => ({
        label: EXCLUSION_LABELS[k] ?? k,
        count,
      })),
    },
  }
}

/** Artefactos de machineLearningP2 (CNN 2D en PyTorch). */
export const pytorchP2Adapter: ExperimentAdapter = async (files) => {
  const [m, h, report, cm, quality, stats] = await Promise.all([
    files.json<RawMetrics>('test_metrics.json'),
    files.json<{ history?: Array<Record<string, number>> }>('training_history.json'),
    files.json<Array<{ especie: string; precision: number; recall: number; f1_score: number; support: number }>>(
      'classification_report.json',
    ),
    files.json<{
      labels: string[]
      matrix: number[][]
      top_confusions?: Array<{ true_species: string; predicted_species: string; count: number }>
    }>('confusion_matrix.json'),
    files.json<RawQuality>('quality_error_analysis.json'),
    files.json<RawStats>('dataset_stats.json'),
  ])

  const history: EpochPoint[] = (h?.history ?? []).map((e) => ({
    epoch: e.epoch,
    trainLoss: e.train_loss,
    valLoss: e.val_loss,
    trainAccuracy: e.train_accuracy,
    valAccuracy: e.val_accuracy,
  }))
  const perSpecies: SpeciesReport[] = (report ?? []).map((r) => ({
    species: r.especie,
    precision: r.precision,
    recall: r.recall,
    f1: r.f1_score,
    support: r.support,
  }))
  const confusion: ConfusionData | null = cm && {
    labels: cm.labels,
    matrix: cm.matrix,
    top: (cm.top_confusions ?? []).map((t) => ({
      trueSpecies: t.true_species,
      predictedSpecies: t.predicted_species,
      count: t.count,
    })),
  }

  return {
    metrics: metrics(m),
    history,
    perSpecies,
    confusion,
    byQuality: (quality?.by_quality ?? []).map((q) => ({
      label: `Calidad ${q.calidad}`,
      count: q.count,
      accuracy: q.accuracy,
      avgConfidence: q.avg_confidence,
    })),
    byVocalization: (quality?.by_vocalization ?? []).map((v) => ({
      label: v.tipo_vocalizacion,
      count: v.count,
      accuracy: v.accuracy,
      avgConfidence: v.avg_confidence,
    })),
    dataset: dataset(stats),
    loadRecordings: async () => {
      const rows = await files.csv('splits.csv')
      return (rows ?? []).map((r): Recording => ({
        id: r.id,
        species: r.especie,
        quality: r.calidad,
        vocalization: r.tipo_vocalizacion_principal,
        durationSec: Number(r.duracion_seg),
        split: r.split,
      }))
    },
  }
}
