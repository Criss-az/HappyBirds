import type { AnalysisResult, AnalyzeRequest, InferenceService } from '../../types'
import { toWav16kMono } from '../../shared/lib/audio/toWav16kMono'
import { activeAdapter } from './adapters'
import { assertPredictionResponse } from './validate'

const TIMEOUT_MS = 120_000

function wavName(name: string): string {
  return `${name.replace(/\.[^./\\]+$/, '') || 'audio'}.wav`
}

function originalFormat(file: File): string {
  return file.type || file.name.split('.').pop()?.toLowerCase() || 'desconocido'
}

async function buildForm({ file, features }: AnalyzeRequest): Promise<{ form: FormData; sourceFormat?: string }> {
  const form = new FormData()
  try {
    const wav = await toWav16kMono(file, { preferredStartSec: features.windowStartSec })
    form.append('audio', wav, wavName(file.name))
    return { form }
  } catch {
    const sourceFormat = originalFormat(file)
    form.append('audio', file, file.name)
    form.append('sourceFormat', sourceFormat)
    return { form, sourceFormat }
  }
}

export const httpInference: InferenceService = {
  async analyze(req: AnalyzeRequest): Promise<AnalysisResult> {
    const base = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')
    if (!base) throw new Error('Falta configurar VITE_API_URL para conectar con el modelo.')

    const { form, sourceFormat } = await buildForm(req)
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch(`${base}/predict`, { method: 'POST', body: form, signal: controller.signal })
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw new Error('El modelo tardó demasiado en responder. Inténtalo de nuevo.')
      }
      throw new Error('No se pudo conectar con el modelo. Revisa VITE_API_URL y que el servicio esté activo.')
    } finally {
      window.clearTimeout(timer)
    }

    if (!response.ok) throw new Error(`El servicio del modelo respondió con un error (HTTP ${response.status}).`)

    let raw: unknown
    try {
      raw = await response.json()
    } catch {
      throw new Error('La respuesta del modelo no es un JSON válido.')
    }

    let data: unknown
    try {
      data = activeAdapter(raw)
    } catch {
      throw new Error('El adaptador no pudo traducir la respuesta del modelo al contrato.')
    }
    assertPredictionResponse(data)

    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      source: req.source,
      fileName: req.file.name,
      mimeType: req.file.type || 'audio/desconocido',
      sizeBytes: req.file.size,
      features: req.features,
      top: [...data.top].sort((a, b) => b.probability - a.probability),
      speciesMetrics: data.speciesMetrics,
      warnings: data.warnings,
      simulated: false,
      modelVersion: data.modelVersion,
      modelWindow: data.window,
      ...(sourceFormat ? { sourceFormat } : {}),
    }
  },
}
