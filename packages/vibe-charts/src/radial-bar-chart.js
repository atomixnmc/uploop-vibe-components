// ─── @uploop-vibe/vibe-charts RadialBarChart ──────────────────
// Circular bar chart: bars (arcs) radiating outward from center.
// Each bar length = (value/max) * (outerRadius - innerRadius).

import { component } from '@uploop/html'
import { getColor, formatNumber } from './utils.js'

export const RadialBarChart = component('VibeRadialBarChart', {
  state: {
    data: [],             // { label, value, color? }[]
    width: 360,
    height: 360,
    max: null,            // auto-computed if not set
    innerRadius: 40,
    barWidth: 16,
    title: '',
    showLabels: true,
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, width, height, max: fixedMax, innerRadius, barWidth, title, showLabels } = state
    const w = width, h = height
    const cx = w / 2
    const cy = h / 2

    const items = Array.isArray(data) ? data : []
    if (!items.length) {
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><text x="${cx}" y="${cy}" text-anchor="middle" fill="var(--vibe-color-mutedFg)">No data</text></svg>`
    }

    const maxVal = fixedMax != null ? fixedMax : Math.max(...items.map(d => d.value || 0), 1)
    const outerR = Math.min(w, h) / 2 - 25
    const inR = Math.max(innerRadius, 0)
    const usableRadius = outerR - inR

    // Angular span per bar
    const angleStep = (Math.PI * 2) / items.length
    const barAngularSpan = angleStep * 0.85  // leave 15% gap between bars
    const halfSpan = barAngularSpan / 2

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${cx}" y="20" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // Background track (subtle ring guide)
    svg += `<circle cx="${cx}" cy="${cy}" r="${(inR + usableRadius * 0.5).toFixed(1)}" fill="none" stroke="var(--vibe-color-neutral150)" stroke-width="${(outerR - inR).toFixed(1)}" stroke-dasharray="2,4" opacity="0.4"/>`

    // Max value reference ring
    svg += `<circle cx="${cx}" cy="${cy}" r="${outerR.toFixed(1)}" fill="none" stroke="var(--vibe-color-neutral200)" stroke-width="0.5"/>`

    // Bars
    svg += items.map((item, i) => {
      const val = item.value || 0
      const ratio = Math.min(val / maxVal, 1)
      const barOuterR = inR + ratio * usableRadius
      const c = item.color || getColor(i)

      // Center angle for this bar
      const midAngle = -Math.PI / 2 + i * angleStep
      const startAngle = midAngle - halfSpan
      const endAngle = midAngle + halfSpan

      // Outer arc points
      const x1o = cx + barOuterR * Math.cos(startAngle)
      const y1o = cy + barOuterR * Math.sin(startAngle)
      const x2o = cx + barOuterR * Math.cos(endAngle)
      const y2o = cy + barOuterR * Math.sin(endAngle)

      // Inner arc points
      const x1i = cx + inR * Math.cos(startAngle)
      const y1i = cy + inR * Math.sin(startAngle)
      const x2i = cx + inR * Math.cos(endAngle)
      const y2i = cy + inR * Math.sin(endAngle)

      const largeArc = barAngularSpan > Math.PI ? 1 : 0

      // Path: inner start → outer start → outer arc → outer end → inner end → inner arc back
      const path = `M${x1i.toFixed(1)},${y1i.toFixed(1)}`
        + ` L${x1o.toFixed(1)},${y1o.toFixed(1)}`
        + ` A${barOuterR.toFixed(1)},${barOuterR.toFixed(1)} 0 ${largeArc},1 ${x2o.toFixed(1)},${y2o.toFixed(1)}`
        + ` L${x2i.toFixed(1)},${y2i.toFixed(1)}`
        + ` A${inR.toFixed(1)},${inR.toFixed(1)} 0 ${largeArc},0 ${x1i.toFixed(1)},${y1i.toFixed(1)} Z`

      let barSvg = `<path d="${path}" fill="${c}" opacity="0.85"/>`

      // Labels outside each bar
      if (showLabels) {
        const labelR = barOuterR + 12
        const lx = cx + labelR * Math.cos(midAngle)
        const ly = cy + labelR * Math.sin(midAngle) + 4  // +4 for vertical centering

        // Determine text-anchor based on position
        let anchor = 'middle'
        if (midAngle > -Math.PI * 0.2 && midAngle < Math.PI * 0.2) anchor = 'start'
        else if (midAngle > Math.PI * 0.8 || midAngle < -Math.PI * 0.8) anchor = 'end'

        const labelText = String(item.label || '').substring(0, 10)

        barSvg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-size="9" fill="var(--vibe-color-mutedFg)">${esc(labelText)}</text>`
        // Value
        const valR = barOuterR + 22
        const vlx = cx + valR * Math.cos(midAngle)
        const vly = cy + valR * Math.sin(midAngle) + 4
        barSvg += `<text x="${vlx.toFixed(1)}" y="${vly.toFixed(1)}" text-anchor="${anchor}" font-size="9" font-weight="600" fill="var(--vibe-color-fg)">${formatNumber(val)}</text>`
      }

      return barSvg
    }).join('')

    // Center value label
    svg += `<text x="${cx}" y="${(cy - 4).toFixed(1)}" text-anchor="middle" font-size="18" font-weight="700" fill="var(--vibe-color-fg)">${formatNumber(maxVal)}</text>`
    svg += `<text x="${cx}" y="${(cy + 12).toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--vibe-color-mutedFg)">max</text>`

    svg += '</svg>'
    return svg
  },
})

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
