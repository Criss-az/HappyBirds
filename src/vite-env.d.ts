/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Proveedor de inferencia: "mock" (por defecto) o "http". */
  readonly VITE_INFERENCE_PROVIDER?: string
  /** URL base del servicio del modelo, sin /predict. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
