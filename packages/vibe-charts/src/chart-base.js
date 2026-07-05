// Chart Foundation — deep uploop integration
//
// @uploop/css   → CSS injection for chart utilities, theme() for tokens,
//                 hexToRgb/lighten/darken for color math
// @uploop/schema → data validation via typed schemas
// @uploop/core  → createLoop for reactive state, createGraph for data flow,
//                 batch() for efficient updates
// @uploop/html  → component() for DOM mount / lifecycle

import { component } from '@uploop/html'
import { createLoop, batch } from '@uploop/core'
import {
  inject as injectCSS,
  theme as createTheme,
  applyTheme,
  lightTheme,
  darkTheme,
  hexToRgb, lighten, darken, alpha, contrast,
  colorShadeVars,
} from '@uploop/css'
import { object, array, number, string, optional } from '@uploop/schema'
import { getChartSchema } from './chart-schema.js'

// ── Inject chart utility CSS once on first import ───────────

let _cssInjected = false
function ensureCSS() {
  if (_cssInjected) return
  if (typeof document === 'undefined') return
  // Inject uploop utility CSS for spacing, colors, sizing
  injectCSS({ groups: ['spacing', 'sizing', 'colors', 'typography'] })
  // Inject chart-specific utility classes
  const style = document.createElement('style')
  style.setAttribute('data-uploop', 'vibe-charts')
  style.textContent = CHART_CSS
  document.head.appendChild(style)
  _cssInjected = true
}

// ── Chart-specific CSS utilities ───────────────────────────

const CHART_CSS = `
  .vibe-chart { display:block; overflow:visible; }
  .vibe-chart text { font-family: var(--vibe-font-sans, Inter, system-ui, sans-serif); }
  .vibe-chart-title { font-size: var(--vibe-chart-title-size, 13px); font-weight: 600; fill: var(--vibe-color-fg, #1a1a2e); }
  .vibe-chart-subtitle { font-size: var(--vibe-chart-tick-size, 9px); fill: var(--vibe-color-mutedFg, #868e96); }
  .vibe-chart-label { font-size: var(--vibe-chart-label-size, 10px); fill: var(--vibe-color-mutedFg, #868e96); }
  .vibe-chart-tick { font-size: var(--vibe-chart-tick-size, 9px); fill: var(--vibe-color-mutedFg, #868e96); }
  .vibe-chart-legend { font-size: var(--vibe-chart-legend-size, 11px); fill: var(--vibe-color-mutedFg, #868e96); }
  .vibe-chart-grid { stroke: var(--vibe-color-neutral200, #e9ecef); stroke-width: 1; stroke-dasharray: 4,4; }
  .vibe-chart-axis { stroke: var(--vibe-color-neutral400, #ced4da); stroke-width: 1; }
  .vibe-chart-bar { opacity: 0.85; transition: opacity 0.15s; }
  .vibe-chart-bar:hover { opacity: 1; }
  .vibe-chart-dot { transition: r 0.15s; }
  .vibe-chart-dot:hover { r: 5; }
  .vibe-chart-link { transition: opacity 0.15s; }
  .vibe-chart-link:hover { opacity: 0.9 !important; }
  .vibe-chart-cell { transition: opacity 0.15s; }
  .vibe-chart-cell:hover { opacity: 1 !important; stroke: var(--vibe-color-fg, #1a1a2e); stroke-width: 1.5; }
`

// ── Chart Theme System ─────────────────────────────────────

/** Chart theme tokens — CSS custom property names mapped to defaults */
const CHART_THEME_DEFAULTS = {
  titleSize:    '13px',
  subtitleSize: '10px',
  labelSize:    '10px',
  tickSize:     '9px',
  legendSize:   '11px',
  strokeWidth:  '2px',
  dotRadius:    '3px',
  barRadius:    '3px',
  barOpacity:   '0.85',
  areaOpacity:  '0.2',
}

/** Build CSS custom property map for a chart theme */
export function buildChartTheme(overrides = {}) {
  const t = { ...CHART_THEME_DEFAULTS, ...overrides }
  const vars = {}
  for (const [key, val] of Object.entries(t)) {
    vars[`--vibe-chart-${key}`] = val
  }
  return vars
}

/** Apply chart theme to a container element */
export function applyChartTheme(el, overrides = {}) {
  const vars = buildChartTheme(overrides)
  for (const [prop, value] of Object.entries(vars)) {
    el.style.setProperty(prop, value)
  }
}

// ── Default Color Palette (uploop-branded) ─────────────────

const DEFAULT_PALETTE = [
  '#646cff', '#40c057', '#fab005', '#fa5252', '#228be6',
  '#f06595', '#20c997', '#fd7e14', '#7950f2', '#15aabf',
  '#e64980', '#74b816', '#4c6ef5', '#ff922b', '#be4bdb',
]

