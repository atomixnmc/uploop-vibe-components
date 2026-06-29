// ─── @uploop-vibe/vibe-charts ScatterPlot ──────────────────

import { component } from '@uploop/html'
import { getColor, formatNumber } from './utils.js'

export const ScatterPlot = component('VibeScatterPlot', {
  state: {
    data: [],            // { x, y, radius?, label?, color? }[]
    width: 400,
    height: 300,
    padding: 45,
    showGrid: true,
    showLabels: false,
    showQuadrants: false,
    title: '',
    xLabel: '',
    yLabel: '',
    minRadius: 3,
    maxRadius: 15,
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, data }),
  },

  view(state) {
    const { data, width, height, padding, showGrid, showLabels, showQuadrants, title, xLabel, yLabel, minRadius, maxRadius } = state
    const w = width, h = height, p = padding

    const points = Array.isArray(data) ? data : []
    if (!points.length) return `<svg width="${w}" height="${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="var(--vibe-color-muted)">No data</text></svg>`

    const xVals = points.map(d => d.x || 0)
    const yVals = points.map(d => d.y || 0)
    const rVals = points.map(d => d.radius || 1)
    const xMin = Math.min(...xVals, 0), xMax = Math.max(...xVals, 0)
    const yMin = Math.min(...yVals, 0), yMax = Math.max(...yVals, 0)
    const rMin = Math.min(...rVals, 1), rMax = Math.max(...rVals, 1)
    const xRange = xMax - xMin || 1
    const yRange = yMax - yMin || 1
    const rRange = rMax - rMin || 1

    const scaleX = (v) => p + ((v - xMin) / xRange) * (w - p * 2)
    const scaleY = (v) => h - p - ((v - yMin) / yRange) * (h - p * 2)
    const scaleR = (v) => minRadius + ((v - rMin) / rRange) * (maxRadius - minRadius)

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${w/2}" y="20" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // Grid
    if (showGrid) {
      const xTicks = 5, yTicks = 5
      for (let i = 0; i <= xTicks; i++) {
        const x = p + (i / xTicks) * (w - p * 2)
        svg += `<line x1="${x.toFixed(1)}" y1="${p}" x2="${x.toFixed(1)}" y2="${h - p}" stroke="var(--vibe-color-neutral200)" stroke-width="1"/>`
      }
      for (let i = 0; i <= yTicks; i++) {
        const y = p + (i / yTicks) * (h - p * 2)
        svg += `<line x1="${p}" y1="${(h - y).toFixed(1)}" x2="${w - p}" y2="${(h - y).toFixed(1)}" stroke="var(--vibe-color-neutral200)" stroke-width="1"/>`
      }
    }

    // Quadrant lines
    if (showQuadrants) {
      const cx = scaleX((xMax + xMin) / 2)
      const cy = scaleY((yMax + yMin) / 2)
      svg += `<line x1="${cx}" y1="${p}" x2="${cx}" y2="${h - p}" stroke="var(--vibe-color-neutral400)" stroke-width="1" stroke-dasharray="4,4"/>`
      svg += `<line x1="${p}" y1="${cy}" x2="${w - p}" y2="${cy}" stroke="var(--vibe-color-neutral400)" stroke-width="1" stroke-dasharray="4,4"/>`
    }

    // Points
    svg += points.map((pt, i) => {
      const cx = scaleX(pt.x || 0)
      const cy = scaleY(pt.y || 0)
      const r = pt.radius ? scaleR(pt.radius) : maxRadius * 0.5
      const color = pt.color || getColor(i)
      const opacity = 0.7

      let pointSvg = `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}" opacity="${opacity}" stroke="white" stroke-width="1"/>`

      if (showLabels && pt.label) {
        pointSvg += `<text x="${(cx + r + 4).toFixed(1)}" y="${(cy + 4).toFixed(1)}" font-size="9" fill="var(--vibe-color-mutedFg)">${esc(pt.label)}</text>`
      }

      return pointSvg
    }).join('')

    // Axis labels
    if (xLabel) {
      svg += `<text x="${w/2}" y="${h - 6}" text-anchor="middle" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(xLabel)}</text>`
    }
    if (yLabel) {
      svg += `<text transform="translate(14,${h/2}) rotate(-90)" text-anchor="middle" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(yLabel)}</text>`
    }

    svg += '</svg>'
    return svg
  },
})

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
