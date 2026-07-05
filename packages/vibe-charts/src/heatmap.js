// ─── @uploop-vibe/vibe-charts Heatmap ───────────────────────
// Color-coded matrix (rows × columns) with value-dependent opacity.
// Used for risk matrices, correlation grids, time-series intensity.

import { component } from '@uploop/html'

const DEFAULT_COLORS = ['#15803d', '#ca8a04', '#b91c1c']   // green → yellow → red

export const Heatmap = component('VibeHeatmap', {
  state: {
    data: [],              // number[][] — rows, each row is an array of numbers
    rowLabels: [],         // string[] — labels for each row
    colLabels: [],         // string[] — labels for each column
    width: 500,
    height: 300,
    padding: 50,
    title: '',
    colorScale: null,      // string[] — low→high gradient, defaults to green-yellow-red
    showValues: true,
    valueFormat: '',
    cellRadius: 2,
    // ── Discrete levels mode (for risk grids) ──
    discreteLevels: false, // true = use levelText labels, not gradient
    levelText: [],         // string[] — text labels for each level (e.g., ['Rất thấp','Thấp','TB','Cao','Rất cao'])
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, rowLabels, colLabels, width, height, padding, title, colorScale, showValues, valueFormat, cellRadius,
      discreteLevels, levelText } = state
    const w = width, h = height, p = padding
    const colors = colorScale && colorScale.length ? colorScale : DEFAULT_COLORS

    if (!data.length || !data[0]?.length) {
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;font-family:var(--vibe-font-sans);">
        <text x="${w/2}" y="${h/2}" text-anchor="middle" font-size="13" fill="var(--vibe-color-mutedFg)">No data</text>
      </svg>`
    }

    const rows = data.length
    const cols = data[0].length

    // Find min/max across all cells
    const allVals = data.flat()
    const minVal = Math.min(...allVals)
    const maxVal = Math.max(...allVals)
    const range = maxVal - minVal || 1

    // Cell dimensions
    const cellW = (w - p * 2) / cols
    const cellH = (h - p * 2) / rows

    // Color interpolation
    function colorFor(value) {
      if (discreteLevels) {
        // Use value as index into colorScale
        const idx = Math.min(Math.max(Math.round(value) || 0, 0), colors.length - 1)
        return colors[idx]
      }
      const t = (value - minVal) / range   // 0→1
      const idx = t * (colors.length - 1)
      const lo = Math.floor(idx)
      const hi = Math.min(lo + 1, colors.length - 1)
      const frac = idx - lo
      if (lo === hi) return colors[lo]
      return lerpColor(colors[lo], colors[hi], frac)
    }

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${w/2}" y="22" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // Cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = data[r]?.[c] ?? 0
        const fill = colorFor(val)
        const x = p + c * cellW + 1
        const y = p + r * cellH + 1
        svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(cellW - 2).toFixed(1)}" height="${(cellH - 2).toFixed(1)}" rx="${cellRadius}" fill="${fill}" opacity="0.9"/>`

        if (showValues) {
          const txt = discreteLevels && levelText.length
            ? levelText[Math.min(Math.round(val) || 0, levelText.length - 1)]
            : (valueFormat ? formatWith(val, valueFormat) : String(Math.round(val * 10) / 10))
          const textColor = luminance(fill) > 0.5 ? '#1a1a2e' : '#ffffff'
          svg += `<text x="${(x + cellW / 2).toFixed(1)}" y="${(y + cellH / 2 + 4).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="500" fill="${textColor}">${esc(txt)}</text>`
        }
      }
    }

    // Row labels
    if (rowLabels.length) {
      svg += rowLabels.map((l, i) => {
        const y = p + i * cellH + cellH / 2 + 4
        return `<text x="${p - 8}" y="${y.toFixed(1)}" text-anchor="end" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(String(l).substring(0, 16))}</text>`
      }).join('')
    }

    // Column labels
    if (colLabels.length) {
      svg += colLabels.map((l, i) => {
        const x = p + i * cellW + cellW / 2
        return `<text x="${x.toFixed(1)}" y="${(h - p + 16).toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--vibe-color-mutedFg)" transform="rotate(-30,${x.toFixed(1)},${(h - p + 16).toFixed(1)})">${esc(String(l).substring(0, 10))}</text>`
      }).join('')
    }

    // Legend
    const legendY = h - p + 28
    const legendW = 120
    const legendH = 10
    const legendX = w - p - legendW
    const steps = 20
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const fill = colorFor(minVal + t * range)
      svg += `<rect x="${(legendX + i * (legendW / steps)).toFixed(1)}" y="${legendY}" width="${(legendW / steps).toFixed(1)}" height="${legendH}" fill="${fill}"/>`
    }
    svg += `<text x="${legendX}" y="${legendY + legendH + 12}" font-size="8" fill="var(--vibe-color-mutedFg)">${fmt(minVal)}</text>`
    svg += `<text x="${(legendX + legendW).toFixed(1)}" y="${legendY + legendH + 12}" text-anchor="end" font-size="8" fill="var(--vibe-color-mutedFg)">${fmt(maxVal)}</text>`

    svg += '</svg>'
    return svg
  },
})

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }

function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(Math.round(n * 10) / 10)
}

function formatWith(n, f) {
  if (f === '%') return (n * 100).toFixed(1) + '%'
  if (f === 'pct') return (n * 100).toFixed(1) + '%'
  return fmt(n)
}

/** Approximate luminance of a hex color (0 = dark, 1 = light) */
function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  // sRGB relative luminance
  const lin = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** Linear interpolation between two hex colors */
function lerpColor(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16)
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bv = Math.round(ab + (bb - ab) * t)
  return '#' + [r, g, bv].map(v => v.toString(16).padStart(2, '0')).join('')
}
