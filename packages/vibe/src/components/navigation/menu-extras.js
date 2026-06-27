// ─── Navigation: ContextMenu, CommandPalette, ScrollSpy ──────

import { component } from '@uploop/html'
import { shadowScale } from '../../design/scales.js'

export const ContextMenu = component('VibeContextMenu', {
  state: { open: false, x: 0, y: 0, items: [] },
  update: {
    show: (s, { x, y, items }) => ({ ...s, open: true, x, y, items: items || s.items }),
    hide: (s) => ({ ...s, open: false }),
    configure: (s, p) => ({ ...s, ...p }),
  },
  view(s) {
    if (!s.open) return '<div style="display:none;"></div>'
    const items = Array.isArray(s.items) ? s.items : []
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    return `<div class="vibe-context-menu vibe-animate-scale-in" style="
      position:fixed; left:${s.x}px; top:${s.y}px; z-index:var(--vibe-z-dropdown);
      min-width:10rem; padding:0.375rem; background:var(--vibe-color-bg);
      border:1px solid var(--vibe-color-border); border-radius:var(--vibe-radius-md);
      box-shadow:${shadowScale.lg};
    " data-up-event-stop>
      ${items.map(item => item.divider
        ? '<div style="height:1px;background:var(--vibe-color-border);margin:0.25rem 0;"></div>'
        : `<button data-up-event="click:select" data-id="${esc(item.id)}" style="
          display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.5rem 0.75rem;
          border:none;background:transparent;color:var(--vibe-color-fg);
          font-size:0.82rem;cursor:pointer;border-radius:var(--vibe-radius-sm);text-align:left;
        ">${item.icon ? `<span>${esc(item.icon)}</span>` : ''}${esc(item.label)}
        ${item.shortcut ? `<span style="margin-left:auto;color:var(--vibe-color-muted);font-size:0.7rem;">${esc(item.shortcut)}</span>` : ''}</button>`
      ).join('')}
    </div>`
  }
})

export const CommandPalette = component('VibeCommandPalette', {
  state: { open: false, query: '', items: [], groups: [], placeholder: 'Type a command...' },
  update: {
    open: (s, p) => ({ ...s, open: true, ...p }),
    close: (s) => ({ ...s, open: false, query: '' }),
    setQuery: (s, query) => ({ ...s, query }),
    configure: (s, p) => ({ ...s, ...p }),
  },
  view(s) {
    if (!s.open) return '<div style="display:none;"></div>'
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    const q = s.query.toLowerCase()
    const filter = (items) => (items || []).filter(it => !q || it.label.toLowerCase().includes(q) || (it.keywords || []).some(k => k.includes(q)))
    const groups = s.groups.length ? s.groups : [{ label: '', items: s.items }]
    return `<div class="vibe-command-palette" style="position:fixed;inset:0;z-index:var(--vibe-z-modal);display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;background:rgba(0,0,0,0.4);" data-up-event="click:close">
      <div class="vibe-animate-scale-in" style="width:32rem;max-width:90vw;background:var(--vibe-color-bg);border-radius:var(--vibe-radius-xl);box-shadow:${shadowScale.xl2};overflow:hidden;" data-up-event-stop>
        <div style="padding:0.75rem;border-bottom:1px solid var(--vibe-color-border);display:flex;align-items:center;gap:0.5rem;">
          <span style="color:var(--vibe-color-muted);">&#8981;</span>
          <input data-up-prop="value:query" placeholder="${esc(s.placeholder)}" style="border:none;outline:none;width:100%;font-size:0.95rem;background:transparent;color:var(--vibe-color-fg);" autofocus />
        </div>
        <div style="max-height:20rem;overflow-y:auto;padding:0.5rem;">
          ${groups.map(g => {
            const filtered = filter(g.items)
            if (!filtered.length) return ''
            return `<div style="margin-bottom:0.25rem;">
              ${g.label ? `<div style="padding:0.25rem 0.75rem;font-size:0.7rem;color:var(--vibe-color-muted);text-transform:uppercase;letter-spacing:0.5px;">${esc(g.label)}</div>` : ''}
              ${filtered.map(item => `<button data-up-event="click:select" data-id="${esc(item.id)}" style="
                display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.5rem 0.75rem;
                border:none;background:transparent;color:var(--vibe-color-fg);
                font-size:0.85rem;cursor:pointer;border-radius:var(--vibe-radius-sm);text-align:left;
              ">${item.icon ? `<span style="font-size:1.1rem;">${esc(item.icon)}</span>` : ''}
                <span>${esc(item.label)}</span>
                ${item.shortcut ? `<span style="margin-left:auto;color:var(--vibe-color-muted);font-size:0.7rem;">${esc(item.shortcut)}</span>` : ''}
              </button>`).join('')}
            </div>`
          }).join('')}
          ${!groups.some(g => filter(g.items).length) ? `<div style="text-align:center;padding:2rem;color:var(--vibe-color-muted);font-size:0.85rem;">No results</div>` : ''}
        </div>
      </div>
    </div>`
  }
})

export const ScrollSpy = component('VibeScrollSpy', {
  state: { items: [], activeId: '', offset: 80 },
  update: { configure: (s, p) => ({ ...s, ...p }), setActive: (s, activeId) => ({ ...s, activeId }) },
  view(s) {
    const items = Array.isArray(s.items) ? s.items : []
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    return `<nav class="vibe-scrollspy" style="position:sticky;top:${s.offset}px;padding:0.5rem 0;">
      ${items.map(item => {
        const active = item.id === s.activeId
        return `<a href="#${esc(item.id)}" data-up-event="click:navigate" data-id="${esc(item.id)}" style="
          display:block; padding:0.3rem 0.75rem; border-left:2px solid ${active ? 'var(--vibe-color-primary600)' : 'transparent'};
          color:${active ? 'var(--vibe-color-primary600)' : 'var(--vibe-color-mutedFg)'};
          font-size:0.82rem; text-decoration:none; font-weight:${active ? 'var(--vibe-font-weight-medium)' : 'normal'};
          transition:all var(--vibe-duration-fast);
        ">${esc(item.label)}</a>`
      }).join('')}
    </nav>`
  }
})
