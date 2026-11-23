import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

const TOKENS = 'src/shared/styles/tokens.css'
const FAVICON = 'src/shared/assets/favicon.template.svg'
const PLACEHOLDER = /\{\{token:(--[\w-]+)\}\}/g

function loadTokens(root: string): Map<string, string> {
  const css = readFileSync(resolve(root, TOKENS), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const block = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
  return new Map([...block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

function resolveToken(tokens: Map<string, string>, name: string, seen = new Set<string>()): string {
  const value = tokens.get(name)
  if (value === undefined || seen.has(name)) throw new Error(`Token no válido en plantilla: ${name}`)
  seen.add(name)
  return value.replace(/var\((--[\w-]+)\)/g, (_, inner: string) => resolveToken(tokens, inner, seen))
}

function fill(root: string, text: string): string {
  const tokens = loadTokens(root)
  return text.replace(PLACEHOLDER, (_, name: string) => resolveToken(tokens, name))
}

/** Lleva los tokens a lo que no puede leer CSS: meta theme-color y favicon.svg. */
export function brandTokens(): Plugin {
  let root = process.cwd()
  let base = '/'
  const favicon = () => fill(root, readFileSync(resolve(root, FAVICON), 'utf8'))

  return {
    name: 'happybirds-brand-tokens',
    configResolved(config) {
      root = config.root
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return {
          html: fill(root, html),
          tags: [
            {
              tag: 'link',
              attrs: { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` },
              injectTo: 'head',
            },
          ],
        }
      },
    },
    configureServer(server) {
      server.middlewares.use(`${base}favicon.svg`, (_req, res) => {
        res.setHeader('Content-Type', 'image/svg+xml')
        res.end(favicon())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'favicon.svg', source: favicon() })
    },
  }
}
