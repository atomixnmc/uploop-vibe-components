// ─── @uploop-vibe/vibe-charts WaterfallChart ─────────────────
// Cumulative effect chart showing positive/negative contributions.
// Bars float above a running baseline; connectors bridge the gaps.

import { component } from '@uploop/html'
import { createChart, esc, formatNumber, niceTicks, svgWrap, gridLines, yAxisLabels, xAxisLabels } from './chart-base.js'

export const WaterfallChart = createChart({
  name: 'VibeWaterfallChart',

  state: {
    data: [],            // { label, value, color?, isTotal?: boolean }[]
    width: 500,
    height: 300,
    showConnectors: true, // thin lines bridging bar tops
    showGrid: true,
    showLabels: true,
    title: '',
    // Color overrides
    positiveColor: '',   // default: auto from palette
    negativeColor: '',
    totalColor: '',
    barGap: 0.2,         // gap ratio between bars
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  render(state) {
    const { data, width, height, showConnectors, showGrid, showLabels, title, positiveColor, negativeColor, totalColor, barGap } = state
    const w = width, h = height
    const pad = { top: 40, right: 20, bottom: 50, left: 55 }

    const topOff = title ? 20 : 0

    const bars = Array.isArray(data) ? data : []
    const n = bars.length

    if (!n) {
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans, system-ui, sans-serif);"><text x="${w / 2}" y="${h / 2}" text-anchor="middle" fill="var(--vibe-color-mutedFg, #868e96)" font-size="12">No data</text></svg>`
    }

    const palette = state.palette || ['#646cff', '#40c057', '#fab005', '#fa5252', '#228be6',
      '#f06595', '#20c997', '#fd7e14', '#7950f2', '#15aabf']

    const posColor = positiveColor || '#40c057'
    const negColor = negativeColor || '#fa5252'
    const totColor = totalColor || '#646cff'

    // Compute running cumulative and bar positions
    let running = 0
    const segments = [] // { label, value, isTotal, y0, y1, color }
    const allY = [0]

    bars.forEach((bar, i) => {
      const val = bar.value || 0
      const isTotal = bar.isTotal === true

      let y0, y1
      if (isTotal) {
        // Total bars always start at 0
        y0 = 0
        y1 = val
      } else {
        y0 = running
        y1 = running + val
      }

      const c = bar.color
        || (isTotal ? totColor
          : val >= 0 ? posColor : negColor)

      segments.push({ label: bar.label || '', value: val, isTotal, y0, y1, color: c })
      allY.push(y0, y1)

      if (!isTotal) {
        running += val
      }
      // For total bars, we don't modify running — next bar picks up from where running was
    })

    const yMin = Math.min(...allY, 0)
    const yMax = Math.max(...allY, 0)
    const yRange = yMax - yMin || 1
    const p = pad
    const chartH = h - p.top - p.bottom
    const chartW = w - p.left - p.right

    const yScale = (v) => p.top + chartH - ((v - yMin) / yRange) * chartH

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans, system-ui, sans-serif);" role="img">`

    if (title) {
      svg += `<text x="${w / 2}" y="20" text-anchor="middle" font-size="var(--vibe-chart-title-size, 13px)" font-weight="600" fill="var(--vibe-color-fg, #1a1a2e)">${esc(title)}</text>`
    }

    // ── Grid lines ──────────────────────────────────────────
    if (showGrid) {
      const ticks = niceTicks(yMin, yMax, 5)
      ticks.forEach(t => {
        const y = yScale(t)
        if (y >= p.top && y <= h - p.bottom) {
          svg += `<line x1="${p.left}" y1="${y.toFixed(1)}" x2="${(w - p.right).toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--vibe-color-neutral200, #e9ecef)" stroke-width="1" stroke-dasharray="4,4"/>`
        }
      })
    }

    // ── Zero baseline ───────────────────────────────────────
    const zeroY = yScale(0)
    svg += `<line x1="${p.left}" y1="${zeroY.toFixed(1)}" x2="${(w - p.right).toFixed(1)}" y2="${zeroY.toFixed(1)}" stroke="var(--vibe-color-neutral400, #ced4da)" stroke-width="1"/>`

    // ── Y-axis labels ───────────────────────────────────────
    if (showLabels) {
      const ticks = niceTicks(yMin, yMax, 5)
      ticks.forEach(t => {
        const y = yScale(t)
        if (y >= p.top && y <= h - p.bottom) {
          svg += `<text x="${(p.left - 8).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="var(--vibe-chart-tick-size, 9px)" fill="var(--vibe-color-mutedFg, #868e96)">${formatNumber(t)}</text>`
        }
      })
    }

    // ── Bars ────────────────────────────────────────────────
    const barW = (chartW / n) * (1 - barGap)
    const gapW = (chartW / n) * barGap / 2

    segments.forEach((seg, i) => {
      const x = p.left + i * (chartW / n) + gapW
      const y0 = yScale(seg.y0)
      const y1 = yScale(seg.y1)

      const rectY = Math.min(y0, y1)
      const rectH = Math.max(Math.abs(y1 - y0), 1)

      svg += `<rect x="${x.toFixed(1)}" y="${rectY.toFixed(1)}" width="${barW.toFixed(1)}" height="${rectH.toFixed(1)}" rx="var(--vibe-chart-bar-radius, 3px)" fill="${seg.color}" opacity="0.85"/>`

      // X-axis label
      if (showLabels) {
        const lx = x + barW / 2
        svg += `<text x="${lx.toFixed(1)}" y="${(h - p.bottom + 16).toFixed(1)}" text-anchor="middle" font-size="var(--vibe-chart-tick-size, 9px)" fill="var(--vibe-color-mutedFg, #868e96)">${esc(String(seg.label).substring(0, 10))}</text>`
      }

      // Value label on bar
      if (showLabels) {
        const vlx = x + barW / 2
        const vly = seg.value >= 0 ? rectY - 6 : rectY + rectH + 14
        svg += `<text x="${vlx.toFixed(1)}" y="${vly.toFixed(1)}" text-anchor="middle" font-size="var(--vibe-chart-tick-size, 9px)" font-weight="600" fill="var(--vibe-color-fg, #1a1a2e)">${formatNumber(seg.value)}</text>`
      }
    })

    // ── Connectors ──────────────────────────────────────────
    if (showConnectors) {
      for (let i = 0; i < n - 1; i++) {
        const curr = segments[i]
        const next = segments[i + 1]

        if (curr.isTotal || next.isTotal) continue

        const x1 = p.left + i * (chartW / n) + gapW + barW
        const x2 = p.left + (i + 1) * (chartW / n) + gapW

        const currTopY = yScale(curr.y1)
        const nextBotY = yScale(next.y0)

        svg += `<line x1="${x1.toFixed(1)}" y1="${currTopY.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${nextBotY.toFixed(1)}" stroke="var(--vibe-color-neutral400, #ced4da)" stroke-width="1" stroke-dasharray="3,3"/>`
      }
    }

    svg += '</svg>'
    return svg
  },
})
