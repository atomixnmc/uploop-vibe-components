// ─── @uploop-vibe/vibe-charts Chart Foundation ───────────────
// Shared base for all charts. Deep uploop integration:
// - @uploop/core → createLoop for reactive state, createGraph for data flow
// - @uploop/css → CSS custom properties for theming
// - State machine → chart interaction states (idle, hover, select, zoom)
// - Typed manifests → every chart exports AI-readable graph

import { component } from '@uploop/html'
import { createLoop, createGraph } from '@uploop/core'
import { themeShadeVars, colorShadeVars, contrast } from '@uploop/css'

// ── Chart State Machine ─────────────────────────────────────

/** Interaction states all charts can be in */
export const CHART_STATES = {
  idle:      { on: { hover: 'hovered', select: 'selected', zoom_in: 'zoomed', zoom_out: 'idle' } },
  hovered:   { on: { leave: 'idle', select: 'selected' } },
  selected:  { on: { deselect: 'idle' } },
  zoomed:    { on: { zoom_out: 'idle', pan: 'zoomed' } },
}

// ── CSS Variable Theme ──────────────────────────────────────

/**
 * Chart theme tokens — injected as CSS custom properties.
 * Leverages @uploop/css design tokens where available.
 */
export const chartTheme = {
  // Typography
  fontFamily:   'var(--vibe-font-sans, system-ui, sans-serif)',
  titleSize:    'var(--vibe-chart-title-size, 13px)',
  labelSize:    'var(--vibe-chart-label-size, 10px)',
  tickSize:     'var(--vibe-chart-tick-size, 9px)',
  legendSize:   'var(--vibe-chart-legend-size, 11px)',
  tooltipSize:  'var(--vibe-chart-tooltip-size, 12px)',

  // Colors (falls back to vibe tokens, then hardcoded)
  fg:           'var(--vibe-color-fg, #1a1a2e)',
  mutedFg:      'var(--vibe-color-mutedFg, #868e96)',
  grid:         'var(--vibe-color-neutral200, #e9ecef)',
  bg:           'var(--vibe-color-bg, #ffffff)',
  tooltipBg:    'var(--vibe-color-neutral800, #343a40)',
  tooltipFg:    'var(--vibe-color-white, #ffffff)',

  // Sizing
  strokeWidth:  'var(--vibe-chart-stroke-width, 2px)',
  dotRadius:    'var(--vibe-chart-dot-radius, 3px)',
  barRadius:    'var(--vibe-chart-bar-radius, 3px)',
  opacity:      'var(--vibe-chart-opacity, 0.85)',
}

/**
 * Default palette — extends vibe design tokens.
 * Can be overridden via CSS custom properties or chart props.
 */
export const defaultPalette = [
  '#646cff', '#40c057', '#fab005', '#fa5252', '#228be6',
  '#f06595', '#20c997', '#fd7e14', '#7950f2', '#15aabf',
  '#e64980', '#74b816', '#4c6ef5', '#ff922b', '#be4bdb',
]

/** Get palette color by index with CSS variable fallback */
export function paletteColor(index, theme = 'primary') {
  const cssVar = `--vibe-chart-color-${index}`
  // Check if custom CSS variable exists
  if (typeof document !== 'undefined') {
    const style = getComputedStyle(document.documentElement)
    const val = style.getPropertyValue(cssVar).trim()
    if (val) return val
  }
  return defaultPalette[index % defaultPalette.length]
}

// ── Shared SVG Helpers ──────────────────────────────────────

