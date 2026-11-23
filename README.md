# HappyBirds · Reconocimiento de aves de Bolivia

Interfaz web para el proyecto del Grupo 7 de Machine Learning. Permite cargar o grabar un audio y muestra la especie más probable y los datos del análisis.

Estado: los resultados son simulados. La interfaz todavía no está conectada al modelo CNN del notebook.

## Requisitos

Node.js 18 o superior.

## Uso

```bash
npm install
npm run dev
```

Abre la dirección que muestra la terminal (normalmente http://localhost:5173). Para generar la versión de producción: `npm run build`.

El micrófono solo funciona en `localhost` o con HTTPS.

## Estructura

```
src/
  components/   Sidebar, UploadView, ResultView, InfoPanel, Spectrogram, Icons
  hooks/        useRecorder (micrófono), useHistory (historial en localStorage)
  lib/          spectrogram.ts (Mel aproximado en el navegador), format.ts
  services/     inference.ts (conexión con el modelo), mockInference.ts, mockSpecies.ts
  styles/       tokens.css (colores), app.css
docs/PLAN.md   Plan, diseño, contrato de API y hoja de ruta
```

## Conectar el modelo real

1. Exponer el modelo con un backend (`POST /api/predict`, ver `docs/PLAN.md`).
2. Crear un servicio que cumpla `InferenceService` (`src/types.ts`).
3. Exportarlo desde `src/services/inference.ts` en lugar de `mockInference`.

## Notas del modelo (notebook)

CNN sobre espectrogramas Mel de 5 s, 16 kHz, 96 bandas, Softmax por especie. La probabilidad no está calibrada y el modelo no detecta especies fuera de su catálogo.
