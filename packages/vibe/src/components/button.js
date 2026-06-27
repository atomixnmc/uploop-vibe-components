// ─── @uploop-vibe/vibe Button Component ───────────────────────

import { component } from '@uploop/html'
import { resolveSize, resolveVariant } from '../design/scales.js'
import { motionPresets } from '../design/motion.js'

/**
 * Vibe Button — intent-driven button with size, variant, and motion.
 *
 * Intent schema:
 *   { label: string, size: 'xs'|'sm'|'md'|'lg'|'xl',
 *     variant: 'solid'|'outline'|'ghost'|'subtle'|'danger'|'success'|'warning'|'neutral',
 *     disabled: boolean, loading: boolean, icon: string, iconRight: string,
 *     animate: 'fade-in'|'scale-in'|... }
 */
export const Button = component('VibeButton', {
  state: {
    label: 'Button',
    size: 'md',
    variant: 'solid',
    disabled: false,
    loading: false,
    icon: '',
    iconRight: '',
    fullWidth: false,
    animate: '',
  },

  update: {
    setLabel: (s, label) => ({ ...s, label }),
    setSize: (s, size) => ({ ...s, size }),
    setVariant: (s, variant) => ({ ...s, variant }),
    setDisabled: (s, disabled) => ({ ...s, disabled }),
    setLoading: (s, loading) => ({ ...s, loading }),
    setIcon: (s, icon) => ({ ...s, icon }),
    setIconRight: (s, iconRight) => ({ ...s, iconRight }),
    setFullWidth: (s, fullWidth) => ({ ...s, fullWidth }),
    setAnimate: (s, animate) => ({ ...s, animate }),
    configure: (s, props) => ({ ...s, ...props }),
  },

  view(state) {
    const sz = resolveSize(state.size)
    const vr = resolveVariant(state.variant)
    const animCls = state.animate ? ` ${(motionPresets[state.animate] || '').replace('.', '')}` : ''
    const wCls = state.fullWidth ? 'vibe-w-full' : ''
    const disCls = state.disabled ? 'vibe-disabled' : ''

    return `<button class="vibe-btn vibe-btn-${state.size} vibe-btn-${state.variant} ${wCls} ${disCls}${animCls}"
      style="
        height:${sz.h}; padding:0 ${sz.px}; font-size:var(--vibe-font-size-${sz.text});
        background:var(--vibe-color-${vr.bg}); color:var(--vibe-color-${vr.fg});
        border:1px solid var(--vibe-color-${vr.border});
        border-radius:var(--vibe-radius-md);
        font-weight:var(--vibe-font-weight-medium);
        cursor:${state.disabled || state.loading ? 'not-allowed' : 'pointer'};
        opacity:${state.disabled ? '0.5' : '1'};
        display:inline-flex; align-items:center; justify-content:center; gap:0.5rem;
        transition:all var(--vibe-duration-fast) var(--vibe-easing-out);
        outline:none;
      "
      ${state.disabled ? 'disabled' : ''}
      data-up-event="click:click"
    >
      ${state.loading ? '<span class="vibe-spinner vibe-animate-spin"></span>' : ''}
      ${state.icon ? `<span class="vibe-btn-icon">${state.icon}</span>` : ''}
      <span>${state.label}</span>
      ${state.iconRight ? `<span class="vibe-btn-icon-right">${state.iconRight}</span>` : ''}
    </button>`
    // Hover/focus/active styles handled by injected CSS utility classes
  }
})
