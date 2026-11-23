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

  const cleanup = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current)
    timer.current = null
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
  }, [cleanup, onFinish, stop])

  useEffect(() => () => {
    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.onstop = null
      recorder.current.stop()
    }
    cleanup()
  }, [cleanup])

  return { recording, elapsed, error, start, stop }
}
