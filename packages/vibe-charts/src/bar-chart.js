// @uploop-vibe/vibe-charts BarChart
// Fully integrated with uploop: CSS classes, schema validation, color math

import { component } from '@uploop/html'
import { getColor, computeTicks, formatNumber } from './utils.js'
import { esc, paletteColor, contrastText, lightenColor } from './chart-base.js'
import { BarData } from './chart-schema.js'

export const BarChart = component('VibeBarChart', {
  state: {
    data: [],
    labels: [],
    width: 400,
    height: 250,
    padding: 40,
    color: 'primary',
    showGrid: true,
    showLabels: true,
    horizontal: false,
    title: '',
    subtitle: '',
    barGap: 0.15,
    yMin: null,
    yMax: null,
  },

  update: {
    configure: (s, p) => {
      // Schema-validate data on configure
      if (p.data !== undefined) {
        const result = BarData.safeParse?.(p.data)
        if (result && !result.ok) {
          console.warn('[BarChart] Invalid data shape:', result.error?.issues)
        }
      }
      return { ...s, ...p }
    },
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, labels, width, height, padding, showGrid, showLabels, horizontal, title, subtitle, barGap, yMin: fixedYMin, yMax: fixedYMax } = state
    const w = width, h = height, p = padding

    const bars = Array.isArray(data) && data.length > 0
      ? (typeof data[0] === 'number'
          ? data.map((v, i) => ({ label: labels[i] || String(i), value: v, color: paletteColor(i, state) }))
          : data)
      : []

    const values = bars.map(b => b.value || 0)
    const minVal = fixedYMin != null ? Math.min(fixedYMin, ...values) : Math.min(...values, 0)
    const maxVal = fixedYMax != null ? Math.max(fixedYMax, ...values) : Math.max(...values, 0)
    const range = maxVal - minVal || 1
    const zeroY = h - p - ((0 - minVal) / range) * (h - p * 2)

    const barW = ((horizontal ? (h - p * 2) : (w - p * 2)) / Math.max(1, bars.length)) * (1 - barGap)
    const gap = ((horizontal ? (h - p * 2) : (w - p * 2)) / Math.max(1, bars.length)) * barGap

    // Use CSS classes from chart-base injected stylesheet
    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" class="vibe-chart" role="img">`

    if (title) {
      svg += `<text x="${w/2}" y="16" text-anchor="middle" class="vibe-chart-title">${esc(title)}</text>`
    }
    if (subtitle) {
      svg += `<text x="${w/2}" y="${title ? 30 : 16}" text-anchor="middle" class="vibe-chart-subtitle">${esc(subtitle)}</text>`
    }

    // Bars with CSS class for hover interaction
    svg += bars.map((bar, i) => {
      const c = bar.color || `var(--vibe-color-${state.color}600)` || paletteColor(i, state)
      const val = bar.value || 0
      const ratio = (val - minVal) / range

      if (horizontal) {
        const barH = barW
        const y = p + i * (barH + gap) + gap / 2
        const wBar = ratio * (w - p * 2)
        const x = val >= 0 ? p : p + (zeroY - p)
        return `<rect x="${Math.min(p, x).toFixed(1)}" y="${y.toFixed(1)}" width="${Math.abs(wBar).toFixed(1)}" height="${barH.toFixed(1)}" rx="var(--vibe-chart-barRadius, 3)" fill="${c}" class="vibe-chart-bar"/>`
      } else {
        const x = p + i * (barW + gap) + gap / 2
        const barH = ratio * (h - p * 2)
        const y = val >= 0 ? zeroY - barH : zeroY
        return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(Math.abs(barH), 1).toFixed(1)}" rx="var(--vibe-chart-barRadius, 3)" fill="${c}" class="vibe-chart-bar"/>`
      }
    }).join('')

    // Zero line
    if (minVal < 0) {
      svg += `<line x1="${p}" y1="${zeroY.toFixed(1)}" x2="${(w - p).toFixed(1)}" y2="${zeroY.toFixed(1)}" class="vibe-chart-axis"/>`
    }

    // Labels
    if (showLabels) {
      svg += bars.map((bar, i) => {
        const val = bar.value || 0
        if (horizontal) {
          const barH = barW
          const y = p + i * (barH + gap) + gap / 2 + barH / 2 + 4
          const r = (val - minVal) / range
          return `<text x="${(p + r * (w - p * 2) + 6).toFixed(1)}" y="${y.toFixed(1)}" class="vibe-chart-label">${formatNumber(val)}</text>`
        } else {
          const barH = Math.abs(((val - minVal) / range) * (h - p * 2))
          const x = p + i * (barW + gap) + gap / 2 + barW / 2
          const y = val >= 0 ? zeroY - barH - 6 : zeroY + barH + 14
          return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" class="vibe-chart-label">${formatNumber(val)}</text>`
        }
      }).join('')

      // X-axis labels
      if (!horizontal) {
        svg += bars.map((bar, i) => {
          const x = p + i * (barW + gap) + gap / 2 + barW / 2
          return `<text x="${x.toFixed(1)}" y="${(h - p + 16).toFixed(1)}" text-anchor="middle" class="vibe-chart-tick">${esc(String(bar.label || '').substring(0, 8))}</text>`
        }).join('')
      }
    }

    svg += '</svg>'
    return svg
  },
})
