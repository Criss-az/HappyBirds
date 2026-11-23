export const TARGET_SAMPLE_RATE = 16000
export const MAX_AUDIO_SEC = 60

interface Options {
  /** Segundo desde el que conviene conservar el audio si supera el máximo. */
  preferredStartSec?: number
  maxSec?: number
}

/** Codifica muestras en el rango -1 a 1 como WAV PCM de 16 bits, mono. */
export function encodeWavPcm16(samples: Float32Array, sampleRate: number): Blob {
  const dataSize = samples.length * 2
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)
  const text = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i))
  }

  text(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  text(36, 'data')
  view.setUint32(40, dataSize, true)

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return new Blob([buffer], { type: 'audio/wav' })
}

/**
 * Convierte cualquier audio que el navegador pueda decodificar a WAV PCM 16-bit, mono, 16 kHz.
 * Si dura más que el máximo, conserva el tramo que empieza en preferredStartSec.
 */
export async function toWav16kMono(file: Blob, options: Options = {}): Promise<Blob> {
  const maxSec = options.maxSec ?? MAX_AUDIO_SEC
  const Ctx =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new Ctx()
  try {
    const decoded = await ctx.decodeAudioData(await file.arrayBuffer())
    const latestStart = Math.max(0, decoded.duration - maxSec)
    const startSec = Math.min(Math.max(0, options.preferredStartSec ?? 0), latestStart)
    const durationSec = Math.min(maxSec, decoded.duration - startSec)
    const length = Math.max(1, Math.round(durationSec * TARGET_SAMPLE_RATE))

    const offline = new OfflineAudioContext(1, length, TARGET_SAMPLE_RATE)
    const source = offline.createBufferSource()
    source.buffer = decoded
    source.connect(offline.destination)
    source.start(0, startSec, durationSec)
    const rendered = await offline.startRendering()
    return encodeWavPcm16(rendered.getChannelData(0), TARGET_SAMPLE_RATE)
  } finally {
    void ctx.close()
  }
}
