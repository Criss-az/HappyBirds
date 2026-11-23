# Contrato del modelo

Formato exacto que el frontend espera de cualquier versión del modelo. El esquema formal está en [contrato-modelo.schema.json](contrato-modelo.schema.json) y los tipos en `src/types.ts`.

Si un notebook produce otro formato, no se cambia la interfaz: se escribe un [adaptador](../src/services/inference/adapters/README.md).

## Petición

`POST {VITE_API_URL}/predict` con `multipart/form-data`.

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `audio` | archivo | Sí | Normalmente `audio/wav`, PCM 16-bit, mono, 16 kHz, máximo 60 s |
| `sourceFormat` | texto | No | Solo aparece si la conversión falló. Indica el formato del archivo original, por ejemplo `audio/webm` |

### Conversión del audio

El navegador convierte siempre el audio a WAV antes de enviarlo, para que el modelo no dependa de códecs (`src/shared/lib/audio/toWav16kMono.ts`).

- Si el audio dura más de 60 s, se envían 60 s desde la ventana de mayor energía.
- Si la conversión falla, se envía **el archivo original** junto con `sourceFormat`. El servicio debe decodificarlo (por ejemplo con librosa y ffmpeg) o responder con un error HTTP.

## Respuesta

`200 OK` con JSON.

| Campo | Tipo | Descripción |
|---|---|---|
| `top` | lista, mínimo 1 | Especies candidatas. La interfaz las ordena de mayor a menor probabilidad |
| `top[].id` | texto | Identificador estable de la clase |
| `top[].commonName` | texto | Nombre común |
| `top[].scientificName` | texto | Nombre científico |
| `top[].probability` | número de 0 a 1 | Salida Softmax. No es una probabilidad calibrada |
| `speciesMetrics.f1` | número de 0 a 1 | F1 de la especie ganadora en prueba |
| `speciesMetrics.recall` | número de 0 a 1 | Recall de la especie ganadora en prueba |
| `speciesMetrics.testSamples` | entero, 0 o más | Audios de prueba de esa especie |
| `window.startSec` | número, 0 o más | Inicio de la ventana analizada |
| `window.durationSec` | número mayor a 0 | Duración de la ventana analizada |
| `modelVersion` | texto | Versión del modelo que respondió |
| `warnings` | lista de textos | Avisos para mostrar al usuario. Puede estar vacía |

### Ejemplo completo

Los valores son ilustrativos.

```json
{
  "top": [
    { "id": "ara-ararauna", "commonName": "Paraba azul y amarilla", "scientificName": "Ara ararauna", "probability": 0.71 },
    { "id": "ara-chloropterus", "commonName": "Paraba roja", "scientificName": "Ara chloropterus", "probability": 0.19 },
    { "id": "ramphastos-toco", "commonName": "Tucán toco", "scientificName": "Ramphastos toco", "probability": 0.06 }
  ],
  "speciesMetrics": { "f1": 0.82, "recall": 0.8, "testSamples": 4 },
  "window": { "startSec": 12.5, "durationSec": 5 },
  "modelVersion": "cnn-mel-2026.11-ejemplo",
  "warnings": []
}
```

### Errores

Ante un fallo, el servicio responde con un código HTTP 4xx o 5xx. La interfaz muestra un mensaje en español cuando no hay conexión, se agota el tiempo (120 s), la respuesta no es JSON o incumple este contrato. El servicio debe permitir CORS desde el origen del frontend.

## Archivos opcionales del notebook

Alimentarán pantallas futuras. Son livianos y van en `modelo/artefactos/`.

### especies.json

```json
[
  { "id": "ara-ararauna", "commonName": "Paraba azul y amarilla", "scientificName": "Ara ararauna" }
]
```

### metricas_generales.json

Todos los valores son del conjunto de prueba. `loss` es 0 o mayor y los demás van de 0 a 1.

```json
{
  "accuracy": 0.8,
  "precisionMacro": 0.78,
  "recallMacro": 0.76,
  "f1Macro": 0.77,
  "loss": 0.64,
  "modelVersion": "cnn-mel-2026.11-ejemplo"
}
```

### dataset_resumen.json

Cantidad de grabaciones por especie y partición.

```json
{
  "totalRecordings": 150,
  "species": [
    { "id": "ara-ararauna", "train": 70, "validation": 15, "test": 15, "total": 100 },
    { "id": "ara-chloropterus", "train": 35, "validation": 8, "test": 7, "total": 50 }
  ]
}
```
