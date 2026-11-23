/** Traduce la respuesta cruda de un modelo al formato del contrato (PredictionResponse). */
export type PredictionAdapter = (raw: unknown) => unknown

/** Para modelos que ya cumplen el contrato. */
export const passthroughAdapter: PredictionAdapter = (raw) => raw

/** Adaptador en uso. Para otro Colab, importa aquí su adaptador y asígnalo. */
export const activeAdapter: PredictionAdapter = passthroughAdapter
