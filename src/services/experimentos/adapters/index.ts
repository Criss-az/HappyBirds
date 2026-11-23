import type { ExperimentAdapter } from '../types'
import { kerasColabAdapter } from './kerasColab'
import { pytorchP2Adapter } from './pytorchP2'

/** Formatos conocidos. Un Colab con otra salida agrega aquí su adaptador. */
export const ARTIFACT_ADAPTERS: Record<string, ExperimentAdapter> = {
  'pytorch-p2': pytorchP2Adapter,
  'keras-colab': kerasColabAdapter,
}
