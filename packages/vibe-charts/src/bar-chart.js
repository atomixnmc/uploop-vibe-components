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
    barGap: 0.15,        // gap ratio between bars
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, labels, width, height, padding, showGrid, showLabels, horizontal, title, barGap } = state
    const w = width, h = height, p = padding
    const color = `var(--vibe-color-${state.color}600)` || getColor(0)

    // Normalize data
    const bars = Array.isArray(data) && data.length > 0
      ? (typeof data[0] === 'number'
          ? data.map((v, i) => ({ label: labels[i] || String(i), value: v, color: getColor(i) }))
          : data)
      : []

    const values = bars.map(b => b.value || 0)
    const maxVal = Math.max(...values, 0)
    const barWidth = ((horizontal ? (h - p * 2) : (w - p * 2)) / Math.max(1, bars.length)) * (1 - barGap)
    const gap = ((horizontal ? (h - p * 2) : (w - p * 2)) / Math.max(1, bars.length)) * barGap

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${w/2}" y="20" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // Bars
    svg += bars.map((bar, i) => {
      const c = bar.color || color
      const ratio = maxVal > 0 ? (bar.value || 0) / maxVal : 0
      if (horizontal) {
        const barH = barWidth
        const y = p + i * (barH + gap) + gap / 2
        const barW = ratio * (w - p * 2)
        return `<rect x="${p}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="3" fill="${c}" opacity="0.85"/>`
      } else {
        const x = p + i * (barWidth + gap) + gap / 2
        const barH = ratio * (h - p * 2)
        const y = h - p - barH
        return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" rx="3" fill="${c}" opacity="0.85"/>`
      }
    }).join('')

    // Labels
    if (showLabels) {
      svg += bars.map((bar, i) => {
        if (horizontal) {
          const ratio = maxVal > 0 ? (bar.value || 0) / maxVal : 0
          const barH = barWidth
          const y = p + i * (barH + gap) + gap / 2 + barH / 2 + 4
          return `<text x="${(p + ratio * (w - p * 2) + 6).toFixed(1)}" y="${y.toFixed(1)}" font-size="10" fill="var(--vibe-color-mutedFg)">${formatNumber(bar.value)}</text>`
        } else {
          const barH = ratioValue(bar.value, maxVal) * (h - p * 2)
          const x = p + i * (barWidth + gap) + gap / 2 + barWidth / 2
          const y = h - p - barH - 6
          return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--vibe-color-mutedFg)">${formatNumber(bar.value)}</text>`
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

function ratioValue(v, max) { return max > 0 ? (v || 0) / max : 0 }
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
