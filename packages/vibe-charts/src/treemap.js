// ─── @uploop-vibe/vibe-charts Treemap ───────────────────────
// Hierarchical area chart using squarified layout algorithm.
// Each node's area is proportional to its value. Labels show
// name + formatted value. Color encodes depth or explicit color.

import { component } from '@uploop/html'
import { getColor, formatNumber } from './utils.js'

export const Treemap = component('VibeTreemap', {
  state: {
    data: null,          // { name, value, color?, children? } (root node)
    width: 500,
    height: 400,
    padding: 2,          // gap between cells
    gap: 2,
    showLabels: true,
    title: '',
    maxDepth: 3,         // max nesting depth to render
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, width, height, padding, gap, showLabels, title, maxDepth } = state
    const w = width, h = height
    const titleH = title ? 30 : 0
    const chartY = titleH
    const chartH = h - titleH
    const pad = gap

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);" role="img">`

    if (title) {
      svg += `<text x="${w / 2}" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    if (!data || !data.children || data.children.length === 0) {
      svg += `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-size="12" fill="var(--vibe-color-mutedFg)">No data</text>`
      svg += '</svg>'
      return svg
    }

    // ── Squarified treemap layout ─────────────────────────
    const cells = []
    squarify(data.children, pad, chartY + pad, w - pad * 2, chartH - pad * 2, 1, maxDepth, cells)

    // ── Render cells ─────────────────────────────────────
    svg += cells.map(cell => {
      const c = cell.color || depthColor(cell.depth)
      const rx = Math.min(4, Math.min(cell.w, cell.h) * 0.08).toFixed(1)

      let cellSvg = `<rect x="${cell.x.toFixed(1)}" y="${cell.y.toFixed(1)}" width="${Math.max(0, cell.w).toFixed(1)}" height="${Math.max(0, cell.h).toFixed(1)}" rx="${rx}" fill="${c}" stroke="var(--vibe-color-bg, #fff)" stroke-width="${pad}"/>`

      // Label: name + value if there's enough space
      if (showLabels && cell.w > 24 && cell.h > 16) {
        const fontSize = Math.max(8, Math.min(13, Math.min(cell.w, cell.h) * 0.12))
        const valStr = formatNumber(cell.value, 1)
        const labelText = truncate(esc(cell.name), Math.floor(cell.w / (fontSize * 0.55)))
        const lineH = fontSize + 3
        const cx = cell.x + cell.w / 2
        const cy = cell.y + cell.h / 2

        // Contrast check for text color
        const textColor = isDark(c) ? '#ffffff' : '#1a1a2e'

        if (cell.h > lineH * 2 + 4) {
          // Two lines: name on top, value below
          cellSvg += `<text x="${cx.toFixed(1)}" y="${(cy - 2).toFixed(1)}" text-anchor="middle" font-size="${fontSize}" font-weight="500" fill="${textColor}">${labelText}</text>`
          cellSvg += `<text x="${cx.toFixed(1)}" y="${(cy + lineH - 2).toFixed(1)}" text-anchor="middle" font-size="${fontSize}" font-weight="700" fill="${textColor}" opacity="0.8">${valStr}</text>`
        } else {
          // Single line
          const singleLabel = cell.w > cell.h ? labelText : `${valStr}`
          cellSvg += `<text x="${cx.toFixed(1)}" y="${(cy + fontSize * 0.35).toFixed(1)}" text-anchor="middle" font-size="${fontSize}" font-weight="500" fill="${textColor}">${singleLabel}</text>`
        }
      }

      return cellSvg
    }).join('')

    svg += '</svg>'
    return svg
  },
})

// ─── Squarified Treemap Algorithm ─────────────────────────

/**
 * Recursively subdivide rectangle using squarified layout.
 * Sorts children by value descending, then packs them into rows
 * choosing the layout that minimizes the worst aspect ratio.
 */
function squarify(children, x, y, w, h, depth, maxDepth, out) {
  if (!children || children.length === 0 || depth > maxDepth) return

  // Filter zero/negative values and sort descending
  const items = children
    .map(c => ({ ...c, value: c.value || 0 }))
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)

  if (items.length === 0) return

  const total = items.reduce((s, c) => s + c.value, 0)
  if (total === 0) return

  // Determine whether to lay out vertically or horizontally
  // based on the rectangle orientation: shorter side splits into rows
  const vertical = w >= h

  let i = 0
  while (i < items.length) {
    // Find the best row break
    let bestEnd = i + 1
    let bestWorst = Infinity

    const rowTotal = items.slice(i).reduce((s, c) => s + c.value, 0)

    for (let end = i + 1; end <= items.length; end++) {
      const rowSum = items.slice(i, end).reduce((s, c) => s + c.value, 0)
      const rowArea = (rowSum / total) * (vertical ? h : w)

      // Compute worst aspect ratio in this row
      let worstAR = 0
      const rowLen = vertical
        ? (rowSum / total) * w
        : (rowSum / total) * h

      for (let j = i; j < end; j++) {
        const itemArea = (items[j].value / total) * w * h
        const itemCross = itemArea / rowLen
        const ar = Math.max(rowLen / itemCross, itemCross / rowLen)
        if (ar > worstAR) worstAR = ar
      }

      if (worstAR < bestWorst) {
        bestWorst = worstAR
        bestEnd = end
      }
      if (worstAR > bestWorst) break // getting worse, stop
    }

    // Layout the best row
    const rowSum = items.slice(i, bestEnd).reduce((s, c) => s + c.value, 0)
    const rowRatio = rowSum / total

    if (vertical) {
      const rowH = rowRatio * h
      let cx = x
      for (let j = i; j < bestEnd; j++) {
        const itemH = (items[j].value / rowSum) * rowH
        const cellW = (items[j].value / rowSum) * (rowRatio * w)
        const cellX = cx
        const cellY = y
        cx += cellW

        if (items[j].children && items[j].children.length > 0) {
          squarify(items[j].children, cellX, cellY, cellW, itemH, depth + 1, maxDepth, out)
        } else {
          out.push({
            name: items[j].name || '',
            value: items[j].value,
            color: items[j].color,
            x: cellX, y: cellY, w: cellW, h: itemH,
            depth,
          })
        }
      }
      y += rowH
      h -= rowH
    } else {
      const rowW = rowRatio * w
      let cy = y
      for (let j = i; j < bestEnd; j++) {
        const itemW = (items[j].value / rowSum) * rowW
        const cellH = (items[j].value / rowSum) * (rowRatio * h)
        const cellX = x
        const cellY = cy
        cy += cellH

        if (items[j].children && items[j].children.length > 0) {
          squarify(items[j].children, cellX, cellY, itemW, cellH, depth + 1, maxDepth, out)
        } else {
          out.push({
            name: items[j].name || '',
            value: items[j].value,
            color: items[j].color,
            x: cellX, y: cellY, w: itemW, h: cellH,
            depth,
          })
        }
      }
      x += rowW
      w -= rowW
    }

    i = bestEnd
  }
}

// ── Helpers ───────────────────────────────────────────────

/** Color palette by depth */
const DEPTH_COLORS = [
  '#646cff', '#40c057', '#fab005', '#fa5252', '#228be6',
  '#f06595', '#20c997', '#fd7e14', '#7950f2', '#15aabf',
]

function depthColor(depth) {
  return DEPTH_COLORS[(depth - 1) % DEPTH_COLORS.length]
}

/** Simple luminance check for contrast */
function isDark(hex) {
  if (!hex || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140
}

/** Truncate text to fit pixel width */
function truncate(text, maxChars) {
  if (!text) return ''
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars - 1) + '…'
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
