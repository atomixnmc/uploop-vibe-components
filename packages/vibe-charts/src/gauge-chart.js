// ─── @uploop-vibe/vibe-charts GaugeChart ─────────────────────
// Semi-circle gauge with colored arcs, needle, and value label.
// Used for risk scores, KPI dials, and performance indicators.

import { component } from '@uploop/html'

export const GaugeChart = component('VibeGaugeChart', {
  state: {
    value: 0,              // current value (0-100)
    max: 100,
    width: 200,
    height: 130,
    label: '',             // text label below gauge (e.g., "TRUNG BÌNH")
    sub: '',               // subtitle below label (e.g., "Giảm 2 điểm")
    color: '#a16207',      // label/subtitle highlight color
    // Color arc segments: { start, end, color } — angles in degrees (0–180)
    // Default: green 0–54°, yellow 54–90°, orange 90–126°, red 126–180°
    segments: [
      { start: 0,   end: 54,  color: '#15803d' },
      { start: 54,  end: 90,  color: '#a16207' },
      { start: 90,  end: 126, color: '#c2410c' },
      { start: 126, end: 180, color: '#b91c1c' },
    ],
    leftLabel: 'An toàn',
    rightLabel: 'Rủi ro cao',
    unit: '/100 điểm',
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setValue: (s, value) => ({ ...s, value }),
  },

  view(state) {
    const { value, max, width, height, label, sub, color, segments, leftLabel, rightLabel, unit } = state
    const w = width, h = height
    const cx = w / 2, cy = h - 15, r = Math.min(cx, cy - 5) - 5
    const pct = Math.min(value / max, 1)

    // arc(saAngle, eaAngle, radius, color) — angles in radians, 0→π mapped to π→2π SVG
    const arc = (saDeg, eaDeg, rad, c) => {
      const sa = Math.PI + (saDeg * Math.PI) / 180
      const ea = Math.PI + (eaDeg * Math.PI) / 180
      const x1 = cx + rad * Math.cos(sa), y1 = cy + rad * Math.sin(sa)
      const x2 = cx + rad * Math.cos(ea), y2 = cy + rad * Math.sin(ea)
      const large = (eaDeg - saDeg) > 180 ? 1 : 0
      return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${rad} ${rad} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/>`
    }

    // Needle
    const needleAngle = Math.PI + Math.PI * pct
    const nx = cx + (r - 15) * Math.cos(needleAngle)
    const ny = cy + (r - 15) * Math.sin(needleAngle)

    let svg = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:240px;display:block;margin:0 auto;">`

    // Background track
    svg += `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}" fill="none" stroke="var(--vibe-color-neutral200)" stroke-width="12" stroke-linecap="round"/>`

    // Colored segments
    svg += segments.map(s => arc(s.start, s.end, r - 2, s.color)).join('')

    // Needle + center
    svg += `<line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="var(--vibe-color-fg)" stroke-width="2" stroke-linecap="round"/>`
    svg += `<circle cx="${cx}" cy="${cy}" r="4" fill="var(--vibe-color-fg)"/>`

    // Value
    svg += `<text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="22" font-weight="700" fill="var(--vibe-color-fg)">${value}</text>`
    if (unit) {
      svg += `<text x="${cx}" y="${cy + 8}" text-anchor="middle" font-size="8" fill="var(--vibe-color-mutedFg)">${esc(unit)}</text>`
    }

    // Left/right labels
    if (leftLabel) {
      svg += `<text x="${(cx - r + 8).toFixed(1)}" y="${cy + 4}" font-size="9" fill="var(--vibe-color-mutedFg)">${esc(leftLabel)}</text>`
    }
    if (rightLabel) {
      svg += `<text x="${(cx + r - 8).toFixed(1)}" y="${cy + 4}" text-anchor="end" font-size="9" fill="var(--vibe-color-mutedFg)">${esc(rightLabel)}</text>`
    }

    svg += '</svg>'

    // HTML wrapper with label + subtitle (renders outside SVG for text wrapping)
    return `<div style="text-align:center;">
      ${svg}
      ${label ? `<div style="font-size:0.73rem;font-weight:600;color:${color};margin-top:6px;">⬤ Mức rủi ro: ${esc(label)}</div>` : ''}
      ${sub ? `<div style="font-size:0.65rem;color:var(--vibe-color-mutedFg);margin-top:2px;">${esc(sub)}</div>` : ''}
    </div>`
  },
})

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
