// ─── @uploop-vibe/vibe-charts BulletChart ───────────────────
// KPI vs target comparison using Stephen Few's bullet graph
// design. A single performance bar with background bands,
// a target marker line, and scale labels.

import { component } from '@uploop/html'
import { formatNumber } from './utils.js'

export const BulletChart = component('VibeBulletChart', {
  state: {
    value: 0,            // actual/performance value
    target: 0,           // target/comparative measure
    max: 100,            // scale maximum
    ranges: [],          // [{ from, to, color }] — performance bands
    width: 350,
    height: 60,
    label: '',           // KPI label (left side)
    unit: '',            // unit suffix (e.g. "$", "%")
    title: '',           // chart title above
    horizontal: true,    // always horizontal for bullet charts
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
  },

  view(state) {
    const { value, target, max, ranges, width, height, label, unit, title } = state
    const w = width, h = height

    // Layout constants
    const titleH = title ? 22 : 0
    const totalH = h + titleH
    const labelW = label ? 80 : 0
    const chartX = labelW + 8
    const chartW = w - labelW - 8 - 16  // 16px right margin
    const barH = Math.min(h * 0.55, 26)
    const barY = (h - barH) / 2 + titleH

    let svg = `<svg width="${w}" height="${totalH}" viewBox="0 0 ${w} ${totalH}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);" role="img">`

    // Title
    if (title) {
      svg += `<text x="${w / 2}" y="14" text-anchor="middle" font-size="12" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // KPI label
    if (label) {
      svg += `<text x="${labelW - 4}" y="${(totalH / 2 + 4).toFixed(1)}" text-anchor="end" font-size="11" font-weight="600" fill="var(--vibe-color-fg)">${esc(label)}</text>`
    }

    const effectiveMax = Math.max(max, value, target, 1)

    // ── Performance bands (background) ───────────────────
    if (ranges && ranges.length > 0) {
      svg += ranges.map((r, i) => {
        const fromX = chartX + (r.from / effectiveMax) * chartW
        const toX = chartX + (r.to / effectiveMax) * chartW
        const bandW = Math.max(0, toX - fromX)
        const c = r.color || rangeColors[i % rangeColors.length]
        return `<rect x="${fromX.toFixed(1)}" y="${barY.toFixed(1)}" width="${bandW.toFixed(1)}" height="${barH.toFixed(1)}" rx="0" fill="${c}" opacity="0.35"/>`
      }).join('')
    } else {
      // Default: single light gray background band
      svg += `<rect x="${chartX.toFixed(1)}" y="${barY.toFixed(1)}" width="${chartW.toFixed(1)}" height="${barH.toFixed(1)}" rx="0" fill="var(--vibe-color-neutral200)" opacity="0.5"/>`
    }

    // ── Performance bar ──────────────────────────────────
    const valueW = Math.max(0, (value / effectiveMax) * chartW)
    const barColor = value >= target
      ? 'var(--vibe-color-green600, #40c057)'
      : 'var(--vibe-color-red600, #fa5252)'
    svg += `<rect x="${chartX.toFixed(1)}" y="${(barY + barH * 0.2).toFixed(1)}" width="${Math.max(2, valueW).toFixed(1)}" height="${(barH * 0.6).toFixed(1)}" rx="2" fill="${barColor}" opacity="0.9"/>`

    // ── Target marker ────────────────────────────────────
    if (target > 0) {
      const targetX = chartX + (target / effectiveMax) * chartW
      const markerW = 4
      svg += `<line x1="${targetX.toFixed(1)}" y1="${(barY - 2).toFixed(1)}" x2="${targetX.toFixed(1)}" y2="${(barY + barH + 2).toFixed(1)}" stroke="var(--vibe-color-fg)" stroke-width="2.5" stroke-linecap="round"/>`
      // Small cap at top
      svg += `<line x1="${(targetX - markerW).toFixed(1)}" y1="${(barY - 2).toFixed(1)}" x2="${(targetX + markerW).toFixed(1)}" y2="${(barY - 2).toFixed(1)}" stroke="var(--vibe-color-fg)" stroke-width="2.5" stroke-linecap="round"/>`
    }

    // ── Value label ──────────────────────────────────────
    const valText = unit ? `${formatNumber(value, 1)}${unit}` : formatNumber(value, 1)
    svg += `<text x="${(chartX + valueW + 6).toFixed(1)}" y="${(barY + barH / 2 + 4).toFixed(1)}" font-size="10" font-weight="700" fill="var(--vibe-color-fg)">${valText}</text>`

    // ── Target label ─────────────────────────────────────
    if (target > 0) {
      const targetX = chartX + (target / effectiveMax) * chartW
      const targetText = unit ? `${formatNumber(target, 1)}${unit}` : formatNumber(target, 1)
      const labelY = barY + barH + 16
      svg += `<text x="${targetX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--vibe-color-mutedFg)">${targetText}</text>`
    }

    // ── Scale labels (min and max) ───────────────────────
    const scaleY = barY + barH + 14
    const scaleText = unit ? `0${unit}` : '0'
    const maxText = unit ? `${formatNumber(effectiveMax, 0)}${unit}` : formatNumber(effectiveMax, 0)
    svg += `<text x="${chartX.toFixed(1)}" y="${scaleY.toFixed(1)}" text-anchor="start" font-size="8" fill="var(--vibe-color-mutedFg)">${scaleText}</text>`
    svg += `<text x="${(chartX + chartW).toFixed(1)}" y="${scaleY.toFixed(1)}" text-anchor="end" font-size="8" fill="var(--vibe-color-mutedFg)">${maxText}</text>`

    svg += '</svg>'
    return svg
  },
})

// ── Helpers ───────────────────────────────────────────────

/** Default range colors: red → yellow → green (poor → satisfactory → good) */
const rangeColors = ['#fa5252', '#fab005', '#40c057']

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
