# Modelo

CNN de aprendizaje supervisado que clasifica espectrogramas Mel de 5 s (mono, 16 kHz, 96 bandas) y termina en Softmax con una probabilidad por especie. Se entrena en Google Colab con TensorFlow/Keras y Librosa.

Cada integrante puede tener su notebook. El modelo final todavía no está definido.

## Carpetas

| Carpeta | Contenido |
|---|---|
| `notebooks/` | Un notebook por integrante o versión |
| `informe/` | Informe del proyecto |
| `artefactos/` | Solo archivos livianos: configuración y métricas |

El dataset y los pesos viven en Drive, **nunca en este repositorio**. Git ignora `*.keras`, `*.h5`, `*.onnx`, `*.tflite`, `modelo/datasets/` y los audios.

## Enlaces

- Dataset en Drive: _pendiente_
- Carpeta de modelos en Drive: _pendiente_
- Notebook de referencia en Colab: _pendiente_

## Ejecutar un notebook

1. Abre el notebook en [Google Colab](https://colab.research.google.com/) (Archivo, Subir cuaderno o desde Drive).
2. Activa la GPU en Entorno de ejecución, Cambiar tipo de entorno.
3. Monta Drive y ajusta la ruta del dataset.
4. Ejecuta todas las celdas en orden.
5. Descarga o copia a Drive los archivos generados.

## Archivos que genera

| Archivo | Destino | Lo usa el frontend |
|---|---|---|
| `mejor_modelo_aves_bolivia.keras` | Drive | No directamente, lo carga el servicio |
| `configuracion_modelo.json` | `artefactos/` | Sí, lista de clases |
| `metricas_generales.json` | `artefactos/` | Sí, pantallas futuras |
| `metricas_por_especie.csv` | `artefactos/` | Sí, pantallas futuras |
| `predicciones_prueba.csv` | Drive | No |
| `especies.json` (opcional) | `artefactos/` | Sí, pantallas futuras |
| `dataset_resumen.json` (opcional) | `artefactos/` | Sí, pantallas futuras |

El formato de los archivos opcionales está en [docs/contrato-modelo.md](../docs/contrato-modelo.md).

## Entregar una versión

1. Sube los pesos a Drive y agrega el enlace en este archivo.
2. Copia los artefactos livianos a `artefactos/` y tu notebook a `notebooks/`.
3. Expón el modelo con una API que cumpla el contrato, o crea un adaptador.
4. Sigue los pasos de [CONTRIBUTING.md](../CONTRIBUTING.md#integrar-un-modelo-nuevo).
