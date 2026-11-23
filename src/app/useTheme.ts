import { useCallback, useEffect, useState } from 'react'
import { readToken } from '../shared/lib/readToken'

export type Theme = 'light' | 'dark'
const KEY = 'happybirds.theme'

export function storedTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(storedTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', readToken('--color-primary'))
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* sin almacenamiento: el tema dura hasta recargar */
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), [])
  return { theme, toggle }
}