/** Escape text for SVG */
export function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Format numbers with locale-aware abbreviations */
export function formatNumber(n, precision = 0, locale = 'en') {
  if (n == null || isNaN(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (abs >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(precision)
}

/** Compute nice axis ticks */
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

/** Build an SVG `<svg>` wrapper with optional title */
export function svgWrap(w, h, title, subtitle) {
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:${chartTheme.fontFamily};" role="img">`
  if (title) {
    s += `<text x="${w / 2}" y="18" text-anchor="middle" font-size="${chartTheme.titleSize}" font-weight="600" fill="${chartTheme.fg}">${esc(title)}</text>`
  }
  if (subtitle) {
    s += `<text x="${w / 2}" y="${title ? 34 : 18}" text-anchor="middle" font-size="${chartTheme.tickSize}" fill="${chartTheme.mutedFg}">${esc(subtitle)}</text>`
  }
  return s
}

/** Build grid lines */
export function gridLines(ticks, w, h, pad) {
  return ticks.map(t => {
    const y = pad.top + ((t - ticks[0]) / ((ticks[ticks.length - 1] || ticks[0] + 1) - ticks[0])) * (h - pad.top - pad.bottom)
    return `<line x1="${pad.left}" y1="${(h - y).toFixed(1)}" x2="${(w - pad.right).toFixed(1)}" y2="${(h - y).toFixed(1)}" stroke="${chartTheme.grid}" stroke-width="1" stroke-dasharray="4,4"/>`
  }).join('')
}

/** Build Y-axis labels */
export function yAxisLabels(ticks, h, pad, formatter = formatNumber) {
  return ticks.map(t => {
    const y = pad.top + ((t - ticks[0]) / ((ticks[ticks.length - 1] || ticks[0] + 1) - ticks[0])) * (h - pad.top - pad.bottom)
    return `<text x="${pad.left - 8}" y="${(h - y + 4).toFixed(1)}" text-anchor="end" font-size="${chartTheme.tickSize}" fill="${chartTheme.mutedFg}">${formatter(t)}</text>`
  }).join('')
}

/** Build X-axis labels */
export function xAxisLabels(labels, w, h, pad, rotate = 0) {
  const step = (w - pad.left - pad.right) / Math.max(1, labels.length - 1)
  const transform = rotate ? ` rotate(${rotate},${0},${h - pad.bottom + 14})` : ''
  return labels.map((l, i) => {
    const x = pad.left + (labels.length === 1 ? (w - pad.left - pad.right) / 2 : i * step)
    return `<text x="${x.toFixed(1)}" y="${(h - pad.bottom + 14).toFixed(1)}" text-anchor="${rotate ? 'end' : 'middle'}" font-size="${chartTheme.tickSize}" fill="${chartTheme.mutedFg}"${transform}>${esc(String(l || '').substring(0, 12))}</text>`
  }).join('')
}

// ── Chart Base Factory ──────────────────────────────────────

/**
 * Create a chart component with full uploop integration.
 *
 * Every chart built with this factory gets:
 * - Reactive state via @uploop/core createLoop
 * - CSS variable theming via @uploop/css tokens
 * - State machine for interaction states
 * - AI-readable manifest via describe()
 * - Consistent mount/lifecycle
 *
 * @param {Object} config
 * @param {string} config.name — component name
 * @param {Object} config.state — initial state
 * @param {Object} config.update — update handlers
 * @param {Function} config.render — (state) => SVG string
 * @param {Object} [config.defaultPadding] — { top, right, bottom, left }
 * @returns {Object} chart component descriptor
 */
export function createChart(config) {
  const {
    name,
    state: initialState = {},
    update: customUpdate = {},
    render,
    defaultPadding = { top: 20, right: 16, bottom: 30, left: 40 },
  } = config

  return component(name, {
    state: {
      // Interaction state machine
      interaction: 'idle',
      hovered: null,        // { index, data }
      // Theming
      theme: { ...chartTheme },
      palette: [...defaultPalette],
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
      // Animation
      animate: true,
      animateDuration: 300,
      // Accessibility
      ariaLabel: '',
      description: '',
      // Merged user state
      ...initialState,
    },

    update: {
      configure: (s, p) => ({ ...s, ...p }),

      setData: (s, data) => ({ ...s, data }),

      setLabels: (s, labels) => ({ ...s, labels }),

      setTheme: (s, theme) => ({
        ...s,
        theme: { ...s.theme, ...theme },
      }),

      setPalette: (s, palette) => ({
        ...s,
        palette: Array.isArray(palette) ? palette : [...defaultPalette],
      }),

      // Interaction events
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

      // Custom update handlers
      ...customUpdate,
    },

    view(state) {
      // Call the render function
      return render(state, { chartTheme, defaultPalette, esc, formatNumber, niceTicks })
    },

    // ── Extended lifecycle for AI inspection ──────────────

    describe() {
      const s = this.getState ? this.getState() : this._state
      return {
        kind: 'uploop-vibe.chart',
        name,
        version: '0.2.0',
        type: 'view',
        component: name,
        width: s.width,
        height: s.height,
        dataShape: s.data && s.data.length ? describeData(s.data[0]) : 'empty',
        interaction: s.interaction,
        theme: s.theme ? 'custom' : 'default',
        nodes: buildChartGraph(s),
        edges: buildChartEdges(s),
      }
    },
  })
}

function describeData(item) {
  if (typeof item === 'number') return 'number[]'
  if (Array.isArray(item)) return 'number[][]'
  return Object.keys(item).join(', ')
}

function buildChartGraph(state) {
  const nodes = [
    { id: 'chart', type: 'view', component: state.view?.name || 'Chart' },
    { id: 'data', type: 'data', length: Array.isArray(state.data) ? state.data.length : 0 },
  ]
  if (state.title) nodes.push({ id: 'title', type: 'view', component: 'title', value: state.title })
  if (state.showLegend) nodes.push({ id: 'legend', type: 'view', component: 'legend' })
  return nodes
}

function buildChartEdges(state) {
  const edges = [{ from: 'data', to: 'chart', type: 'binds' }]
  if (state.showLegend) edges.push({ from: 'chart', to: 'legend', type: 'decorates' })
  return edges
}

// ── Resize Observer ─────────────────────────────────────────

/**
 * Attach a ResizeObserver to auto-resize charts.
 * Returns cleanup function.
 */
export function autoResize(chartInstance, containerEl) {
  if (typeof ResizeObserver === 'undefined') return () => {}
  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        chartInstance.loop?.send('resize', { width, height })
      }
    }
  })
  observer.observe(containerEl)
  return () => observer.disconnect()
}
