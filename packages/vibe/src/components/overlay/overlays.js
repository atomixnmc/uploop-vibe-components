// ─── Overlay: Drawer, Sheet, Popover, HoverCard, Lightbox, FullscreenOverlay ─

import { component } from '@uploop/html'
import { shadowScale } from '../../design/scales.js'

export const Drawer = component('VibeDrawer', {
  state: { open: false, title: '', placement: 'right', size: 'md', closeOnOverlay: true },
  update: { configure: (s, p) => ({ ...s, ...p }), open: (s, p) => ({ ...s, open: true, ...p }), close: (s) => ({ ...s, open: false }) },
  view(s) {
    if (!s.open) return '<div style="display:none;"></div>'
    const sz = { sm: '20rem', md: '28rem', lg: '36rem', xl: '48rem', full: '100vw' }
    const w = sz[s.size] || sz.md
    const isH = s.placement === 'left' || s.placement === 'right'
    const transformOff = s.placement === 'right' ? `translateX(100%)` : s.placement === 'left' ? `translateX(-100%)` : s.placement === 'top' ? `translateY(-100%)` : `translateY(100%)`
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-drawer-overlay" style="position:fixed;inset:0;z-index:var(--vibe-z-modal);background:rgba(0,0,0,0.4);display:flex;${isH ? '' : 'flex-direction:column;'}" ${s.closeOnOverlay ? 'data-up-event="click:close"' : ''}>
      <div class="vibe-drawer vibe-animate-slide-in-${s.placement}" style="
        ${isH ? `width:${w};height:100%;${s.placement}:0;` : `height:${w};width:100%;${s.placement}:0;`}
        position:absolute; background:var(--vibe-color-bg);
        box-shadow:${shadowScale.xl2}; overflow-y:auto;
        animation:vibe-slide-in-${s.placement} var(--vibe-duration-normal) var(--vibe-easing-out);
      " data-up-event-stop>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid var(--vibe-color-border);">
          <h3 style="margin:0;font-size:1.1rem;">${esc(s.title)}</h3>
          <button data-up-event="click:close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--vibe-color-muted);line-height:1;">&times;</button>
        </div>
        <div style="padding:1.25rem;" data-up-slot><slot></slot></div>
      </div>
    </div>`
  }
})

export const Sheet = component('VibeSheet', {
  state: { open: false, title: '', placement: 'bottom', size: 'md' },
  update: { configure: (s, p) => ({ ...s, ...p }), open: (s, p) => ({ ...s, open: true, ...p }), close: (s) => ({ ...s, open: false }) },
  view(s) {
    if (!s.open) return '<div style="display:none;"></div>'
    const sz = { sm: '30vh', md: '50vh', lg: '75vh', full: '100vh' }
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div style="position:fixed;inset:0;z-index:var(--vibe-z-modal);">
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);" data-up-event="click:close"></div>
      <div class="vibe-sheet vibe-animate-slide-in-up" style="
        position:absolute; bottom:0; left:0; right:0; height:${sz[s.size]};
        background:var(--vibe-color-bg); border-radius:var(--vibe-radius-xl) var(--vibe-radius-xl) 0 0;
        box-shadow:${shadowScale.xl2}; overflow-y:auto; padding:1.25rem;
        animation:vibe-slide-in-up var(--vibe-duration-normal) var(--vibe-easing-out);
      " data-up-event-stop>
        <div style="width:2.5rem;height:0.25rem;background:var(--vibe-color-neutral300);border-radius:var(--vibe-radius-full);margin:0 auto 1rem;"></div>
        ${s.title ? `<h3 style="margin:0 0 1rem;font-size:1.1rem;text-align:center;">${esc(s.title)}</h3>` : ''}
        <div data-up-slot><slot></slot></div>
      </div>
    </div>`
  }
})

