import { AudioLines, ChartColumn, Database, History, Info, Lock, type LucideIcon } from 'lucide-react'
import type { RouteName } from './useHashRoute'

export interface RouteMeta {
  label: string
  title: string
  description: string
  icon: LucideIcon
  badge?: string
}

export const ROUTE_META: Record<RouteName, RouteMeta> = {
  analizar: {
    label: 'Identificar ave',
    title: 'Identificar especie por canto o llamado',
    description:
      'Sube una grabación de campo o usa el micrófono para estimar a qué especie de ave de Bolivia corresponde el sonido.',
    icon: AudioLines,
  },
  historial: {
    label: 'Historial',
    title: 'Historial de análisis',
    description: 'Los audios que analizaste en este navegador. Puedes volver a ver o eliminar cada resultado.',
    icon: History,
  },
  dataset: {
    label: 'Dataset',
    title: 'Dataset de entrenamiento',
    description: 'Resumen y grabaciones del CSV del Colab activo: especies, calidad, duración y particiones.',
    icon: Database,
  },
  modelo: {
    label: 'Métricas del modelo',
    title: 'Métricas del modelo',
    description:
      'Desempeño del Colab activo en el conjunto de prueba: curvas de entrenamiento, matriz de confusión y reporte por especie.',
    icon: ChartColumn,
  },
  'no-supervisado': {
    label: 'No supervisado',
    title: 'Aprendizaje no supervisado',
    description: 'Espacio reservado para el segundo modelo de la práctica.',
    icon: Lock,
    badge: 'Próximamente',
  },
  acerca: {
    label: 'Acerca de',
    title: 'Acerca del proyecto',
    description: 'Metodología, limitaciones, equipo y créditos.',
    icon: Info,
  },
}

export const NAV_GROUPS: Array<{ label: string; routes: RouteName[] }> = [
  { label: 'Analizar', routes: ['analizar', 'historial'] },
  { label: 'Modelo', routes: ['dataset', 'modelo', 'no-supervisado'] },
  { label: 'Proyecto', routes: ['acerca'] },
]

export const groupOf = (name: RouteName) => NAV_GROUPS.find((g) => g.routes.includes(name))?.label ?? ''
