// ─── @uploop-vibe/vibe-charts ComboChart ─────────────────────
// Stacked bar chart + line overlay (dual-axis).
// Used for GDP sector contribution, NBFI scale trends, trade data.

import { component } from '@uploop/html'
import { getColor, formatNumber } from './utils.js'

export const ComboChart = component('VibeComboChart', {
  state: {
    // Stacked bars: each bar = one time period, each sector = one stack
    sectors: [],          // { key, name, color }[] — stack segments
    quarters: [],         // { label, [key]: value }[] — time periods
    // Line overlay
    line: [],             // { value }[] — line values (same length as quarters)
    lineColor: '#b91c1c',
    lineLabel: '',
    // Layout
    width: 600,
    height: 320,
    padding: { top: 40, right: 50, bottom: 35, left: 55 },
    title: '',
    subtitle: '',
    showLegend: true,
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, sectors: data.sectors || [], quarters: data.quarters || [], line: data.line || [], lineColor: data.lineColor || s.lineColor, lineLabel: data.lineLabel || s.lineLabel }),
  },

  view(state) {
    const { sectors, quarters, line, lineColor, lineLabel, width, height, padding, title, subtitle, showLegend } = state
    const p = padding
    const w = width, h = height
    const cw = w - p.left - p.right
    const ch = h - p.top - p.bottom

    if (!quarters.length) {
      return `<svg width="${w}" height="${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="var(--vibe-color-muted)">No data</text></svg>`
    }

    const n = quarters.length
    const barWidth = Math.max(12, cw / n - 14)

    // Compute max Y from both bars and line
    const stackTotals = quarters.map(q => sectors.reduce((s, sec) => s + (q[sec.key] || 0), 0))
    const allVals = [...stackTotals, ...line.map(d => d.value || 0)]
    const maxV = Math.max(...allVals, 1) * 1.2

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${w/2}" y="16" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }
    if (subtitle) {
      svg += `<text x="${w/2}" y="${title ? 30 : 16}" text-anchor="middle" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(subtitle)}</text>`
    }

    // Grid + Y-axis
    for (let v = 0; v <= maxV; v += Math.max(1, Math.ceil(maxV / 5))) {
      const y = p.top + ch - (v / maxV) * ch
      svg += `<line x1="${p.left}" y1="${y.toFixed(1)}" x2="${w - p.right}" y2="${y.toFixed(1)}" stroke="var(--vibe-color-neutral200)" stroke-width="0.5"/>`
      svg += `<text x="${p.left - 6}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--vibe-color-mutedFg)">${v}%</text>`
    }

    // Stacked bars
    quarters.forEach((q, i) => {
      const x = p.left + i * (cw / n) + (cw / n - barWidth) / 2
      let sy = p.top + ch
      sectors.forEach(sec => {
        const v = q[sec.key] || 0
        const bh = (v / maxV) * ch
        sy -= bh
        svg += `<rect x="${x.toFixed(1)}" y="${sy.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${Math.max(bh, 0.5).toFixed(1)}" rx="1.5" fill="${sec.color}" opacity="0.88"/>`
      })
    })

    // X-axis labels
    quarters.forEach((q, i) => {
      const x = p.left + i * (cw / n) + cw / n / 2
      svg += `<text x="${x.toFixed(1)}" y="${(h - 6).toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--vibe-color-mutedFg)">${esc(String(q.label || ''))}</text>`
    })

    // Line overlay
    if (line.length) {
      const lc = lineColor || '#b91c1c'
      const pts = line.map((d, i) =>
        `${(p.left + i * (cw / n) + cw / n / 2).toFixed(1)},${(p.top + ch - ((d.value || 0) / maxV) * ch).toFixed(1)}`
      ).join(' ')

      svg += `<polyline points="${pts}" fill="none" stroke="${lc}" stroke-width="2.5"/>`

      // Dots + value labels
      line.forEach((d, i) => {
        const lx = p.left + i * (cw / n) + cw / n / 2
        const ly = p.top + ch - ((d.value || 0) / maxV) * ch
        svg += `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="4" fill="${lc}" stroke="white" stroke-width="1.5"/>`
        svg += `<text x="${lx.toFixed(1)}" y="${(ly - 8).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" fill="${lc}">${d.value}%</text>`
      })
    }

    svg += '</svg>'

    // HTML legend
    if (showLegend) {
      let leg = sectors.map(s =>
        `<span style="display:inline-flex;align-items:center;gap:0.25rem;font-size:0.7rem;margin-right:0.75rem;"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${s.color}"></span>${esc(s.name)}</span>`
      ).join('')
      if (line.length && lineLabel) {
        leg += `<span style="display:inline-flex;align-items:center;gap:0.25rem;font-size:0.7rem;"><span style="display:inline-block;width:16px;height:2px;background:${lineColor};border-radius:1px;"></span>${esc(lineLabel)}</span>`
      }
      return svg + `<div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.35rem;justify-content:center;">${leg}</div>`
    }

    return svg
  },
})

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
