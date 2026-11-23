import { Badge } from '../../shared/components/Badge'

export function InfoPanel() {
  return (
    <aside className="info glass" aria-label="Información general">
      <Badge>Modo simulación</Badge>

      <section>
        <h2>Sobre el modelo</h2>
        <dl className="kv">
          <dt>Tipo</dt>
          <dd>CNN supervisada</dd>
          <dt>Entrada</dt>
          <dd>Espectrograma Mel</dd>
          <dt>Ventana</dt>
          <dd>5 s, mono, 16 kHz</dd>
          <dt>Bandas Mel</dt>
          <dd>96</dd>
          <dt>Salida</dt>
          <dd>Softmax por especie</dd>
        </dl>
      </section>

      <section>
        <h2>Formatos</h2>
        <p>WAV, MP3, OGG, FLAC, M4A y WEBM. También puedes grabar hasta 30 s con el micrófono.</p>
      </section>

      <section>
        <h2>Para mejores resultados</h2>
        <ul>
          <li>Entre 5 y 10 segundos de canto.</li>
          <li>Poco ruido de fondo, sin voces.</li>
          <li>Una sola ave dominante.</li>
        </ul>
      </section>

      <section>
        <h2>Limitaciones</h2>
        <p>
          El modelo solo reconoce las especies con las que fue entrenado y siempre propone alguna de ellas. La
          probabilidad no es una medida calibrada de certeza.
        </p>
      </section>
    </aside>
  )
}
