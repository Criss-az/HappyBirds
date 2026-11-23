import type { AudioFeatures, SpectrogramData } from '../../types'

export const WINDOW_SEC = 5
const N_FFT = 1024
const N_BANDS = 64
const N_FRAMES = 100
const FMIN = 400
const FMAX = 7500
const DB_RANGE = 80

function fft(re: Float32Array, im: Float32Array) {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[re[i], re[j]] = [re[j], re[i]]
      ;[im[i], im[j]] = [im[j], im[i]]
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len
    const wr = Math.cos(ang)
    const wi = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let cr = 1
      let ci = 0
      for (let k = 0; k < len / 2; k++) {
        const a = i + k
        const b = a + len / 2
        const tr = re[b] * cr - im[b] * ci
        const ti = re[b] * ci + im[b] * cr
        re[b] = re[a] - tr
        im[b] = im[a] - ti
        re[a] += tr
        im[a] += ti
        const ncr = cr * wr - ci * wi
        ci = cr * wi + ci * wr
        cr = ncr
      }
    }
  }
}

const hz2mel = (f: number) => 2595 * Math.log10(1 + f / 700)
const mel2hz = (m: number) => 700 * (10 ** (m / 2595) - 1)

function toMono(buf: AudioBuffer): Float32Array {
  const out = new Float32Array(buf.length)
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const ch = buf.getChannelData(c)
    for (let i = 0; i < ch.length; i++) out[i] += ch[i] / buf.numberOfChannels
  }
  return out
}

/** Elige la ventana de 5 s con mayor energía (misma heurística del notebook). */
function bestWindowStart(x: Float32Array, sr: number): number {
  const win = WINDOW_SEC * sr
  if (x.length <= win) return 0
  const block = Math.floor(sr / 2)
  const blocks: number[] = []
  for (let i = 0; i + block <= x.length; i += block) {
    let e = 0
    for (let k = i; k < i + block; k++) e += x[k] * x[k]
    blocks.push(e)
  }
  const per = Math.round(WINDOW_SEC * 2)
  let best = 0
  let bestE = -1
  for (let b = 0; b + per <= blocks.length; b++) {
    let e = 0
    for (let k = b; k < b + per; k++) e += blocks[k]
    if (e > bestE) {
      bestE = e
      best = b
    }
  }
  return (best * block) / sr
}

function melSpectrogram(x: Float32Array, sr: number, start: number): SpectrogramData {
  const hop = Math.floor((WINDOW_SEC * sr) / N_FRAMES)
  const fmax = Math.min(FMAX, sr / 2)
  const edges = Array.from({ length: N_BANDS + 2 }, (_, i) =>
    mel2hz(hz2mel(FMIN) + ((hz2mel(fmax) - hz2mel(FMIN)) * i) / (N_BANDS + 1)),
  )
  const binHz = sr / N_FFT
  const hann = Float32Array.from({ length: N_FFT }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N_FFT - 1)))
  const s0 = Math.floor(start * sr)
  const db = new Float32Array(N_BANDS * N_FRAMES)
  const re = new Float32Array(N_FFT)
  const im = new Float32Array(N_FFT)
  let maxDb = -Infinity

  for (let t = 0; t < N_FRAMES; t++) {
    const off = s0 + t * hop
    for (let i = 0; i < N_FFT; i++) {
      re[i] = (x[off + i] ?? 0) * hann[i]
      im[i] = 0
    }
    fft(re, im)
    for (let b = 0; b < N_BANDS; b++) {
      const lo = edges[b]
      const hi = edges[b + 2]
      const i0 = Math.max(1, Math.floor(lo / binHz))
      const i1 = Math.max(i0 + 1, Math.ceil(hi / binHz))
      let p = 0
      for (let k = i0; k < i1 && k < N_FFT / 2; k++) p += re[k] * re[k] + im[k] * im[k]
      p /= i1 - i0
      const v = 10 * Math.log10(p + 1e-10)
      db[b * N_FRAMES + t] = v
      if (v > maxDb) maxDb = v
    }
  }

  const bytes = new Uint8Array(db.length)
  for (let i = 0; i < db.length; i++) {
    const n = Math.min(1, Math.max(0, (db[i] - (maxDb - DB_RANGE)) / DB_RANGE))
    bytes[i] = Math.round(n * 255)
  }
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return { w: N_FRAMES, h: N_BANDS, b64: btoa(bin) }
}

export async function extractFeatures(file: File): Promise<AudioFeatures> {
  const Ctx =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new Ctx()
  try {
    const buf = await ctx.decodeAudioData(await file.arrayBuffer())
    if (buf.duration < 0.5) throw new Error('El audio es demasiado corto (mínimo 0,5 s).')
    const x = toMono(buf)
    const start = bestWindowStart(x, buf.sampleRate)
    return {
      durationSec: buf.duration,
      sampleRate: buf.sampleRate,
      windowStartSec: start,
      windowSec: Math.min(WINDOW_SEC, buf.duration),
      spectrogram: melSpectrogram(x, buf.sampleRate, start),
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('El audio')) throw e
    throw new Error('No se pudo leer el audio. Prueba con WAV, MP3, OGG, FLAC o M4A.')
  } finally {
    void ctx.close()
  }
}
