// ─── @uploop-vibe/vibe-charts PieChart ──────────────────────

import { component } from '@uploop/html'
import { getColor, formatNumber } from './utils.js'

export const PieChart = component('VibePieChart', {
  state: {
    data: [],            // { label, value, color? }[]
    width: 250,
    height: 250,
    donut: false,        // true = donut chart, false = pie
    donutWidth: 30,
    showLabels: true,
    showLegend: false,   // 'below' | 'side' | false
    title: '',
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, width, height, donut, donutWidth, showLabels, showLegend, title } = state
    const w = width, h = height
    let cx = w / 2, cy = h / 2
    const radius = Math.min(w, h) / 2 - 10
    const innerRadius = donut ? radius - donutWidth : 0

    const items = Array.isArray(data) ? data : []
    const total = items.reduce((sum, d) => sum + (d.value || 0), 0)
    if (total === 0) return `<svg width="${w}" height="${h}"><text x="${cx}" y="${cy}" text-anchor="middle" fill="var(--vibe-color-muted)">No data</text></svg>`

    let svg = `<svg width="${w}" height="${h + (showLegend ? items.length * 22 : 0)}" viewBox="0 0 ${w} ${h + (showLegend ? items.length * 22 : 0)}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${cx}" y="16" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
      cy = title ? cy + 10 : cy
    }

    let angle = -Math.PI / 2 // Start at top

    svg += items.map((item, i) => {
      const pct = (item.value || 0) / total
      const sliceAngle = pct * Math.PI * 2
      const c = item.color || getColor(i)

      const x1 = cx + radius * Math.cos(angle)
      const y1 = cy + radius * Math.sin(angle)
      angle += sliceAngle
      const x2 = cx + radius * Math.cos(angle)
      const y2 = cy + radius * Math.sin(angle)

      const largeArc = sliceAngle > Math.PI ? 1 : 0

      let path
      if (donut) {
        const ix1 = cx + innerRadius * Math.cos(angle - sliceAngle)
        const iy1 = cy + innerRadius * Math.sin(angle - sliceAngle)
        const ix2 = cx + innerRadius * Math.cos(angle)
        const iy2 = cy + innerRadius * Math.sin(angle)
        path = `M${x1.toFixed(1)},${y1.toFixed(1)} A${radius},${radius} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${ix2.toFixed(1)},${iy2.toFixed(1)} A${innerRadius},${innerRadius} 0 ${largeArc},0 ${ix1.toFixed(1)},${iy1.toFixed(1)} Z`
      } else {
        path = `M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${radius},${radius} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`
      }

      let sliceSvg = `<path d="${path}" fill="${c}" opacity="0.85" stroke="white" stroke-width="1"/>`

      // Labels on slices
      if (showLabels && pct > 0.05) {
        const midAngle = angle - sliceAngle / 2
        const labelR = radius * 0.65
        const lx = cx + labelR * Math.cos(midAngle)
        const ly = cy + labelR * Math.sin(midAngle)
        sliceSvg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="10" font-weight="600" fill="white">${Math.round(pct * 100)}%</text>`
      }

      return sliceSvg
    }).join('')

    // Center text for donut
    if (donut) {
      svg += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="22" font-weight="700" fill="var(--vibe-color-fg)">${formatNumber(total)}</text>`
      svg += `<text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="10" fill="var(--vibe-color-mutedFg)">Total</text>`
    }

    // Legend
    if (showLegend === 'side') {
      // Inline legend rendered as HTML outside SVG for side-by-side layout
      let legHtml = items.map((item, i) => {
        const c = item.color || getColor(i)
        const pct = total > 0 ? Math.round((item.value || 0) / total * 100) : 0
        return `<div style="display:flex;align-items:center;gap:0.35rem;font-size:0.73rem;padding:0.15rem 0;"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${c};flex-shrink:0;"></span><span style="flex:1;">${esc(item.label || '')}</span><span style="font-weight:600;">${formatNumber(item.value)}</span><span style="color:var(--vibe-color-mutedFg);font-size:0.65rem;">(${pct}%)</span></div>`
      }).join('')
      return svg + '</svg>' + `<div style="margin-top:0.5rem;">${legHtml}</div>`
    }
    if (showLegend === 'below' || showLegend === true) {
      svg += items.map((item, i) => {
        const c = item.color || getColor(i)
        const y = h + 16 + i * 22
        return `<rect x="12" y="${y - 8}" width="12" height="12" rx="2" fill="${c}"/><text x="30" y="${y + 2}" font-size="11" fill="var(--vibe-color-mutedFg)">${esc(item.label || '')} (${Math.round((item.value || 0) / total * 100)}%)</text>`
      }).join('')
    }

    svg += '</svg>'
    return svg
  },
})

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
