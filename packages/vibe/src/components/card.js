// ─── @uploop-vibe/vibe Card Component ─────────────────────────

import { component } from '@uploop/html'
import { shadowScale } from '../design/scales.js'

export const Card = component('VibeCard', {
  state: {
    padding: 'md',     // none|sm|md|lg|xl
    shadow: 'sm',      // none|xs|sm|md|lg|xl|xl2
    radius: 'lg',      // none|xs|sm|md|lg|xl|full
    bordered: true,
    hoverable: false,
    clickable: false,
  },

  update: {
    configure: (s, props) => ({ ...s, ...props }),
  },

  view(state) {
    const padMap = { none: '0', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '2rem' }
    const radMap = { none: 'var(--vibe-radius-none)', xs: 'var(--vibe-radius-xs)', sm: 'var(--vibe-radius-sm)', md: 'var(--vibe-radius-md)', lg: 'var(--vibe-radius-lg)', xl: 'var(--vibe-radius-xl)', full: 'var(--vibe-radius-full)' }
    const shadow = shadowScale[state.shadow] || shadowScale.sm
    const hovCls = state.hoverable ? 'vibe-card-hoverable' : ''
    const clkCls = state.clickable ? 'vibe-card-clickable' : ''

    return `<div class="vibe-card ${hovCls} ${clkCls}" style="
      padding:${padMap[state.padding] || '1rem'};
      background:var(--vibe-color-surface);
      border-radius:${radMap[state.radius] || 'var(--vibe-radius-lg)'};
      box-shadow:${shadow};
      ${state.bordered ? 'border:1px solid var(--vibe-color-border)' : ''};
      transition:all var(--vibe-duration-fast) var(--vibe-easing-out);
    " data-up-slot>
      <slot></slot>
    </div>`
  }
})

export const CardHeader = component('VibeCardHeader', {
  state: { divider: true },
  view(s) {
    return `<div class="vibe-card-header" style="
      padding-bottom:0.75rem;
      ${s.divider ? 'border-bottom:1px solid var(--vibe-color-border)' : ''};
      margin-bottom:0.75rem;
    " data-up-slot><slot></slot></div>`
  }
})

export const CardBody = component('VibeCardBody', {
  state: {},
  view() {
    return `<div class="vibe-card-body" data-up-slot><slot></slot></div>`
  }
})

export const CardFooter = component('VibeCardFooter', {
  state: { divider: true },
  view(s) {
    return `<div class="vibe-card-footer" style="
      padding-top:0.75rem;
      ${s.divider ? 'border-top:1px solid var(--vibe-color-border)' : ''};
      margin-top:0.75rem;
    " data-up-slot><slot></slot></div>`
  }
})
