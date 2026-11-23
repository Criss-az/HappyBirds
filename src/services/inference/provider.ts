/** Indica si las predicciones de la interfaz son simuladas. */
export const isSimulatedProvider = (import.meta.env.VITE_INFERENCE_PROVIDER ?? 'mock').trim().toLowerCase() !== 'http'
