// ─── @uploop-vibe/vibe-charts AreaChart ─────────────────────

import { component } from '@uploop/html'
import { getColor, computeTicks, buildAreaPath, formatNumber } from './utils.js'

export const AreaChart = component('VibeAreaChart', {
  state: {
    data: [],            // number[] or { label, values: number[], color? }[]
    labels: [],
    width: 400,
    height: 250,
    padding: 40,
    color: 'primary',
    showGrid: true,
    showDots: false,
    showLabels: true,
    stacked: false,
    title: '',
    opacity: 0.2,
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, labels, width, height, padding, showGrid, showDots, showLabels, stacked, title, opacity } = state
    const color = `var(--vibe-color-${state.color}600)` || getColor(0)
    const w = width, h = height, p = padding

    const series = Array.isArray(data) && data.length > 0
      ? (typeof data[0] === 'number' ? [{ values: data, color: getColor(0) }] : data)
      : [{ values: [], color: getColor(0) }]

    const allValues = series.flatMap(s => s.values || [])
    const yMax = Math.max(...allValues, 0)
    const yMin = Math.min(...allValues, 0)
    const ticks = computeTicks(yMin, yMax, 5)

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

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

    // Areas (drawn first, behind lines)
    // For stacked, compute cumulative values
    let cumulative = new Array((series[0]?.values || []).length).fill(0)
    svg += series.map((s, si) => {
      const vals = (s.values || []).map((v, i) => {
        if (stacked) { cumulative[i] += v; return cumulative[i] }
        return v
      })
      if (!vals.length) return ''
      const c = s.color || getColor(si)
      const areaPath = buildAreaPath(vals, w, h, p, stacked ? 0 : yMin)
      // Gradient
      const gradId = 'area-grad-' + si
      return `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c}" stop-opacity="${opacity * 2}"/>
        <stop offset="100%" stop-color="${c}" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${areaPath}" fill="url(#${gradId})"/>`
    }).join('')

    // Lines (on top of areas)
    cumulative = new Array((series[0]?.values || []).length).fill(0)
    svg += series.map((s, si) => {
      const vals = (s.values || []).map((v, i) => {
        if (stacked) { cumulative[i] += v; return cumulative[i] }
        return v
      })
      if (!vals.length) return ''
      const c = s.color || getColor(si)
      const xStep = (w - p * 2) / Math.max(1, vals.length - 1)
      const yRange = yMax - yMin || 1
      const yScale = (h - p * 2) / yRange
      const path = vals.map((v, i) => {
        const x = p + i * xStep
        const y = h - p - (v - yMin) * yScale
        return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1)
      }).join(' ')

      let lineSvg = `<path d="${path}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
      if (showDots) {
        lineSvg += vals.map((v, i) =>
          `<circle cx="${(p + i * xStep).toFixed(1)}" cy="${(h - p - (v - yMin) * yScale).toFixed(1)}" r="2" fill="${c}"/>`
        ).join('')
      }
      return lineSvg
    }).join('')

    // Legend
    if (series.length > 1 && series[0].label) {
      svg += series.map((s, si) => {
        const c = s.color || getColor(si)
        return `<rect x="${p + si * 100}" y="${h - p + 8}" width="10" height="10" rx="2" fill="${c}"/>
          <text x="${p + si * 100 + 14}" y="${h - p + 17}" font-size="9" fill="var(--vibe-color-mutedFg)">${esc(s.label || '')}</text>`
      }).join('')
    }

    svg += '</svg>'
    return svg
  },
})

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
