// ─── @uploop-vibe/vibe-editor Code Editor ─────────────────────
//
// Syntax-highlighted code editor with line numbers and dark theme.
//
//   import { VibeCodeEditor } from '@uploop-vibe/vibe-editor/code'
//   VibeCodeEditor.mount(el, { language: 'javascript' })
//   VibeCodeEditor.setCode('const x = 1;')
//   const code = VibeCodeEditor.getCode()

import { component } from '@uploop/html'

// ── Closure state ──────────────────────────────────────────

let _code = ''
let _language = 'html'

// ── Language tokenizers ────────────────────────────────────

/**
 * Token definitions per language.
 * Each token has `regex` (global match) and `cssClass` for styling.
 * Applied in order; earlier matches take priority.
 */
const TOKENIZERS = {
  html: [
    { regex: /<!--[\s\S]*?-->/g, cls: 'comment' },
    { regex: /<\/?[a-zA-Z][\w-]*(?:\s[^>]*)?\/?>/g, cls: 'tag' },
    { regex: /[a-zA-Z-]+(?=\s*=)/g, cls: 'attr' },
    { regex: /"[^"]*"/g, cls: 'string' },
    { regex: /'[^']*'/g, cls: 'string' },
    { regex: /&[a-zA-Z]+;/g, cls: 'entity' },
  ],

  javascript: [
    { regex: /\/\/[^\n]*/g, cls: 'comment' },
    { regex: /\/\*[\s\S]*?\*\//g, cls: 'comment' },
    { regex: /"[^"\\]*(?:\\.[^"\\]*)*"/g, cls: 'string' },
    { regex: /'[^'\\]*(?:\\.[^'\\]*)*'/g, cls: 'string' },
    { regex: /`[^`\\]*(?:\\.[^`\\]*)*`/g, cls: 'string' },
    { regex: /\b(function|return|if|else|for|while|do|switch|case|break|continue|new|typeof|instanceof|in|of|void|delete)\b/g, cls: 'keyword' },
    { regex: /\b(var|let|const|class|extends|import|export|from|default|async|await|try|catch|throw|finally|yield)\b/g, cls: 'keyword' },
    { regex: /\b(true|false|null|undefined|NaN|Infinity)\b/g, cls: 'literal' },
    { regex: /\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, cls: 'number' },
    { regex: /\b(console|Math|JSON|Object|Array|String|Number|Boolean|Date|RegExp|Map|Set|Promise|Symbol)\b/g, cls: 'builtin' },
    { regex: /\b(this|super|arguments)\b/g, cls: 'special' },
  ],

  uploop: [
    { regex: /\/\/[^\n]*/g, cls: 'comment' },
    { regex: /\/\*[\s\S]*?\*\//g, cls: 'comment' },
    { regex: /"[^"\\]*(?:\\.[^"\\]*)*"/g, cls: 'string' },
    { regex: /'[^'\\]*(?:\\.[^'\\]*)*'/g, cls: 'string' },
    { regex: /`[^`\\]*(?:\\.[^`\\]*)*`/g, cls: 'string' },
    { regex: /\b(function|return|if|else|for|while|do|switch|case|break|continue|new|typeof|instanceof|void|delete)\b/g, cls: 'keyword' },
    { regex: /\b(var|let|const|class|extends|import|export|from|default|async|await|try|catch|throw|finally|yield)\b/g, cls: 'keyword' },
    { regex: /\b(component|state|update|view|mount|unmount|effect|send|get|compose|html|intent|action)\b/g, cls: 'uploop-keyword' },
    { regex: /\b(true|false|null|undefined|NaN|Infinity)\b/g, cls: 'literal' },
    { regex: /\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, cls: 'number' },
    { regex: /\b(uploop|store|schema|flow|render|hydrate|define|configure)\b/g, cls: 'uploop-builtin' },
  ],
}

// ── Token color map (dark theme) ───────────────────────────

const TOKEN_COLORS = {
  'comment': '#6a9955',
  'tag': '#569cd6',
  'attr': '#9cdcfe',
  'string': '#ce9178',
  'entity': '#d7ba7d',
  'keyword': '#c586c0',
  'literal': '#569cd6',
  'number': '#b5cea8',
  'builtin': '#4ec9b0',
  'special': '#569cd6',
  'uploop-keyword': '#c586c0',
  'uploop-builtin': '#4ec9b0',
}

// ── Inline style fragments ─────────────────────────────────

const editorWrapper = {
  display: 'flex',
  flexDirection: 'column',
  background: '#1e1e1e',
  borderRadius: 'var(--vibe-radius-md, 8px)',
  border: '1px solid #333',
  overflow: 'hidden',
  fontFamily: '"Fira Code", "Cascadia Code", Consolas, Monaco, "Courier New", monospace',
}

const editorBody = {
  display: 'flex',
  position: 'relative',
  minHeight: '200px',
  maxHeight: '600px',
}

const gutterStyle = {
  minWidth: '3rem',
  padding: '0.75rem 0.5rem 0.75rem 0.75rem',
  background: '#1a1a1a',
  color: '#858585',
  fontSize: '13px',
  lineHeight: '1.6',
  textAlign: 'right',
  userSelect: 'none',
  borderRight: '1px solid #333',
  overflow: 'hidden',
  fontFamily: 'inherit',
  whiteSpace: 'pre',
}

const textareaStyle = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  padding: '0.75rem',
  border: 'none',
  outline: 'none',
  resize: 'none',
  fontSize: '13px',
  lineHeight: '1.6',
  fontFamily: 'inherit',
  color: 'transparent',
  caretColor: '#fff',
  background: 'transparent',
  tabSize: '2',
  overflow: 'auto',
  whiteSpace: 'pre',
  zIndex: '2',
}

const overlayStyle = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  padding: '0.75rem',
  fontSize: '13px',
  lineHeight: '1.6',
  fontFamily: 'inherit',
  color: '#d4d4d4',
  whiteSpace: 'pre',
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: '1',
  wordWrap: 'break-word',
}

const toolbarBtn = {
  padding: '0.35rem 0.75rem',
  border: '1px solid #444',
  borderRadius: 'var(--vibe-radius-sm, 4px)',
  background: '#2d2d2d',
  color: '#ccc',
  cursor: 'pointer',
  fontSize: '0.78rem',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  transition: 'background 0.1s, border-color 0.1s',
}

const topBar = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  background: '#252525',
  borderBottom: '1px solid #333',
}

const langSelect = {
  padding: '0.3rem 0.5rem',
  fontSize: '0.78rem',
  fontFamily: 'inherit',
  background: '#2d2d2d',
  color: '#ccc',
  border: '1px solid #444',
  borderRadius: 'var(--vibe-radius-sm, 4px)',
  outline: 'none',
  cursor: 'pointer',
}

// ── Escape for HTML ────────────────────────────────────────

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ── Tokenize source into HTML with syntax spans ────────────

function tokenize(source, language) {
  if (!source) return ''
  const tokens = TOKENIZERS[language] || TOKENIZERS.html

  // Collect all match positions
  const matches = []
  for (const tok of tokens) {
    const re = new RegExp(tok.regex.source, tok.regex.flags)
    let m
    while ((m = re.exec(source)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, cls: tok.cls, text: m[0] })
    }
  }

  // Sort by position, earlier start wins; longer match wins on tie
  matches.sort((a, b) => a.start - b.start || b.end - a.end)

  // Remove overlapping tokens (keep the one that came first)
  const filtered = []
  let lastEnd = 0
  for (const m of matches) {
    if (m.start >= lastEnd) {
      filtered.push(m)
      lastEnd = m.end
    }
  }

  // Build HTML
  let out = ''
  let pos = 0
  for (const m of filtered) {
    if (m.start > pos) {
      out += esc(source.slice(pos, m.start))
    }
    const color = TOKEN_COLORS[m.cls] || '#d4d4d4'
    out += '<span style="color:' + color + '">' + esc(m.text) + '</span>'
    pos = m.end
  }
  if (pos < source.length) {
    out += esc(source.slice(pos))
  }

  return out
}

// ── Build HTML styles object into inline string ────────────

function styleStr(obj) {
  return Object.entries(obj)
    .map(([k, v]) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ':' + v)
    .join(';')
}

// ── Component ──────────────────────────────────────────────

export const VibeCodeEditor = component('VibeCodeEditor', {
  state: {
    language: 'html',
  },

  update: {
    configure: (s, props) => ({ ...s, ...props }),
    setLanguage: (s, language) => {
      _language = language
      return { ...s, language }
    },
  },

  view(state) {
    _language = state.language || 'html'

    const highlighted = tokenize(_code, _language)
    const lineCount = _code ? _code.split('\n').length : 1
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => String(i + 1)).join('\n')

    return ''
      + '<div class="vibe-code-editor" style="' + styleStr(editorWrapper) + '">'
      // ── Top bar ──────────────────────────────────────
      + '<div class="vibe-code-editor-top" style="' + styleStr(topBar) + '">'
      + '<select class="vibe-code-editor-lang" data-up-event="change:setLanguage" data-up-prop="value:language" style="' + styleStr(langSelect) + '">'
      + '<option value="html"' + (_language === 'html' ? ' selected' : '') + '>HTML</option>'
      + '<option value="javascript"' + (_language === 'javascript' ? ' selected' : '') + '>JavaScript</option>'
      + '<option value="uploop"' + (_language === 'uploop' ? ' selected' : '') + '>Uploop</option>'
      + '</select>'
      + '<span style="flex:1"></span>'
      + '<button class="vibe-code-editor-btn" data-action="export-html" style="' + styleStr(toolbarBtn) + '">↗ Export as HTML File</button>'
      + '<button class="vibe-code-editor-btn" data-action="export-uploop" style="' + styleStr(toolbarBtn) + '">↗ Export as Uploop JS</button>'
      + '</div>'
      // ── Editor body ──────────────────────────────────
      + '<div class="vibe-code-editor-body" style="' + styleStr(editorBody) + '">'
      // Line numbers gutter
      + '<div class="vibe-code-editor-gutter" aria-hidden="true" style="' + styleStr(gutterStyle) + '">' + esc(lineNumbers) + '</div>'
      // Editing area wrapper
      + '<div style="position:relative;flex:1;overflow:hidden">'
      // Syntax-highlighted overlay
      + '<pre class="vibe-code-editor-overlay" aria-hidden="true" style="'
      + styleStr(overlayStyle) + ';position:relative;width:100%;height:100%;overflow-y:auto;margin:0">'
      + '<code>' + (highlighted || '<span style="color:#858585">Start typing...</span>') + '\n</code></pre>'
      // Textarea (on top for editing)
      + '<textarea class="vibe-code-editor-textarea" spellcheck="false" style="' + styleStr(textareaStyle) + '"></textarea>'
      + '</div>'
      + '</div>'
      + '</div>'
  },

  /**
   * Wire textarea input, keyboard handling (Tab, indent preservation),
   * scroll sync, and export buttons.
   */
  mount(el, ctx) {
    if (!ctx || typeof document === 'undefined') return

    const textarea = el.querySelector('.vibe-code-editor-textarea')
    const overlay = el.querySelector('.vibe-code-editor-overlay')
    const gutter = el.querySelector('.vibe-code-editor-gutter')
    const send = (ev, val) => ctx.send(ev, val)

    // ── Restore code into textarea ──────────────────────

    if (textarea && _code) {
      textarea.value = _code
    }

    // ── Input handler ───────────────────────────────────

    const onInput = () => {
      if (!textarea) return
      _code = textarea.value

      // Update overlay with highlighted version
      if (overlay) {
        const h = tokenize(_code, _language)
        overlay.querySelector('code').innerHTML = h + '\n'
      }

      // Update line numbers
      if (gutter) {
        const lineCount = _code ? _code.split('\n').length : 1
        gutter.textContent = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1).join('\n')
      }
    }

    if (textarea) {
      textarea.addEventListener('input', onInput)
    }

    // ── Tab key → insert 2 spaces ───────────────────────

    const onKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const ta = e.target
        if (ta.tagName !== 'TEXTAREA') return
        const start = ta.selectionStart
        const end = ta.selectionEnd
        const val = ta.value

        if (e.shiftKey) {
          // Shift+Tab: outdent
          const lineStart = val.lastIndexOf('\n', start - 1) + 1
          const line = val.slice(lineStart, start)
          const leading = line.match(/^ {1,2}/)
          if (leading) {
            ta.value = val.slice(0, lineStart) + line.slice(leading[0].length) + val.slice(start)
            ta.selectionStart = ta.selectionEnd = start - leading[0].length
            ta.dispatchEvent(new Event('input', { bubbles: true }))
          }
        } else {
          // Insert 2 spaces
          ta.value = val.slice(0, start) + '  ' + val.slice(end)
          ta.selectionStart = ta.selectionEnd = start + 2
          ta.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }
    }

    if (textarea) {
      textarea.addEventListener('keydown', onKeyDown)
    }

    // ── Indentation preservation on Enter ───────────────

    const onKeyUp = (e) => {
      if (e.key !== 'Enter') return
      const ta = e.target
      if (ta.tagName !== 'TEXTAREA') return
      const start = ta.selectionStart
      const val = ta.value

      // Find the indentation of the previous line
      const prevNewline = val.lastIndexOf('\n', start - 2)
      const lineStart = prevNewline === -1 ? 0 : prevNewline + 1
      const lineEnd = start - 1
      const prevLine = val.slice(lineStart, lineEnd)
      const indent = prevLine.match(/^(\s*)/)
      if (indent && indent[1]) {
        // Check if line ends with { — add extra indent
        const trimmed = prevLine.trimEnd()
        const extra = trimmed.endsWith('{') || trimmed.endsWith('(') || trimmed.endsWith('[') ? '  ' : ''
        const insert = indent[1] + extra
        const newVal = val.slice(0, start) + insert + val.slice(start)
        ta.value = newVal
        ta.selectionStart = ta.selectionEnd = start + insert.length
        ta.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }

    if (textarea) {
      textarea.addEventListener('keyup', onKeyUp)
    }

    // ── Scroll sync: textarea ↔ overlay + gutter ────────

    const onScroll = () => {
      if (!textarea || !overlay) return
      overlay.scrollTop = textarea.scrollTop
      overlay.scrollLeft = textarea.scrollLeft
      if (gutter) gutter.scrollTop = textarea.scrollTop
    }

    if (textarea) {
      textarea.addEventListener('scroll', onScroll)
    }

    // ── Export buttons ──────────────────────────────────

    const topBar = el.querySelector('.vibe-code-editor-top')

    const onExportClick = (e) => {
      const btn = e.target.closest('button[data-action]')
      if (!btn) return

      const action = btn.dataset.action

      if (action === 'export-html') {
        el.dispatchEvent(
          new CustomEvent('up-code-export', {
            detail: { format: 'html', code: _code },
            bubbles: true,
          })
        )
      } else if (action === 'export-uploop') {
        el.dispatchEvent(
          new CustomEvent('up-code-export', {
            detail: { format: 'uploop', code: _code },
            bubbles: true,
          })
        )
      }
    }

    if (topBar) {
      topBar.addEventListener('click', onExportClick)
    }

    send('markReady', true)

    // ── Cleanup ────────────────────────────────────────

    return () => {
      if (textarea) {
        textarea.removeEventListener('input', onInput)
        textarea.removeEventListener('keydown', onKeyDown)
        textarea.removeEventListener('keyup', onKeyUp)
        textarea.removeEventListener('scroll', onScroll)
      }
      if (topBar) {
        topBar.removeEventListener('click', onExportClick)
      }
    }
  },
})

// ── Public static API ──────────────────────────────────────

/** Set the editor code content */
VibeCodeEditor.setCode = function (code) {
  _code = code || ''
  const ta = document.querySelector('.vibe-code-editor-textarea')
  if (ta) {
    ta.value = _code
    ta.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

/** Get the current editor code content */
VibeCodeEditor.getCode = function () {
  const ta = document.querySelector('.vibe-code-editor-textarea')
  if (ta) _code = ta.value
  return _code
}

/** Set the language mode */
VibeCodeEditor.setLanguage = function (lang) {
  _language = lang || 'html'
  // Re-tokenize if editor is mounted
  const ta = document.querySelector('.vibe-code-editor-textarea')
  if (ta) {
    ta.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

export default VibeCodeEditor
