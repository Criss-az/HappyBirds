import { useCallback, useSyncExternalStore } from 'react'

export type RouteName = 'analizar' | 'historial' | 'dataset' | 'modelo' | 'no-supervisado' | 'acerca'

export interface Route {
  name: RouteName
  /** Id del resultado en #/analizar/:id. */
  param: string | null
}

const NAMES: RouteName[] = ['analizar', 'historial', 'dataset', 'modelo', 'no-supervisado', 'acerca']

function parse(hash: string): Route {
  const [name, param] = hash.replace(/^#\/?/, '').split('/')
  return NAMES.includes(name as RouteName)
    ? { name: name as RouteName, param: param ? decodeURIComponent(param) : null }
    : { name: 'analizar', param: null }
}

const subscribe = (listener: () => void) => {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}

export const href = (name: RouteName, param?: string) => `#/${name}${param ? `/${encodeURIComponent(param)}` : ''}`

export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const navigate = useCallback((name: RouteName, param?: string) => {
    window.location.hash = href(name, param)
  }, [])
  return { route: parse(hash), navigate }
}
