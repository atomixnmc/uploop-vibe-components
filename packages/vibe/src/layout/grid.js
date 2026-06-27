// ─── @uploop-vibe/vibe Layout Grid ────────────────────────────

import { component } from '@uploop/html'
import { breakpoints } from '../design/tokens.js'

// ── Container ────────────────────────────────────────────────

export const Container = component('VibeContainer', {
  state: {
    size: 'lg',       // sm|md|lg|xl|full
    padding: true,
    center: true,
  },

  update: { configure: (s, props) => ({ ...s, ...props }) },

  view(state) {
    const maxWidthMap = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', full: 'none' }
    return `<div class="vibe-container" style="
      width:100%;
      max-width:${maxWidthMap[state.size] || maxWidthMap.lg};
      ${state.center ? 'margin-left:auto;margin-right:auto;' : ''}
      ${state.padding ? 'padding-left:1rem;padding-right:1rem;' : ''}
    " data-up-slot><slot></slot></div>`
  }
})

// ── Grid ─────────────────────────────────────────────────────

export const Grid = component('VibeGrid', {
  state: {
    cols: 3,            // number of columns
    gap: 'md',          // sm|md|lg|xl
    responsive: true,
  },

  update: { configure: (s, props) => ({ ...s, ...props }) },

  view(state) {
    const gapMap = { sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' }
    const gap = gapMap[state.gap] || gapMap.md

    let responsiveCSS = ''
    if (state.responsive) {
      // Responsive grid: reduces columns at breakpoints
      const bpEntries = Object.entries(breakpoints).filter(([k]) => k !== 'z').sort((a, b) => a[1] - b[1])
      let lastCols = state.cols
      for (const [bp, px] of bpEntries) {
        const colsAtBp = Math.max(1, Math.min(lastCols, bp === 'sm' ? 2 : bp === 'md' ? Math.ceil(state.cols * 0.66) : bp === 'lg' ? state.cols : state.cols))
        if (colsAtBp !== lastCols) {
          responsiveCSS += `@media (max-width:${px - 1}px) { #vibe-grid-${state.cols} { grid-template-columns:repeat(${colsAtBp}, 1fr); } }`
          lastCols = colsAtBp
        }
      }
    }

    return `<div>
      ${responsiveCSS ? `<style>${responsiveCSS}</style>` : ''}
      <div id="vibe-grid-${state.cols}" class="vibe-grid" style="
        display:grid;
        grid-template-columns:repeat(${state.cols}, 1fr);
        gap:${gap};
      " data-up-slot><slot></slot></div>
    </div>`
  }
})

// ── Stack (vertical/horizontal) ──────────────────────────────

export const Stack = component('VibeStack', {
  state: {
    direction: 'vertical',  // vertical|horizontal
    gap: 'md',              // sm|md|lg|xl
    align: 'stretch',       // start|center|end|stretch
    justify: 'start',       // start|center|end|between|around|evenly
    wrap: false,
  },

  update: { configure: (s, props) => ({ ...s, ...props }) },

  view(state) {
    const gapMap = { sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' }
    const justifyMap = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between', around: 'space-around', evenly: 'space-evenly' }

    return `<div class="vibe-stack" style="
      display:flex;
      flex-direction:${state.direction === 'horizontal' ? 'row' : 'column'};
      gap:${gapMap[state.gap] || gapMap.md};
      align-items:${state.align === 'stretch' ? 'stretch' : state.align === 'start' ? 'flex-start' : state.align === 'end' ? 'flex-end' : 'center'};
      justify-content:${justifyMap[state.justify] || 'flex-start'};
      ${state.wrap ? 'flex-wrap:wrap;' : ''}
    " data-up-slot><slot></slot></div>`
  }
})

// ── Flex (row/col with explicit items) ───────────────────────

export const Flex = component('VibeFlex', {
  state: {
    gap: 'md',
    align: 'center',
    justify: 'start',
    wrap: false,
  },

  update: { configure: (s, props) => ({ ...s, ...props }) },

  view(state) {
    const gapMap = { sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' }
    const justifyMap = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between', around: 'space-around', evenly: 'space-evenly' }

    return `<div class="vibe-flex" style="
      display:flex; align-items:${state.align};
      justify-content:${justifyMap[state.justify] || 'flex-start'};
      gap:${gapMap[state.gap] || gapMap.md};
      ${state.wrap ? 'flex-wrap:wrap;' : ''}
    " data-up-slot><slot></slot></div>`
  }
})

// ── Spacer ───────────────────────────────────────────────────

export const Spacer = component('VibeSpacer', {
  state: { size: 'md' },  // xs|sm|md|lg|xl|xl2|xl3
  update: { configure: (s, props) => ({ ...s, ...props }) },
  view(state) {
    const sizeMap = { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', xl2: '3rem', xl3: '4rem' }
    return `<div style="width:100%;height:${sizeMap[state.size] || sizeMap.md};" aria-hidden="true"></div>`
  }
})

// ── Divider ──────────────────────────────────────────────────

export const Divider = component('VibeDivider', {
  state: { orientation: 'horizontal', label: '' },
  update: { configure: (s, props) => ({ ...s, ...props }) },
  view(state) {
    const esc = (s) => String(s).replace(/&/g, '&amp;')
    if (state.label) {
      return `<div class="vibe-divider" style="display:flex;align-items:center;gap:1rem;">
        <div style="flex:1;height:1px;background:var(--vibe-color-border);"></div>
        <span style="font-size:var(--vibe-font-size-sm);color:var(--vibe-color-mutedFg);white-space:nowrap;">${esc(state.label)}</span>
        <div style="flex:1;height:1px;background:var(--vibe-color-border);"></div>
      </div>`
    }
    return `<div style="width:100%;height:1px;background:var(--vibe-color-border);" aria-hidden="true"></div>`
  }
})
