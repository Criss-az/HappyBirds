#!/usr/bin/env node
// Falla si encuentra colores escritos fuera de los archivos de tokens.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const TARGETS = process.argv.slice(2).length ? process.argv.slice(2) : ['src', 'public', 'index.html']
const TOKEN_FILES = new Set(['src/shared/styles/tokens.css'])
const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git'])
const EXTENSIONS = new Set(['.css', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.html', '.svg'])

const NAMES =
  'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'
const NAME_GROUP = NAMES.split(' ').join('|')

const CSS_PROPERTY =
  '(?:color|background(?:-color)?|border(?:-(?:top|right|bottom|left|block|inline))?(?:-color)?|outline(?:-color)?|fill|stroke|stop-color|flood-color|lighting-color|caret-color|accent-color|column-rule(?:-color)?|text-decoration(?:-color)?|text-shadow|box-shadow)'
const JS_PROPERTY =
  '(?:color|background|backgroundColor|border|borderColor|outline|outlineColor|fill|stroke|stopColor|floodColor|fillStyle|strokeStyle|shadowColor|caretColor|accentColor|boxShadow|textShadow)'

const RULES = [
  ['hex', /(?<![\w&/-])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi],
  ['función de color', /(?<![\w-])(?:rgba?|hsla?)\(/gi],
]
const CSS_NAME = new RegExp(`(?<![\\w-])${CSS_PROPERTY}\\s*:[^;{}]*?(?<![\\w-])(${NAME_GROUP})(?![\\w-])`, 'gi')
const MARKUP_NAME = new RegExp(
  `(?<![\\w-])(?:${JS_PROPERTY}|stop-color)\\s*[=:]\\s*\\{?\\s*["'\`](?:[^"'\`]*\\s)?(${NAME_GROUP})(?:\\s[^"'\`]*)?["'\`]`,
  'gi',
)

function walk(path, out = []) {
  if (!existsSync(path)) return out
  if (statSync(path).isDirectory()) {
    for (const entry of readdirSync(path)) if (!IGNORED_DIRS.has(entry)) walk(join(path, entry), out)
  } else if (EXTENSIONS.has(extname(path))) {
    out.push(path)
  }
  return out
}

/** Quita comentarios y referencias a ids, conservando las posiciones para informar la línea. */
function clean(text, ext) {
  const blank = (m) => m.replace(/[^\n]/g, ' ')
  let s = text.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/<!--[\s\S]*?-->/g, blank)
  if (ext !== '.css' && ext !== '.html' && ext !== '.svg') s = s.replace(/(^|\s)\/\/.*$/gm, blank)
  return s.replace(/url\(\s*['"]?#[^)]*\)/g, blank).replace(/\bhref=["']#[^"']*["']/g, blank)
}

const problems = []
const files = TARGETS.flatMap((t) => walk(join(ROOT, t)))
for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join('/')
  if (TOKEN_FILES.has(rel)) continue
  const ext = extname(file)
  const text = clean(readFileSync(file, 'utf8'), ext)
  const rules = [...RULES, ['nombre de color', ext === '.css' ? CSS_NAME : MARKUP_NAME]]
  for (const [label, regex] of rules) {
    for (const match of text.matchAll(regex)) {
      const line = text.slice(0, match.index).split('\n').length
      problems.push(`${rel}:${line}  ${label}: ${(match[1] ?? match[0]).trim()}`)
    }
  }
}

if (problems.length) {
  console.error(`check:tokens falló. ${problems.length} color(es) fuera de los tokens:\n`)
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`check:tokens correcto: ${files.length} archivos revisados, sin colores fuera de los tokens.`)
