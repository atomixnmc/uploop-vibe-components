// ─── @uploop-vibe/vibe-charts BarChart ──────────────────────

import { component } from '@uploop/html'
import { getColor, computeTicks, formatNumber } from './utils.js'

export const BarChart = component('VibeBarChart', {
  state: {
    data: [],            // number[] or { label, value, color? }[]
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
    barGap: 0.15,        // gap ratio between bars
    // ── Extended props ──
    yMin: null,          // fixed y-axis min (null = auto, supports negative)
    yMax: null,          // fixed y-axis max
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, labels, width, height, padding, showGrid, showLabels, horizontal, title, subtitle, barGap,
      yMin: fixedYMin, yMax: fixedYMax } = state
    const w = width, h = height, p = padding

    // Normalize data
    const bars = Array.isArray(data) && data.length > 0
      ? (typeof data[0] === 'number'
          ? data.map((v, i) => ({ label: labels[i] || String(i), value: v, color: getColor(i) }))
          : data)
      : []

    const values = bars.map(b => b.value || 0)
    const minVal = fixedYMin != null ? Math.min(fixedYMin, ...values) : Math.min(...values, 0)
    const maxVal = fixedYMax != null ? Math.max(fixedYMax, ...values) : Math.max(...values, 0)
    const range = maxVal - minVal || 1
    const zeroY = h - p - ((0 - minVal) / range) * (h - p * 2)  // pixel position of zero

    const barWidth = ((horizontal ? (h - p * 2) : (w - p * 2)) / Math.max(1, bars.length)) * (1 - barGap)
    const gap = ((horizontal ? (h - p * 2) : (w - p * 2)) / Math.max(1, bars.length)) * barGap

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${w/2}" y="16" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }
    if (subtitle) {
      svg += `<text x="${w/2}" y="${title ? 30 : 16}" text-anchor="middle" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(subtitle)}</text>`
    }

    // Bars
    svg += bars.map((bar, i) => {
      const c = bar.color || `var(--vibe-color-${state.color}600)` || getColor(i)
      const val = bar.value || 0
      const ratio = (val - minVal) / range
      if (horizontal) {
        const barH = barWidth
        const y = p + i * (barH + gap) + gap / 2
        const barW = ratio * (w - p * 2)
        const x = val >= 0 ? p : p + (zeroY - p) // crude for negative
        return `<rect x="${Math.min(p, x).toFixed(1)}" y="${y.toFixed(1)}" width="${Math.abs(barW).toFixed(1)}" height="${barH.toFixed(1)}" rx="3" fill="${c}" opacity="0.85"/>`
      } else {
        const x = p + i * (barWidth + gap) + gap / 2
        const barH = ratio * (h - p * 2)
        const y = val >= 0 ? zeroY - barH : zeroY
        return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${Math.max(Math.abs(barH), 1).toFixed(1)}" rx="3" fill="${c}" opacity="0.85"/>`
      }
    }).join('')

    // Zero line for negative charts
    if (minVal < 0) {
      svg += `<line x1="${p}" y1="${zeroY.toFixed(1)}" x2="${(w - p).toFixed(1)}" y2="${zeroY.toFixed(1)}" stroke="var(--vibe-color-neutral300)" stroke-width="1"/>`
    }

    // Labels
    if (showLabels) {
      svg += bars.map((bar, i) => {
        const val = bar.value || 0
        if (horizontal) {
          const barH = barWidth
          const y = p + i * (barH + gap) + gap / 2 + barH / 2 + 4
          const ratio = (val - minVal) / range
          return `<text x="${(p + ratio * (w - p * 2) + 6).toFixed(1)}" y="${y.toFixed(1)}" font-size="10" fill="var(--vibe-color-mutedFg)">${formatNumber(val)}</text>`
        } else {
          const barH = Math.abs(((val - minVal) / range) * (h - p * 2))
          const x = p + i * (barWidth + gap) + gap / 2 + barWidth / 2
          const y = val >= 0 ? zeroY - barH - 6 : zeroY + barH + 14
          return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--vibe-color-mutedFg)">${formatNumber(val)}</text>`
        }
      }).join('')

      // X-axis labels
      if (!horizontal) {
        svg += bars.map((bar, i) => {
          const x = p + i * (barWidth + gap) + gap / 2 + barWidth / 2
          return `<text x="${x.toFixed(1)}" y="${(h - p + 16).toFixed(1)}" text-anchor="middle" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(String(bar.label || '').substring(0, 8))}</text>`
        }).join('')
      }
    }

    svg += '</svg>'
    return svg
  },
})

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
