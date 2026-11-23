import { parseCsv } from '../../shared/lib/csv'
import { ARTIFACT_ADAPTERS } from './adapters'
import type { ArtifactReader, ExperimentData, ExperimentMeta } from './types'

// Cada carpeta de modelo/artefactos con un experimento.json es un Colab. Se cargan bajo demanda.
const FILES = import.meta.glob<string>('/modelo/artefactos/*/*.{json,csv}', { query: '?raw', import: 'default' })

const PATH = /^\/modelo\/artefactos\/([^/]+)\/([^/]+)$/

function folderFiles(folder: string): Map<string, () => Promise<string>> {
  const out = new Map<string, () => Promise<string>>()
  for (const [path, load] of Object.entries(FILES)) {
    const m = path.match(PATH)
    if (m?.[1] === folder) out.set(m[2], load)
  }
  return out
}

function reader(folder: string): ArtifactReader {
  const files = folderFiles(folder)
  return {
    has: (name) => files.has(name),
    async json<T>(name: string) {
      const load = files.get(name)
      if (!load) return null
      try {
        return JSON.parse(await load()) as T
      } catch {
        throw new Error(`El archivo ${name} de "${folder}" no es un JSON válido.`)
      }
    },
    async csv(name) {
      const load = files.get(name)
      return load ? parseCsv(await load()) : null
    },
  }
}

export interface ExperimentList {
  items: ExperimentMeta[]
  /** Carpetas con una ficha inválida: se avisan, pero no impiden usar las demás. */
  problems: string[]
}

export async function listExperiments(): Promise<ExperimentList> {
  const folders = [...new Set(Object.keys(FILES).flatMap((p) => p.match(PATH)?.[1] ?? []))].sort()
  const items: ExperimentMeta[] = []
  const problems: string[] = []

  await Promise.all(
    folders.map(async (folder) => {
      try {
        const meta = await reader(folder).json<ExperimentMeta>('experimento.json')
        if (!meta) throw new Error(`"${folder}" no tiene experimento.json.`)
        if (!meta.nombre || !meta.formato) throw new Error(`"${folder}": faltan "nombre" o "formato".`)
        if (!ARTIFACT_ADAPTERS[meta.formato]) throw new Error(`"${folder}": formato "${meta.formato}" desconocido.`)
        items.push({ ...meta, id: folder, origen: meta.origen === 'ejemplo' ? 'ejemplo' : 'artefactos' })
      } catch (e) {
        problems.push(e instanceof Error ? e.message : `No se pudo leer "${folder}".`)
      }
    }),
  )
  items.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  return { items, problems: problems.sort() }
}

const cache = new Map<string, Promise<ExperimentData>>()

export function loadExperiment(meta: ExperimentMeta): Promise<ExperimentData> {
  let data = cache.get(meta.id)
  if (!data) {
    data = ARTIFACT_ADAPTERS[meta.formato](reader(meta.id))
    data.catch(() => cache.delete(meta.id))
    cache.set(meta.id, data)
  }
  return data
}
