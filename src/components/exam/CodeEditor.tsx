import { useCallback, useMemo, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { SPEC, type Lang, type LangSpec } from '@/lib/harness'
import { cn } from '@/lib/cn'

/**
 * The editor.
 *
 * A textarea with a highlighted `<pre>` sitting exactly behind it: the textarea's
 * own text is transparent, only its caret and selection show, and the colours
 * come from the layer underneath. That is the whole trick, and it is why this is
 * a few hundred bytes instead of the ~800 KB Monaco would add to a page students
 * open on hostel wifi. The two layers must share font, size, line-height,
 * padding and `white-space`, or the caret drifts — that is the one invariant
 * worth guarding when editing this file.
 *
 * Edits go through `document.execCommand('insertText')` rather than setState.
 * It is deprecated and universally implemented, and it is the only way to change
 * a textarea's contents while keeping the browser's native undo stack, which
 * matters enormously when you are 40 minutes into a timed round and hit Ctrl-Z.
 */

const INDENT = '  '

/*
 * Keywords by *highlight family*, not by language, so adding a language does not
 * mean editing this file. A language's registry entry names its family with
 * `highlightAs` and may add its own words with `keywords`; anything unlisted
 * still renders, just without its identifiers coloured.
 */
type Family = NonNullable<LangSpec['highlightAs']>

const FAMILY_KEYWORDS: Record<Family, string> = {
  python:
    'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield print range len int str list dict set tuple sum min max sorted enumerate map filter abs input',
  'c-like':
    'abstract alignas assert auto bool break byte case catch char class const constexpr continue default defer delete do double else enum explicit extends extern false final finally float fn for friend func go goto if impl implements import in inline instanceof int interface let long loop match mod move mut namespace native new nil nullptr null operator package private protected pub public range return short signed sizeof static struct super switch synchronized template this throw throws trait true try type typedef typename union unsigned use using var virtual void volatile where while string String vector map set pair queue stack sort max min size begin end len append make println printf System out Console',
  javascript:
    'async await break case catch class const continue debugger default delete do else export extends finally for from function if import in instanceof interface let new of return static super switch this throw try type typeof var void while yield true false null undefined console log Math Number String Array Object Set Map JSON number boolean string any unknown never readonly',
}

const familyOf = (lang: Lang): Family => SPEC[lang].highlightAs ?? 'c-like'

const keysetCache = new Map<Lang, Set<string>>()
function keysetFor(lang: Lang) {
  let set = keysetCache.get(lang)
  if (!set) {
    const words = `${FAMILY_KEYWORDS[familyOf(lang)]} ${SPEC[lang].keywords ?? ''}`.trim()
    set = new Set(words.split(/\s+/))
    keysetCache.set(lang, set)
  }
  return set
}

function tokenizer(lang: Lang) {
  const family = familyOf(lang)
  // Order matters: comments and strings must win before words and numbers.
  const comment =
    family === 'python'
      ? String.raw`#[^\n]*`
      : String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`
  // C and C++ preprocessor lines, which would otherwise read as comments.
  const pre = lang === 'cpp' ? String.raw`|^[ \t]*#[a-z]+` : ''
  const backtick = family !== 'python' ? String.raw`|\`(?:\\.|[^\`\\])*\`?` : ''
  const str = String.raw`"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?` + backtick
  return new RegExp(
    `(${comment})|(${str})|(\\b\\d[\\w.]*\\b)|(\\b[A-Za-z_$][\\w$]*\\b)${pre}`,
    'gm',
  )
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlight(code: string, lang: Lang) {
  const re = tokenizer(lang)
  const keys = keysetFor(lang)
  let out = ''
  let last = 0
  for (let m = re.exec(code); m; m = re.exec(code)) {
    out += esc(code.slice(last, m.index))
    const [text, comm, str, num, word] = m
    if (comm !== undefined) out += `<span class="tk-com">${esc(text)}</span>`
    else if (str !== undefined) out += `<span class="tk-str">${esc(text)}</span>`
    else if (num !== undefined) out += `<span class="tk-num">${esc(text)}</span>`
    else if (word !== undefined && keys.has(word)) out += `<span class="tk-key">${esc(text)}</span>`
    else out += esc(text)
    last = m.index + text.length
  }
  out += esc(code.slice(last))
  // A trailing newline collapses in <pre>; the space keeps the last row alive.
  return out + '\n '
}

const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" }
const OPENERS_AT_EOL = /[([{:]\s*$/

export function CodeEditor({
  value,
  onChange,
  lang,
  blockPaste,
  onBlockedPaste,
  readOnly,
  className,
}: {
  value: string
  onChange: (next: string) => void
  lang: Lang
  blockPaste?: boolean
  onBlockedPaste?: () => void
  readOnly?: boolean
  className?: string
}) {
  const ta = useRef<HTMLTextAreaElement>(null)
  const pre = useRef<HTMLPreElement>(null)
  const gutter = useRef<HTMLDivElement>(null)

  const html = useMemo(() => highlight(value, lang), [value, lang])
  const lineCount = useMemo(() => value.split('\n').length, [value])

  /** Replace [start,end) with `text`, preserving native undo where possible. */
  const apply = useCallback(
    (start: number, end: number, text: string, cursor?: number, cursorEnd?: number) => {
      const el = ta.current
      if (!el) return
      el.focus()
      el.setSelectionRange(start, end)
      let ok = false
      try {
        ok = document.execCommand('insertText', false, text)
      } catch {
        ok = false
      }
      const a = cursor ?? start + text.length
      const b = cursorEnd ?? a
      if (!ok) {
        onChange(value.slice(0, start) + text + value.slice(end))
        requestAnimationFrame(() => el.setSelectionRange(a, b))
        return
      }
      el.setSelectionRange(a, b)
    },
    [onChange, value],
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget
      const { selectionStart: s, selectionEnd: t } = el
      const before = value.slice(0, s)
      const lineStart = before.lastIndexOf('\n') + 1

      // Keyboard users must not be trapped by Tab. Escape lets them out.
      if (e.key === 'Escape') {
        el.blur()
        return
      }

      if (e.key === 'Tab') {
        e.preventDefault()
        const multiline = value.slice(s, t).includes('\n')
        if (!multiline && !e.shiftKey) {
          apply(s, t, INDENT)
          return
        }
        // Block indent / dedent, snapped to whole lines.
        const blockStart = lineStart
        const blockEnd = value.indexOf('\n', t) === -1 ? value.length : value.indexOf('\n', t)
        const lines = value.slice(blockStart, blockEnd).split('\n')
        const next = lines
          .map((l) => (e.shiftKey ? l.replace(/^ {1,2}/, '') : INDENT + l))
          .join('\n')
        apply(blockStart, blockEnd, next, blockStart, blockStart + next.length)
        return
      }

      if (e.key === 'Enter') {
        const line = value.slice(lineStart, s)
        const indent = (line.match(/^[ \t]*/) ?? [''])[0]
        const deeper = OPENERS_AT_EOL.test(line) ? indent + INDENT : indent
        const nextChar = value[s] ?? ''
        e.preventDefault()
        // Typing Enter between a bracket pair opens a room rather than a corridor.
        if (indent !== deeper && (nextChar === ')' || nextChar === ']' || nextChar === '}')) {
          const text = '\n' + deeper + '\n' + indent
          apply(s, t, text, s + 1 + deeper.length)
          return
        }
        apply(s, t, '\n' + deeper)
        return
      }

      if (e.key === 'Backspace' && s === t) {
        const line = value.slice(lineStart, s)
        // Inside leading indentation, backspace eats a whole indent step.
        if (line.length >= INDENT.length && /^[ ]+$/.test(line) && line.length % INDENT.length === 0) {
          e.preventDefault()
          apply(s - INDENT.length, s, '')
          return
        }
        const pair = PAIRS[value[s - 1]]
        if (pair && value[s] === pair) {
          e.preventDefault()
          apply(s - 1, s + 1, '')
          return
        }
      }

      if (s === t && (e.key === ')' || e.key === ']' || e.key === '}' || e.key === '"' || e.key === "'")) {
        // Typing the closer that is already there just steps over it.
        if (value[s] === e.key) {
          e.preventDefault()
          el.setSelectionRange(s + 1, s + 1)
          return
        }
      }

      if (PAIRS[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const quote = e.key === '"' || e.key === "'"
        const nextChar = value[t] ?? ''
        // Do not auto-close a quote in the middle of a word: it turns `don` into `don''`.
        const wordish = /[\w"']/.test(nextChar) || (quote && /[\w]/.test(value[s - 1] ?? ''))
        if (s !== t) {
          // Wrap the selection instead of replacing it.
          e.preventDefault()
          apply(s, t, e.key + value.slice(s, t) + PAIRS[e.key], s + 1, t + 1)
          return
        }
        if (!wordish) {
          e.preventDefault()
          apply(s, t, e.key + PAIRS[e.key], s + 1)
          return
        }
      }
    },
    [apply, value],
  )

  const onPaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      if (!blockPaste) return
      e.preventDefault()
      onBlockedPaste?.()
    },
    [blockPaste, onBlockedPaste],
  )

  const syncScroll = useCallback(() => {
    const el = ta.current
    if (!el) return
    if (pre.current) {
      pre.current.scrollTop = el.scrollTop
      pre.current.scrollLeft = el.scrollLeft
    }
    if (gutter.current) gutter.current.scrollTop = el.scrollTop
  }, [])

  return (
    <div
      className={cn(
        'relative flex min-h-0 overflow-hidden bg-surface-2 font-mono text-[13px] leading-[20px]',
        className,
      )}
    >
      <div
        ref={gutter}
        aria-hidden
        className="no-scrollbar w-11 shrink-0 select-none overflow-hidden border-r border-line bg-surface text-right"
      >
        <div className="py-3">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="pr-2.5 tabular-nums text-muted/70">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="relative min-w-0 flex-1">
        <pre
          ref={pre}
          aria-hidden
          className="no-scrollbar pointer-events-none absolute inset-0 overflow-auto whitespace-pre px-3 py-3"
          style={{ tabSize: 2 }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <textarea
          ref={ta}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onScroll={syncScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          wrap="off"
          aria-label="Code editor"
          className="code-input scroll-thin absolute inset-0 size-full resize-none overflow-auto bg-transparent px-3 py-3 text-transparent caret-ink outline-none"
          style={{ tabSize: 2 }}
        />
      </div>
    </div>
  )
}
