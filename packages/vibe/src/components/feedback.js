// ─── @uploop-vibe/vibe Skeleton, Progress, Icon ───────────────

import { component } from '@uploop/html'

// ── Skeleton ─────────────────────────────────────────────────

export const Skeleton = component('VibeSkeleton', {
  state: {
    width: '100%',
    height: '1rem',
    radius: 'md',
    variant: 'text',    // text|circle|rect
    count: 1,
    animate: true,
  },

  update: { configure: (s, props) => ({ ...s, ...props }) },

  view(state) {
    const animCls = state.animate ? 'vibe-animate-shimmer' : ''
    const radMap = { none: '0', sm: 'var(--vibe-radius-sm)', md: 'var(--vibe-radius-md)', lg: 'var(--vibe-radius-lg)', full: 'var(--vibe-radius-full)' }
    const rad = state.variant === 'circle' ? 'var(--vibe-radius-full)' : (radMap[state.radius] || radMap.md)
    const w = state.variant === 'circle' ? state.height : state.width

    const item = `<div class="vibe-skeleton ${animCls}" style="
      width:${w}; height:${state.height}; border-radius:${rad};
      background:linear-gradient(90deg, var(--vibe-color-neutral100) 25%, var(--vibe-color-neutral200) 50%, var(--vibe-color-neutral100) 75%);
      background-size:200% 100%;
      ${state.animate ? 'animation: vibe-shimmer 1.5s infinite;' : ''}
    "></div>`

    if (state.count <= 1) return item
    return Array.from({ length: state.count }, (_, i) => `<div style="${i > 0 ? 'margin-top:0.5rem;' : ''}">${item}</div>`).join('')
  }
})

// ── Progress ─────────────────────────────────────────────────

export const Progress = component('VibeProgress', {
  state: {
    value: 0,           // 0-100
    max: 100,
    size: 'md',         // sm|md|lg
    variant: 'primary',  // primary|success|warning|error|info
    showLabel: false,
    indeterminate: false,
  },

  update: {
    configure: (s, props) => ({ ...s, ...props }),
    setValue: (s, value) => ({ ...s, value }),
    setIndeterminate: (s, indeterminate) => ({ ...s, indeterminate }),
  },

  view(state) {
    const szMap = { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' }
    const h = szMap[state.size] || szMap.md
    const pct = Math.min(100, Math.max(0, (state.value / state.max) * 100))
    const esc = (s) => String(s).replace(/&/g, '&amp;')

    return `<div class="vibe-progress" style="width:100%;">
      <div style="
        width:100%; height:${h}; background:var(--vibe-color-neutral100);
        border-radius:var(--vibe-radius-full); overflow:hidden;
      ">
        <div class="${state.indeterminate ? 'vibe-progress-indeterminate' : ''}" style="
          height:100%; width:${state.indeterminate ? '30%' : pct + '%'};
          background:var(--vibe-color-${state.variant === 'primary' ? 'primary600' : state.variant});
          border-radius:var(--vibe-radius-full);
          transition:width var(--vibe-duration-normal) var(--vibe-easing-out);
          ${state.indeterminate ? 'animation: vibe-progress-indeterminate 1.5s infinite ease-in-out;' : ''}
        "></div>
      </div>
      ${state.showLabel ? `<span style="display:block;margin-top:0.25rem;font-size:var(--vibe-font-size-xs);color:var(--vibe-color-mutedFg);">${Math.round(pct)}%</span>` : ''}
    </div>`
  }
})

// ── Icon ─────────────────────────────────────────────────────

export const Icon = component('VibeIcon', {
  state: {
    name: '',           // icon name/key
    size: 'md',         // xs|sm|md|lg|xl|xl2
    color: 'currentColor',
    spin: false,
    pulse: false,
  },

  update: { configure: (s, props) => ({ ...s, ...props }) },

  view(state) {
    const szMap = { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.25rem', xl: '1.5rem', xl2: '2rem' }
    const sz = szMap[state.size] || szMap.md
    const animCls = state.spin ? 'vibe-animate-spin' : (state.pulse ? 'vibe-animate-pulse' : '')

    // Inline SVG placeholder — real icons would be fetched from a sprite/registry
    return `<span class="vibe-icon ${animCls}" style="
      display:inline-flex; align-items:center; justify-content:center;
      width:${sz}; height:${sz}; font-size:${sz}; color:var(--vibe-color-${state.color});
      ${state.spin || state.pulse ? 'animation-duration: var(--vibe-duration-slower);' : ''}
    " data-icon="${state.name}">
      <!-- Icon slot: inject SVG via children or use a sprite system -->
      <slot></slot>
    </span>`
  }
})
