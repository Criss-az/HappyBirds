import type { AnalysisResult, AnalyzeRequest, InferenceService } from '../../types'
import { SPECIES } from './mockSpecies'

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(seed: number) {
  let s = seed || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

/**
 * Simulación determinista: el mismo archivo da siempre el mismo resultado.
 * No analiza el sonido; solo permite construir y probar la interfaz.
 */
export const mockInference: InferenceService = {
  async analyze({ file, source, features }: AnalyzeRequest): Promise<AnalysisResult> {
    await new Promise((r) => setTimeout(r, 1400))
    const rand = rng(hash(`${file.name}|${file.size}|${Math.round(features.durationSec * 10)}`))

    const order = [...SPECIES].sort(() => rand() - 0.5).slice(0, 3)
    const logits = order.map((_, i) => (i === 0 ? 1.2 + rand() * 2.4 : rand() * 1.6))
    const exp = logits.map(Math.exp)
    const sum = exp.reduce((a, b) => a + b, 0)
    const top = order.map((s, i) => ({ ...s, probability: exp[i] / sum })).sort((a, b) => b.probability - a.probability)

    const warnings: string[] = []
    if (top[0].probability < 0.5) warnings.push('Confianza baja: varias especies tienen probabilidades parecidas.')
    if (features.durationSec < 3) warnings.push('El audio es corto; el modelo espera una ventana de 5 s.')

    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      source,
      fileName: file.name,
      mimeType: file.type || 'audio/desconocido',
      sizeBytes: file.size,
      features,
      top,
      speciesMetrics: {
        f1: 0.55 + rand() * 0.37,
        recall: 0.5 + rand() * 0.42,
        testSamples: 2 + Math.floor(rand() * 9),
      },
      warnings,
      simulated: true,
    }
  },
}
