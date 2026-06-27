// ─── Feedback: Alert, Notification, Banner, Spinner, EmptyState, ErrorState, LoadingOverlay, Result, Spotlight, Tour ─

import { component } from '@uploop/html'
import { shadowScale } from '../../design/scales.js'

export const Alert = component('VibeAlert', {
  state: { title: '', message: '', variant: 'info', dismissible: true, visible: true, icon: '' },
  update: { configure: (s, p) => ({ ...s, ...p }), dismiss: (s) => ({ ...s, visible: false }), show: (s, p) => ({ ...s, visible: true, ...p }) },
  view(s) {
    if (!s.visible) return '<div style="display:none;"></div>'
    const variants = {
      info:    { bg: 'var(--vibe-color-primary50)', border: 'var(--vibe-color-primary300)', fg: 'var(--vibe-color-primary800)', icon: 'ℹ' },
      success: { bg: '#d3f9d8', border: '#8ce99a', fg: '#2b8a3e', icon: '✓' },
      warning: { bg: '#fff3bf', border: '#ffc078', fg: '#e67700', icon: '⚠' },
      error:   { bg: '#ffe3e3', border: '#ffa8a8', fg: '#c92a2a', icon: '✕' },
    }
    const v = variants[s.variant] || variants.info
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-alert vibe-animate-slide-in-down" style="
      padding:0.75rem 1rem; background:${v.bg}; border:1px solid ${v.border};
      border-radius:var(--vibe-radius-md); color:${v.fg}; font-size:0.85rem;
      display:flex; gap:0.75rem; align-items:flex-start;
    ">
      <span style="font-size:1.1rem;flex-shrink:0;">${s.icon || v.icon}</span>
      <div style="flex:1;">
        ${s.title ? `<div style="font-weight:var(--vibe-font-weight-semibold);margin-bottom:0.125rem;">${esc(s.title)}</div>` : ''}
        <div>${esc(s.message)}</div>
      </div>
      ${s.dismissible ? `<button data-up-event="click:dismiss" style="background:none;border:none;cursor:pointer;font-size:1.25rem;line-height:1;color:inherit;opacity:0.6;flex-shrink:0;">&times;</button>` : ''}
    </div>`
  }
})

export const Notification = component('VibeNotification', {
  state: { title: '', message: '', variant: 'info', duration: 5000, id: '' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const variants = { info: { border: 'var(--vibe-color-primary500)' }, success: { border: 'var(--vibe-color-success)' }, warning: { border: 'var(--vibe-color-warning)' }, error: { border: 'var(--vibe-color-error)' } }
    const v = variants[s.variant] || variants.info
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-notification" style="
      padding:0.75rem 1rem; background:var(--vibe-color-bg); border-left:3px solid ${v.border};
      border-radius:var(--vibe-radius-md); box-shadow:${shadowScale.md}; font-size:0.85rem;
    ">
      ${s.title ? `<div style="font-weight:var(--vibe-font-weight-semibold);margin-bottom:0.125rem;">${esc(s.title)}</div>` : ''}
      <div style="color:var(--vibe-color-mutedFg);">${esc(s.message)}</div>
    </div>`
  }
})

