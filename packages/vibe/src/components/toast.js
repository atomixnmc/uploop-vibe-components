// ─── @uploop-vibe/vibe Toast, Modal, Dialog, Tooltip ──────────

import { component } from '@uploop/html'
import { shadowScale } from '../design/scales.js'
import { motionPresets } from '../design/motion.js'

// ── Toast ────────────────────────────────────────────────────

export const Toast = component('VibeToast', {
  state: {
    message: '',
    variant: 'info',    // info|success|warning|error|neutral
    visible: false,
    duration: 3000,     // auto-dismiss ms (0 = manual)
    position: 'top-right', // top-right|top-left|bottom-right|bottom-left|top-center|bottom-center
  },

  update: {
    show: (s, { message, variant, duration }) => {
      const d = { ...s, message: message || s.message, variant: variant || s.variant, visible: true }
      if (duration !== undefined) d.duration = duration
      return d
    },
    hide: (s) => ({ ...s, visible: false }),
    configure: (s, props) => ({ ...s, ...props }),
  },

  effect: {
    'visible': (state) => {
      if (state.visible && state.duration > 0) {
        const timeout = setTimeout(() => {
          // Self-dismiss via internal state — will be handled by parent
        }, state.duration)
        return () => clearTimeout(timeout)
      }
    }
  },

  view(state) {
    if (!state.visible) return '<div class="vibe-toast vibe-hidden" style="display:none;"></div>'

    const variantColors = {
      info:    { bg: 'var(--vibe-color-info)', fg: 'white' },
      success: { bg: 'var(--vibe-color-success)', fg: 'white' },
      warning: { bg: 'var(--vibe-color-warning)', fg: 'var(--vibe-color-neutral900)' },
      error:   { bg: 'var(--vibe-color-error)', fg: 'white' },
      neutral: { bg: 'var(--vibe-color-neutral800)', fg: 'white' },
    }
    const c = variantColors[state.variant] || variantColors.info

    const posMap = {
      'top-right': 'top:1rem;right:1rem;', 'top-left': 'top:1rem;left:1rem;',
      'bottom-right': 'bottom:1rem;right:1rem;', 'bottom-left': 'bottom:1rem;left:1rem;',
      'top-center': 'top:1rem;left:50%;transform:translateX(-50%);', 'bottom-center': 'bottom:1rem;left:50%;transform:translateX(-50%);',
    }

    return `<div class="vibe-toast vibe-animate-slide-in-right" style="
      position:fixed; ${posMap[state.position] || posMap['top-right']}
      z-index:var(--vibe-z-toast);
      padding:0.75rem 1rem;
      background:${c.bg}; color:${c.fg};
      border-radius:var(--vibe-radius-md);
      box-shadow:${shadowScale.lg};
      font-size:var(--vibe-font-size-sm);
      font-weight:var(--vibe-font-weight-medium);
      display:flex; align-items:center; gap:0.5rem;
      max-width:24rem;
      animation: vibe-slide-in-right var(--vibe-duration-normal) var(--vibe-easing-out);
    " data-up-event="click:hide">
      <span>${state.message.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>
      <span style="cursor:pointer;margin-left:auto;opacity:0.7;font-size:1.25rem;line-height:1;" data-up-event="click:hide">&times;</span>
    </div>`
  }
})

// ── Modal ────────────────────────────────────────────────────

export const Modal = component('VibeModal', {
  state: {
    open: false,
    title: '',
    size: 'md',         // sm|md|lg|xl|full
    closeOnOverlay: true,
    closeOnEsc: true,
  },

  update: {
    open: (s, { title } = {}) => ({ ...s, open: true, title: title || s.title }),
    close: (s) => ({ ...s, open: false }),
    toggle: (s) => ({ ...s, open: !s.open }),
    configure: (s, props) => ({ ...s, ...props }),
  },

  view(state) {
    if (!state.open) return '<div class="vibe-modal vibe-hidden" style="display:none;"></div>'

    const szMap = { sm: '24rem', md: '32rem', lg: '40rem', xl: '56rem', full: '100vw' }

    return `<div class="vibe-modal-overlay" style="
      position:fixed; inset:0; z-index:var(--vibe-z-modal);
      background:rgba(0,0,0,0.5);
      display:flex; align-items:center; justify-content:center;
      animation: vibe-fade-in var(--vibe-duration-fast) var(--vibe-easing-out);
    " ${state.closeOnOverlay ? 'data-up-event="click:close"' : ''}>
      <div class="vibe-modal-content vibe-animate-scale-in" style="
        background:var(--vibe-color-bg);
        border-radius:var(--vibe-radius-xl);
        box-shadow:${shadowScale.xl2};
        width:${szMap[state.size] || szMap.md}; max-width:calc(100vw - 2rem); max-height:calc(100vh - 4rem);
        display:flex; flex-direction:column;
        animation: vibe-scale-in var(--vibe-duration-normal) var(--vibe-easing-out);
      " data-up-event-stop>
        ${state.title ? `<div class="vibe-modal-header" style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--vibe-color-border);display:flex;align-items:center;justify-content:space-between;">
          <h2 style="margin:0;font-size:var(--vibe-font-size-lg);font-weight:var(--vibe-font-weight-semibold);">${state.title.replace(/&/g, '&amp;')}</h2>
          <span data-up-event="click:close" style="cursor:pointer;font-size:1.5rem;line-height:1;opacity:0.5;">&times;</span>
        </div>` : ''}
        <div class="vibe-modal-body" style="padding:1.5rem;overflow-y:auto;flex:1;" data-up-slot>
          <slot></slot>
        </div>
      </div>
    </div>`
  }
})

