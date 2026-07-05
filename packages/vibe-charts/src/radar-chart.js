// ─── @uploop-vibe/vibe-charts RadarChart ─────────────────────
// Multi-dimensional comparison across axes radiating from center.
// Each series is a polygon; axes define the spokes.

import { component } from '@uploop/html'
import { createChart, esc, formatNumber, niceTicks, svgWrap, gridLines, yAxisLabels, xAxisLabels } from './chart-base.js'

export const RadarChart = createChart({
  name: 'VibeRadarChart',

  state: {
    data: [],            // { name, color?, values: number[] }[] — multiple series
    axes: [],            // { label, max }[] — one per axis/spoke
    width: 350,
    height: 350,
    filled: true,        // fill polygon interior
    showDots: true,      // show data point circles
    showGrid: true,      // show concentric rings
    showLabels: true,    // show axis labels
    title: '',
    // Interaction
    hovered: null,
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
    setAxes: (s, axes) => ({ ...s, axes }),
  },

  render(state) {
    const { data, axes, width, height, filled, showDots, showGrid, showLabels, title } = state
    const w = width, h = height
    const cx = w / 2, cy = h / 2
    const pad = 60
    const radius = Math.min(w, h) / 2 - pad
    const gridLevels = showGrid ? 5 : 0
    const axisCount = axes.length

    if (!axisCount || !Array.isArray(data)) {
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans, system-ui, sans-serif);"><text x="${cx}" y="${cy}" text-anchor="middle" fill="var(--vibe-color-mutedFg, #868e96)" font-size="12">No data</text></svg>`
    }

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans, system-ui, sans-serif);" role="img">`

    if (title) {
      svg += `<text x="${cx}" y="18" text-anchor="middle" font-size="var(--vibe-chart-title-size, 13px)" font-weight="600" fill="var(--vibe-color-fg, #1a1a2e)">${esc(title)}</text>`
    }

    // Helper: angle in radians for axis i (start at top, clockwise)
    const angle = (i) => -Math.PI / 2 + (2 * Math.PI * i) / axisCount

    // Helper: point on axis i at given value ratio (0..1)
    const point = (i, ratio) => ({
      x: cx + radius * ratio * Math.cos(angle(i)),
      y: cy + radius * ratio * Math.sin(angle(i)),
    })

    // ── Grid rings ──────────────────────────────────────────
    if (showGrid) {
      for (let level = 1; level <= gridLevels; level++) {
        const ratio = level / gridLevels
        const pts = []
        for (let i = 0; i <= axisCount; i++) {
          const j = i % axisCount
          const p = point(j, ratio)
          pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        }
        svg += `<polygon points="${pts.join(' ')}" fill="none" stroke="var(--vibe-color-neutral200, #e9ecef)" stroke-width="1"/>`
      }
    }

    // ── Axis spokes ─────────────────────────────────────────
    for (let i = 0; i < axisCount; i++) {
      const tip = point(i, 1)
      svg += `<line x1="${cx}" y1="${cy}" x2="${tip.x.toFixed(1)}" y2="${tip.y.toFixed(1)}" stroke="var(--vibe-color-neutral300, #dee2e6)" stroke-width="1"/>`
    }

    // ── Axis labels ─────────────────────────────────────────
    if (showLabels) {
      for (let i = 0; i < axisCount; i++) {
        const labelR = radius + 18
        const lx = cx + labelR * Math.cos(angle(i))
        const ly = cy + labelR * Math.sin(angle(i))
        const anchor = lx > cx + 2 ? 'start' : lx < cx - 2 ? 'end' : 'middle'
        const yOff = ly > cy + 2 ? 4 : ly < cy - 2 ? -2 : 0
        svg += `<text x="${lx.toFixed(1)}" y="${(ly + yOff).toFixed(1)}" text-anchor="${anchor}" font-size="var(--vibe-chart-label-size, 10px)" fill="var(--vibe-color-mutedFg, #868e96)">${esc(String(axes[i].label || '').substring(0, 12))}</text>`
      }
    }

    // ── Grid value labels (on first axis) ───────────────────
    if (showGrid) {
      for (let level = 1; level <= gridLevels; level++) {
        const ratio = level / gridLevels
        const max = axes[0]?.max ?? 1
        const val = Math.round(max * ratio)
        const lp = point(0, ratio)
        svg += `<text x="${(lp.x - 6).toFixed(1)}" y="${(lp.y + 4).toFixed(1)}" text-anchor="end" font-size="var(--vibe-chart-tick-size, 9px)" fill="var(--vibe-color-mutedFg, #868e96)">${formatNumber(val)}</text>`
      }
    }

    // ── Data polygons (back-to-front so first on top) ───────
    const palette = state.palette || ['#646cff', '#40c057', '#fab005', '#fa5252', '#228be6',
      '#f06595', '#20c997', '#fd7e14', '#7950f2', '#15aabf']

    const seriesData = (Array.isArray(data) && data.length > 0)
      ? (data[0] && 'values' in data[0] ? data : [{ name: '', values: data.map(d => d.value ?? d) }])
      : []

    // Draw in reverse so first series is rendered on top
    const reversed = [...seriesData].reverse()

    reversed.forEach((series, revIdx) => {
      const si = seriesData.length - 1 - revIdx
      const values = series.values || []
      const c = series.color || palette[si % palette.length]

      if (!values.length) return

      // Build polygon points
      const pts = []
      for (let i = 0; i < axisCount; i++) {
        const max = axes[i]?.max ?? 1
        const val = values[i] ?? 0
        const ratio = Math.max(0, Math.min(1, val / (max || 1)))
        const p = point(i, ratio)
        pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      }

      // Filled polygon (behind)
      if (filled) {
        svg += `<polygon points="${pts.join(' ')}" fill="${c}" opacity="0.15" stroke="none"/>`
      }

      // Stroke polygon
      svg += `<polygon points="${pts.join(' ')}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>`

      // Dots at vertices
      if (showDots) {
        for (let i = 0; i < axisCount; i++) {
          const max = axes[i]?.max ?? 1
          const val = values[i] ?? 0
          const ratio = Math.max(0, Math.min(1, val / (max || 1)))
          const p = point(i, ratio)
          svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="white" stroke="${c}" stroke-width="2"/>`
        }
      }
    })

    // ── Legend (if multiple named series) ────────────────────
    const namedSeries = seriesData.filter(s => s.name)
    if (namedSeries.length > 1) {
      const legX = w - 100
      const legY = pad
      namedSeries.forEach((s, i) => {
        const c = s.color || palette[i % palette.length]
        const y = legY + i * 18
        svg += `<rect x="${legX}" y="${y}" width="10" height="10" rx="2" fill="${c}"/>`
        svg += `<text x="${legX + 14}" y="${y + 9}" font-size="var(--vibe-chart-legend-size, 11px)" fill="var(--vibe-color-fg, #1a1a2e)">${esc(String(s.name).substring(0, 16))}</text>`
      })
    }

    svg += '</svg>'
    return svg
  },
})
