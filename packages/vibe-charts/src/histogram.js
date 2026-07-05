// ─── @uploop-vibe/vibe-charts Histogram ─────────────────────
// Distribution histogram: auto-bins raw values using Sturges'
// formula, renders contiguous vertical bars with no gap.
// X-axis shows bin ranges, Y-axis shows frequency.

import { component } from '@uploop/html'

export const Histogram = component('VibeHistogram', {
  state: {
    data: [],            // number[] — raw values to bin
    bins: 0,             // manual bin count (0 = auto using Sturges')
    width: 400,
    height: 250,
    padding: 40,
    color: 'primary',
    showGrid: true,
    showLabels: true,
    title: '',
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, bins: manualBins, width, height, padding, color, showGrid, showLabels, title } = state
    const w = width, h = height, p = padding

    // Empty state
    if (!data || data.length === 0) {
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">
        <text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-size="12" fill="var(--vibe-color-mutedFg)">No data</text>
      </svg>`
    }

    // ── Compute bins ───────────────────────────────────────
    const filtered = data.filter(v => typeof v === 'number' && !isNaN(v))
    if (filtered.length === 0) {
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">
        <text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-size="12" fill="var(--vibe-color-mutedFg)">No valid data</text>
      </svg>`
    }

    const n = filtered.length
    const binCount = manualBins > 0 ? manualBins : Math.ceil(Math.log2(n) + 1)

    const dMin = Math.min(...filtered)
    const dMax = Math.max(...filtered)
    const dRange = dMax - dMin || 1
    const binWidth = dRange / binCount

    // Build bins: [min, max) for first N-1, [min, max] for last
    const bins = []
    for (let i = 0; i < binCount; i++) {
      const lo = dMin + i * binWidth
      const hi = dMin + (i + 1) * binWidth
      bins.push({ lo, hi, count: 0 })
    }

    for (const v of filtered) {
      const idx = Math.min(Math.floor((v - dMin) / binWidth), binCount - 1)
      bins[idx].count++
    }

    const maxFreq = Math.max(...bins.map(b => b.count), 1)

    // ── SVG ────────────────────────────────────────────────
    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    // Title
    if (title) {
      svg += `<text x="${w / 2}" y="16" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    const chartW = w - p * 2
    const chartH = h - p * 2
    const barW = chartW / binCount
    const barC = color.startsWith('#') ? color : `var(--vibe-color-${color}600)`

    // Grid lines
    if (showGrid) {
      const gridLines = 5
      for (let i = 0; i <= gridLines; i++) {
        const y = p + (i / gridLines) * chartH
        svg += `<line x1="${p}" y1="${y.toFixed(1)}" x2="${(w - p).toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--vibe-color-neutral200)" stroke-width="1"/>`
      }
    }

    // Bars (contiguous, no gap)
    svg += bins.map((bin, i) => {
      const ratio = bin.count / maxFreq
      const barH = Math.max(ratio * chartH, 1)
      const x = p + i * barW
      const y = h - p - barH
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" fill="${barC}" opacity="0.8"/>`
    }).join('')

    // Bar borders (thin stroke between bars only)
    svg += bins.map((bin, i) => {
      if (i === 0) return ''
      const x = p + i * barW
      return `<line x1="${x.toFixed(1)}" y1="${(h - p).toFixed(1)}" x2="${x.toFixed(1)}" y2="${p.toFixed(1)}" stroke="var(--vibe-color-bg)" stroke-width="1"/>`
    }).join('')

    // X-axis labels (bin ranges)
    if (showLabels && binCount <= 20) {
      const labelStep = binCount <= 10 ? 1 : Math.ceil(binCount / 10)
      svg += bins.map((bin, i) => {
        if (i % labelStep !== 0) return ''
        const x = p + i * barW + barW / 2
        const label = fmtBinLabel(bin.lo, bin.hi, binWidth)
        return `<text x="${x.toFixed(1)}" y="${(h - p + 16).toFixed(1)}" text-anchor="middle" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(label)}</text>`
      }).join('')
    }

    // Frequency labels on top of tallest bars
    if (showLabels) {
      svg += bins.map((bin, i) => {
        if (bin.count === 0) return ''
        const ratio = bin.count / maxFreq
        const barH = Math.max(ratio * chartH, 1)
        const x = p + i * barW + barW / 2
        const y = h - p - barH - 6
        return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--vibe-color-mutedFg)">${bin.count}</text>`
      }).join('')
    }

    // Axis line
    svg += `<line x1="${p}" y1="${(h - p).toFixed(1)}" x2="${(w - p).toFixed(1)}" y2="${(h - p).toFixed(1)}" stroke="var(--vibe-color-neutral300)" stroke-width="1"/>`

    svg += '</svg>'
    return svg
  },
})

// ── Helpers ──────────────────────────────────────────────────

/** Format a bin range label, intelligently rounding for readability */
function fmtBinLabel(lo, hi, binWidth) {
  // For integer ranges, show as integers
  if (binWidth >= 1 && Number.isInteger(lo) && Number.isInteger(hi)) {
    return `${lo}–${hi}`
  }
  // For small decimal ranges
  const precision = binWidth < 0.01 ? 3 : binWidth < 0.1 ? 2 : binWidth < 1 ? 1 : 0
  return `${lo.toFixed(precision)}–${hi.toFixed(precision)}`
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
