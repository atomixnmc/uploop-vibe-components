// ─── @uploop-vibe/vibe-editor WYSIWYG ─────────────────────────
//
// IMPORTANT: contenteditable body content lives in closure variables,
// NOT in component state — prevents innerHTML re-render from
// destroying the contenteditable on every keystroke.
//
//   import { WysiwygEditor } from '@uploop-vibe/vibe-editor/wysiwyg'
//   WysiwygEditor.mount(el)
//   WysiwygEditor.setContent('<p>hello</p>')
//   WysiwygEditor.getContent()

import { component } from '@uploop/html'
import { editorPrompt } from './editor-prompt.js'
import { showInspector } from './hypergraph-inspector.js'

// ── Closure state (survives innerHTML re-renders) ──────────

let _bodyHTML = ''
let _readOnly = false
let _showToolbar = true

// ── Inline style fragments ─────────────────────────────────

const toolbarBase =
  'display:flex;gap:4px;padding:0.5rem;' +
  'background:var(--vibe-color-neutral50, #fafafa);' +
  'border:1px solid var(--vibe-color-border, #e2e8f0);' +
  'border-bottom:none;border-radius:var(--vibe-radius-md, 8px) var(--vibe-radius-md, 8px) 0 0;' +
  'flex-wrap:wrap;align-items:center'

const tbBtn =
  'padding:0.35rem 0.55rem;' +
  'border:1px solid var(--vibe-color-border, #cbd5e1);' +
  'border-radius:var(--vibe-radius-sm, 4px);' +
  'background:var(--vibe-color-bg, #fff);' +
  'color:var(--vibe-color-fg, #334155);' +
  'cursor:pointer;min-width:30px;font-size:0.8rem;' +
  'transition:background 0.1s, box-shadow 0.1s;' +
  'font-family:inherit;line-height:1.4'

const tbBtnActive =
  'padding:0.35rem 0.55rem;' +
  'border:1px solid var(--vibe-color-primary500, #646cff);' +
  'border-radius:var(--vibe-radius-sm, 4px);' +
  'background:var(--vibe-color-primary50, #eef2ff);' +
  'color:var(--vibe-color-primary600, #4f46e5);' +
  'cursor:pointer;min-width:30px;font-size:0.8rem;' +
  'transition:background 0.1s, box-shadow 0.1s;' +
  'font-family:inherit;line-height:1.4'

const bodyBase =
  'min-height:250px;padding:1rem;' +
  'border:1px solid var(--vibe-color-border, #cbd5e1);' +
  'border-radius:0 0 var(--vibe-radius-md, 8px) var(--vibe-radius-md, 8px);' +
  'outline:none;background:var(--vibe-color-bg, #fff);' +
  'font-size:1rem;line-height:1.7;' +
  'color:var(--vibe-color-fg, #1e293b);' +
  'overflow-y:auto'

// ── Separator for toolbar button groups ────────────────────

function sep() {
  return '<span style="width:1px;background:var(--vibe-color-border,#cbd5e1);margin:0 4px;align-self:stretch"></span>'
}

// ── Helper — escape for HTML attribute safety ──────────────

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

// ── Build toolbar HTML ─────────────────────────────────────

function toolbarHTML() {
  return ''
    + '<div class="up-wysiwyg-toolbar" style="' + toolbarBase + '">'
    + '<button data-cmd="bold" title="Bold (Ctrl+B)" style="' + tbBtn + ';font-weight:bold">B</button>'
    + '<button data-cmd="italic" title="Italic (Ctrl+I)" style="' + tbBtn + ';font-style:italic">I</button>'
    + '<button data-cmd="underline" title="Underline (Ctrl+U)" style="' + tbBtn + ';text-decoration:underline">U</button>'
    + '<button data-cmd="strikeThrough" title="Strikethrough" style="' + tbBtn + ';text-decoration:line-through">S</button>'
    + sep()
    + '<button data-cmd="formatBlock" data-arg="h2" title="Heading 2" style="' + tbBtn + ';font-weight:700">H2</button>'
    + '<button data-cmd="formatBlock" data-arg="h3" title="Heading 3" style="' + tbBtn + ';font-weight:700">H3</button>'
    + sep()
    + '<button data-cmd="insertUnorderedList" title="Bullet List" style="' + tbBtn + '">≡•</button>'
    + '<button data-cmd="insertOrderedList" title="Numbered List" style="' + tbBtn + '">≡1</button>'
    + sep()
    + '<button data-cmd="createLink" title="Insert Link (Ctrl+K)" style="' + tbBtn + '">🔗</button>'
    + '<button data-cmd="unlink" title="Remove Link" style="' + tbBtn + '">🔓</button>'
    + sep()
    + '<button data-media="image" title="Insert Image" style="' + tbBtn + '">🖼 Image</button>'
    + '<button data-media="carousel" title="Insert Carousel" style="' + tbBtn + '">🎠 Carousel</button>'
    + '<button data-media="audio" title="Insert Audio" style="' + tbBtn + '">🎵 Audio</button>'
    + '<button data-media="video" title="Insert Video" style="' + tbBtn + '">🎬 Video</button>'
    + sep()
    + '<button data-action="inspect" title="Inspect HyperGraph" style="' + tbBtn + '">🔍 Inspect</button>'
    + '</div>'
}

