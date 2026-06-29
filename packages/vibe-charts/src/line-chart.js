// ─── @uploop-vibe/vibe-charts LineChart ─────────────────────

import { component } from '@uploop/html'
import { getColor, computeTicks, buildPath, formatNumber } from './utils.js'

export const LineChart = component('VibeLineChart', {
  state: {
    data: [],            // number[] or { label, values: number[] } for multi-line
    labels: [],          // x-axis labels
    width: 400,
    height: 250,
    padding: 40,
    color: 'primary',
    showGrid: true,
    showDots: true,
    showLabels: true,
    smooth: false,
    title: '',
    yLabel: '',
    xLabel: '',
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, labels, width, height, padding, showGrid, showDots, showLabels, title, yLabel, xLabel } = state
    const color = `var(--vibe-color-${state.color}600)` || getColor(0)
    const w = width, h = height, p = padding

    // Normalize data to array of series
    const series = Array.isArray(data) && data.length > 0
      ? (typeof data[0] === 'number' ? [{ values: data, color: getColor(0) }] : data)
      : [{ values: [], color: getColor(0) }]

    const allValues = series.flatMap(s => s.values || [])
    const yMax = Math.max(...allValues, 0)
    const yMin = Math.min(...allValues, 0)
    const ticks = computeTicks(yMin, yMax, 5)

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    // Title
    if (title) {
      svg += `<text x="${w/2}" y="20" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // Grid
    if (showGrid) {
      svg += ticks.map(t => {
        const y = p + ((t - yMin) / (yMax - yMin || 1)) * (h - p * 2)
        return `<line x1="${p}" y1="${(h - y).toFixed(1)}" x2="${(w - p).toFixed(1)}" y2="${(h - y).toFixed(1)}" stroke="var(--vibe-color-neutral200)" stroke-width="1"/>`
      }).join('')
    }

    // Y-axis labels
    if (showLabels) {
      svg += ticks.map(t => {
        const y = p + ((t - yMin) / (yMax - yMin || 1)) * (h - p * 2)
        return `<text x="${p - 8}" y="${(h - y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--vibe-color-mutedFg)">${formatNumber(t)}</text>`
      }).join('')
    }

    // X-axis labels
    if (showLabels && labels.length) {
      const xStep = (w - p * 2) / Math.max(1, labels.length - 1)
      svg += labels.map((l, i) => {
        const x = p + i * xStep
        return `<text x="${x.toFixed(1)}" y="${(h - p + 18).toFixed(1)}" text-anchor="middle" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(String(l))}</text>`
      }).join('')
    }

    // Axis labels
    if (yLabel) {
      svg += `<text transform="translate(14,${h/2}) rotate(-90)" text-anchor="middle" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(yLabel)}</text>`
    }

    // Data lines
    svg += series.map((s, si) => {
      const vals = s.values || []
      if (vals.length === 0) return ''
      const c = s.color || getColor(si)
      const path = buildPath(vals, w, h, p)
      let lineSvg = `<path d="${path}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
      if (showDots) {
        const xStep = (w - p * 2) / Math.max(1, vals.length - 1)
        lineSvg += vals.map((v, i) =>
          `<circle cx="${(p + i * xStep).toFixed(1)}" cy="${(h - p - ((v - yMin) / (yMax - yMin || 1)) * (h - p * 2)).toFixed(1)}" r="3" fill="white" stroke="${c}" stroke-width="2"/>`
        ).join('')
      }
      return lineSvg
    }).join('')

    svg += '</svg>'
    return svg
  },
})

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