// ── Dialog (Modal with actions) ──────────────────────────────

export const Dialog = component('VibeDialog', {
  state: {
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'primary',  // primary|danger
    loading: false,
  },

  update: {
    confirm: (s, { title, message, variant } = {}) => ({ ...s, open: true, title: title || s.title, message: message || s.message, variant: variant || s.variant }),
    close: (s) => ({ ...s, open: false }),
    setLoading: (s, loading) => ({ ...s, loading }),
    configure: (s, props) => ({ ...s, ...props }),
  },

  view(state) {
    if (!state.open) return '<div class="vibe-dialog vibe-hidden" style="display:none;"></div>'

    const btnColor = state.variant === 'danger' ? 'var(--vibe-color-error)' : 'var(--vibe-color-primary600)'

    return `<div class="vibe-modal-overlay" style="
      position:fixed; inset:0; z-index:var(--vibe-z-modal);
      background:rgba(0,0,0,0.5);
      display:flex; align-items:center; justify-content:center;
      animation: vibe-fade-in var(--vibe-duration-fast) var(--vibe-easing-out);
    " data-up-event="click:close">
      <div class="vibe-dialog-content vibe-animate-scale-in" style="
        background:var(--vibe-color-bg);
        border-radius:var(--vibe-radius-xl);
        box-shadow:${shadowScale.xl2};
        width:28rem; max-width:calc(100vw - 2rem);
        padding:1.5rem;
        animation: vibe-scale-in var(--vibe-duration-normal) var(--vibe-easing-out);
      " data-up-event-stop>
        ${state.title ? `<h3 style="margin:0 0 0.5rem;font-size:var(--vibe-font-size-lg);font-weight:var(--vibe-font-weight-semibold);">${state.title.replace(/&/g, '&amp;')}</h3>` : ''}
        ${state.message ? `<p style="margin:0 0 1.5rem;color:var(--vibe-color-mutedFg);">${state.message.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>` : ''}
        <div style="display:flex;justify-content:flex-end;gap:0.75rem;">
          <button class="vibe-btn vibe-btn-ghost" data-up-event="click:close" style="height:2.25rem;padding:0 1rem;border-radius:var(--vibe-radius-md);border:1px solid var(--vibe-color-border);background:transparent;cursor:pointer;">${state.cancelLabel}</button>
          <button class="vibe-btn" data-up-event="click:confirm" style="height:2.25rem;padding:0 1.25rem;border-radius:var(--vibe-radius-md);border:none;background:${btnColor};color:white;font-weight:var(--vibe-font-weight-medium);cursor:pointer;">${state.confirmLabel}</button>
        </div>
      </div>
    </div>`
  }
})

// ── Tooltip ──────────────────────────────────────────────────

export const Tooltip = component('VibeTooltip', {
  state: {
    text: '',
    position: 'top',  // top|bottom|left|right
    delay: 200,
  },

  update: { configure: (s, props) => ({ ...s, ...props }) },

  view(state) {
    return `<span class="vibe-tooltip-wrapper" style="position:relative;display:inline-block;" data-up-slot>
      <slot></slot>
      ${state.text ? `<span class="vibe-tooltip" style="
        position:absolute;
        ${state.position === 'top' ? 'bottom:calc(100% + 0.5rem);left:50%;transform:translateX(-50%);' : ''}
        ${state.position === 'bottom' ? 'top:calc(100% + 0.5rem);left:50%;transform:translateX(-50%);' : ''}
        ${state.position === 'left' ? 'right:calc(100% + 0.5rem);top:50%;transform:translateY(-50%);' : ''}
        ${state.position === 'right' ? 'left:calc(100% + 0.5rem);top:50%;transform:translateY(-50%);' : ''}
        padding:0.375rem 0.75rem;
        background:var(--vibe-color-neutral800); color:white;
        font-size:var(--vibe-font-size-xs);
        border-radius:var(--vibe-radius-md);
        white-space:nowrap;
        z-index:var(--vibe-z-tooltip);
        pointer-events:none;
        opacity:0; transition:opacity var(--vibe-duration-fast) var(--vibe-easing-out);
      ">${state.text.replace(/&/g, '&amp;')}</span>` : ''}
    </span>`
  }
})