// ── Component ──────────────────────────────────────────────

export const VibeWysiwygEditor = component('VibeWysiwygEditor', {
  state: {
    ready: false,
    showToolbar: true,
    readOnly: false,
  },

  update: {
    markReady: (s) => ({ ...s, ready: true }),
    configure: (s, props) => ({
      ...s,
      ...props,
    }),
    setShowToolbar: (s, v) => {
      _showToolbar = !!v
      return { ...s, showToolbar: _showToolbar }
    },
    setReadOnly: (s, v) => {
      _readOnly = !!v
      return { ...s, readOnly: _readOnly }
    },
  },

  view(state) {
    // Sync closure state from component state on initial render
    // (component state is the source of truth for props)
    _showToolbar = state.showToolbar !== false
    _readOnly = !!state.readOnly

    const showTb = _showToolbar && !_readOnly

    const tbBorderFix = showTb ? 'border-top:none;' : 'border-radius:var(--vibe-radius-md, 8px);'

    return ''
      + '<div class="up-wysiwyg" style="font-family:system-ui,-apple-system,sans-serif">'
      + (showTb ? toolbarHTML() : '')
      + '<div class="up-wysiwyg-body"'
      + ' contenteditable="' + (_readOnly ? 'false' : 'true') + '"'
      + ' style="' + bodyBase + tbBorderFix + '"'
      + '></div>'
      + '</div>'
  },

  /**
   * Wire toolbar click handlers, keyboard shortcuts, and input listener.
   * Restore contenteditable content from closure on mount.
   */
  mount(el, ctx) {
    if (!ctx || typeof document === 'undefined') return

    const body = el.querySelector('.up-wysiwyg-body')
    const send = (ev, val) => ctx.send(ev, val)

    // Restore content from closure (survives re-renders)
    if (body && _bodyHTML) {
      body.innerHTML = _bodyHTML
    }

    // ── Toolbar click handler ────────────────────────────

    const toolbar = el.querySelector('.up-wysiwyg-toolbar')

    const onClick = async (e) => {
      const btn = e.target.closest('button')
      if (!btn) return
      e.preventDefault()

      const cmd = btn.dataset.cmd
      if (cmd === 'createLink') {
        const result = await editorPrompt({
          title: 'Insert Link',
          fields: [
            { key: 'url', label: 'URL', type: 'url', placeholder: 'https://', required: true },
          ]
        })
        if (result?.url) document.execCommand(cmd, false, result.url)
      } else if (cmd) {
        document.execCommand(cmd, false, btn.dataset.arg || null)
      }

      const mediaType = btn.dataset.media
      if (mediaType) {
        if (body) body.focus()
        if (mediaType === 'image') {
          const result = await editorPrompt({
            title: 'Insert Image',
            fields: [
              { key: 'url', label: 'Image URL', type: 'url', placeholder: 'https://...', required: true },
              { key: 'alt', label: 'Alt Text', type: 'text', placeholder: 'Image description' },
            ]
          })
          if (result?.url) document.execCommand('insertImage', false, result.url)
        } else if (mediaType === 'audio') {
          const result = await editorPrompt({
            title: 'Insert Audio',
            fields: [
              { key: 'url', label: 'Audio URL', type: 'url', placeholder: 'https://...mp3', required: true },
            ]
          })
          if (result?.url) {
            document.execCommand('insertHTML', false, '<audio controls src="' + esc(result.url) + '" style="width:100%;margin:0.5rem 0;"></audio><p></p>')
          }
        } else if (mediaType === 'video') {
          const result = await editorPrompt({
            title: 'Insert Video',
            fields: [
              { key: 'url', label: 'Video URL', type: 'url', placeholder: 'https://...mp4', required: true },
            ]
          })
          if (result?.url) {
            document.execCommand('insertHTML', false, '<video controls src="' + esc(result.url) + '" style="width:100%;max-width:560px;margin:0.5rem 0;border-radius:8px;"></video><p></p>')
          }
        } else if (mediaType === 'carousel') {
          const html = '<div style="background:#f0f0ff;border:2px dashed #646cff;border-radius:8px;padding:1rem;text-align:center;margin:0.5rem 0;">🎠 <strong>Carousel Placeholder</strong><br><span style="font-size:0.8rem;color:#888;">Replace with carousel images</span></div><p></p>'
          document.execCommand('insertHTML', false, html)
        }
      }

      // Inspect action — pass the component descriptor for full graph
      if (btn.dataset.action === 'inspect') {
        showInspector(VibeWysiwygEditor)
      }

      // Save to closure after toolbar action
      if (body) _bodyHTML = body.innerHTML

      // Update toolbar button active states
      _updateToolbarState(toolbar)
    }

    if (toolbar) {
      toolbar.addEventListener('click', onClick)
    }

    // ── Keyboard shortcuts ─────────────────────────────

    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey) {
        const map = { b: 'bold', i: 'italic', u: 'underline', k: 'createLink' }
        const cmd = map[e.key]
        if (cmd) {
          e.preventDefault()
          if (cmd === 'createLink') {
            editorPrompt({
              title: 'Insert Link',
              fields: [{ key: 'url', label: 'URL', type: 'url', placeholder: 'https://', required: true }]
            }).then(result => {
              if (result?.url) document.execCommand(cmd, false, result.url)
            })
          } else {
            document.execCommand(cmd)
          }
          if (body) _bodyHTML = body.innerHTML
          if (toolbar) _updateToolbarState(toolbar)
        }
      }
    }

    if (body) {
      body.addEventListener('keydown', onKey)
    }

    // ── Save to closure on each keystroke ──────────────

    const onInput = () => {
      if (body) _bodyHTML = body.innerHTML
      if (toolbar) _updateToolbarState(toolbar)
    }

    if (body) {
      body.addEventListener('input', onInput)
    }

    // ── Selection change → update toolbar state ────────

    const onSelectionChange = () => {
      if (toolbar) _updateToolbarState(toolbar)
    }

    document.addEventListener('selectionchange', onSelectionChange)

    send('markReady')

    // ── Cleanup ────────────────────────────────────────

    return () => {
      if (toolbar) toolbar.removeEventListener('click', onClick)
      if (body) {
        body.removeEventListener('keydown', onKey)
        body.removeEventListener('input', onInput)
      }
      document.removeEventListener('selectionchange', onSelectionChange)
    }
  },
})

