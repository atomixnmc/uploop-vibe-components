// @uploop-vibe/vibe-editor EditorArea
//
// Stable DOM container that isolates editor content from
// Uploop's innerHTML replacement cycle.
//
// Problem: Uploop's view() → innerHTML destroys contenteditable,
// canvas, video/audio elements, and event listeners on every render.
//
// Solution: EditorArea renders a container div that survives
// re-renders via ctx.registerResource(). Editor content is mounted
// into this container externally, outside the view() template.
//
// Usage:
//   const area = EditorArea.create({})
//   area.mount(parentEl)
//   // Now mount your editor into the stable container:
//   const stableEl = EditorArea.getContainer()
//   myContentEditor.mount(stableEl)

import { component } from '@uploop/html'

let _containerEl = null

export const EditorArea = component('EditorArea', {
  state: {
    label: '',
    minHeight: '200px',
    border: true,
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
  },

  view(state) {
    const border = state.border
      ? 'border:1px solid var(--vibe-color-border, #dadce0);border-radius:8px;'
      : ''
    return `
    <div class="vibe-editor-area" style="
      display:flex;flex-direction:column;
      font-family:system-ui,sans-serif;
    ">
      ${state.label ? `<div style="font-size:11px;font-weight:600;color:#888;padding:0 0 6px 2px;">${esc(state.label)}</div>` : ''}
      <div id="vibe-editor-area-container" style="
        ${border}
        min-height:${state.minHeight};
        position:relative;overflow:hidden;
        background:#fff;
      "></div>
    </div>`
  },

  mount(el, ctx) {
    const container = el.querySelector('#vibe-editor-area-container')
    if (container) _containerEl = container

    // Register as persistent resource so the container survives re-renders
    ctx.registerResource?.('editor-area', {
      save: () => {
        if (_containerEl?.parentNode) {
          _containerEl.parentNode.removeChild(_containerEl)
        }
        return _containerEl?.innerHTML || ''
      },
      restore: (html) => {
        const newContainer = el.querySelector('#vibe-editor-area-container')
        if (newContainer) {
          _containerEl = newContainer
          if (html && !_containerEl.hasChildNodes()) {
            _containerEl.innerHTML = html
          }
        }
      },
    })
  },
})

/** Get the stable container element for mounting editors into */
EditorArea.getContainer = () => _containerEl

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
