// ─── @uploop-vibe/vibe-charts WordCloud ─────────────────────
// Text frequency visualization with sized words placed in
// non-overlapping positions using spiral placement.
// Font size is proportional to word weight.

import { component } from '@uploop/html'
import { getColor } from './utils.js'

export const WordCloud = component('VibeWordCloud', {
  state: {
    words: [],           // { text, weight, color?, rotation?, font? }[]
    width: 500,
    height: 400,
    title: '',
    minFontSize: 10,
    maxFontSize: 60,
    maxWords: 100,
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, words) => ({ ...s, words }),
  },

  view(state) {
    const { words: rawWords, width, height, title, minFontSize, maxFontSize, maxWords } = state
    const w = width, h = height

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);" role="img">`

    if (title) {
      svg += `<text x="${w / 2}" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    if (!rawWords || rawWords.length === 0) {
      svg += `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-size="12" fill="var(--vibe-color-mutedFg)">No words</text>`
      svg += '</svg>'
      return svg
    }

    // ── Normalize, sort, clamp ────────────────────────────
    const items = rawWords
      .filter(d => d.text && (d.weight || 0) > 0)
      .sort((a, b) => (b.weight || 0) - (a.weight || 0))
      .slice(0, maxWords)

    if (items.length === 0) {
      svg += `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-size="12" fill="var(--vibe-color-mutedFg)">No words</text>`
      svg += '</svg>'
      return svg
    }

    const maxWeight = Math.max(...items.map(d => d.weight || 0))
    const minWeight = Math.min(...items.map(d => d.weight || 0))
    const weightRange = maxWeight - minWeight || 1

    // Font size ranges
    const sizeRange = maxFontSize - minFontSize

    // Allowed rotations
    const rotations = [-90, 0, 90]

    // ── Spiral placement ──────────────────────────────────
    const placed = []
    const cx = w / 2, cy = h / 2

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const weightRatio = (item.weight - minWeight) / weightRange
      const fontSize = item.weight === maxWeight
        ? maxFontSize
        : minFontSize + weightRatio * sizeRange

      // Choose rotation: explicit, or random from allowed set
      let rotation
      if (item.rotation != null) {
        rotation = item.rotation
      } else {
        // Use seeded pseudo-random for consistent output
        rotation = rotations[hashIndex(item.text, rotations.length)]
      }

      const color = item.color || getColor(i)

      // Measure approximate bounding box
      // Approximate: width ~ chars * fontSize * 0.6, height ~ fontSize * 1.2
      const textLen = item.text.length
      const approxW = rotation === 0
        ? textLen * fontSize * 0.6
        : fontSize * 1.2
      const approxH = rotation === 0
        ? fontSize * 1.2
        : textLen * fontSize * 0.6

      // Spiral search for non-overlapping position
      const position = findPosition(cx, cy, approxW, approxH, placed, 2000)

      if (position) {
        placed.push({
          x: position.x - approxW / 2,
          y: position.y - approxH / 2,
          w: approxW,
          h: approxH,
        })

        const textAnchor = 'middle'
        const domBaseline = 'central'
        svg += `<text x="${position.x.toFixed(1)}" y="${position.y.toFixed(1)}" text-anchor="${textAnchor}" dominant-baseline="${domBaseline}" font-size="${fontSize}" font-weight="${i < 5 ? '700' : '500'}" fill="${color}" opacity="${0.7 + weightRatio * 0.3}"${rotation ? ` transform="rotate(${rotation},${position.x.toFixed(1)},${position.y.toFixed(1)})"` : ''}>${esc(item.text)}</text>`
      }
      // If no position found, skip this word (cloud is full)
    }

    svg += '</svg>'
    return svg
  },
})

// ── Spiral Placement ──────────────────────────────────────

/**
 * Archimedean spiral search for a non-overlapping position.
 * Starts at center and spirals outward.
 *
 * @param {number} cx - center x
 * @param {number} cy - center y
 * @param {number} bw - bounding box width
 * @param {number} bh - bounding box height
 * @param {Array} placed - already placed rects { x, y, w, h }
 * @param {number} maxSteps - max spiral steps before giving up
 * @returns {{ x: number, y: number } | null}
 */
function findPosition(cx, cy, bw, bh, placed, maxSteps) {
  // If nothing placed yet, center it
  if (placed.length === 0) return { x: cx, y: cy }

  const a = 0.5  // spiral tightness
  const b = 2    // step between spiral arms

  for (let step = 0; step < maxSteps; step++) {
    const angle = a * step
    const radius = b * Math.sqrt(step)
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)

    const rect = { x: x - bw / 2, y: y - bh / 2, w: bw, h: bh }

    if (!overlaps(rect, placed)) {
      return { x, y }
    }
  }

  return null
}

/** Check if a rect overlaps any in the placed array */
function overlaps(rect, placed) {
  for (const p of placed) {
    if (
      rect.x < p.x + p.w &&
      rect.x + rect.w > p.x &&
      rect.y < p.y + p.h &&
      rect.y + rect.h > p.y
    ) {
      return true
    }
  }
  return false
}

// ── Helpers ───────────────────────────────────────────────

/** Simple hash for deterministic rotation assignment */
function hashIndex(str, mod) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % mod
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