export const Banner = component('VibeBanner', {
  state: { message: '', variant: 'info', action: null, visible: true, fixed: false },
  update: { configure: (s, p) => ({ ...s, ...p }), dismiss: (s) => ({ ...s, visible: false }) },
  view(s) {
    if (!s.visible) return '<div style="display:none;"></div>'
    const variants = { info: { bg: 'var(--vibe-color-primary600)', fg: 'white' }, success: { bg: 'var(--vibe-color-success)', fg: 'white' }, warning: { bg: 'var(--vibe-color-warning)', fg: '#212529' }, error: { bg: 'var(--vibe-color-error)', fg: 'white' } }
    const v = variants[s.variant] || variants.info
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-banner" style="
      ${s.fixed ? 'position:fixed;top:0;left:0;right:0;z-index:var(--vibe-z-banner);' : ''}
      padding:0.625rem 1.5rem; background:${v.bg}; color:${v.fg};
      text-align:center; font-size:0.85rem; font-weight:var(--vibe-font-weight-medium);
      display:flex; align-items:center; justify-content:center; gap:1rem;
    ">
      <span>${esc(s.message)}</span>
      ${s.action ? `<button data-up-event="click:action" style="
        padding:0.25rem 0.75rem; border:1px solid currentColor; border-radius:var(--vibe-radius-full);
        background:transparent; color:inherit; cursor:pointer; font-size:0.8rem;
      ">${esc(s.action.label)}</button>` : ''}
      <button data-up-event="click:dismiss" style="background:none;border:none;cursor:pointer;color:inherit;opacity:0.7;font-size:1.25rem;line-height:1;">&times;</button>
    </div>`
  }
})

export const Spinner = component('VibeSpinner', {
  state: { size: 'md', color: 'primary', label: '' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const sz = { xs: '0.75rem', sm: '1rem', md: '1.5rem', lg: '2rem', xl: '3rem' }
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-spinner" style="display:inline-flex;flex-direction:column;align-items:center;gap:0.5rem;">
      <div class="vibe-animate-spin" style="
        width:${sz[s.size]};height:${sz[s.size]};border:2px solid var(--vibe-color-neutral200);
        border-top-color:var(--vibe-color-${s.color}600);
        border-radius:50%;animation:vibe-spin 0.6s linear infinite;
      "></div>
      ${s.label ? `<span style="font-size:0.78rem;color:var(--vibe-color-mutedFg);">${esc(s.label)}</span>` : ''}
    </div>`
  }
})

export const EmptyState = component('VibeEmptyState', {
  state: { icon: '📭', title: 'Nothing here', description: '', action: null },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-empty-state" style="text-align:center;padding:3rem 1.5rem;">
      <div style="font-size:3rem;margin-bottom:0.75rem;">${esc(s.icon)}</div>
      <h3 style="margin:0 0 0.375rem;font-size:1.1rem;font-weight:var(--vibe-font-weight-semibold);">${esc(s.title)}</h3>
      ${s.description ? `<p style="margin:0 0 1rem;color:var(--vibe-color-mutedFg);font-size:0.85rem;">${esc(s.description)}</p>` : ''}
      ${s.action ? `<button data-up-event="click:action" style="padding:0.5rem 1.25rem;background:var(--vibe-color-primary600);color:white;border:none;border-radius:var(--vibe-radius-md);cursor:pointer;font-weight:var(--vibe-font-weight-medium);font-size:0.85rem;">${esc(s.action.label)}</button>` : ''}
    </div>`
  }
})

export const ErrorState = component('VibeErrorState', {
  state: { title: 'Something went wrong', message: '', onRetry: null },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-error-state" style="text-align:center;padding:3rem 1.5rem;">
      <div style="font-size:3rem;margin-bottom:0.75rem;">&#9888;</div>
      <h3 style="margin:0 0 0.375rem;font-size:1.1rem;font-weight:var(--vibe-font-weight-semibold);color:var(--vibe-color-error);">${esc(s.title)}</h3>
      ${s.message ? `<p style="margin:0 0 1rem;color:var(--vibe-color-mutedFg);font-size:0.85rem;">${esc(s.message)}</p>` : ''}
      <button data-up-event="click:retry" style="padding:0.5rem 1.25rem;background:var(--vibe-color-primary600);color:white;border:none;border-radius:var(--vibe-radius-md);cursor:pointer;font-weight:var(--vibe-font-weight-medium);font-size:0.85rem;">Try Again</button>
    </div>`
  }
})

