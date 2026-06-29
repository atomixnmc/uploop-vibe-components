// ─── @uploop-vibe/vibe-charts Shared Utilities ──────────────
// Color scales, axis helpers, SVG builders.

/** Default color palette */
export const chartColors = [
  '#646cff', '#40c057', '#fab005', '#fa5252', '#228be6',
  '#f06595', '#20c997', '#fd7e14', '#7950f2', '#15aabf',
]

/** Get color by index */
export function getColor(index) {
  return chartColors[index % chartColors.length]
}

/** Format a number for axis labels */
export function formatNumber(n, precision = 0) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toFixed(precision)
}

/** Compute axis ticks */
export function computeTicks(min, max, count = 5) {
  const range = max - min || 1
  const step = range / (count - 1)
  const ticks = []
  for (let i = 0; i < count; i++) {
    ticks.push(min + step * i)
  }
  return ticks
}

/** Build SVG path from points */
export function buildPath(points, width, height, padding) {
  if (!points.length) return ''
  const xScale = (width - padding * 2) / Math.max(1, points.length - 1)
  const yMax = Math.max(...points, 0)
  const yMin = Math.min(...points, 0)
  const yRange = yMax - yMin || 1
  const yScale = (height - padding * 2) / yRange

  return points.map((v, i) => {
    const x = padding + i * xScale
    const y = height - padding - (v - yMin) * yScale
    return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1)
  }).join(' ')
}

/** Build SVG area path (for area charts) */
export function buildAreaPath(points, width, height, padding, baseline = 0) {
  const linePath = buildPath(points, width, height, padding)
  if (!linePath) return ''
  const lastPt = points[points.length - 1]
  const firstPt = points[0]
  const xScale = (width - padding * 2) / Math.max(1, points.length - 1)
  const yMax = Math.max(...points, baseline)
  const yMin = Math.min(...points, baseline)
  const yRange = yMax - yMin || 1
  const yScale = (height - padding * 2) / yRange
  const baseY = height - padding - (baseline - yMin) * yScale

  return linePath +
    ' L' + (padding + (points.length - 1) * xScale).toFixed(1) + ',' + baseY.toFixed(1) +
    ' L' + padding.toFixed(1) + ',' + baseY.toFixed(1) + ' Z'
}

/** Build SVG grid lines */
export function buildGrid(ticks, width, height, padding) {
  return ticks.map(t => {
    const y = padding + ((t - ticks[0]) / (ticks[ticks.length - 1] - ticks[0] || 1)) * (height - padding * 2)
    return `<line x1="${padding}" y1="${(height - y).toFixed(1)}" x2="${(width - padding).toFixed(1)}" y2="${(height - y).toFixed(1)}" stroke="var(--vibe-color-neutral200)" stroke-width="1" />`
  }).join('')
}
