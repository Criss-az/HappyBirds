# Modelo

Aquí se registran los modelos del Grupo 7. Cada integrante puede entrenar su propio Colab, y la interfaz los muestra sin cambiar código: **una carpeta en `artefactos/` es un Colab**.

## Carpetas

| Carpeta | Contenido |
|---|---|
| `notebooks/` | Un notebook por integrante o versión |
| `informe/` | Informe del proyecto |
| `artefactos/<id>/` | Ficha, métricas y CSV livianos de un Colab |

El dataset de audio y los pesos viven en Drive, **nunca en este repositorio**. Git ignora `*.keras`, `*.h5`, `*.onnx`, `*.tflite`, `modelo/datasets/` y los audios. Los pesos `.pt` tampoco se copian aquí.

## Enlaces

- Dataset en Drive: _pendiente_
- Carpeta de modelos en Drive: _pendiente_
- Notebook de referencia en Colab: _pendiente_

## Agregar un Colab

1. Crea `modelo/artefactos/mi-colab/`, con un nombre sin espacios.
2. Agrega `experimento.json`:

   ```json
   {
     "nombre": "CNN Keras de Daniel",
     "descripcion": "Versión con 96 bandas Mel.",
     "formato": "keras-colab",
     "framework": "TensorFlow/Keras",
     "origen": "artefactos",
     "audio": { "sampleRate": 16000, "ventanaSec": 5, "bandasMel": 96 }
   }
   ```

3. Copia los archivos que exporte tu notebook.
4. Ejecuta `pnpm dev`. El Colab aparece en el selector de **Dataset** y **Métricas del Modelo**.

Todos los archivos, salvo la ficha, son opcionales: lo que falte se muestra como un estado vacío. Usa `"origen": "ejemplo"` si los números no son de un entrenamiento real, y la interfaz mostrará la insignia "Datos de ejemplo".

## Formatos admitidos

**`keras-colab`**

| Archivo | Columnas o campos |
|---|---|
| `metricas_generales.json` | `accuracy`, `precisionMacro`, `recallMacro`, `f1Macro`, `loss` |
| `metricas_por_especie.csv` | `especie`, `precision`, `recall`, `f1`, `support` |
| `dataset_resumen.json` | `totalRecordings`, `species[]` con `id`, `train`, `validation`, `test`, `total` |
| `historial_entrenamiento.csv` | Salida de `CSVLogger`: `epoch`, `loss`, `val_loss`, `accuracy`, `val_accuracy` |
| `grabaciones.csv` | `id`, `especie`, `calidad`, `tipo_vocalizacion`, `duracion_seg`, `split` |

**`pytorch-p2`**: `test_metrics.json`, `training_history.json`, `classification_report.json`, `confusion_matrix.json`, `quality_error_analysis.json`, `dataset_stats.json` y `splits.csv`.

**Otro formato:** crea un adaptador en `src/services/experimentos/adapters/` y regístralo en su `index.ts`. Ese es el único código que hace falta.

## Ejecutar un notebook

1. Abre el notebook en [Google Colab](https://colab.research.google.com/).
2. Activa la GPU en Entorno de ejecución, Cambiar tipo de entorno.
3. Monta Drive y ajusta la ruta del dataset.
4. Ejecuta todas las celdas en orden.
5. Copia los artefactos livianos a `artefactos/<id>/` y sube los pesos a Drive.

Mostrar métricas no conecta las predicciones. Para eso, expón el modelo con una API que cumpla [el contrato](../docs/contrato-modelo.md) y sigue [CONTRIBUTING.md](../CONTRIBUTING.md#integrar-un-modelo-nuevo).
