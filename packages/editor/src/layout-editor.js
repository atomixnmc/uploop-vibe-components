// ─── @uploop-vibe/vibe-editor VibeLayoutEditor ─────────────────
//
// Drag-and-drop layout builder with:
//  - Component catalog sidebar (available Vibe components)
//  - Drop zone with grid / flex / stack layout modes
//  - Drag from catalog → drop zone to place components
//  - Rearrange components within drop zone via drag
//  - Click to select, property editor for selected component
//  - Delete selected component
//  - Layout mode toggle: grid | flex | stack
//  - Export / import layout as JSON config
//
// Uses @uploop/store for layout state; pointer events for drag
// (supports both mouse and touch).

import { component } from '@uploop/html'
import { store } from '@uploop/store'

// ---------------------------------------------------------------------------
// Component catalog
// ---------------------------------------------------------------------------

const DEFAULT_CATALOG = [
  { type: 'Button',   icon: '🔘', label: 'Button',   defaultProps: { label: 'Button', variant: 'solid', size: 'md' } },
  { type: 'Card',     icon: '🃏', label: 'Card',     defaultProps: { padding: 'md', shadow: 'sm', bordered: true } },
  { type: 'Input',    icon: '📝', label: 'Input',    defaultProps: { placeholder: 'Enter text...', size: 'md', fullWidth: true } },
  { type: 'Text',     icon: '🔤', label: 'Text',     defaultProps: { content: 'Hello World', size: 'md', weight: 'normal' } },
  { type: 'Image',    icon: '🖼️', label: 'Image',    defaultProps: { src: '', alt: '', width: '100%', height: 'auto' } },
  { type: 'Badge',    icon: '🏷️', label: 'Badge',    defaultProps: { label: 'New', variant: 'solid', color: 'primary', size: 'md' } },
  { type: 'Avatar',   icon: '👤', label: 'Avatar',   defaultProps: { name: 'User', size: 'md' } },
  { type: 'Checkbox', icon: '☑️', label: 'Checkbox', defaultProps: { label: 'Option', checked: false } },
  { type: 'Select',   icon: '📋', label: 'Select',   defaultProps: { placeholder: 'Select...', options: [] } },
  { type: 'Divider',  icon: '➖', label: 'Divider',  defaultProps: {} },
  { type: 'Spacer',   icon: '⬜', label: 'Spacer',   defaultProps: { height: '1rem' } },
  { type: 'Container',icon: '📦', label: 'Container',defaultProps: { padding: 'md', direction: 'column', gap: '0.5rem' } },
]

// ---------------------------------------------------------------------------
// Layout store
// ---------------------------------------------------------------------------

