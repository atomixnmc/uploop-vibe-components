// ─── @uploop-vibe/vibe-charts FunnelChart ────────────────────
// Conversion/loss funnel showing decreasing stages.
// Each stage is a horizontal trapezoid tapering toward the bottom.

import { component } from '@uploop/html'
import { createChart, esc, formatNumber, niceTicks, svgWrap, gridLines, yAxisLabels, xAxisLabels } from './chart-base.js'

export const FunnelChart = createChart({
  name: 'VibeFunnelChart',

  state: {
    data: [],            // { stage, value, color? }[] — ordered top to bottom
    width: 400,
    height: 350,
    showValues: true,    // show value inside each stage
    showPercentages: true, // show % of first stage
    title: '',
    barHeight: 0,        // 0 = auto distribute, otherwise fixed px per stage
    minWidth: 40,        // minimum pixel width of narrowest trapezoid
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  render(state) {
    const { data, width, height, showValues, showPercentages, title, barHeight, minWidth } = state
    const w = width, h = height

    const items = Array.isArray(data) ? data : []
    const stageCount = items.length

    if (!stageCount) {
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans, system-ui, sans-serif);"><text x="${w / 2}" y="${h / 2}" text-anchor="middle" fill="var(--vibe-color-mutedFg, #868e96)" font-size="12">No data</text></svg>`
    }

    const topPad = title ? 36 : 20
    const bottomPad = 12
    const availableH = h - topPad - bottomPad

    // Stage dimensions
    const stageH = barHeight > 0 ? barHeight : availableH / stageCount
    const gap = 4
    const totalH = stageCount * stageH + (stageCount - 1) * gap
    const startY = topPad + (availableH - totalH) / 2

    const firstVal = items[0]?.value || 1
    const palette = state.palette || ['#646cff', '#40c057', '#fab005', '#fa5252', '#228be6',
      '#f06595', '#20c997', '#fd7e14', '#7950f2', '#15aabf']

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans, system-ui, sans-serif);" role="img">`

    if (title) {
      svg += `<text x="${w / 2}" y="20" text-anchor="middle" font-size="var(--vibe-chart-title-size, 13px)" font-weight="600" fill="var(--vibe-color-fg, #1a1a2e)">${esc(title)}</text>`
    }

    // Draw each stage
    items.forEach((item, i) => {
      const val = item.value || 0
      const c = item.color || palette[i % palette.length]

      // Width ratio based on first stage
      const maxW = w - 40 // max trapezoid width with margin
      const topRatio = i === 0 ? 1 : (items[i - 1]?.value || 0) / firstVal
      const botRatio = val / firstVal

      const topW = Math.max(minWidth, maxW * topRatio)
      const botW = Math.max(minWidth, maxW * botRatio)

      const y = startY + i * (stageH + gap)
      const cx = w / 2

      // Trapezoid corners
      const x1 = cx - topW / 2
      const x2 = cx + topW / 2
      const x3 = cx + botW / 2
      const x4 = cx - botW / 2

      svg += `<polygon points="${x1.toFixed(1)},${y.toFixed(1)} ${x2.toFixed(1)},${y.toFixed(1)} ${x3.toFixed(1)},${(y + stageH).toFixed(1)} ${x4.toFixed(1)},${(y + stageH).toFixed(1)}" fill="${c}" opacity="0.85"/>`

      // Stage label
      svg += `<text x="${cx}" y="${(y + stageH / 2 - 2).toFixed(1)}" text-anchor="middle" font-size="var(--vibe-chart-label-size, 10px)" font-weight="600" fill="white">${esc(String(item.stage || ''))}</text>`

      // Value label
      if (showValues) {
        svg += `<text x="${cx}" y="${(y + stageH / 2 + 14).toFixed(1)}" text-anchor="middle" font-size="var(--vibe-chart-tick-size, 9px)" fill="rgba(255,255,255,0.85)">${formatNumber(val)}</text>`
      }

      // Percentage label (relative to first stage)
      if (showPercentages && i > 0) {
        const pct = firstVal > 0 ? Math.round((val / firstVal) * 100) : 0
        const labY = y + stageH / 2 + (showValues ? 26 : 12)
        svg += `<text x="${cx}" y="${labY.toFixed(1)}" text-anchor="middle" font-size="var(--vibe-chart-tick-size, 9px)" fill="rgba(255,255,255,0.7)">${pct}%</text>`
      }

      // Drop rate (conversion between stages)
      if (i > 0 && showPercentages) {
        const prevVal = items[i - 1]?.value || 0
        const drop = prevVal > 0 ? Math.round((1 - val / prevVal) * 100) : 0
        const gapY = y - gap / 2
        svg += `<text x="${(x2 + 8).toFixed(1)}" y="${gapY.toFixed(1)}" text-anchor="start" font-size="var(--vibe-chart-tick-size, 9px)" fill="var(--vibe-color-mutedFg, #868e96)">-${drop}%</text>`
      }
    })

    svg += '</svg>'
    return svg
  },
})
