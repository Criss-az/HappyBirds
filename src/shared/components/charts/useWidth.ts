import { useEffect, useRef, useState } from 'react'

export function useWidth<T extends HTMLElement>(fallback = 480) {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(fallback)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(Math.max(120, el.clientWidth))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}