// ── Helpers ────────────────────────────────────────────────

/**
 * Update toolbar button active states based on current selection.
 * Highlights buttons whose format is active at the cursor.
 */
function _updateToolbarState(toolbar) {
  if (!toolbar) return
  const btns = toolbar.querySelectorAll('button[data-cmd]')
  btns.forEach((btn) => {
    const cmd = btn.dataset.cmd
    if (!cmd || cmd === 'createLink' || cmd === 'unlink') return

    let active = false
    try {
      if (cmd === 'formatBlock') {
        const arg = btn.dataset.arg
        if (arg) {
          const fmt = document.queryCommandValue('formatBlock')
          active = fmt && fmt.toLowerCase() === arg.toLowerCase()
        }
      } else {
        active = document.queryCommandState(cmd)
      }
    } catch (_) {
      // queryCommandState may throw on some commands
    }
    btn.setAttribute('style', active ? tbBtnActive : tbBtn)
    // Preserve special inline styles
    if (cmd === 'bold') btn.style.fontWeight = 'bold'
    if (cmd === 'italic') btn.style.fontStyle = 'italic'
    if (cmd === 'underline') btn.style.textDecoration = 'underline'
    if (cmd === 'strikeThrough') btn.style.textDecoration = 'line-through'
    if (cmd === 'formatBlock') btn.style.fontWeight = '700'
  })
}

// ── Public static API ──────────────────────────────────────

/** Set the WYSIWYG content (call after mount) */
VibeWysiwygEditor.setContent = function (html) {
  _bodyHTML = html || ''
  const body = document.querySelector('.up-wysiwyg-body')
  if (body) body.innerHTML = _bodyHTML
}

/** Get the current WYSIWYG content */
VibeWysiwygEditor.getContent = function () {
  const body = document.querySelector('.up-wysiwyg-body')
  if (body) _bodyHTML = body.innerHTML
  return _bodyHTML
}

export default VibeWysiwygEditor
