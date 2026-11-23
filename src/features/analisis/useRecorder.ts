import { useCallback, useEffect, useRef, useState } from 'react'

export const MAX_RECORD_SEC = 30

export function useRecorder(onFinish: (file: File) => void) {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const chunks = useRef<Blob[]>([])
  const timer = useRef<number | null>(null)
  const [level, setLevel] = useState(0)
  const meter = useRef<{ ctx: AudioContext; raf: number } | null>(null)

  /** Solo mide el volumen: no altera lo que se graba. */
  const startMeter = useCallback((s: MediaStream) => {
    const Ctx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    try {
      const ctx = new Ctx()
      // Algunos navegadores crean el contexto suspendido después de pedir el permiso.
      void ctx.resume()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      ctx.createMediaStreamSource(s).connect(analyser)
      const samples = new Float32Array(analyser.fftSize)
      const state = { ctx, raf: 0 }
      const tick = () => {
        analyser.getFloatTimeDomainData(samples)
        let sum = 0
        for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i]
        setLevel(Math.min(1, Math.sqrt(sum / samples.length) * 4))
        state.raf = requestAnimationFrame(tick)
      }
      meter.current = state
      state.raf = requestAnimationFrame(tick)
    } catch {
      /* sin medidor: la grabación sigue funcionando */
    }
  }, [])

  const cleanup = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current)
    timer.current = null
    if (meter.current) {
      cancelAnimationFrame(meter.current.raf)
      void meter.current.ctx.close()
      meter.current = null
    }
    setLevel(0)
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    setRecording(false)
  }, [])

  const stop = useCallback(() => {
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop()
  }, [])

  const start = useCallback(async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Tu navegador no permite grabar audio. Sube un archivo en su lugar.')
      return
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.current = s
      const mr = new MediaRecorder(s)
      recorder.current = mr
      chunks.current = []
      mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      mr.onstop = () => {
        const type = mr.mimeType || 'audio/webm'
        const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm'
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
        cleanup()
        if (chunks.current.length) onFinish(new File(chunks.current, `grabacion-${stamp}.${ext}`, { type }))
      }
      mr.start()
      setElapsed(0)
      setRecording(true)
      startMeter(s)
      timer.current = window.setInterval(() => {
        setElapsed((p) => {
          if (p + 1 >= MAX_RECORD_SEC) stop()
          return p + 1
        })
      }, 1000)
    } catch {
      cleanup()
      setError('No se pudo acceder al micrófono. Revisa el permiso del navegador.')
    }
  }, [cleanup, onFinish, startMeter, stop])

  useEffect(
    () => () => {
      if (recorder.current && recorder.current.state !== 'inactive') {
        recorder.current.onstop = null
        recorder.current.stop()
      }
      cleanup()
    },
    [cleanup],
  )

  return { recording, elapsed, level, error, start, stop }
}
