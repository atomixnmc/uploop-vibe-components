// ─── @uploop-vibe/vibe-charts BidirectionalBarChart ───────────
// Population pyramid / back-to-back horizontal bar chart.
// Two sets of bars extend in opposite directions from a center axis.
// Left bars extend left, right bars extend right.
// Labels sit in a center column between the two bar sets.

import { component } from '@uploop/html'
import { getColor } from './utils.js'

export const BidirectionalBarChart = component('VibeBidirectionalBar', {
  state: {
    left: [],            // { label, value, color? }[]
    right: [],           // { label, value, color? }[]
    width: 500,
    height: 400,
    leftLabel: '',
    rightLabel: '',
    title: '',
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, { left, right }) => ({ ...s, left: left || [], right: right || [] }),
  },

  view(state) {
    const { left, right, width, height, leftLabel, rightLabel, title } = state
    const w = width, h = height

    const leftBars = Array.isArray(left) ? left : []
    const rightBars = Array.isArray(right) ? right : []
    const maxRows = Math.max(leftBars.length, rightBars.length)

    if (!maxRows) {
      return `<svg width="${w}" height="${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="var(--vibe-color-muted)">No data</text></svg>`
    }

    const pad = { top: title ? 40 : 20, bottom: 20, left: 12, right: 12 }
    const labelWidth = 60 // center column for labels
    const availableW = w - pad.left - pad.right - labelWidth
    const halfW = availableW / 2
    const barAreaH = h - pad.top - pad.bottom
    const rowH = barAreaH / maxRows
    const barH = rowH * 0.7
    const barOffset = (rowH - barH) / 2
    const centerX = pad.left + halfW + labelWidth / 2

    // ── Find max values for scaling ──
    const leftMax = Math.max(1, ...leftBars.map(b => b.value || 0))
    const rightMax = Math.max(1, ...rightBars.map(b => b.value || 0))
    // Use the overall max so both sides are proportionally comparable
    const globalMax = Math.max(leftMax, rightMax)

    // ── SVG ──
    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${w / 2}" y="20" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // ── Side labels (column headers) ──
    if (leftLabel) {
      svg += `<text x="${(pad.left + 8).toFixed(1)}" y="${(pad.top - 4).toFixed(1)}" text-anchor="start" font-size="10" font-weight="600" fill="var(--vibe-color-mutedFg)">${esc(leftLabel)}</text>`
    }
    if (rightLabel) {
      svg += `<text x="${(w - pad.right - 8).toFixed(1)}" y="${(pad.top - 4).toFixed(1)}" text-anchor="end" font-size="10" font-weight="600" fill="var(--vibe-color-mutedFg)">${esc(rightLabel)}</text>`
    }

    // ── Center axis line ──
    svg += `<line x1="${centerX.toFixed(1)}" y1="${pad.top.toFixed(1)}" x2="${centerX.toFixed(1)}" y2="${(h - pad.bottom).toFixed(1)}" stroke="var(--vibe-color-neutral300)" stroke-width="1"/>`

    // ── Left bars (extend left from center) ──
    svg += leftBars.map((bar, i) => {
      const value = bar.value || 0
      const barW = (value / globalMax) * halfW
      const y = pad.top + i * rowH + barOffset
      const x = centerX - barW
      const color = bar.color || getColor(i)

      let barSvg = `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(1, barW).toFixed(1)}" height="${barH.toFixed(1)}" rx="3" fill="${color}" opacity="0.85"/>`

      // Value label
      barSvg += `<text x="${(x - 4).toFixed(1)}" y="${(y + barH / 2 + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--vibe-color-mutedFg)">${fmtVal(value)}</text>`

      return barSvg
    }).join('')

    // ── Right bars (extend right from center) ──
    svg += rightBars.map((bar, i) => {
      const value = bar.value || 0
      const barW = (value / globalMax) * halfW
      const y = pad.top + i * rowH + barOffset
      const x = centerX
      const color = bar.color || getColor(i + leftBars.length)

      let barSvg = `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(1, barW).toFixed(1)}" height="${barH.toFixed(1)}" rx="3" fill="${color}" opacity="0.85"/>`

      // Value label
      barSvg += `<text x="${(x + barW + 4).toFixed(1)}" y="${(y + barH / 2 + 4).toFixed(1)}" text-anchor="start" font-size="9" fill="var(--vibe-color-mutedFg)">${fmtVal(value)}</text>`

      return barSvg
    }).join('')

    // ── Center labels ──
    const allLabels = []
    for (let i = 0; i < maxRows; i++) {
      const leftLabel = leftBars[i]?.label
      const rightLabel = rightBars[i]?.label
      allLabels.push(leftLabel || rightLabel || '')
    }

    svg += allLabels.map((label, i) => {
      if (!label) return ''
      const y = pad.top + i * rowH + barOffset + barH / 2 + 4
      return `<text x="${centerX.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--vibe-color-fg)">${esc(String(label).substring(0, 10))}</text>`
    }).join('')

    svg += '</svg>'
    return svg
  },
})

function fmtVal(v) {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M'
  if (v >= 1000) return (v / 1000).toFixed(1) + 'K'
  return v >= 100 ? Math.round(v).toString() : v.toFixed(1)
}

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
