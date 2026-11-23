# Plan del frontend — Reconocimiento de aves de Bolivia

Materia: Machine Learning · Grupo 7 · Parte a cargo: interfaz (frontend).

## 1. Qué problema resuelve el sistema

El usuario entrega una grabación de un ave y el sistema devuelve la especie más probable y datos del análisis. El modelo (notebook de Colab) es aprendizaje supervisado con Deep Learning: una CNN que clasifica espectrogramas Mel de 5 s (mono, 16 kHz, 96 bandas) y termina en Softmax con una probabilidad por especie.

## 2. Qué implica para la interfaz

- Entrada: archivo de audio (WAV, MP3, OGG, FLAC, M4A, WEBM) o grabación del micrófono. El navegador no necesita convertir el formato: el backend lo decodifica con librosa/ffmpeg. En la interfaz solo se decodifica para mostrar el espectrograma.
- Salida del modelo hoy: top-3 de especies con probabilidad Softmax, más métricas globales y por especie del conjunto de prueba (F1, recall).
- Honestidad del resultado: la probabilidad no está calibrada y el modelo siempre elige una especie conocida. Por eso la interfaz muestra advertencias de confianza baja y una sección de limitaciones.
- Dataset pequeño: las métricas por especie dependen de pocos audios de prueba. Se muestra la cantidad junto al F1.

## 3. Pantallas (según los bocetos)

1. Carga: zona central con "Cargar audio" (clic o arrastrar) y botón de micrófono. Vista previa con reproductor y botón Analizar.
2. Resultado: especie principal con anillo de probabilidad, candidatas, fiabilidad de la especie, espectrograma, datos del audio.
3. Barra izquierda: historial de audios analizados (como la lista de chats). Al hacer clic se abre su resultado.
4. Panel derecho: información general (modelo, formatos, consejos, limitaciones). Queda libre para ayuda o controles más adelante.

## 4. Diseño visual

Idea: el fénix. Magenta/fucsia como color principal, violeta y azul ultramar como fondo, y una brasa ámbar solo en detalles (logo, barras, anillo).

| Uso | Color |
|---|---|
| Fondo | #0d0614 |
| Magenta | #b5174f |
| Fucsia | #d6246e |
| Fucsia claro | #ff5a8a |
| Violeta | #6a1b9a |
| Ultramar | #1a2a7a |
| Brasa | #ffb347 |

Estilo: paneles translúcidos con desenfoque, degradados suaves, bordes finos, tipografía del sistema. Se evita el brillo neón excesivo y los iconos decorativos para que no parezca una plantilla genérica de IA.

## 5. Arquitectura

- React + TypeScript + Vite, CSS propio con variables (sin librerías de UI).
- `src/services/inference.ts` es el único punto de conexión con el modelo. Hoy usa `mockInference` (resultado determinista por archivo).
- `src/lib/spectrogram.ts` calcula en el navegador un espectrograma Mel aproximado de la ventana más energética de 5 s. Es visual, no es la entrada real de la CNN.
- Historial en `localStorage` (solo metadatos y espectrograma reducido, no el audio).

## 6. Contrato de la API (propuesta para el backend)

`POST /api/predict` con `multipart/form-data`, campo `audio`.

```json
{
  "top": [
    { "id": "ara-ararauna", "commonName": "Paraba azul y amarilla", "scientificName": "Ara ararauna", "probability": 0.71 }
  ],
  "speciesMetrics": { "f1": 0.82, "recall": 0.8, "testSamples": 4 },
  "window": { "startSec": 12.5, "durationSec": 5 },
  "warnings": []
}
```

El backend puede ser FastAPI cargando `mejor_modelo_aves_bolivia.keras` y `configuracion_modelo.json` (lista de clases). Al estar listo, se escribe un `httpInference` que adapte esta respuesta a `AnalysisResult` y se cambia una línea en `inference.ts`.

## 7. Hoja de ruta

1. [hecho] Repositorio, carga, grabación, resultado con datos simulados, historial.
2. Ajustar diseño con el equipo (paneles laterales, textos, logo).
3. Backend de inferencia y servicio HTTP.
4. Nombres comunes reales de las especies y fotos con licencia.
5. Despliegue (por ejemplo Vercel o Netlify para el frontend).

## 8. Preguntas abiertas para el equipo

- ¿Cuántas especies y cuáles tendrá el modelo final?
- ¿Habrá backend propio o se ejecutará todo desde Colab?
- ¿Qué debe mostrar el panel derecho: ayuda, controles o datos de la especie?
