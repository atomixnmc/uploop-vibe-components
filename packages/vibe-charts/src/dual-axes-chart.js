// ─── @uploop-vibe/vibe-charts DualAxesChart ──────────────────
// Bars on left Y-axis + line on right Y-axis.
// Two independent Y scales, color-coded axis labels.

import { component } from '@uploop/html'
import { getColor, computeTicks, formatNumber } from './utils.js'

export const DualAxesChart = component('VibeDualAxesChart', {
  state: {
    bars: [],             // { label, value, color? }[]
    line: [],             // { value }[] — same length as bars
    leftLabel: '',        // label for left Y-axis (bars)
    rightLabel: '',       // label for right Y-axis (line)
    width: 500,
    height: 300,
    padding: { top: 50, right: 55, bottom: 40, left: 55 },
    title: '',
    showGrid: true,
    showDots: true,
    barColor: 'primary',
    lineColor: '#e03131',
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, bars) => ({ ...s, bars }),
  },

  view(state) {
    const { bars, line, leftLabel, rightLabel, width, height, padding, title, showGrid, showDots, barColor, lineColor } = state
    const p = padding
    const w = width, h = height
    const cw = w - p.left - p.right
    const ch = h - p.top - p.bottom

    if (!bars.length) {
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="var(--vibe-color-mutedFg)">No data</text></svg>`
    }

    const n = bars.length

    // ── Bar (left) axis ──
    const barValues = bars.map(b => b.value || 0)
    const barMin = Math.min(0, ...barValues)
    const barMax = Math.max(...barValues, 1)
    const barRange = barMax - barMin || 1
    const barTicks = computeTicks(barMin, barMax, 5)

    // ── Line (right) axis ──
    const lineValues = line.length ? line.map(d => d.value || 0) : [0]
    const lineMin = Math.min(0, ...lineValues)
    const lineMax = Math.max(...lineValues, 1)
    const lineRange = lineMax - lineMin || 1
    const lineTicks = computeTicks(lineMin, lineMax, 5)

    // ── Bar dimensions ──
    const barGap = 0.2
    const barW = (cw / n) * (1 - barGap)
    const gapW = (cw / n) * barGap

    // ── SVG ──
    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${w/2}" y="20" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // ── Grid (left axis ticks) ──
    if (showGrid) {
      svg += barTicks.map(t => {
        const y = p.top + ch - ((t - barMin) / barRange) * ch
        return `<line x1="${p.left}" y1="${y.toFixed(1)}" x2="${w - p.right}" y2="${y.toFixed(1)}" stroke="var(--vibe-color-neutral200)" stroke-width="0.5"/>`
      }).join('')
    }

    // ── Left Y-axis labels (bars) ──
    svg += barTicks.map(t => {
      const y = p.top + ch - ((t - barMin) / barRange) * ch
      return `<text x="${p.left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--vibe-color-primary600)">${formatNumber(t)}</text>`
    }).join('')

    // ── Right Y-axis labels (line) ──
    svg += lineTicks.map(t => {
      const y = p.top + ch - ((t - lineMin) / lineRange) * ch
      return `<text x="${(w - p.right + 10).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="start" font-size="9" fill="${lineColor}">${formatNumber(t)}</text>`
    }).join('')

    // ── Axis labels ──
    if (leftLabel) {
      svg += `<text x="${14}" y="${p.top + ch / 2}" text-anchor="middle" font-size="10" fill="var(--vibe-color-primary600)" transform="rotate(-90, 14, ${(p.top + ch / 2).toFixed(1)})">${esc(leftLabel)}</text>`
    }
    if (rightLabel) {
      svg += `<text x="${(w - 14).toFixed(1)}" y="${(p.top + ch / 2).toFixed(1)}" text-anchor="middle" font-size="10" fill="${lineColor}" transform="rotate(90, ${(w - 14).toFixed(1)}, ${(p.top + ch / 2).toFixed(1)})">${esc(rightLabel)}</text>`
    }

    // ── Bars (left axis) ──
    svg += bars.map((bar, i) => {
      const c = bar.color || `var(--vibe-color-${barColor}600)` || getColor(i)
      const val = bar.value || 0
      const x = p.left + i * (cw / n) + gapW / 2
      const barH = (val / barRange) * ch
      const y = p.top + ch - barH
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(barH, 1).toFixed(1)}" rx="3" fill="${c}" opacity="0.85"/>`
    }).join('')

    // ── Bar value labels ──
    svg += bars.map((bar, i) => {
      const val = bar.value || 0
      const x = p.left + i * (cw / n) + gapW / 2 + barW / 2
      const barH = (val / barRange) * ch
      const y = p.top + ch - barH - 6
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--vibe-color-mutedFg)">${formatNumber(val)}</text>`
    }).join('')

    // ── X-axis labels ──
    svg += bars.map((bar, i) => {
      const x = p.left + i * (cw / n) + cw / n / 2
      return `<text x="${x.toFixed(1)}" y="${(h - p.bottom + 16).toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--vibe-color-mutedFg)">${esc(String(bar.label || ''))}</text>`
    }).join('')

    // ── Line overlay (right axis) ──
    if (line.length) {
      const lc = lineColor || '#e03131'
      // Build polyline points
      const pts = line.map((d, i) => {
        const lx = p.left + i * (cw / n) + cw / n / 2
        const ly = p.top + ch - ((d.value || 0) / lineRange) * ch
        return `${lx.toFixed(1)},${ly.toFixed(1)}`
      }).join(' ')

      svg += `<polyline points="${pts}" fill="none" stroke="${lc}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`

      // Dots
      if (showDots) {
        svg += line.map((d, i) => {
          const lx = p.left + i * (cw / n) + cw / n / 2
          const ly = p.top + ch - ((d.value || 0) / lineRange) * ch
          return `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="4" fill="white" stroke="${lc}" stroke-width="2"/>`
        }).join('')
      }

      // Line value labels
      svg += line.map((d, i) => {
        const lx = p.left + i * (cw / n) + cw / n / 2
        const ly = p.top + ch - ((d.value || 0) / lineRange) * ch
        return `<text x="${lx.toFixed(1)}" y="${(ly - 10).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="600" fill="${lc}">${formatNumber(d.value || 0)}</text>`
      }).join('')
    }

    svg += '</svg>'
    return svg
  },
})

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