/** Get palette color by index, with CSS var fallback */
export function paletteColor(index, state) {
  // Check for CSS custom property override
  if (typeof document !== 'undefined') {
    const cssVar = `--vibe-chart-color-${index}`
    const val = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
    if (val) return val
  }
  // Check state palette
  if (state?.palette && Array.isArray(state.palette)) {
    return state.palette[index % state.palette.length]
  }
  return DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]
}

// ── SVG Helpers (using CSS classes from injected sheet) ────

export function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function formatNumber(n, precision = 0) {
  if (n == null || isNaN(n)) return '--'
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (abs >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(precision)
}

export function niceTicks(min, max, count = 5) {
  if (max === min) return [min]
  const range = max - min
  const roughStep = range / (count - 1)
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
  const niceStep = [1, 2, 5, 10].reduce((best, m) => {
    const s = m * magnitude
    return Math.abs(s - roughStep) < Math.abs(best - roughStep) ? s : best
  }, magnitude)
  const niceMin = Math.floor(min / niceStep) * niceStep
  const niceMax = Math.ceil(max / niceStep) * niceStep
  const ticks = []
  for (let v = niceMin; v <= niceMax + niceStep / 2; v += niceStep) {
    ticks.push(Math.round(v * 100) / 100)
  }
  return ticks
}

export function svgWrap(w, h, title, subtitle) {
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" class="vibe-chart" role="img">`
  if (title) {
    s += `<text x="${w / 2}" y="18" text-anchor="middle" class="vibe-chart-title">${esc(title)}</text>`
  }
  if (subtitle) {
    s += `<text x="${w / 2}" y="${title ? 34 : 18}" text-anchor="middle" class="vibe-chart-subtitle">${esc(subtitle)}</text>`
  }
  return s
}

/** Build grid lines using CSS class */
export function gridLines(ticks, w, h, pad) {
  const yMin = ticks[0], yMax = ticks[ticks.length - 1] || ticks[0] + 1
  const yRange = yMax - yMin || 1
  return ticks.map(t => {
    const y = pad.top + ((t - yMin) / yRange) * (h - pad.top - pad.bottom)
    return `<line x1="${pad.left}" y1="${(h - y).toFixed(1)}" x2="${(w - pad.right).toFixed(1)}" y2="${(h - y).toFixed(1)}" class="vibe-chart-grid"/>`
  }).join('')
}

export function yAxisLabels(ticks, h, pad, fmt = formatNumber) {
  const yMin = ticks[0], yMax = ticks[ticks.length - 1] || ticks[0] + 1
  const yRange = yMax - yMin || 1
  return ticks.map(t => {
    const y = pad.top + ((t - yMin) / yRange) * (h - pad.top - pad.bottom)
    return `<text x="${pad.left - 8}" y="${(h - y + 4).toFixed(1)}" text-anchor="end" class="vibe-chart-tick">${fmt(t)}</text>`
  }).join('')
}

export function xAxisLabels(labels, w, h, pad, rotate = 0) {
  const step = (w - pad.left - pad.right) / Math.max(1, labels.length - 1)
  const rot = rotate ? ` transform="rotate(${rotate},${0},${h - pad.bottom + 14})"` : ''
  return labels.map((l, i) => {
    const x = pad.left + (labels.length === 1 ? (w - pad.left - pad.right) / 2 : i * step)
    return `<text x="${x.toFixed(1)}" y="${(h - pad.bottom + 14).toFixed(1)}" text-anchor="${rotate ? 'end' : 'middle'}" class="vibe-chart-tick"${rot}>${esc(String(l || '').substring(0, 12))}</text>`
  }).join('')
}

// ── Color math helpers (delegates to @uploop/css) ──────────

/** Lighten a color using @uploop/css */
export function lightenColor(hex, amount) {
  try { return lighten(hex, amount) } catch { return hex }
}

/** Darken a color using @uploop/css */
export function darkenColor(hex, amount) {
  try { return darken(hex, amount) } catch { return hex }
}

/** Add alpha to hex color */
export function alphaColor(hex, a) {
  try { return alpha(hex, a) } catch {
    const rgb = hexToRgb(hex)
    if (!rgb) return hex
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`
  }
}

/** Get text color (black/white) for contrast against background */
export function contrastText(hex) {
  try {
    const c = contrast(hex)
    return c > 0.5 ? '#1a1a2e' : '#ffffff'
  } catch {
    // Fallback: simple luminance
    const rgb = hexToRgb(hex)
    if (!rgb) return '#1a1a2e'
    const lum = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b
    return lum > 140 ? '#1a1a2e' : '#ffffff'
  }
}

// ── Resize Observer ─────────────────────────────────────────

export function autoResize(chartInstance, containerEl) {
  if (typeof ResizeObserver === 'undefined') return () => {}
  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        chartInstance.loop?.send?.('resize', { width, height })
      }
    }
  })
  observer.observe(containerEl)
  return () => observer.disconnect()
}

// ── Uploop Chart Component Factory ─────────────────────────
//
// Creates a proper uploop component with:
//  - CSS injection on first mount
//  - Schema validation on data changes
//  - batched updates for efficiency
//  - CSS class-based styling (not inline)
//  - Theme via CSS custom properties

export function createChart(config) {
  const {
    name,
    state: initialState = {},
    update: customUpdate = {},
    render,
    defaultPadding = { top: 20, right: 16, bottom: 30, left: 40 },
    schema: chartSchema,  // optional @uploop/schema for data validation
  } = config

  return component(name, {
    state: {
      // Interaction
      interaction: 'idle',
      hovered: null,
      selected: null,
      // Theme (CSS custom properties)
      theme: { ...CHART_THEME_DEFAULTS },
      palette: [...DEFAULT_PALETTE],
      // Layout
      width: 400,
      height: 300,
      padding: { ...defaultPadding },
      title: '',
      subtitle: '',
      showGrid: true,
      showLabels: true,
      showLegend: false,
      // Data
      data: [],
      labels: [],
      // Accessibility
      ariaLabel: '',
      // Merged custom state
      ...initialState,
    },

    update: {
      // ── Standard updates ──────────────────────────────

      configure: (s, p) => {
        // Validate data if schema is provided
        if (chartSchema && p.data !== undefined) {
          const result = chartSchema.safeParse?.(p.data)
          if (result && !result.ok) {
            console.warn(`[${name}] Schema validation warnings:`, result.error?.issues || result.error)
          }
        }
        return { ...s, ...p }
      },

      setData: (s, data) => {
        // Schema validation
        if (chartSchema && data !== undefined) {
          const result = chartSchema.safeParse?.(data)
          if (result && !result.ok) {
            console.warn(`[${name}] Invalid data:`, result.error?.issues || result.error)
          }
        }
        return { ...s, data }
      },

      setTheme: (s, themeOverrides) => ({
        ...s,
        theme: { ...s.theme, ...themeOverrides },
      }),

      setPalette: (s, palette) => ({
        ...s,
        palette: Array.isArray(palette) ? palette : [...DEFAULT_PALETTE],
      }),

      // ── Interaction state machine ──────────────────────

      hover: (s, index) => ({
        ...s,
        interaction: 'hovered',
        hovered: { index, data: Array.isArray(s.data) ? s.data[index] : null },
      }),

      leave: (s) => ({
        ...s,
        interaction: 'idle',
        hovered: null,
      }),

      select: (s, index) => ({
        ...s,
        interaction: 'selected',
        selected: index,
      }),

      deselect: (s) => ({
        ...s,
        interaction: 'idle',
        selected: null,
      }),

      resize: (s, { width, height }) => ({
        ...s,
        width: width || s.width,
        height: height || s.height,
      }),

      // ── Custom update handlers ────────────────────────

      ...customUpdate,
    },

    view(state) {
      ensureCSS()
      return render(state)
    },

    // ── AI-readable manifest ────────────────────────────

    describe() {
      const s = this.getState ? this.getState() : (this._state || {})
      return {
        kind: 'uploop-vibe.chart',
        name,
        version: '0.3.0',
        type: 'view',
        component: name,
        width: s.width,
        height: s.height,
        dataShape: s.data && s.data.length ? describeShape(s.data) : 'empty',
        interaction: s.interaction,
        theme: s.theme,
        palette: s.palette,
        schema: chartSchema ? chartSchema.describe?.() || 'schema' : null,
        cssInjected: _cssInjected,
        nodes: [
          { id: 'chart', type: 'view', component: name },
          { id: 'data', type: 'data', length: Array.isArray(s.data) ? s.data.length : 0 },
          ...(s.title ? [{ id: 'title', type: 'view', component: 'title', value: s.title }] : []),
          ...(s.showLegend ? [{ id: 'legend', type: 'view', component: 'legend' }] : []),
        ],
        edges: [
          { from: 'data', to: 'chart', type: 'binds' },
          ...(s.showLegend ? [{ from: 'chart', to: 'legend', type: 'decorates' }] : []),
        ],
      }
    },
  })
}

function describeShape(item) {
  if (typeof item === 'number') return 'number[]'
  if (Array.isArray(item)) {
    if (item.length && typeof item[0] === 'number') return 'number[][]'
    if (item.length && typeof item[0] === 'object') {
      return 'object[]: ' + Object.keys(item[0]).join(', ')
    }
    return 'array'
  }
  if (typeof item === 'object' && item !== null) {
    return 'object: ' + Object.keys(item).join(', ')
  }
  return typeof item
}