export const Popover = component('VibePopover', {
  state: { open: false, content: '', placement: 'bottom', trigger: 'hover' },
  update: { configure: (s, p) => ({ ...s, ...p }), show: (s) => ({ ...s, open: true }), hide: (s) => ({ ...s, open: false }), toggle: (s) => ({ ...s, open: !s.open }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<span class="vibe-popover" style="position:relative;display:inline-block;" data-up-event="${s.trigger === 'click' ? 'click:toggle' : 'mouseenter:show'}">
      <span data-up-slot><slot></slot></span>
      ${s.open ? `<div class="vibe-popover-content vibe-animate-scale-in" style="
        position:absolute; z-index:var(--vibe-z-popover); min-width:12rem;
        ${s.placement === 'bottom' ? 'top:calc(100% + 0.5rem);left:50%;transform:translateX(-50%);' : ''}
        ${s.placement === 'top' ? 'bottom:calc(100% + 0.5rem);left:50%;transform:translateX(-50%);' : ''}
        ${s.placement === 'left' ? 'right:calc(100% + 0.5rem);top:50%;transform:translateY(-50%);' : ''}
        ${s.placement === 'right' ? 'left:calc(100% + 0.5rem);top:50%;transform:translateY(-50%);' : ''}
        padding:1rem; background:var(--vibe-color-bg); border:1px solid var(--vibe-color-border);
        border-radius:var(--vibe-radius-lg); box-shadow:${shadowScale.lg};
        animation:vibe-scale-in var(--vibe-duration-faster) var(--vibe-easing-out);
      " data-up-event-stop>${esc(s.content)}</div>` : ''}
    </span>`
  }
})

export const HoverCard = component('VibeHoverCard', {
  state: { open: false, content: '', placement: 'top', delay: 200 },
  update: { configure: (s, p) => ({ ...s, ...p }), show: (s) => ({ ...s, open: true }), hide: (s) => ({ ...s, open: false }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<span class="vibe-hovercard" style="position:relative;display:inline-block;" data-up-event="mouseenter:show" data-up-event="mouseleave:hide">
      <span data-up-slot><slot></slot></span>
      ${s.open ? `<div class="vibe-hovercard-content vibe-animate-fade-in" style="
        position:absolute; z-index:var(--vibe-z-popover);
        ${s.placement === 'top' ? 'bottom:calc(100% + 0.5rem);' : 'top:calc(100% + 0.5rem);'}
        left:50%; transform:translateX(-50%);
        padding:1rem; background:var(--vibe-color-bg); border:1px solid var(--vibe-color-border);
        border-radius:var(--vibe-radius-lg); box-shadow:${shadowScale.lg}; max-width:20rem;
        animation:vibe-fade-in var(--vibe-duration-faster) var(--vibe-easing-out);
      " data-up-event-stop>${esc(s.content)}</div>` : ''}
    </span>`
  }
})

export const Lightbox = component('VibeLightbox', {
  state: { open: false, src: '', alt: '', caption: '' },
  update: { configure: (s, p) => ({ ...s, ...p }), open: (s, p) => ({ ...s, open: true, ...p }), close: (s) => ({ ...s, open: false }) },
  view(s) {
    if (!s.open) return '<div style="display:none;"></div>'
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-lightbox" style="position:fixed;inset:0;z-index:var(--vibe-z-modal);background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;flex-direction:column;" data-up-event="click:close">
      <button data-up-event="click:close" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:white;font-size:2rem;cursor:pointer;line-height:1;">&times;</button>
      <img src="${esc(s.src)}" alt="${esc(s.alt)}" style="max-width:90vw;max-height:80vh;object-fit:contain;border-radius:var(--vibe-radius-md);" />
      ${s.caption ? `<p style="color:rgba(255,255,255,0.7);margin-top:1rem;font-size:0.9rem;">${esc(s.caption)}</p>` : ''}
    </div>`
  }
})

export const FullscreenOverlay = component('VibeFullscreenOverlay', {
  state: { visible: false, blur: true, clickToClose: true },
  update: { configure: (s, p) => ({ ...s, ...p }), show: (s) => ({ ...s, visible: true }), hide: (s) => ({ ...s, visible: false }) },
  view(s) {
    if (!s.visible) return '<div style="display:none;"></div>'
    return `<div class="vibe-fullscreen-overlay vibe-animate-fade-in" style="
      position:fixed; inset:0; z-index:var(--vibe-z-overlay);
      background:rgba(0,0,0,0.5); ${s.blur ? 'backdrop-filter:blur(4px);' : ''}
      display:flex; align-items:center; justify-content:center;
      animation:vibe-fade-in var(--vibe-duration-fast) var(--vibe-easing-out);
    " ${s.clickToClose ? 'data-up-event="click:hide"' : ''} data-up-slot>
      <slot></slot>
    </div>`
  }
})
