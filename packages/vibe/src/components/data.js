// ─── @uploop-vibe/vibe Dropdown, Nav, Table ───────────────────

import { component } from '@uploop/html'
import { shadowScale } from '../design/scales.js'

// ── Dropdown ─────────────────────────────────────────────────

export const Dropdown = component('VibeDropdown', {
  state: {
    open: false,
    items: [],          // [{ id, label, icon?, disabled?, divider? (bool for separator) }]
    trigger: '',        // trigger button label
    placement: 'bottom-left', // bottom-left|bottom-right|top-left|top-right
    size: 'md',
  },

  update: {
    configure: (s, props) => ({ ...s, ...props }),
    open: (s) => ({ ...s, open: true }),
    close: (s) => ({ ...s, open: false }),
    toggle: (s) => ({ ...s, open: !s.open }),
    setItems: (s, items) => ({ ...s, items }),
  },

  view(state) {
    const items = Array.isArray(state.items) ? state.items : []
    const esc = (s) => String(s||'').replace(/&/g, '&amp;').replace(/"/g, '&quot;')

    const menuItems = items.map(item => {
      if (item.divider) return '<div style="height:1px;background:var(--vibe-color-border);margin:0.25rem 0;"></div>'
      return `<button data-up-event="click:select" data-item-id="${esc(item.id)}" style="
        display:flex; align-items:center; gap:0.5rem; width:100%;
        padding:0.5rem 0.75rem; border:none; background:transparent;
        color:${item.disabled ? 'var(--vibe-color-muted)' : 'var(--vibe-color-fg)'};
        font-size:var(--vibe-font-size-sm); cursor:${item.disabled ? 'not-allowed' : 'pointer'};
        border-radius:var(--vibe-radius-sm); text-align:left;
        opacity:${item.disabled ? '0.5' : '1'};
      ">
        ${item.icon ? `<span>${esc(item.icon)}</span>` : ''}
        ${esc(item.label)}
      </button>`
    }).join('')

    const placementStyle = {
      'bottom-left': 'top:calc(100% + 0.25rem);left:0;',
      'bottom-right': 'top:calc(100% + 0.25rem);right:0;',
      'top-left': 'bottom:calc(100% + 0.25rem);left:0;',
      'top-right': 'bottom:calc(100% + 0.25rem);right:0;',
    }

    return `<div class="vibe-dropdown" style="position:relative;display:inline-block;">
      <button data-up-event="click:toggle" style="
        display:inline-flex; align-items:center; gap:0.375rem;
        padding:0.375rem 0.75rem;
        border:1px solid var(--vibe-color-border);
        border-radius:var(--vibe-radius-md);
        background:var(--vibe-color-bg);
        color:var(--vibe-color-fg);
        font-size:var(--vibe-font-size-sm);
        cursor:pointer;
        transition:all var(--vibe-duration-fast) var(--vibe-easing-out);
      ">
        ${esc(state.trigger || 'Select')}
        <span style="font-size:0.6rem;">&#9660;</span>
      </button>
      ${state.open ? `<div class="vibe-dropdown-menu vibe-animate-scale-in" style="
        position:absolute; ${placementStyle[state.placement] || placementStyle['bottom-left']}
        z-index:var(--vibe-z-dropdown);
        min-width:12rem;
        padding:0.375rem;
        background:var(--vibe-color-bg);
        border:1px solid var(--vibe-color-border);
        border-radius:var(--vibe-radius-md);
        box-shadow:${shadowScale.lg};
        animation: vibe-scale-in var(--vibe-duration-faster) var(--vibe-easing-out);
      " data-up-event-stop>
        ${menuItems}
      </div>` : ''}
    </div>`
  }
})

// ── Nav ──────────────────────────────────────────────────────

export const Nav = component('VibeNav', {
  state: {
    items: [],          // [{ id, label, href?, icon?, active? }]
    variant: 'horizontal', // horizontal|vertical
    size: 'md',
  },

  update: {
    configure: (s, props) => ({ ...s, ...props }),
    setItems: (s, items) => ({ ...s, items }),
    setActive: (s, id) => ({ ...s, items: s.items.map(item => ({ ...item, active: item.id === id })) }),
  },

  view(state) {
    const items = Array.isArray(state.items) ? state.items : []
    const isVert = state.variant === 'vertical'
    const esc = (s) => String(s||'').replace(/&/g, '&amp;')

    const links = items.map(item => {
      const active = item.active
      return `<a ${item.href ? `href="${esc(item.href)}"` : ''} data-up-event="click:navigate" data-item-id="${esc(item.id)}" style="
        display:flex; align-items:center; gap:0.5rem;
        padding:0.5rem 0.75rem;
        color:${active ? 'var(--vibe-color-primary600)' : 'var(--vibe-color-mutedFg)'};
        font-size:var(--vibe-font-size-sm);
        font-weight:${active ? 'var(--vibe-font-weight-semibold)' : 'var(--vibe-font-weight-medium)'};
        text-decoration:none;
        border-radius:var(--vibe-radius-md);
        background:${active ? 'var(--vibe-color-primary50)' : 'transparent'};
        transition:all var(--vibe-duration-fast) var(--vibe-easing-out);
        cursor:pointer;
      ">
        ${item.icon ? `<span>${esc(item.icon)}</span>` : ''}
        ${esc(item.label)}
      </a>`
    }).join('')

    return `<nav class="vibe-nav" style="
      display:flex; flex-direction:${isVert ? 'column' : 'row'};
      gap:0.25rem; ${isVert ? 'align-items:stretch;' : 'align-items:center;'}
    ">${links}</nav>`
  }
})

// ── Table ────────────────────────────────────────────────────

export const Table = component('VibeTable', {
  state: {
    columns: [],        // [{ key, label, sortable?, width? }]
    rows: [],           // [{ ...fields }]
    striped: true,
    hoverable: true,
    bordered: true,
    compact: false,
    loading: false,
    emptyMessage: 'No data',
  },

  update: {
    configure: (s, props) => ({ ...s, ...props }),
    setRows: (s, rows) => ({ ...s, rows }),
    setColumns: (s, columns) => ({ ...s, columns }),
    setLoading: (s, loading) => ({ ...s, loading }),
  },

  view(state) {
    const cols = Array.isArray(state.columns) ? state.columns : []
    const rows = Array.isArray(state.rows) ? state.rows : []
    const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')

    if (state.loading) {
      return `<div class="vibe-table-loading" style="padding:2rem;text-align:center;color:var(--vibe-color-muted);">Loading...</div>`
    }

    if (!rows.length && !state.loading) {
      return `<div class="vibe-table-empty" style="padding:3rem 1rem;text-align:center;color:var(--vibe-color-muted);border:1px dashed var(--vibe-color-border);border-radius:var(--vibe-radius-lg);">
        <p style="margin:0;font-size:var(--vibe-font-size-sm);">${esc(state.emptyMessage)}</p>
      </div>`
    }

    const thStyle = `padding:${state.compact ? '0.5rem 0.75rem' : '0.75rem 1rem'};text-align:left;font-size:var(--vibe-font-size-xs);font-weight:var(--vibe-font-weight-semibold);color:var(--vibe-color-mutedFg);text-transform:uppercase;letter-spacing:var(--vibe-letter-spacing-wide);border-bottom:2px solid var(--vibe-color-border);background:var(--vibe-color-surface);white-space:nowrap;`
    const tdStyle = `padding:${state.compact ? '0.5rem 0.75rem' : '0.75rem 1rem'};font-size:var(--vibe-font-size-sm);color:var(--vibe-color-fg);border-bottom:1px solid ${state.bordered ? 'var(--vibe-color-border)' : 'transparent'};`

    const header = cols.map(c => `<th style="${thStyle}${c.width ? 'width:' + c.width + ';' : ''}">${esc(c.label)}</th>`).join('')
    const body = rows.map((row, ri) => {
      const stripeStyle = state.striped && ri % 2 === 1 ? 'background:var(--vibe-color-neutral50);' : ''
      const hoverStyle = state.hoverable ? 'transition:background var(--vibe-duration-faster);' : ''
      return `<tr style="${stripeStyle}${hoverStyle}">${cols.map(c => `<td style="${tdStyle}">${esc(row[c.key])}</td>`).join('')}</tr>`
    }).join('')

    return `<div class="vibe-table-wrapper" style="overflow-x:auto;border-radius:var(--vibe-radius-lg);${state.bordered ? 'border:1px solid var(--vibe-color-border);' : ''}">
      <table class="vibe-table" style="width:100%;border-collapse:collapse;">
        <thead><tr>${header}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`
  }
})
