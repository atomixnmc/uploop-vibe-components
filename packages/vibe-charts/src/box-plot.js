// ─── @uploop-vibe/vibe-charts BoxPlot ────────────────────────
// Statistical box-and-whisker plot. Draws box from Q1 to Q3
// with line at median, whiskers to min/max. Optional outlier
// dots. Supports multiple boxes for comparison (horizontal
// or vertical orientation).

import { component } from '@uploop/html'
import { getColor } from './utils.js'

export const BoxPlot = component('VibeBoxPlot', {
  state: {
    data: [],            // { label, min, q1, median, q3, max, outliers?: number[], color? }[]
    width: 400,
    height: 300,
    padding: 50,
    horizontal: false,
    showLabels: true,
    showOutliers: true,
    title: '',
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, width, height, padding, horizontal, showLabels, showOutliers, title } = state
    const w = width, h = height, p = padding

    // Empty state
    if (!data || data.length === 0) {
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">
        <text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-size="12" fill="var(--vibe-color-mutedFg)">No data</text>
      </svg>`
    }

    const series = data.map((d, i) => ({
      label: d.label || `Series ${i + 1}`,
      min: d.min ?? 0,
      q1: d.q1 ?? 0,
      median: d.median ?? 0,
      q3: d.q3 ?? 0,
      max: d.max ?? 0,
      outliers: d.outliers || [],
      color: d.color || getColor(i),
    }))

    // Compute global range across all series
    const allVals = series.flatMap(s => [s.min, s.q1, s.median, s.q3, s.max, ...s.outliers])
    const globalMin = Math.min(...allVals)
    const globalMax = Math.max(...allVals)
    const range = globalMax - globalMin || 1

    // Pad the range by 5% for visual breathing room
    const padRange = range * 0.05
    const vMin = globalMin - padRange
    const vMax = globalMax + padRange
    const vRange = vMax - vMin || 1

    const count = series.length

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    // Title
    if (title) {
      svg += `<text x="${w / 2}" y="16" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    const titleOffset = title ? 10 : 0
    const chartW = w - p * 2
    const chartH = h - p * 2 - titleOffset

    // Box dimensions
    const slotSize = (horizontal ? chartH : chartW) / count
    const boxWidth = slotSize * 0.5  // 50% of slot

    // Grid lines (across the value axis)
    const gridLines = 5
    if (horizontal) {
      for (let i = 0; i <= gridLines; i++) {
        const x = p + (i / gridLines) * chartW
        svg += `<line x1="${x.toFixed(1)}" y1="${(p + titleOffset).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(h - p).toFixed(1)}" stroke="var(--vibe-color-neutral200)" stroke-width="1"/>`
      }
    } else {
      for (let i = 0; i <= gridLines; i++) {
        const y = p + titleOffset + (i / gridLines) * chartH
        svg += `<line x1="${p}" y1="${y.toFixed(1)}" x2="${(w - p).toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--vibe-color-neutral200)" stroke-width="1"/>`
      }
    }

    svg += series.map((s, i) => {
      const c = s.color
      const slotCenter = p + (horizontal ? titleOffset : 0) + slotSize * i + slotSize / 2

      // Convert values to pixel positions
      const toPixel = (v) => (v - vMin) / vRange

      let box = ''

      if (horizontal) {
        const pxMin = p + toPixel(s.min) * chartW
        const pxQ1 = p + toPixel(s.q1) * chartW
        const pxMedian = p + toPixel(s.median) * chartW
        const pxQ3 = p + toPixel(s.q3) * chartW
        const pxMax = p + toPixel(s.max) * chartW

        const boxY = slotCenter - boxWidth / 2

        // Whisker line: min to max
        box += `<line x1="${pxMin.toFixed(1)}" y1="${slotCenter.toFixed(1)}" x2="${pxMax.toFixed(1)}" y2="${slotCenter.toFixed(1)}" stroke="${c}" stroke-width="1.5"/>`

        // Whisker caps (small vertical lines at min and max)
        const capH = boxWidth * 0.3
        box += `<line x1="${pxMin.toFixed(1)}" y1="${(slotCenter - capH).toFixed(1)}" x2="${pxMin.toFixed(1)}" y2="${(slotCenter + capH).toFixed(1)}" stroke="${c}" stroke-width="1.5"/>`
        box += `<line x1="${pxMax.toFixed(1)}" y1="${(slotCenter - capH).toFixed(1)}" x2="${pxMax.toFixed(1)}" y2="${(slotCenter + capH).toFixed(1)}" stroke="${c}" stroke-width="1.5"/>`

        // Box: Q1 to Q3
        box += `<rect x="${pxQ1.toFixed(1)}" y="${boxY.toFixed(1)}" width="${(pxQ3 - pxQ1).toFixed(1)}" height="${boxWidth.toFixed(1)}" rx="2" fill="${c}" opacity="0.3" stroke="${c}" stroke-width="1.5"/>`

        // Median line
        box += `<line x1="${pxMedian.toFixed(1)}" y1="${boxY.toFixed(1)}" x2="${pxMedian.toFixed(1)}" y2="${(boxY + boxWidth).toFixed(1)}" stroke="${c}" stroke-width="2"/>`

        // Outliers
        if (showOutliers && s.outliers.length > 0) {
          box += s.outliers.map(o => {
            const px = p + toPixel(o) * chartW
            return `<circle cx="${px.toFixed(1)}" cy="${slotCenter.toFixed(1)}" r="3" fill="${c}" opacity="0.7"/>`
          }).join('')
        }

        // Label
        if (showLabels) {
          box += `<text x="${(p - 6).toFixed(1)}" y="${(slotCenter + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(s.label)}</text>`
        }
      } else {
        // Vertical
        const pxMin = p + chartH - toPixel(s.min) * chartH + titleOffset
        const pxQ1 = p + chartH - toPixel(s.q1) * chartH + titleOffset
        const pxMedian = p + chartH - toPixel(s.median) * chartH + titleOffset
        const pxQ3 = p + chartH - toPixel(s.q3) * chartH + titleOffset
        const pxMax = p + chartH - toPixel(s.max) * chartH + titleOffset

        const boxX = slotCenter - boxWidth / 2

        // Whisker line: min to max
        box += `<line x1="${slotCenter.toFixed(1)}" y1="${pxMax.toFixed(1)}" x2="${slotCenter.toFixed(1)}" y2="${pxMin.toFixed(1)}" stroke="${c}" stroke-width="1.5"/>`

        // Whisker caps (small horizontal lines)
        const capW = boxWidth * 0.3
        box += `<line x1="${(slotCenter - capW).toFixed(1)}" y1="${pxMin.toFixed(1)}" x2="${(slotCenter + capW).toFixed(1)}" y2="${pxMin.toFixed(1)}" stroke="${c}" stroke-width="1.5"/>`
        box += `<line x1="${(slotCenter - capW).toFixed(1)}" y1="${pxMax.toFixed(1)}" x2="${(slotCenter + capW).toFixed(1)}" y2="${pxMax.toFixed(1)}" stroke="${c}" stroke-width="1.5"/>`

        // Box: Q1 to Q3
        box += `<rect x="${boxX.toFixed(1)}" y="${pxQ3.toFixed(1)}" width="${boxWidth.toFixed(1)}" height="${(pxQ1 - pxQ3).toFixed(1)}" rx="2" fill="${c}" opacity="0.3" stroke="${c}" stroke-width="1.5"/>`

        // Median line
        box += `<line x1="${boxX.toFixed(1)}" y1="${pxMedian.toFixed(1)}" x2="${(boxX + boxWidth).toFixed(1)}" y2="${pxMedian.toFixed(1)}" stroke="${c}" stroke-width="2"/>`

        // Outliers
        if (showOutliers && s.outliers.length > 0) {
          box += s.outliers.map(o => {
            const py = p + chartH - toPixel(o) * chartH + titleOffset
            return `<circle cx="${slotCenter.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="${c}" opacity="0.7"/>`
          }).join('')
        }

        // Label
        if (showLabels) {
          box += `<text x="${slotCenter.toFixed(1)}" y="${(h - p + 16).toFixed(1)}" text-anchor="middle" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(s.label)}</text>`
        }
      }

      return box
    }).join('')

    // Axis line
    if (horizontal) {
      svg += `<line x1="${p}" y1="${(p + titleOffset).toFixed(1)}" x2="${(w - p).toFixed(1)}" y2="${(p + titleOffset).toFixed(1)}" stroke="var(--vibe-color-neutral300)" stroke-width="1"/>`
    } else {
      svg += `<line x1="${p}" y1="${(p + titleOffset).toFixed(1)}" x2="${p}" y2="${(h - p).toFixed(1)}" stroke="var(--vibe-color-neutral300)" stroke-width="1"/>`
    }

    svg += '</svg>'
    return svg
  },
})

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
