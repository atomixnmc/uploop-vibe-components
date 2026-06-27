// ─── Data Display: List, Timeline, TreeView, Stat, DescriptionList, Accordion, Carousel ─

import { component } from '@uploop/html'
import { shadowScale } from '../../design/scales.js'

export const List = component('VibeList', {
  state: { items: [], ordered: false, spacing: 'md', icon: '', divider: false, size: 'md' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const items = Array.isArray(s.items) ? s.items : []
    const gap = { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' }
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    const Tag = s.ordered ? 'ol' : 'ul'
    return `<${Tag} class="vibe-list" style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:${gap[s.spacing]};">
      ${items.map((item, i) => `<li style="display:flex;align-items:flex-start;gap:0.5rem;${s.divider && i < items.length - 1 ? 'border-bottom:1px solid var(--vibe-color-border);padding-bottom:' + gap[s.spacing] : ''}">
        ${s.icon ? `<span style="color:var(--vibe-color-primary500);flex-shrink:0;margin-top:0.125rem;">${esc(s.icon)}</span>` : s.ordered ? `<span style="color:var(--vibe-color-muted);min-width:1.5rem;font-variant-numeric:tabular-nums;">${i + 1}.</span>` : `<span style="color:var(--vibe-color-primary500);margin-top:0.375rem;">&#8226;</span>`}
        <span style="font-size:var(--vibe-font-size-${s.size === 'sm' ? 'sm' : 'base'});">${typeof item === 'string' ? esc(item) : esc(item.label || '')}</span>
      </li>`).join('')}
    </${Tag}>`
  }
})

export const Timeline = component('VibeTimeline', {
  state: { items: [], align: 'left', active: -1 },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const items = Array.isArray(s.items) ? s.items : []
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    return `<div class="vibe-timeline" style="position:relative;padding-left:2rem;">
      ${items.map((item, i) => {
        const isActive = i === s.active, isDone = i < s.active
        const dotColor = isDone ? 'var(--vibe-color-success)' : isActive ? 'var(--vibe-color-primary600)' : 'var(--vibe-color-neutral300)'
        return `<div style="position:relative;padding-bottom:${i < items.length - 1 ? '1.5rem' : '0'};">
          ${i < items.length - 1 ? `<div style="position:absolute;left:-1.625rem;top:1.5rem;width:2px;height:calc(100% - 0.5rem);background:var(--vibe-color-neutral200);"></div>` : ''}
          <div style="position:absolute;left:-2rem;top:0.25rem;width:0.75rem;height:0.75rem;border-radius:50%;background:${dotColor};border:2px solid ${isDone || isActive ? dotColor : 'var(--vibe-color-border)'};"></div>
          <div>
            <div style="font-size:0.8rem;font-weight:var(--vibe-font-weight-semibold);">${esc(item.title || '')}</div>
            ${item.description ? `<div style="font-size:0.78rem;color:var(--vibe-color-mutedFg);margin-top:0.125rem;">${esc(item.description)}</div>` : ''}
            ${item.time ? `<div style="font-size:0.7rem;color:var(--vibe-color-muted);margin-top:0.25rem;">${esc(item.time)}</div>` : ''}
          </div>
        </div>`
      }).join('')}
    </div>`
  }
})

