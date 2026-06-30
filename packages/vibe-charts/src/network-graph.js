// ─── @uploop-vibe/vibe-charts NetworkGraph ──────────────────
// SVG-based node-edge network visualization.
// Supports circle nodes, weighted edges, force-directed layout hints.

import { component } from '@uploop/html'
import { getColor } from './utils.js'

export const NetworkGraph = component('VibeNetworkGraph', {
  state: {
    nodes: [],           // { id, label, value?, color?, x?, y? }[]
    edges: [],           // { from, to, weight?, label? }[]
    width: 500,
    height: 400,
    nodeRadius: 12,
    showLabels: true,
    showEdgeLabels: false,
    title: '',
    layout: 'circular',  // circular | grid | manual (use node.x, node.y)
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, data) => ({ ...s, nodes: data.nodes || [], edges: data.edges || [] }),
  },

  view(state) {
    const { nodes, edges, width, height, nodeRadius, showLabels, showEdgeLabels, title, layout } = state
    const w = width, h = height
    const cx = w / 2, cy = h / 2
    const r = Math.min(w, h) / 2 - 40

    const nodeList = Array.isArray(nodes) ? nodes : []
    const edgeList = Array.isArray(edges) ? edges : []
    if (!nodeList.length) return `<svg width="${w}" height="${h}"><text x="${cx}" y="${cy}" text-anchor="middle" fill="var(--vibe-color-muted)">No data</text></svg>`

    // Position nodes
    const positioned = positionNodes(nodeList, layout, cx, cy, r, w, h)

    // Build edge thickness map
    const maxWeight = Math.max(1, ...edgeList.map(e => e.weight || 1))

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${cx}" y="20" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // Edges (drawn first, behind nodes)
    svg += edgeList.map(edge => {
      const from = positioned.find(n => n.id === edge.from)
      const to = positioned.find(n => n.id === edge.to)
      if (!from || !to) return ''

      const strokeWidth = Math.max(1, ((edge.weight || 1) / maxWeight) * 4)
      const color = edge.color || 'var(--vibe-color-neutral300)'
      const opacity = Math.max(0.2, (edge.weight || 1) / maxWeight)

      let edgeSvg = `<line x1="${from.x.toFixed(1)}" y1="${from.y.toFixed(1)}" x2="${to.x.toFixed(1)}" y2="${to.y.toFixed(1)}" stroke="${color}" stroke-width="${strokeWidth.toFixed(1)}" opacity="${opacity.toFixed(2)}"/>`

      if (showEdgeLabels && edge.label) {
        const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2
        edgeSvg += `<text x="${mx.toFixed(1)}" y="${(my - 4).toFixed(1)}" text-anchor="middle" font-size="8" fill="var(--vibe-color-mutedFg)">${esc(edge.label)}</text>`
      }

      return edgeSvg
    }).join('')

    // Nodes
    svg += positioned.map((node, i) => {
      const color = node.color || getColor(i)
      const radius = nodeRadius + (node.value ? Math.min(node.value * 3, 15) : 0)
      const valueText = node.value != null ? formatValue(node.value) : ''

      let nodeSvg = `<circle cx="${node.x.toFixed(1)}" cy="${node.y.toFixed(1)}" r="${radius}" fill="${color}" opacity="0.85" stroke="white" stroke-width="2"/>`

      if (valueText) {
        nodeSvg += `<text x="${node.x.toFixed(1)}" y="${(node.y + 4).toFixed(1)}" text-anchor="middle" font-size="${Math.max(8, radius * 0.7)}" font-weight="600" fill="white">${valueText}</text>`
      }

      if (showLabels && node.label) {
        nodeSvg += `<text x="${node.x.toFixed(1)}" y="${(node.y + radius + 14).toFixed(1)}" text-anchor="middle" font-size="10" fill="var(--vibe-color-mutedFg)">${esc(node.label)}</text>`
      }

      return nodeSvg
    }).join('')

    svg += '</svg>'
    return svg
  },
})

// ── Layout Functions ────────────────────────────────────────

function positionNodes(nodes, layout, cx, cy, r, w, h) {
  const positioned = nodes.map(n => ({ ...n, x: n.x || 0, y: n.y || 0 }))

  switch (layout) {
    case 'circular':
      const angleStep = (Math.PI * 2) / Math.max(1, positioned.length)
      positioned.forEach((n, i) => {
        const angle = -Math.PI / 2 + i * angleStep
        n.x = cx + r * Math.cos(angle)
        n.y = cy + r * Math.sin(angle)
      })
      break

    case 'grid':
      const cols = Math.ceil(Math.sqrt(positioned.length))
      const cellW = (w - 80) / cols
      const cellH = (h - 80) / Math.ceil(positioned.length / cols)
      positioned.forEach((n, i) => {
        const col = i % cols, row = Math.floor(i / cols)
        n.x = 40 + col * cellW + cellW / 2
        n.y = 40 + row * cellH + cellH / 2
      })
      break

    case 'manual':
      // Use provided x, y
      break
  }

  return positioned
}

function formatValue(v) {
  if (v >= 1000) return (v / 1000).toFixed(1) + 'K'
  if (v >= 100) return Math.round(v).toString()
  return v.toFixed(1)
}

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
