# Plan del frontend de HappyBirds — Reconocimiento de aves de Bolivia

Materia: Machine Learning · Grupo 7 · Parte a cargo: interfaz (frontend).

## 1. Qué problema resuelve el sistema

El usuario entrega una grabación de un ave y el sistema devuelve la especie más probable y datos del análisis. El modelo (notebook de Colab) es aprendizaje supervisado con Deep Learning: una CNN que clasifica espectrogramas Mel de 5 s (mono, 16 kHz, 96 bandas) y termina en Softmax con una probabilidad por especie.

## 2. Qué implica para la interfaz

- Entrada: archivo de audio (WAV, MP3, OGG, FLAC, M4A, WEBM) o grabación del micrófono. Antes de enviarlo, el navegador lo convierte a WAV PCM 16-bit, mono, 16 kHz (máximo 60 s). Si falla, envía el original con `sourceFormat`.
- Salida del modelo hoy: top-3 de especies con probabilidad Softmax, más métricas globales y por especie del conjunto de prueba (F1, recall).
- Honestidad del resultado: la probabilidad no está calibrada y el modelo siempre elige una especie conocida. Por eso la interfaz muestra advertencias de confianza baja y una sección de limitaciones.
- Dataset pequeño: las métricas por especie dependen de pocos audios de prueba. Se muestra la cantidad junto al F1.

## 3. Pantallas

1. Identificar Ave: carga o grabación, estado del análisis, resultado y últimas predicciones.
2. Historial: tabla completa con filtro por especie.
3. Dataset: estadísticas y grabaciones del CSV del Colab elegido.
4. Métricas del Modelo: indicadores, curvas, matriz de confusión y reporte por especie.
5. No Supervisado: espacio reservado para la siguiente entrega.
6. Acerca de: metodología, limitaciones, equipo y créditos.

## 4. Diseño visual

Estilo clásico de ventanas con barra de título en tonos verdes, traído de `machineLearningP2`, con modo claro y oscuro. Los valores están en `src/shared/styles/tokens.css`. Algunos tonos se ajustaron para cumplir el contraste WCAG AA.

## 5. Arquitectura

- React + TypeScript + Vite, CSS propio con tokens (sin librerías de UI).
- `src/features/` agrupa cada funcionalidad: `analisis`, `historial`, `dataset`, `modelo`, `no-supervisado` e `informacion`.
- `src/services/experimentos/` registra cada Colab de `modelo/artefactos/`.
- `src/shared/` contiene componentes, utilidades y estilos comunes.
- `src/services/inference/` es el único punto de conexión con el modelo. Usa el proveedor `mock` por defecto o `http` según `VITE_INFERENCE_PROVIDER`.
- `src/features/analisis/spectrogram.ts` calcula un espectrograma Mel aproximado de 64 bandas. Es visual, no es la entrada real de la CNN.
- Historial en `localStorage` (solo metadatos y espectrograma reducido, no el audio).

El detalle está en [arquitectura.md](arquitectura.md).

## 6. Contrato del modelo

`POST /predict` con `multipart/form-data` y campo `audio`. El formato completo, el ejemplo y los archivos opcionales están en [contrato-modelo.md](contrato-modelo.md).

## 7. Hoja de ruta

1. [hecho] Repositorio, carga, grabación, resultado con datos simulados, historial.
2. [hecho] Estructura por funcionalidad, contrato del modelo, tokens y documentación.
3. [hecho] Rediseño visual y registro de varios Colabs.
4. Backend de inferencia y activación del proveedor HTTP.
5. Nombres comunes reales de las especies y fotos con licencia.
6. Despliegue (por ejemplo Vercel o Netlify para el frontend).

## 8. Preguntas abiertas para el equipo

- ¿Cuántas especies y cuáles tendrá el modelo final?
- ¿Habrá backend propio o se ejecutará todo desde Colab?
