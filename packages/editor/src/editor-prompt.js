// @uploop-vibe/vibe-editor EditorPrompt
// Structured input dialog using @uploop/schema for field validation.
// Replaces browser prompt() with a styled, non-blocking dialog.

import { component } from '@uploop/html'

// Module-scoped state for the currently active prompt
let _activePrompt = null
// Resolve/reject for the promise-based API
let _resolve = null, _reject = null

/**
 * Show a structured editor prompt and return a promise with the result.
 *
 * @param {Object} config
 * @param {string} config.title — dialog title
 * @param {Array<Object>} config.fields — [{ key, label, type, placeholder, defaultValue, required }]
 * @returns {Promise<Object|null>} — field values keyed by field key, or null if cancelled
 *
 * @example
 * const result = await editorPrompt({
 *   title: 'Insert Image',
 *   fields: [
 *     { key: 'url', label: 'Image URL', type: 'url', placeholder: 'https://...', required: true },
 *     { key: 'alt', label: 'Alt Text', type: 'text', placeholder: 'Description' },
 *     { key: 'width', label: 'Width', type: 'text', placeholder: 'auto' },
 *   ]
 * })
 * // { url: 'https://...', alt: 'My image', width: '400' }
 */
export function editorPrompt(config) {
  return new Promise((resolve) => {
    _activePrompt = config
    _resolve = resolve

    // Find or create the prompt container
    let el = document.getElementById('vibe-editor-prompt')
    if (!el) {
      el = document.createElement('div')
      el.id = 'vibe-editor-prompt'
      document.body.appendChild(el)
    }

    const inst = EditorPromptDialog.create(config)
    inst.mount(el)
  })
}

// Close from within the dialog
function close(result) {
  _activePrompt = null
  const r = _resolve
  _resolve = null
  r?.(result)
  const el = document.getElementById('vibe-editor-prompt')
  if (el) el.innerHTML = ''
}

// ── Dialog Component ──────────────────────────────────────

export const EditorPromptDialog = component('EditorPromptDialog', {
  state: {},

  update: {
    init: (s, config) => {
      // Build initial values from field defaults
      const vals = {}
      for (const f of (config.fields || [])) {
        vals[f.key] = f.defaultValue || ''
      }
      return { ...s, ...config, values: vals, error: '' }
    },
    setValue: (s, key, val) => ({
      ...s, values: { ...s.values, [key]: val },
    }),
    setError: (s, err) => ({ ...s, error: err }),
    submit: (s) => {
      // Validate required fields
      for (const f of (s.fields || [])) {
        if (f.required && (!s.values[f.key] || !s.values[f.key].trim())) {
          return { ...s, error: f.label + ' is required' }
        }
      }
      close(s.values)
      return s
    },
    cancel: (s) => {
      close(null)
      return s
    },
  },

  view(state) {
    const { title, fields = [], values = {}, error } = state
    const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

    return `
    <div style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4);backdrop-filter:blur(2px);">
      <div style="background:#fff;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,0.2);min-width:360px;max-width:440px;overflow:hidden;font-family:system-ui,sans-serif;">
        <div style="padding:1rem 1.25rem;border-bottom:1px solid #e8eaed;font-size:14px;font-weight:600;color:#1a1a1a;">${esc(title)}</div>
        <div style="padding:1rem 1.25rem;display:flex;flex-direction:column;gap:0.75rem;">
          ${fields.map(f => `
            <div>
              <label style="display:block;font-size:12px;font-weight:500;color:#666;margin-bottom:4px;">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <input class="vibe-prompt-input" data-prompt-key="${f.key}"
                type="${f.type === 'url' ? 'url' : 'text'}"
                placeholder="${esc(f.placeholder || '')}"
                value="${esc(values[f.key] || '')}"
                style="width:100%;padding:6px 10px;border:1px solid #dadce0;border-radius:6px;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;"
              />
            </div>
          `).join('')}
          ${error ? `<div style="font-size:12px;color:#d93025;margin-top:-4px;">${esc(error)}</div>` : ''}
        </div>
        <div style="padding:0.75rem 1.25rem;border-top:1px solid #e8eaed;display:flex;gap:0.5rem;justify-content:flex-end;">
          <button data-up-event="click:cancel" style="padding:6px 16px;border:1px solid #dadce0;border-radius:6px;background:#fff;font-size:13px;cursor:pointer;font-family:inherit;">Cancel</button>
          <button data-up-event="click:submit" style="padding:6px 16px;border:none;border-radius:6px;background:#1a73e8;color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;">OK</button>
        </div>
      </div>
    </div>`
  },

  mount(el, ctx) {
    // Initialize with the active prompt config
    if (_activePrompt) ctx.send('init', _activePrompt)

    // Handle Enter key in inputs
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') ctx.send('cancel')
    })

    // Handle input changes via delegation
    el.addEventListener('input', (e) => {
      const inp = e.target.closest('.vibe-prompt-input')
      if (inp) {
        const key = inp.dataset.promptKey
        if (key) ctx.send('setValue', key, inp.value)
      }
    })

    // Handle submit/cancel via toolbar buttons
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('button')
      if (!btn) return
      const ev = btn.getAttribute('data-up-event')
      if (ev === 'click:submit') { e.preventDefault(); ctx.send('submit') }
      if (ev === 'click:cancel') { e.preventDefault(); ctx.send('cancel') }
    })

    // Focus first input
    setTimeout(() => {
      const first = el.querySelector('.vibe-prompt-input')
      if (first) first.focus()
    }, 50)
  },
})
