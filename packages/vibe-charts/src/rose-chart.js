// ─── @uploop-vibe/vibe-charts RoseChart ──────────────────────
// Nightingale Rose / Polar Area chart.
// Equal-angle sectors with radius proportional to value.
// innerRadius=0 → polar area, >0 → rose donut.

import { component } from '@uploop/html'
import { getColor, formatNumber } from './utils.js'

export const RoseChart = component('VibeRoseChart', {
  state: {
    data: [],             // { label, value, color? }[]
    width: 320,
    height: 320,
    innerRadius: 0,       // 0 = polar area, > 0 = rose donut
    title: '',
    showLabels: true,
    showLegend: false,
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, width, height, innerRadius, title, showLabels, showLegend } = state
    const w = width, h = height
    const cx = w / 2
    const cy = h / 2

    const items = Array.isArray(data) ? data : []
    if (!items.length) {
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><text x="${cx}" y="${cy}" text-anchor="middle" fill="var(--vibe-color-mutedFg)">No data</text></svg>`
    }

    const maxVal = Math.max(...items.map(d => d.value || 0), 1)
    const outerR = Math.min(w, h) / 2 - 10
    const inR = Math.min(innerRadius, outerR - 5)

    // Angle per sector (equal angles)
    const angleStep = (Math.PI * 2) / items.length

    const legendH = showLegend ? items.length * 20 + 10 : 0
    const totalH = h + legendH

    let svg = `<svg width="${w}" height="${totalH}" viewBox="0 0 ${w} ${totalH}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${cx}" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // Background rings (subtle guides)
    const ringSteps = 4
    for (let r = 1; r <= ringSteps; r++) {
      const rr = inR + ((outerR - inR) * r) / ringSteps
      svg += `<circle cx="${cx}" cy="${cy}" r="${rr.toFixed(1)}" fill="none" stroke="var(--vibe-color-neutral200)" stroke-width="0.5"/>`
    }

    // Sectors
    let startAngle = -Math.PI / 2 // Start from top

    svg += items.map((item, i) => {
      const ratio = (item.value || 0) / maxVal
      const sectorOuterR = inR + ratio * (outerR - inR)
      const c = item.color || getColor(i)
      const endAngle = startAngle + angleStep

      // Build arc path
      const x1o = cx + sectorOuterR * Math.cos(startAngle)
      const y1o = cy + sectorOuterR * Math.sin(startAngle)
      const x2o = cx + sectorOuterR * Math.cos(endAngle)
      const y2o = cy + sectorOuterR * Math.sin(endAngle)

      const largeArc = angleStep > Math.PI ? 1 : 0

      let path
      if (inR > 0) {
        // Donut-style rose: inner edge connects back
        const x1i = cx + inR * Math.cos(startAngle)
        const y1i = cy + inR * Math.sin(startAngle)
        const x2i = cx + inR * Math.cos(endAngle)
        const y2i = cy + inR * Math.sin(endAngle)

        path = `M${x1o.toFixed(1)},${y1o.toFixed(1)}`
          + ` A${sectorOuterR.toFixed(1)},${sectorOuterR.toFixed(1)} 0 ${largeArc},1 ${x2o.toFixed(1)},${y2o.toFixed(1)}`
          + ` L${x2i.toFixed(1)},${y2i.toFixed(1)}`
          + ` A${inR.toFixed(1)},${inR.toFixed(1)} 0 ${largeArc},0 ${x1i.toFixed(1)},${y1i.toFixed(1)} Z`
      } else {
        // Polar area: connect to center
        path = `M${cx},${cy} L${x1o.toFixed(1)},${y1o.toFixed(1)}`
          + ` A${sectorOuterR.toFixed(1)},${sectorOuterR.toFixed(1)} 0 ${largeArc},1 ${x2o.toFixed(1)},${y2o.toFixed(1)} Z`
      }

      let sectorSvg = `<path d="${path}" fill="${c}" opacity="0.82" stroke="white" stroke-width="1"/>`

      // Labels at sector midpoints
      if (showLabels && ratio > 0.05) {
        const midAngle = startAngle + angleStep / 2
        const labelR = sectorOuterR * 0.7
        const lx = cx + labelR * Math.cos(midAngle)
        const ly = cy + labelR * Math.sin(midAngle)

        // Choose text color based on sector brightness for readability
        sectorSvg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="9" font-weight="600" fill="white">${esc(String(item.label || '').substring(0, 8))}</text>`
      }

      startAngle = endAngle
      return sectorSvg
    }).join('')

    // Legend at bottom
    if (showLegend) {
      svg += items.map((item, i) => {
        const c = item.color || getColor(i)
        const y = h + 16 + i * 20
        return `<rect x="12" y="${y - 8}" width="10" height="10" rx="2" fill="${c}"/>`
          + `<text x="28" y="${y + 2}" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(item.label || '')} — ${formatNumber(item.value || 0)}</text>`
      }).join('')
    }

    svg += '</svg>'
    return svg
  },
})

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
