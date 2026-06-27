// ─── Navigation: Breadcrumb, Link, Pagination, Stepper ───────

import { component } from '@uploop/html'

export const Breadcrumb = component('VibeBreadcrumb', {
  state: { items: [], separator: '/', size: 'sm' },
  update: { configure: (s, p) => ({ ...s, ...p }), setItems: (s, items) => ({ ...s, items }) },
  view(s) {
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    const items = Array.isArray(s.items) ? s.items : []
    const fs = { xs: '0.7rem', sm: '0.78rem', md: '0.85rem' }
    return `<nav class="vibe-breadcrumb" aria-label="Breadcrumb" style="display:flex;align-items:center;gap:0.375rem;font-size:${fs[s.size]||fs.sm};flex-wrap:wrap;">
      ${items.map((item, i) => {
        const isLast = i === items.length - 1
        return `<span style="display:flex;align-items:center;gap:0.375rem;">
          ${item.href && !isLast
            ? `<a href="${esc(item.href)}" data-up-event="click:navigate" style="color:var(--vibe-color-mutedFg);text-decoration:none;">${esc(item.label)}</a>`
            : `<span style="color:${isLast ? 'var(--vibe-color-fg)' : 'var(--vibe-color-mutedFg)'};font-weight:${isLast ? 'var(--vibe-font-weight-medium)' : 'normal'};">${esc(item.label)}</span>`}
          ${!isLast ? `<span style="color:var(--vibe-color-muted);user-select:none;">${esc(s.separator)}</span>` : ''}
        </span>`
      }).join('')}
    </nav>`
  }
})

export const Link = component('VibeLink', {
  state: { href: '#', label: '', external: false, underline: 'hover', color: 'primary', size: 'inherit' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    return `<a href="${esc(s.href)}" class="vibe-link" style="
      color:var(--vibe-color-${s.color}600); font-size:${s.size};
      text-decoration:${s.underline === 'always' ? 'underline' : 'none'};
      cursor:pointer; transition:opacity var(--vibe-duration-fast);
    " ${s.external ? 'target="_blank" rel="noopener"' : ''} data-up-slot>
      ${s.label ? esc(s.label) : '<slot></slot>'}
    </a>`
  }
})

export const Pagination = component('VibePagination', {
  state: { page: 1, total: 1, siblings: 1, size: 'sm' },
  update: { configure: (s, p) => ({ ...s, ...p }), setPage: (s, page) => ({ ...s, page }) },
  view(s) {
    if (s.total <= 1) return '<div style="display:none;"></div>'
    const pages = []
    const total = Math.max(1, s.total)
    const current = Math.min(total, Math.max(1, s.page))
    const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i)
    const left = Math.max(2, current - s.siblings)
    const right = Math.min(total - 1, current + s.siblings)
    pages.push(1)
    if (left > 2) pages.push('...')
    for (const p of range(left, right)) pages.push(p)
    if (right < total - 1) pages.push('...')
    if (total > 1) pages.push(total)

    const btnStyle = (isActive) => `min-width:2rem;height:2rem;padding:0 0.375rem;border:1px solid ${isActive ? 'var(--vibe-color-primary600)' : 'var(--vibe-color-border)'};border-radius:var(--vibe-radius-md);background:${isActive ? 'var(--vibe-color-primary600)' : 'transparent'};color:${isActive ? 'white' : 'var(--vibe-color-fg)'};font-size:0.8rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;`

    return `<div class="vibe-pagination" style="display:flex;align-items:center;gap:0.25rem;">
      <button data-up-event="click:setPage" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''} style="${btnStyle(false)}opacity:${current <= 1 ? '0.4' : '1'};">&laquo;</button>
      ${pages.map(p => p === '...'
        ? `<span style="width:2rem;text-align:center;color:var(--vibe-color-muted);">&hellip;</span>`
        : `<button data-up-event="click:setPage" data-page="${p}" style="${btnStyle(p === current)}">${p}</button>`
      ).join('')}
      <button data-up-event="click:setPage" data-page="${current + 1}" ${current >= total ? 'disabled' : ''} style="${btnStyle(false)}opacity:${current >= total ? '0.4' : '1'};">&raquo;</button>
    </div>`
  }
})

export const Stepper = component('VibeStepper', {
  state: { steps: [], active: 0, orientation: 'horizontal', size: 'md' },
  update: { configure: (s, p) => ({ ...s, ...p }), setActive: (s, active) => ({ ...s, active }) },
  view(s) {
    const steps = Array.isArray(s.steps) ? s.steps : []
    const isVert = s.orientation === 'vertical'
    const sz = { sm: '1.5rem', md: '2rem', lg: '2.5rem' }
    return `<div class="vibe-stepper" style="display:flex;flex-direction:${isVert ? 'column' : 'row'};${isVert ? 'align-items:flex-start;' : 'align-items:center;'}">
      ${steps.map((step, i) => {
        const done = i < s.active, active = i === s.active, pending = i > s.active
        const color = done ? 'var(--vibe-color-success)' : active ? 'var(--vibe-color-primary600)' : 'var(--vibe-color-neutral300)'
        const esc = (v) => String(v||'').replace(/&/g, '&amp;')
        return `<div style="display:flex;align-items:center;${isVert ? 'margin-bottom:0.5rem;' : ''}">
          <div style="display:flex;align-items:center;gap:0.5rem;${isVert ? 'flex-direction:row;' : 'flex-direction:column;'}">
            <div style="
              width:${sz[s.size]};height:${sz[s.size]};border-radius:var(--vibe-radius-full);
              background:${done ? color : active ? color : 'transparent'};
              border:2px solid ${color}; color:${done || active ? 'white' : 'var(--vibe-color-muted)'};
              display:flex;align-items:center;justify-content:center;
              font-size:0.75rem;font-weight:var(--vibe-font-weight-semibold);
            ">${done ? '&#10003;' : i + 1}</div>
            <div style="text-align:${isVert ? 'left' : 'center'};${isVert ? '' : 'margin-top:0.25rem;'}">
              <div style="font-size:0.8rem;font-weight:${active ? 'var(--vibe-font-weight-semibold)' : 'normal'};color:${active ? 'var(--vibe-color-fg)' : 'var(--vibe-color-mutedFg)'};">${esc(step.label)}</div>
              ${step.description ? '<div style="font-size:0.7rem;color:var(--vibe-color-muted);">' + esc(step.description) + '</div>' : ''}
            </div>
          </div>
          ${i < steps.length - 1 ? '<div style="' + (isVert
            ? 'width:2px;height:2rem;margin:0.25rem 0 0.25rem ' + (parseInt(sz[s.size]) / 2) + 'px;'
            : 'height:2px;width:2.5rem;margin:0 0.5rem;'
          ) + 'background:' + (i < s.active ? 'var(--vibe-color-success)' : 'var(--vibe-color-neutral200)') + ';"></div>' : ''}
        </div>`
      }).join('')}
    </div>`
  }
})
