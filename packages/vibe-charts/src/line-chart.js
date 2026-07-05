// ─── @uploop-vibe/vibe-charts LineChart ─────────────────────

import { component } from '@uploop/html'
import { getColor, computeTicks, buildPath, formatNumber } from './utils.js'

export const LineChart = component('VibeLineChart', {
  state: {
    data: [],            // number[] or { name, values: number[], color? }[] for multi-line
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
    subtitle: '',
    yLabel: '',
    xLabel: '',
    // ── Extended props ──
    yMin: null,          // fixed y-axis minimum (null = auto)
    yMax: null,          // fixed y-axis maximum (null = auto)
    targetLine: null,    // { value, color?, label? } — reference line
    showLegend: false,   // show color legend for multi-series
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, labels, width, height, padding, showGrid, showDots, showLabels, title, subtitle, yLabel, xLabel, showLegend,
      yMin: fixedYMin, yMax: fixedYMax, targetLine } = state
    const w = width, h = height, p = padding
    const titleOff = title ? 20 : 0

    // Normalize data to array of series
    const series = Array.isArray(data) && data.length > 0
      ? (typeof data[0] === 'number' ? [{ name: '', values: data, color: getColor(0) }] :
         data[0] && data[0].values ? data :
         data[0] && 'series' in data[0] ? data[0].series :
         [{ name: '', values: data.map(d => d.value ?? d), color: getColor(0) }])
      : [{ name: '', values: [], color: getColor(0) }]

    // Labels from data if not explicitly provided
    const xLabels = labels.length ? labels : (series[0]?._labels || [])
    // If data has labels at top level, use those
    const dataLabels = Array.isArray(data) && data.labels ? data.labels : (data && !Array.isArray(data) && data.labels ? data.labels : [])
    const finalLabels = xLabels.length ? xLabels : dataLabels

    const allValues = series.flatMap(s => s.values || [])
    const autoYMin = Math.min(...allValues, 0)
    const autoYMax = Math.max(...allValues, 0)
    const yMin = fixedYMin != null ? fixedYMin : autoYMin
    const yMax = fixedYMax != null ? fixedYMax : autoYMax
    const ticks = computeTicks(yMin, yMax, 5)

    const legendH = showLegend && series.length > 1 ? 20 : 0
    const totalH = h + legendH
    let svg = `<svg width="${w}" height="${totalH}" viewBox="0 0 ${w} ${totalH}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${w/2}" y="16" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }
    if (subtitle) {
      svg += `<text x="${w/2}" y="${title ? 30 : 16}" text-anchor="middle" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(subtitle)}</text>`
    }

    // Grid
    if (showGrid) {
      svg += ticks.map(t => {
        const y = p + ((t - yMin) / (yMax - yMin || 1)) * (h - p * 2)
        return `<line x1="${p}" y1="${(h - y).toFixed(1)}" x2="${(w - p).toFixed(1)}" y2="${(h - y).toFixed(1)}" stroke="var(--vibe-color-neutral200)" stroke-width="1"/>`
      }).join('')
    }

    // Target line
    if (targetLine && targetLine.value != null) {
      const ty = h - p - ((targetLine.value - yMin) / (yMax - yMin || 1)) * (h - p * 2)
      const tc = targetLine.color || '#a16207'
      svg += `<line x1="${p}" y1="${ty.toFixed(1)}" x2="${(w - p).toFixed(1)}" y2="${ty.toFixed(1)}" stroke="${tc}" stroke-width="1.5" stroke-dasharray="5,3"/>`
      if (targetLine.label) {
        svg += `<text x="${(w - p).toFixed(1)}" y="${(ty - 4).toFixed(1)}" text-anchor="end" font-size="9" fill="${tc}">${esc(targetLine.label)}</text>`
      }
    }

    // Y-axis labels
    if (showLabels) {
      svg += ticks.map(t => {
        const y = p + ((t - yMin) / (yMax - yMin || 1)) * (h - p * 2)
        return `<text x="${p - 8}" y="${(h - y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--vibe-color-mutedFg)">${formatNumber(t)}</text>`
      }).join('')
    }

    // X-axis labels
    if (showLabels && finalLabels.length) {
      const xStep = (w - p * 2) / Math.max(1, finalLabels.length - 1)
      svg += finalLabels.map((l, i) => {
        const x = p + i * xStep
        return `<text x="${x.toFixed(1)}" y="${(h - p + 16).toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--vibe-color-mutedFg)">${esc(String(l))}</text>`
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
          `<circle cx="${(p + i * xStep).toFixed(1)}" cy="${(h - p - (v - yMin) * yScale).toFixed(1)}" r="3" fill="white" stroke="${c}" stroke-width="2"/>`
        ).join('')
      }
      return lineSvg
    }).join('')

    // Legend for multi-series
    if (showLegend && series.length > 1) {
      svg += series.map((s, si) => {
        const c = s.color || getColor(si)
        const name = s.name || ''
        if (!name) return ''
        return `<rect x="${p + si * 120}" y="${h - p + 8}" width="10" height="10" rx="2" fill="${c}"/>
          <text x="${p + si * 120 + 14}" y="${h - p + 17}" font-size="9" fill="var(--vibe-color-mutedFg)">${esc(name)}</text>`
      }).join('')
    }

    svg += '</svg>'
    return svg
  },
})

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