export const TreeView = component('VibeTreeView', {
  state: { items: [], expandedIds: [] },
  update: {
    configure: (s, p) => ({ ...s, ...p }),
    toggle: (s, id) => ({ ...s, expandedIds: s.expandedIds.includes(id) ? s.expandedIds.filter(e => e !== id) : [...s.expandedIds, id] }),
  },
  view(s) {
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    function renderNodes(nodes, depth = 0) {
      return (nodes || []).map(node => {
        const hasChildren = node.children && node.children.length > 0
        const expanded = s.expandedIds.includes(node.id)
        return `<div>
          <div data-up-event="click:toggle" data-id="${esc(node.id)}" style="
            display:flex;align-items:center;gap:0.375rem;padding:0.25rem 0.5rem;padding-left:${depth * 1.25 + 0.5}rem;
            cursor:pointer;border-radius:var(--vibe-radius-sm);font-size:0.85rem;
          ">
            ${hasChildren ? `<span style="transition:transform var(--vibe-duration-fast);display:inline-block;${expanded ? 'transform:rotate(90deg);' : ''}">&#9654;</span>` : '<span style="width:1em;"></span>'}
            ${node.icon ? `<span>${esc(node.icon)}</span>` : hasChildren ? '<span>&#128193;</span>' : '<span>&#128196;</span>'}
            <span>${esc(node.label)}</span>
          </div>
          ${hasChildren && expanded ? `<div>${renderNodes(node.children, depth + 1)}</div>` : ''}
        </div>`
      }).join('')
    }
    return `<div class="vibe-tree-view">${renderNodes(s.items)}</div>`
  }
})

export const Stat = component('VibeStat', {
  state: { label: '', value: '', helpText: '', trend: '', trendValue: '', icon: '' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    const trendColor = s.trend === 'up' ? 'var(--vibe-color-success)' : s.trend === 'down' ? 'var(--vibe-color-error)' : 'var(--vibe-color-muted)'
    const trendArrow = s.trend === 'up' ? '↑' : s.trend === 'down' ? '↓' : ''
    return `<div class="vibe-stat" style="padding:0.75rem 1rem;">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">
        ${s.icon ? `<span style="font-size:1.25rem;">${esc(s.icon)}</span>` : ''}
        <span style="font-size:0.75rem;color:var(--vibe-color-mutedFg);text-transform:uppercase;letter-spacing:0.5px;font-weight:var(--vibe-font-weight-medium);">${esc(s.label)}</span>
      </div>
      <div style="font-size:1.5rem;font-weight:var(--vibe-font-weight-bold);line-height:1.2;">${esc(s.value)}</div>
      ${(s.trend || s.helpText) ? `<div style="display:flex;align-items:center;gap:0.375rem;margin-top:0.25rem;">
        ${s.trend ? `<span style="font-size:0.8rem;color:${trendColor};font-weight:var(--vibe-font-weight-medium);">${trendArrow} ${esc(s.trendValue)}</span>` : ''}
        ${s.helpText ? `<span style="font-size:0.7rem;color:var(--vibe-color-muted);">${esc(s.helpText)}</span>` : ''}
      </div>` : ''}
    </div>`
  }
})

export const DescriptionList = component('VibeDescriptionList', {
  state: { items: [], horizontal: false, compact: false },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const items = Array.isArray(s.items) ? s.items : []
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    const py = s.compact ? '0.375rem' : '0.75rem'
    return `<dl class="vibe-description-list" style="margin:0;${s.horizontal ? 'display:grid;grid-template-columns:auto 1fr;gap:0;' : ''}">
      ${items.map(item => `<div style="${s.horizontal ? 'display:contents;' : ''}padding:${py} 0;${items.indexOf(item) < items.length - 1 ? 'border-bottom:1px solid var(--vibe-color-border);' : ''}">
        <dt style="font-size:0.8rem;font-weight:var(--vibe-font-weight-semibold);color:var(--vibe-color-fg);padding:${py} ${s.horizontal ? '1rem' : '0'} ${s.horizontal ? py : '0'} 0;">${esc(item.term)}</dt>
        <dd style="margin:0;font-size:0.85rem;color:var(--vibe-color-mutedFg);padding:${py} 0;">${esc(item.description)}</dd>
      </div>`).join('')}
    </dl>`
  }
})

export const Accordion = component('VibeAccordion', {
  state: { items: [], allowMultiple: false, variant: 'default' },
  update: {
    configure: (s, p) => ({ ...s, ...p }),
    toggle: (s, id) => {
      const open = s.items.map(it => it.id === id ? { ...it, open: !it.open } : s.allowMultiple ? it : { ...it, open: false })
      return { ...s, items: open }
    },
  },
  view(s) {
    const items = Array.isArray(s.items) ? s.items : []
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    const variantBorder = s.variant === 'separated' ? 'border:1px solid var(--vibe-color-border);border-radius:var(--vibe-radius-lg);margin-bottom:0.5rem;overflow:hidden;' : 'border-bottom:1px solid var(--vibe-color-border);'
    return `<div class="vibe-accordion">
      ${items.map(item => `<div style="${variantBorder}">
        <button data-up-event="click:toggle" data-id="${esc(item.id)}" style="
          display:flex;align-items:center;justify-content:space-between;width:100%;
          padding:0.75rem 1rem;border:none;background:transparent;cursor:pointer;
          font-size:0.9rem;font-weight:var(--vibe-font-weight-medium);color:var(--vibe-color-fg);
          text-align:left;
        ">
          <span>${item.icon ? `<span style="margin-right:0.5rem;">${esc(item.icon)}</span>` : ''}${esc(item.title)}</span>
          <span style="transition:transform var(--vibe-duration-fast);${item.open ? 'transform:rotate(180deg);' : ''}">&#9660;</span>
        </button>
        ${item.open ? `<div style="padding:0 1rem 1rem;font-size:0.85rem;color:var(--vibe-color-mutedFg);line-height:1.6;" data-up-slot>
          ${item.content ? esc(item.content) : '<slot></slot>'}
        </div>` : ''}
      </div>`).join('')}
    </div>`
  }
})

export const Carousel = component('VibeCarousel', {
  state: { slides: [], active: 0, autoplay: false, interval: 3000, showDots: true, showArrows: true, loop: true },
  update: {
    configure: (s, p) => ({ ...s, ...p }),
    next: (s) => ({ ...s, active: s.loop && s.active >= s.slides.length - 1 ? 0 : Math.min(s.active + 1, s.slides.length - 1) }),
    prev: (s) => ({ ...s, active: s.loop && s.active <= 0 ? s.slides.length - 1 : Math.max(s.active - 1, 0) }),
    goTo: (s, i) => ({ ...s, active: Number(i) }),
  },
  view(s) {
    const slides = Array.isArray(s.slides) ? s.slides : []
    if (!slides.length) return '<div style="padding:2rem;text-align:center;color:var(--vibe-color-muted);">No slides</div>'
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    return `<div class="vibe-carousel" style="position:relative;overflow:hidden;border-radius:var(--vibe-radius-lg);">
      <div style="display:flex;transition:transform var(--vibe-duration-normal) var(--vibe-easing-out);transform:translateX(-${s.active * 100}%);">
        ${slides.map(slide => `<div style="min-width:100%;">${typeof slide === 'string' ? `<div style="padding:3rem 2rem;text-align:center;background:var(--vibe-color-surface);min-height:12rem;display:flex;align-items:center;justify-content:center;font-size:1.25rem;">${esc(slide)}</div>` : esc(slide.content || '')}</div>`).join('')}
      </div>
      ${s.showArrows ? `<>
        <button data-up-event="click:prev" style="position:absolute;left:0.5rem;top:50%;transform:translateY(-50%);width:2.5rem;height:2.5rem;border-radius:50%;border:none;background:rgba(0,0,0,0.3);color:white;font-size:1.25rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">&#8249;</button>
        <button data-up-event="click:next" style="position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);width:2.5rem;height:2.5rem;border-radius:50%;border:none;background:rgba(0,0,0,0.3);color:white;font-size:1.25rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">&#8250;</button>
      </>` : ''}
      ${s.showDots ? `<div style="position:absolute;bottom:0.75rem;left:50%;transform:translateX(-50%);display:flex;gap:0.375rem;">
        ${slides.map((_, i) => `<button data-up-event="click:goTo" data-index="${i}" style="
          width:${i === s.active ? '1.5rem' : '0.5rem'};height:0.5rem;border-radius:var(--vibe-radius-full);
          border:none;background:${i === s.active ? 'white' : 'rgba(255,255,255,0.5)'};
          cursor:pointer;transition:all var(--vibe-duration-fast);
        "></button>`).join('')}
      </div>` : ''}
    </div>`
  }
})
