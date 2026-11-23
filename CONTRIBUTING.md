# Cómo contribuir

## Ramas

Parte de `main` actualizada y usa un nombre descriptivo:

- `feature/nombre-corto` para funcionalidades.
- `fix/nombre-corto` para correcciones.

Integra los cambios a `main` con un pull request.

## Commits

Usa el formato `tipo: descripción en imperativo`.

| Tipo | Uso |
|---|---|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección |
| `refactor` | Cambio interno sin alterar el comportamiento |
| `style` | Cambio visual o de formato |
| `docs` | Documentación |
| `chore` | Dependencias y configuración |

Ejemplo: `feat: agrega adaptador del modelo de Daniel`.

## Antes de subir

```bash
pnpm lint
pnpm check:tokens
pnpm format:check
pnpm build
```

No subas pesos de modelos, datasets ni audios. Solo van archivos livianos en `modelo/artefactos/`.

## Integrar un modelo nuevo

1. **Crea el adaptador.** Copia `src/services/inference/adapters/ejemploColab.ts` y traduce la salida de tu notebook al [contrato](docs/contrato-modelo.md). Si tu modelo ya lo cumple, omite este paso.
2. **Actívalo.** Asígnalo a `activeAdapter` en `src/services/inference/adapters/index.ts`.
3. **Apunta la interfaz al modelo.** En `.env`:

   ```bash
   VITE_INFERENCE_PROVIDER=http
   VITE_API_URL=https://tu-servicio
   ```

4. **Prueba contra el contrato.** Ejecuta `pnpm dev` y analiza un audio. Si la respuesta no cumple, la pantalla indica qué campo falló.
5. **Permite el origen.** El servicio debe aceptar peticiones (CORS) desde la dirección del frontend.
