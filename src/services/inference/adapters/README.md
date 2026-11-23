# Adaptadores

Un adaptador traduce la salida de un Colab al [contrato del modelo](../../../../docs/contrato-modelo.md), para no tocar la interfaz cuando cambia el modelo.

1. Copia `ejemploColab.ts` con el nombre de tu modelo.
2. Cambia `SalidaColab` por la forma real de tu respuesta y completa cada campo del contrato.
3. Asígnalo en `index.ts`:

   ```ts
   import { miModeloAdapter } from './miModelo'

   export const activeAdapter: PredictionAdapter = miModeloAdapter
   ```

`http.ts` valida el resultado del adaptador. Si falta un campo, la interfaz muestra cuál es.
