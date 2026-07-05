// ─── @uploop-vibe/vibe-charts Sunburst ──────────────────────
// Hierarchical donut chart (multi-level ring). Inner ring is
// the root, each outer ring represents the next depth level.
// Each segment's angular span is proportional to its value
// relative to siblings. Labels on larger segments.

import { component } from '@uploop/html'
import { formatNumber } from './utils.js'

export const Sunburst = component('VibeSunburst', {
  state: {
    data: null,          // { name, value, color?, children? } (root node)
    width: 400,
    height: 400,
    title: '',
    maxDepth: 3,         // max rings to render (0 = root only)
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, width, height, title, maxDepth } = state
    const w = width, h = height

    // Empty state
    if (!data) {
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">
        <text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-size="12" fill="var(--vibe-color-mutedFg)">No data</text>
      </svg>`
    }

    const titleH = title ? 28 : 0
    const cx = w / 2
    const cy = (h + titleH) / 2
    const maxRadius = Math.min(cx, cy - titleH) - 8

    const ringCount = maxDepth + 1  // depth 0 through maxDepth
    const ringWidth = maxRadius / ringCount

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${cx}" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // ── Collect segments via recursive walk ────────────────
    const segments = []

    function walk(node, depth, startAngle, endAngle) {
      if (depth > maxDepth) return

      const innerR = depth * ringWidth
      const outerR = innerR + ringWidth

      segments.push({
        name: node.name || '',
        value: node.value || 0,
        color: node.color || depthColor(depth, segments.length),
        startAngle,
        endAngle,
        innerR,
        outerR,
        depth,
      })

      const children = node.children || []
      if (children.length === 0 || depth >= maxDepth) return

      const totalChildValue = children.reduce((s, c) => s + (c.value || 0), 0)
      if (totalChildValue <= 0) return

      let angle = startAngle
      for (const child of children) {
        const childAngle = ((child.value || 0) / totalChildValue) * (endAngle - startAngle)
        walk(child, depth + 1, angle, angle + childAngle)
        angle += childAngle
      }
    }

    // Root always spans full circle
    walk(data, 0, -Math.PI / 2, (3 * Math.PI) / 2)  // start at top (12 o'clock)

    // ── Render segments ────────────────────────────────────
    svg += segments.map(seg => {
      if (seg.startAngle === seg.endAngle) return ''

      const { startAngle, endAngle, innerR, outerR, color, name, value, depth } = seg
      const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0

      // Outer arc points
      const x1o = cx + outerR * Math.cos(startAngle)
      const y1o = cy + outerR * Math.sin(startAngle)
      const x2o = cx + outerR * Math.cos(endAngle)
      const y2o = cy + outerR * Math.sin(endAngle)

      // Inner arc points
      const x1i = cx + innerR * Math.cos(startAngle)
      const y1i = cy + innerR * Math.sin(startAngle)
      const x2i = cx + innerR * Math.cos(endAngle)
      const y2i = cy + innerR * Math.sin(endAngle)

      // Path: start at inner-start, line to outer-start, arc to outer-end, line to inner-end, arc back to inner-start
      const path = [
        `M ${x1o.toFixed(2)} ${y1o.toFixed(2)}`,
        `A ${outerR.toFixed(2)} ${outerR.toFixed(2)} 0 ${largeArc} 1 ${x2o.toFixed(2)} ${y2o.toFixed(2)}`,
        `L ${x2i.toFixed(2)} ${y2i.toFixed(2)}`,
        `A ${innerR.toFixed(2)} ${innerR.toFixed(2)} 0 ${largeArc} 0 ${x1i.toFixed(2)} ${y1i.toFixed(2)}`,
        'Z',
      ].join(' ')

      let segSvg = `<path d="${path}" fill="${color}" stroke="var(--vibe-color-bg)" stroke-width="1.5" opacity="0.85"/>`

      // Label on larger segments
      const midAngle = (startAngle + endAngle) / 2
      const midR = (innerR + outerR) / 2
      const arcLen = (endAngle - startAngle) * midR

      if (arcLen > 30 && outerR - innerR > 14 && name) {
        const labelX = cx + midR * Math.cos(midAngle)
        const labelY = cy + midR * Math.sin(midAngle)

        // Determine rotation: keep text readable (upright)
        let angleDeg = (midAngle * 180) / Math.PI
        // Normalize to [-90, 90] for readability
        if (angleDeg > 90) angleDeg -= 180
        if (angleDeg < -90) angleDeg += 180

        const fontSize = Math.max(8, Math.min(11, (outerR - innerR) * 0.6))
        const maxChars = Math.max(3, Math.floor(arcLen / (fontSize * 0.6)))
        const labelText = truncate(name, maxChars)

        // Check contrast
        const textColor = isDark(color) ? '#ffffff' : '#1a1a2e'

        segSvg += `<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}" font-weight="500" fill="${textColor}" transform="rotate(${angleDeg.toFixed(1)},${labelX.toFixed(1)},${labelY.toFixed(1)})">${esc(labelText)}</text>`

        // Value on second line if enough space
        if (arcLen > 60 && outerR - innerR > 24) {
          const valLabelY = labelY + fontSize + 2
          const valStr = formatNumber(value, 1)
          segSvg += `<text x="${labelX.toFixed(1)}" y="${valLabelY.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="${Math.max(7, fontSize - 1)}" fill="${textColor}" opacity="0.75" transform="rotate(${angleDeg.toFixed(1)},${labelX.toFixed(1)},${valLabelY.toFixed(1)})">${valStr}</text>`
        }
      }

      return segSvg
    }).join('')

    // Center circle (root node label if it fits)
    const rootSeg = segments[0]
    if (rootSeg && ringWidth > 30) {
      const rootLabel = truncate(rootSeg.name, Math.floor(ringWidth / 8))
      const textColor = isDark(rootSeg.color) ? '#ffffff' : '#1a1a2e'
      svg += `<text x="${cx.toFixed(1)}" y="${(cy - 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="${textColor}">${esc(rootLabel)}</text>`
      svg += `<text x="${cx.toFixed(1)}" y="${(cy + 12).toFixed(1)}" text-anchor="middle" font-size="10" fill="${textColor}" opacity="0.75">${formatNumber(rootSeg.value, 1)}</text>`
    }

    svg += '</svg>'
    return svg
  },
})

// ── Helpers ──────────────────────────────────────────────────

/** Color palette for sunburst depth levels */
const DEPTH_PALETTE = [
  ['#646cff', '#7c83ff', '#9da3ff', '#bfc3ff'],   // purple ramp
  ['#40c057', '#69db7c', '#8ce99a', '#b2f2bb'],   // green ramp
  ['#fab005', '#fcc419', '#ffd43b', '#ffe066'],   // yellow ramp
  ['#fa5252', '#ff6b6b', '#ff8787', '#ffa8a8'],   // red ramp
  ['#228be6', '#4dabf7', '#74c0fc', '#a5d8ff'],   // blue ramp
]

function depthColor(depth, index) {
  const ramp = DEPTH_PALETTE[depth % DEPTH_PALETTE.length]
  return ramp[index % ramp.length]
}

/** Simple luminance check for contrast */
function isDark(hex) {
  if (!hex || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140
}

/** Truncate text to fit */
function truncate(text, maxChars) {
  if (!text) return ''
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars - 1) + '…'
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
