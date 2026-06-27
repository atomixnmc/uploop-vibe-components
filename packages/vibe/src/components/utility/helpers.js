// ─── Utility: Portal, Transition, FocusTrap, ClickOutside, LazyLoad ─

import { component } from '@uploop/html'

export const Portal = component('VibePortal', {
  state: { target: 'body', disabled: false },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view() {
    // Portal renders children into target via mount hook — view is pass-through
    return `<div class="vibe-portal" data-up-slot><slot></slot></div>`
  },
})

export const Transition = component('VibeTransition', {
  state: { show: false, enter: 'fade-in', exit: 'fade-out', duration: 'normal', unmountOnExit: true },
  update: { configure: (s, p) => ({ ...s, ...p }), show: (s) => ({ ...s, show: true }), hide: (s) => ({ ...s, show: false }) },
  view(s) {
    if (!s.show && s.unmountOnExit) return '<div style="display:none;"></div>'
    const animCls = s.show ? `vibe-animate-${s.enter}` : `vibe-animate-${s.exit}`
    return `<div class="vibe-transition ${animCls} vibe-duration-${s.duration}" style="
      animation-fill-mode:both;
      ${!s.show ? 'opacity:0;pointer-events:none;' : ''}
    " data-up-slot><slot></slot></div>`
  }
})

export const FocusTrap = component('VibeFocusTrap', {
  state: { active: false, autoFocus: true },
  update: { configure: (s, p) => ({ ...s, ...p }), activate: (s) => ({ ...s, active: true }), deactivate: (s) => ({ ...s, active: false }) },
  view(s) {
    return `<div class="vibe-focus-trap" ${s.active ? 'tabindex="-1"' : ''} data-up-slot style="outline:none;">
      <slot></slot>
    </div>`
  },
})

export const ClickOutside = component('VibeClickOutside', {
  state: { enabled: true },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view() {
    return `<div class="vibe-click-outside" data-up-slot style="display:contents;">
      <slot></slot>
    </div>`
  },
})

export const LazyLoad = component('VibeLazyLoad', {
  state: { loaded: false, placeholder: '', threshold: 0.1 },
  update: { configure: (s, p) => ({ ...s, ...p }), load: (s) => ({ ...s, loaded: true }) },
  view(s) {
    if (!s.loaded) {
      return `<div class="vibe-lazy-load" style="min-height:2rem;" data-up-slot>
        ${s.placeholder ? `<div style="padding:1rem;text-align:center;color:var(--vibe-color-muted);font-size:0.85rem;">${String(s.placeholder).replace(/&/g, '&amp;')}</div>` : '<div class="vibe-skeleton vibe-animate-pulse" style="height:3rem;background:var(--vibe-color-neutral100);border-radius:var(--vibe-radius-md);"></div>'}
      </div>`
    }
    return `<div class="vibe-lazy-load" data-up-slot><slot></slot></div>`
  },
})