export const layoutStore = store({
  name: 'vibe-layout',
  state: {
    catalog: DEFAULT_CATALOG,
    layout: {
      mode: 'grid',   // grid | flex | stack
      items: [],      // [{ id, type, props, position }]
    },
  },
  update: {
    setCatalog: (s, catalog) => ({ ...s, catalog: Array.isArray(catalog) ? catalog : DEFAULT_CATALOG }),
    setLayout: (s, layout) => ({ ...s, layout }),
    setMode: (s, mode) => ({ ...s, layout: { ...s.layout, mode } }),
    addItem: (s, item) => ({
      ...s,
      layout: { ...s.layout, items: [...s.layout.items, item] },
    }),
    updateItem: (s, id, props) => ({
      ...s,
      layout: {
        ...s.layout,
        items: s.layout.items.map(it => (it.id === id ? { ...it, props: { ...it.props, ...props } } : it)),
      },
    }),
    deleteItem: (s, id) => ({
      ...s,
      layout: { ...s.layout, items: s.layout.items.filter(it => it.id !== id) },
    }),
    moveItem: (s, id, toIndex) => {
      const items = [...s.layout.items]
      const fromIdx = items.findIndex(it => it.id === id)
      if (fromIdx === -1) return s
      const [moved] = items.splice(fromIdx, 1)
      items.splice(toIndex, 0, moved)
      return { ...s, layout: { ...s.layout, items } }
    },
    clearLayout: (s) => ({ ...s, layout: { ...s.layout, items: [] } }),
    importLayout: (s, json) => {
      let parsed
      try { parsed = typeof json === 'string' ? JSON.parse(json) : json } catch { return s }
      if (!parsed || !Array.isArray(parsed.items)) return s
      return { ...s, layout: { mode: parsed.mode || 'grid', items: parsed.items } }
    },
  },
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _nextId = 1
function uid() { return `lo_${Date.now()}_${_nextId++}` }

function esc(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

const PROPERTY_SCHEMAS = {
  Button:   ['label', 'variant', 'size'],
  Card:     ['padding', 'shadow', 'bordered'],
  Input:    ['placeholder', 'size', 'fullWidth'],
  Text:     ['content', 'size', 'weight'],
  Image:    ['src', 'alt', 'width', 'height'],
  Badge:    ['label', 'variant', 'color', 'size'],
  Avatar:   ['name', 'size'],
  Checkbox: ['label', 'checked'],
  Select:   ['placeholder'],
  Divider:  [],
  Spacer:   ['height'],
  Container:['padding', 'direction', 'gap'],
}

const PROPERTY_LABELS = {
  label: 'Label', variant: 'Variant', size: 'Size', color: 'Color',
  padding: 'Padding', shadow: 'Shadow', bordered: 'Bordered',
  placeholder: 'Placeholder', fullWidth: 'Full Width',
  content: 'Content', weight: 'Weight', src: 'Image URL',
  alt: 'Alt Text', width: 'Width', height: 'Height',
  name: 'Name', checked: 'Checked', options: 'Options',
  direction: 'Direction', gap: 'Gap',
}

// ---------------------------------------------------------------------------
// Drag state — module-scoped so pointermove/up work across frames
// ---------------------------------------------------------------------------

let dragState = null // { type: 'catalog'|'reorder', item?, fromIndex?, ghostEl?, dropIndicatorEl? }

// ---------------------------------------------------------------------------
// VibeLayoutEditor component
// ---------------------------------------------------------------------------

export const VibeLayoutEditor = component('VibeLayoutEditor', {
  state: {
    selectedId: null,
    dragging: null,       // { from: 'catalog'|'layout', item } | null
    dragOverIdx: -1,      // drop indicator position
    showImport: false,
    importJson: '',
    importError: '',
  },

  update: {
    _refresh: (s) => ({ ...s }),   // triggers re-render on store change
    selectItem: (s, id) => ({ ...s, selectedId: id }),
    deselectAll: (s) => ({ ...s, selectedId: null }),
    setDragging: (s, dragging) => ({ ...s, dragging }),
    setDragOverIdx: (s, idx) => ({ ...s, dragOverIdx: idx }),
    toggleImport: (s) => ({ ...s, showImport: !s.showImport, importJson: '', importError: '' }),
    setImportJson: (s, val) => ({ ...s, importJson: val }),
    setImportError: (s, err) => ({ ...s, importError: err }),
  },

  view(state) {
    const storeState = layoutStore.select()
    const { catalog, layout } = storeState
    const { selectedId, dragOverIdx, showImport, importJson, importError } = state

    const selectedItem = layout.items.find(it => it.id === selectedId)
    const propSchema = selectedItem ? (PROPERTY_SCHEMAS[selectedItem.type] || []) : []

    return /* html */ `
    <div class="vibe-layout-editor" style="
      display:flex; gap:0;
      font-family:var(--vibe-font-sans, system-ui, sans-serif);
      font-size:var(--vibe-font-size-sm);
      color:var(--vibe-color-fg);
      background:var(--vibe-color-bg);
      border:1px solid var(--vibe-color-border);
      border-radius:var(--vibe-radius-md);
      overflow:hidden; height:520px;
    ">
      <!-- ── Catalog Sidebar ──────────────────────────────────── -->
      <div class="vibe-layout-catalog" style="
        width:180px; min-width:180px;
        border-right:1px solid var(--vibe-color-border);
        background:var(--vibe-color-surface);
        display:flex; flex-direction:column; overflow:hidden;
      ">
        <div style="padding:0.625rem 0.75rem; font-weight:var(--vibe-font-weight-semibold);
          font-size:var(--vibe-font-size-xs); color:var(--vibe-color-mutedFg);
          border-bottom:1px solid var(--vibe-color-border);
          text-transform:uppercase; letter-spacing:0.05em;
        ">Components</div>
        <div class="vibe-layout-catalog-list" style="
          flex:1; overflow-y:auto; padding:0.375rem;
        ">
          ${catalog.map(item => `
            <div class="vibe-layout-catalog-item"
              data-catalog-type="${esc(item.type)}"
              style="
                display:flex; align-items:center; gap:0.5rem;
                padding:0.5rem 0.625rem; border-radius:var(--vibe-radius-sm);
                cursor:grab; user-select:none;
                font-size:var(--vibe-font-size-xs);
                transition:background var(--vibe-duration-fast);
              "
              onmouseenter="this.style.background='var(--vibe-color-hover)'"
              onmouseleave="this.style.background='transparent'"
            >
              <span style="font-size:1rem;">${item.icon}</span>
              <span>${esc(item.label)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ── Main Area ────────────────────────────────────────── -->
      <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
        <!-- Toolbar -->
        <div style="
          display:flex; align-items:center; gap:0.375rem;
          padding:0.5rem 0.75rem;
          border-bottom:1px solid var(--vibe-color-border);
          background:var(--vibe-color-surface);
        ">
          <span style="font-size:var(--vibe-font-size-xs); font-weight:var(--vibe-font-weight-medium);">Layout:</span>
          ${['grid', 'flex', 'stack'].map(mode => `
            <button class="vibe-layout-mode-btn" data-mode="${mode}"
              data-up-event="click:_setMode,${mode}" style="
                padding:0.2rem 0.625rem;
                font-size:var(--vibe-font-size-xs);
                border:1px solid ${layout.mode === mode ? '#3b82f6' : 'var(--vibe-color-border)'};
                border-radius:var(--vibe-radius-sm);
                background:${layout.mode === mode ? '#eff6ff' : 'var(--vibe-color-bg)'};
                color:${layout.mode === mode ? '#3b82f6' : 'var(--vibe-color-fg)'};
                cursor:pointer; text-transform:capitalize;
              ">${mode}</button>
          `).join('')}
          <div style="flex:1;"></div>
          <button data-up-event="click:_exportLayout" style="
            padding:0.25rem 0.625rem; font-size:var(--vibe-font-size-xs);
            border:1px solid var(--vibe-color-border);
            border-radius:var(--vibe-radius-sm);
            background:var(--vibe-color-bg);
            color:var(--vibe-color-fg); cursor:pointer;
          ">Export</button>
          <button data-up-event="click:toggleImport" style="
            padding:0.25rem 0.625rem; font-size:var(--vibe-font-size-xs);
            border:1px solid var(--vibe-color-border);
            border-radius:var(--vibe-radius-sm);
            background:var(--vibe-color-bg);
            color:var(--vibe-color-fg); cursor:pointer;
          ">Import</button>
          ${layout.items.length > 0 ? `
          <button data-up-event="click:_clearLayout" style="
            padding:0.25rem 0.625rem; font-size:var(--vibe-font-size-xs);
            border:1px solid #fca5a5; border-radius:var(--vibe-radius-sm);
            background:#fef2f2; color:#dc2626; cursor:pointer;
          ">Clear</button>` : ''}
        </div>

        <!-- Import panel -->
        ${showImport ? `
        <div style="
          padding:0.75rem; border-bottom:1px solid var(--vibe-color-border);
          background:#fffbeb;
        ">
          <div style="display:flex; gap:0.5rem; align-items:flex-start;">
            <textarea class="vibe-layout-import-textarea" data-up-prop="importJson:value"
              placeholder="Paste JSON layout config..."
              style="
                flex:1; min-height:60px; padding:0.5rem;
                font-size:var(--vibe-font-size-xs); font-family:monospace;
                border:1px solid var(--vibe-color-border);
                border-radius:var(--vibe-radius-sm);
                background:var(--vibe-color-bg);
                color:var(--vibe-color-fg);
                resize:vertical; outline:none;
              "
            >${esc(importJson)}</textarea>
            <div style="display:flex; flex-direction:column; gap:0.25rem;">
              <button data-up-event="click:_doImport" style="
                padding:0.25rem 0.75rem; font-size:var(--vibe-font-size-xs);
                border:1px solid #3b82f6; border-radius:var(--vibe-radius-sm);
                background:#eff6ff; color:#3b82f6; cursor:pointer;
              ">Load</button>
              <button data-up-event="click:toggleImport" style="
                padding:0.25rem 0.75rem; font-size:var(--vibe-font-size-xs);
                border:1px solid var(--vibe-color-border);
                border-radius:var(--vibe-radius-sm);
                background:var(--vibe-color-bg);
                color:var(--vibe-color-fg); cursor:pointer;
              ">Cancel</button>
            </div>
          </div>
          ${importError ? `<div style="margin-top:0.375rem; font-size:var(--vibe-font-size-xs); color:#dc2626;">${esc(importError)}</div>` : ''}
        </div>` : ''}

        <!-- Drop Zone -->
        <div class="vibe-layout-dropzone" style="
          flex:1; overflow:auto; padding:1rem; position:relative;
          ${layout.mode === 'grid'
            ? `display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:0.75rem; align-content:start;`
            : layout.mode === 'flex'
            ? `display:flex; flex-wrap:wrap; gap:0.75rem; align-content:start;`
            : `display:flex; flex-direction:column; gap:0.5rem;`
          }
        ">
          ${layout.items.map((item, idx) => {
            const isSel = item.id === selectedId
            const isDragOver = dragOverIdx === idx
            const props = item.props || {}
            const icon = catalog.find(c => c.type === item.type)?.icon || '📦'

            return `<div class="vibe-layout-item"
              data-item-id="${esc(item.id)}"
              data-item-idx="${idx}"
              style="
                position:relative;
                padding:0.625rem 0.75rem;
                border-radius:var(--vibe-radius-sm);
                border:2px solid ${isSel ? '#3b82f6' : 'var(--vibe-color-border)'};
                background:${isSel ? '#eff6ff' : 'var(--vibe-color-bg)'};
                min-height:${layout.mode === 'stack' ? 'auto' : '60px'};
                display:flex; align-items:center; gap:0.5rem;
                cursor:grab; user-select:none;
                transition:box-shadow var(--vibe-duration-fast);
                box-shadow:${isSel ? '0 0 0 2px rgba(59,130,246,0.25)' : 'none'};
                ${isDragOver ? 'box-shadow: 0 0 0 2px #3b82f6; border-color:#3b82f6;' : ''}
              "
            >
              <span style="font-size:1rem; flex-shrink:0;">${icon}</span>
              <div style="flex:1; min-width:0;">
                <div style="font-size:var(--vibe-font-size-xs); font-weight:var(--vibe-font-weight-semibold);">
                  ${esc(item.type)}
                </div>
                <div style="font-size:var(--vibe-font-size-xs); color:var(--vibe-color-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                  ${esc(props.label || props.content || props.placeholder || props.name || item.type)}
                </div>
              </div>
              ${isSel ? `
              <button data-up-event="click:_deleteSelected" style="
                background:none; border:none; cursor:pointer;
                font-size:1rem; color:#dc2626; padding:0; line-height:1;
                flex-shrink:0;
              " title="Delete">✕</button>` : ''}
            </div>`
          }).join('')}

          ${layout.items.length === 0 ? `
          <div style="
            display:flex; align-items:center; justify-content:center;
            height:100%; color:var(--vibe-color-muted);
            font-size:var(--vibe-font-size-sm); text-align:center;
            grid-column:1/-1;
          ">
            <div>
              <div style="font-size:2rem; margin-bottom:0.5rem;">📥</div>
              <div>Drag components from the catalog here</div>
              <div style="font-size:var(--vibe-font-size-xs); margin-top:0.25rem;">
                to build your layout
              </div>
            </div>
          </div>` : ''}
        </div>
      </div>

      <!-- ── Property Editor ──────────────────────────────────── -->
      ${selectedItem ? `
      <div class="vibe-layout-props" style="
        width:200px; min-width:200px;
        border-left:1px solid var(--vibe-color-border);
        background:var(--vibe-color-surface);
        display:flex; flex-direction:column; overflow:hidden;
      ">
        <div style="
          display:flex; align-items:center; justify-content:space-between;
          padding:0.625rem 0.75rem;
          border-bottom:1px solid var(--vibe-color-border);
        ">
          <span style="font-size:var(--vibe-font-size-xs); font-weight:var(--vibe-font-weight-semibold);">
            ${esc(selectedItem.type)}
          </span>
          <button data-up-event="click:deselectAll" style="
            background:none; border:none; cursor:pointer; font-size:1rem;
            color:var(--vibe-color-muted); padding:0; line-height:1;
          ">✕</button>
        </div>
        <div style="flex:1; overflow-y:auto; padding:0.625rem 0.75rem;">
          ${propSchema.map(propKey => {
            const val = selectedItem.props?.[propKey]
            const label = PROPERTY_LABELS[propKey] || propKey

            if (propKey === 'checked') {
              return `<label style="
                display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;
                font-size:var(--vibe-font-size-xs);
              ">
                <input type="checkbox" data-up-bool="_checked:checked"
                  ${val ? 'checked' : ''}
                  style="accent-color:#3b82f6;"
                />
                <span>${esc(label)}</span>
              </label>`
            }

            if (propKey === 'bordered' || propKey === 'fullWidth') {
              return `<label style="
                display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;
                font-size:var(--vibe-font-size-xs);
              ">
                <input type="checkbox" data-up-bool="_boolProp,${propKey}:checked"
                  ${val ? 'checked' : ''}
                  style="accent-color:#3b82f6;"
                />
                <span>${esc(label)}</span>
              </label>`
            }

            return `<div style="margin-bottom:0.5rem;">
              <label style="display:block; font-size:var(--vibe-font-size-xs);
                color:var(--vibe-color-mutedFg); margin-bottom:0.125rem;
              ">${esc(label)}</label>
              <input class="vibe-layout-prop-input"
                data-prop-key="${esc(propKey)}"
                value="${esc(val ?? '')}"
                style="
                  width:100%; padding:0.25rem 0.375rem; box-sizing:border-box;
                  font-size:var(--vibe-font-size-xs);
                  border:1px solid var(--vibe-color-border);
                  border-radius:var(--vibe-radius-sm);
                  background:var(--vibe-color-bg);
                  color:var(--vibe-color-fg);
                  outline:none;
                "
              />
            </div>`
          }).join('')}

          ${propSchema.length === 0 ? `
          <div style="font-size:var(--vibe-font-size-xs); color:var(--vibe-color-muted);">
            No configurable properties
          </div>` : ''}
        </div>
      </div>` : ''}
    </div>`
  },

  mount(el, ctx) {
    // Subscribe to store changes and force re-render
    const unsub = layoutStore.subscribe(() => {
      ctx.send('_refresh')
    })
    // Initial render
    ctx.send('_refresh')

    // Helper to dispatch actions (used by drag-drop handlers below)
    const updateState = (action, ...args) => ctx.send(action, ...args)

    const dropzone = el.querySelector('.vibe-layout-dropzone')
    const catalogList = el.querySelector('.vibe-layout-catalog-list')

    // ── Property editor input handling ──────────────────────────
    el.addEventListener('input', (e) => {
      const inp = e.target.closest('.vibe-layout-prop-input')
      if (!inp) return
      const key = inp.dataset.propKey
      if (!key) return
      const selectedId = ctx.get().selectedId
      if (selectedId) layoutStore.send('updateItem', selectedId, { [key]: inp.value })
    })

    // ── Click: select / deselect items ──────────────────────────
    el.addEventListener('click', (e) => {
      if (e.target === dropzone && !e.target.closest('.vibe-layout-item')) {
        ctx.send('deselectAll')
        return
      }
      const itemEl = e.target.closest('.vibe-layout-item')
      if (itemEl) {
        const id = itemEl.dataset.itemId
        if (id) ctx.send('selectItem', id)
      }
    })

    // ── Catalog drag start ─────────────────────────────────────

    function getDropIndex(clientX, clientY) {
      if (!dropzone) return -1
      const items = dropzone.querySelectorAll('.vibe-layout-item')
      let bestIdx = items.length
      let minDist = Infinity

      const storeState = layoutStore.select()
      const isStack = storeState.layout.mode === 'stack'

      items.forEach((el, i) => {
        const rect = el.getBoundingClientRect()
        if (isStack) {
          const midY = rect.top + rect.height / 2
          const dist = Math.abs(clientY - midY)
          if (dist < minDist) {
            minDist = dist
            bestIdx = clientY < midY ? i : i + 1
          }
        } else {
          const midX = rect.left + rect.width / 2
          const midY = rect.top + rect.height / 2
          const dist = Math.hypot(clientX - midX, clientY - midY)
          if (dist < minDist) {
            minDist = dist
            // Use midpoint for grid: which side of the item
            bestIdx = clientX < midX ? i : i + 1
          }
        }
      })
      if (isStack && bestIdx === items.length) {
        // Check if below all items
        const last = items[items.length - 1]
        if (last) {
          const rect = last.getBoundingClientRect()
          bestIdx = clientY > rect.bottom ? items.length : items.length - 1
        }
      }
      return Math.max(0, Math.min(items.length, bestIdx))
    }

    // Catalog drag start
    if (catalogList) {
      catalogList.addEventListener('pointerdown', (e) => {
        const itemEl = e.target.closest('.vibe-layout-catalog-item')
        if (!itemEl) return
        const type = itemEl.dataset.catalogType
        if (!type) return

        e.preventDefault()
        itemEl.setPointerCapture(e.pointerId)

        const catalogItem = layoutStore.select().catalog.find(c => c.type === type)
        if (!catalogItem) return

        dragState = {
          type: 'catalog',
          itemType: type,
          catalogItem,
          ghostEl: null,
          dropIndicatorEl: null,
        }
        updateState('setDragging', { from: 'catalog', item: catalogItem })
      })
    }

    // Layout item drag start (reorder)
    if (dropzone) {
      dropzone.addEventListener('pointerdown', (e) => {
        const itemEl = e.target.closest('.vibe-layout-item')
        if (!itemEl) return
        const id = itemEl.dataset.itemId
        const fromIdx = parseInt(itemEl.dataset.itemIdx, 10)
        if (!id || isNaN(fromIdx)) return

        e.preventDefault()
        e.stopPropagation()

        const storeState = layoutStore.select()
        const item = storeState.layout.items.find(it => it.id === id)
        if (!item) return

        dragState = {
          type: 'reorder',
          id,
          fromIdx,
          item,
          ghostEl: null,
        }
        updateState('setDragging', { from: 'layout', item })
      })
    }

    // Global pointermove
    const onPointerMove = (e) => {
      if (!dragState) return
      const idx = getDropIndex(e.clientX, e.clientY)
      if (idx !== _dragOverIdx) {
        updateState('setDragOverIdx', idx)
      }
    }

    // Global pointerup
    const onPointerUp = (e) => {
      if (!dragState) return

      if (dragState.type === 'catalog') {
        const storeState = layoutStore.select()
        const catItem = dragState.catalogItem

        // Create new item from catalog
        const newItem = {
          id: uid(),
          type: dragState.itemType,
          props: { ...catItem.defaultProps },
        }

        const idx = getDropIndex(e.clientX, e.clientY)
        const items = [...storeState.layout.items]
        const insertAt = idx >= 0 && idx <= items.length ? idx : items.length
        items.splice(insertAt, 0, newItem)

        layoutStore.send('setLayout', { mode: storeState.layout.mode, items })
        updateState('selectItem', newItem.id)
      }

      if (dragState.type === 'reorder') {
        const idx = getDropIndex(e.clientX, e.clientY)
        const storeState = layoutStore.select()
        const curIdx = storeState.layout.items.findIndex(it => it.id === dragState.id)
        if (curIdx === -1) { /* item deleted during drag */ }
        else if (idx >= 0 && idx !== curIdx && idx !== curIdx + 1) {
          layoutStore.send('moveItem', dragState.id, idx)
        }
      }

      // Cleanup
      dragState = null
      updateState('setDragging', null)
      updateState('setDragOverIdx', -1)
    }

    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)

    // ── Custom actions wired via data-up-event ──────────────────
    const origSend = ctx.send.bind(ctx)
    ctx.send = (action, ...args) => {
      switch (action) {
        case '_setMode':
          layoutStore.send('setMode', args[0])
          return
        case '_exportLayout': {
          const s = layoutStore.select()
          const json = JSON.stringify(s.layout, null, 2)
          // Copy to clipboard
          if (navigator.clipboard) {
            navigator.clipboard.writeText(json).catch(() => {})
          }
          // Also log
          console.log('[VibeLayoutEditor] Exported layout:', json)
          return
        }
        case '_doImport': {
          const s = layoutStore.select()
          try {
            const parsed = JSON.parse(s._importJson || '')
            if (!parsed || !Array.isArray(parsed.items)) {
              updateState('setImportError', 'Invalid format: expected { mode, items }')
              return
            }
            layoutStore.send('importLayout', parsed)
            updateState('toggleImport')
          } catch (err) {
            updateState('setImportError', 'Invalid JSON: ' + err.message)
          }
          return
        }
        case '_clearLayout':
          layoutStore.send('clearLayout')
          updateState('deselectAll')
          return
        case '_deleteSelected':
          if (_selectedId) {
            layoutStore.send('deleteItem', _selectedId)
            updateState('deselectAll')
          }
          return
        case '_refresh':
          // Store-triggered re-render — just pass through
          break
      }
      return updateState(action, ...args)
    }

    return () => {
      unsub()
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
      dragState = null
    }
  },

  // ── Public API ────────────────────────────────────────────────
  exportLayout() {
    return JSON.stringify(layoutStore.select().layout, null, 2)
  },
  importLayout(json) {
    layoutStore.send('importLayout', json)
  },
  getLayout() {
    return layoutStore.select().layout
  },
  setLayout(layout) {
    layoutStore.send('setLayout', layout)
  },
  clearLayout() {
    layoutStore.send('clearLayout')
  },
})

export default VibeLayoutEditor
