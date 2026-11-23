# HappyBirds

Reconocimiento de aves de Bolivia por sus vocalizaciones: interfaz web para cargar o grabar un audio y ver la especie identificada. Proyecto del Grupo 7 de Machine Learning (CNN, aprendizaje supervisado, Deep Learning).

## Estado del proyecto

**Predicciones simuladas.** La pestaña Identificar Ave todavía no está conectada a un modelo: sus especies y probabilidades no analizan el sonido. Las pestañas Dataset y Métricas sí muestran los artefactos reales del primer Colab (CNN 2D en PyTorch).

## Capturas de pantalla

<!-- Agregar aquí las capturas en docs/bocetos/ o en una carpeta de imágenes. -->

_Pendiente._

## Características

- Carga de audio con clic o arrastre (WAV, MP3, OGG, FLAC, M4A, WEBM) y grabación con el micrófono, hasta 30 s.
- Resultado con especie probable, candidatas, forma de onda y espectrograma Mel aproximado.
- Historial local con filtro por especie.
- Exploración del dataset desde CSV y métricas del modelo, con matriz de confusión.
- **Varios Colabs:** cada carpeta de `modelo/artefactos/` aparece sola en un selector.
- Modo claro y oscuro, diseño responsive y navegación por teclado.
- Proveedor de inferencia intercambiable: simulado o HTTP.

## Stack

React 18, TypeScript, Vite, CSS con tokens de diseño, iconos Lucide, ESLint y Prettier. El modelo se entrena aparte con TensorFlow/Keras y Librosa en Google Colab.

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
src/app/                       Encabezado, router por hash y tema
src/features/analisis/         Carga, grabación, resultado y espectrograma
src/features/historial/        Historial local
src/features/dataset/          Exploración del dataset y sus CSV
src/features/modelo/           Métricas, matriz de confusión y selector de Colab
src/features/no-supervisado/   Espacio para la siguiente entrega
src/features/informacion/      Acerca de
src/shared/                    Componentes, gráficos, utilidades, tokens y marca
src/services/inference/        Proveedores mock y HTTP, validación y adaptadores
src/services/experimentos/     Registro automático de Colabs y sus adaptadores
scripts/                       Revisión de tokens y plugin de Vite
modelo/artefactos/             Una carpeta por Colab: ficha, métricas y CSV
docs/                          Plan, arquitectura, contrato del modelo y bocetos
public/                        Archivos estáticos
```

## Agregar un Colab

Crea una carpeta en `modelo/artefactos/` con un `experimento.json` y los archivos del notebook. La guía está en [modelo/README.md](modelo/README.md).

## Conectar el modelo real

1. Expón el modelo con un servicio que cumpla [el contrato](docs/contrato-modelo.md).
2. Si su salida tiene otro formato, crea un adaptador ([guía](src/services/inference/adapters/README.md)).
3. En `.env`, usa `VITE_INFERENCE_PROVIDER=http` y apunta `VITE_API_URL` al servicio.

## Roadmap

- [x] Carga, grabación, resultado e historial con datos simulados.
- [x] Estructura por funcionalidad, contrato del modelo y tokens de diseño.
- [x] Rediseño visual y registro de varios Colabs.
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
