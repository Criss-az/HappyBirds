# HappyBirds

Reconocimiento de aves de Bolivia por sus vocalizaciones: interfaz web para cargar o grabar un audio y ver la especie identificada. Proyecto del Grupo 7 de Machine Learning (CNN, aprendizaje supervisado, Deep Learning).

## Estado del proyecto

**Interfaz con datos simulados.** La aplicación todavía no está conectada al modelo: las especies y probabilidades que muestra son de ejemplo y no analizan el sonido. La capa para conectar el modelo real ya existe y está desactivada por defecto.

## Capturas de pantalla

<!-- Agregar aquí las capturas en docs/bocetos/ o en una carpeta de imágenes. -->

_Pendiente._

## Características

- Carga de audio con clic o arrastre (WAV, MP3, OGG, FLAC, M4A, WEBM).
- Grabación con el micrófono, hasta 30 s.
- Resultado con la especie más probable, candidatas y métricas de la especie.
- Espectrograma Mel aproximado, calculado en el navegador.
- Historial local de análisis.
- Proveedor de inferencia intercambiable: simulado o HTTP.
- Conversión del audio a WAV PCM 16-bit, mono, 16 kHz antes de enviarlo al modelo.

## Stack

React 18, TypeScript, Vite, CSS con tokens de diseño, ESLint y Prettier. El modelo se entrena aparte con TensorFlow/Keras y Librosa en Google Colab.

## Requisitos

- Node.js 18.18 o superior.
- pnpm (la versión está fijada en `package.json`).

## Instalación

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Abre la dirección que muestra la terminal (normalmente http://localhost:5173). El micrófono solo funciona en `localhost` o con HTTPS.

## Scripts

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Inicia el servidor de desarrollo |
| `pnpm build` | Revisa los tipos y genera la versión de producción en `dist/` |
| `pnpm preview` | Sirve localmente la versión de producción |
| `pnpm lint` | Ejecuta ESLint sin permitir advertencias |
| `pnpm format` | Da formato al código con Prettier |
| `pnpm format:check` | Comprueba el formato sin modificar archivos |
| `pnpm check:tokens` | Falla si hay colores escritos fuera de los tokens |

## Variables de entorno

| Variable | Valores | Por defecto | Uso |
|---|---|---|---|
| `VITE_INFERENCE_PROVIDER` | `mock`, `http` | `mock` | Elige de dónde salen las predicciones |
| `VITE_API_URL` | URL base, sin `/predict` | sin valor | Dirección del servicio del modelo, necesaria con `http` |

## Estructura de carpetas

```
src/features/analisis/     Carga, grabación, resultado y espectrograma
src/features/historial/    Barra lateral e historial local
src/features/informacion/  Panel de información
src/shared/components/     Componentes reutilizables e iconos
src/shared/lib/            Utilidades: formato, tokens y conversión de audio
src/shared/styles/         Tokens de diseño y estilos base
src/shared/assets/         Plantilla del favicon
src/services/inference/    Proveedores mock y HTTP, validación y adaptadores
scripts/                   Revisión de tokens y plugin de Vite
modelo/                    Notebooks, informe y artefactos livianos
docs/                      Plan, arquitectura, contrato del modelo y bocetos
public/                    Archivos estáticos
```

## Conectar el modelo real

1. Expón el modelo con un servicio que cumpla [el contrato](docs/contrato-modelo.md).
2. Si su salida tiene otro formato, crea un adaptador ([guía](src/services/inference/adapters/README.md)).
3. En `.env`, usa `VITE_INFERENCE_PROVIDER=http` y apunta `VITE_API_URL` al servicio.

## Roadmap

- [x] Carga, grabación, resultado e historial con datos simulados.
- [x] Estructura por funcionalidad, contrato del modelo y tokens de diseño.
- [ ] Rediseño visual con identidad de HappyBirds.
- [ ] Elegir el modelo final y publicar su servicio de inferencia.
- [ ] Nombres comunes definitivos y fotos con licencia.
- [ ] Despliegue del frontend.

## Equipo (Grupo 7)

| Integrante |
|---|
| Alba Zapata Cristhian |
| Chinchilla Condori Jhilmer |
| Flores Mamani Daniel Teodoro |
| Lora Quilla Santiago Leonardo |
| Lizarazu Fernández Josue Joel |
| Padilla Alexander J. |
| Sejas Mamani Jairo Joshua |
| Uzeda Rocha Mauricio |

## Licencia

Proyecto académico del Grupo 7 de Machine Learning. Por ahora no se publica bajo una licencia de código abierto.