export const LoadingOverlay = component('VibeLoadingOverlay', {
  state: { visible: false, message: 'Loading...', blur: false },
  update: { configure: (s, p) => ({ ...s, ...p }), show: (s) => ({ ...s, visible: true }), hide: (s) => ({ ...s, visible: false }) },
  view(s) {
    if (!s.visible) return '<div style="display:none;"></div>'
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-loading-overlay" style="
      position:absolute; inset:0; z-index:var(--vibe-z-overlay);
      display:flex; align-items:center; justify-content:center; flex-direction:column; gap:0.75rem;
      background:rgba(255,255,255,0.8); ${s.blur ? 'backdrop-filter:blur(4px);' : ''}
      border-radius:inherit;
    ">
      <div class="vibe-animate-spin" style="width:2.5rem;height:2.5rem;border:3px solid var(--vibe-color-neutral200);border-top-color:var(--vibe-color-primary600);border-radius:50%;animation:vibe-spin 0.6s linear infinite;"></div>
      <span style="font-size:0.85rem;font-weight:var(--vibe-font-weight-medium);color:var(--vibe-color-mutedFg);">${esc(s.message)}</span>
    </div>`
  }
})

export const Result = component('VibeResult', {
  state: { status: 'success', title: '', subtitle: '', extra: null },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const config = {
      success: { icon: '✅', color: 'var(--vibe-color-success)' },
      error:   { icon: '❌', color: 'var(--vibe-color-error)' },
      warning: { icon: '⚠️', color: 'var(--vibe-color-warning)' },
      info:    { icon: 'ℹ️', color: 'var(--vibe-color-info)' },
    }
    const c = config[s.status] || config.info
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-result" style="text-align:center;padding:3rem 1.5rem;">
      <div style="font-size:4rem;margin-bottom:1rem;">${c.icon}</div>
      <h2 style="margin:0 0 0.5rem;font-size:1.5rem;font-weight:var(--vibe-font-weight-bold);color:${c.color};">${esc(s.title)}</h2>
      ${s.subtitle ? `<p style="margin:0 0 1.5rem;color:var(--vibe-color-mutedFg);font-size:0.9rem;">${esc(s.subtitle)}</p>` : ''}
      <div data-up-slot><slot></slot></div>
    </div>`
  }
})

export const Spotlight = component('VibeSpotlight', {
  state: { target: '', title: '', description: '', step: 0, total: 1, visible: false },
  update: { configure: (s, p) => ({ ...s, ...p }), show: (s) => ({ ...s, visible: true }), hide: (s) => ({ ...s, visible: false }), next: (s) => ({ ...s, step: s.step + 1 }), prev: (s) => ({ ...s, step: Math.max(0, s.step - 1) }) },
  view(s) {
    if (!s.visible) return '<div style="display:none;"></div>'
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-spotlight" style="position:fixed;inset:0;z-index:var(--vibe-z-popover);">
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);" data-up-event="click:hide"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);max-width:24rem;width:90%;padding:1.5rem;background:var(--vibe-color-bg);border-radius:var(--vibe-radius-xl);box-shadow:${shadowScale.xl2};text-align:center;">
        <div style="font-size:0.75rem;color:var(--vibe-color-muted);margin-bottom:0.5rem;">Step ${s.step + 1} of ${s.total}</div>
        <h3 style="margin:0 0 0.5rem;">${esc(s.title)}</h3>
        <p style="margin:0 0 1.25rem;color:var(--vibe-color-mutedFg);font-size:0.85rem;">${esc(s.description)}</p>
        <div style="display:flex;gap:0.5rem;justify-content:center;">
          ${s.step > 0 ? `<button data-up-event="click:prev" style="padding:0.5rem 1rem;border:1px solid var(--vibe-color-border);border-radius:var(--vibe-radius-md);background:transparent;cursor:pointer;">Back</button>` : ''}
          <button data-up-event="click:${s.step < s.total - 1 ? 'next' : 'hide'}" style="padding:0.5rem 1.25rem;border:none;border-radius:var(--vibe-radius-md);background:var(--vibe-color-primary600);color:white;cursor:pointer;font-weight:var(--vibe-font-weight-medium);">${s.step < s.total - 1 ? 'Next' : 'Done'}</button>
        </div>
      </div>
    </div>`
  }
})
