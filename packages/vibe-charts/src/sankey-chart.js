// ─── @uploop-vibe/vibe-charts SankeyChart ────────────────────
// Flow diagram showing magnitude between nodes using SVG bezier curves.
// Left-to-right layering: nodes grouped by depth, links drawn as curved paths
// with thickness proportional to value.

import { component } from '@uploop/html'
import { getColor } from './utils.js'

export const SankeyChart = component('VibeSankeyChart', {
  state: {
    nodes: [],           // { id, label, color? }[]
    links: [],           // { source, target, value, color? }[]
    width: 600,
    height: 400,
    nodeWidth: 20,
    nodePadding: 24,
    title: '',
    showValues: true,
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setData: (s, { nodes, links }) => ({ ...s, nodes: nodes || [], links: links || [] }),
  },

  view(state) {
    const { nodes, links, width, height, nodeWidth, nodePadding, title, showValues } = state
    const w = width, h = height
    const nodeList = Array.isArray(nodes) ? nodes : []
    const linkList = Array.isArray(links) ? links : []

    if (!nodeList.length) {
      return `<svg width="${w}" height="${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="var(--vibe-color-muted)">No data</text></svg>`
    }

    // ── Layer assignment (simple left-to-right by reachability) ──
    const layers = assignLayers(nodeList, linkList)
    const columnCount = Math.max(1, ...Object.values(layers).map(l => l.layer)) + 1

    // ── Position nodes ──
    const pad = { top: title ? 36 : 16, bottom: 16, left: 16, right: 16 }
    const availableW = w - pad.left - pad.right
    const availableH = h - pad.top - pad.bottom
    const colWidth = availableW / Math.max(1, columnCount)

    const nodeMap = new Map()
    // Group nodes by layer
    const layerGroups = {}
    for (const [id, { layer }] of Object.entries(layers)) {
      if (!layerGroups[layer]) layerGroups[layer] = []
      layerGroups[layer].push(id)
    }

    for (const [layerIdx, ids] of Object.entries(layerGroups)) {
      const li = Number(layerIdx)
      const x = pad.left + li * colWidth + colWidth / 2
      const totalNodeH = ids.length * nodeWidth + (ids.length - 1) * nodePadding
      const startY = pad.top + (availableH - totalNodeH) / 2
      ids.forEach((id, i) => {
        const node = nodeList.find(n => n.id === id)
        const y = startY + i * (nodeWidth + nodePadding)
        nodeMap.set(id, {
          ...node,
          x,
          y,
          x0: x - nodeWidth / 2,
          y0: y,
          w: nodeWidth,
          h: nodeWidth,
        })
      })
    }

    // ── Compute max link value for thickness scaling ──
    const maxVal = Math.max(1, ...linkList.map(l => l.value || 0))

    // ── Build SVG ──
    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;font-family:var(--vibe-font-sans);">`

    if (title) {
      svg += `<text x="${w / 2}" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="var(--vibe-color-fg)">${esc(title)}</text>`
    }

    // ── Links (drawn first, behind nodes) ──
    svg += linkList.map((link, i) => {
      const src = nodeMap.get(link.source)
      const tgt = nodeMap.get(link.target)
      if (!src || !tgt) return ''

      const thickness = Math.max(1, ((link.value || 1) / maxVal) * 18)
      const color = link.color || getColor(i)
      const opacity = Math.max(0.3, Math.min(0.85, (link.value || 1) / maxVal))

      // Source exits from right edge, target enters from left edge
      const x1 = src.x + nodeWidth / 2
      const y1 = src.y + nodeWidth / 2
      const x2 = tgt.x - nodeWidth / 2
      const y2 = tgt.y + nodeWidth / 2

      // Cubic bezier control points: horizontal offset = 40% of distance
      const dx = Math.abs(x2 - x1) * 0.4
      const cx1 = x1 + dx
      const cy1 = y1
      const cx2 = x2 - dx
      const cy2 = y2

      const d = `M${x1.toFixed(1)},${y1.toFixed(1)} C${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`

      let linkSvg = `<path d="${d}" fill="none" stroke="${color}" stroke-width="${thickness.toFixed(1)}" opacity="${opacity.toFixed(2)}" stroke-linecap="round"/>`

      // Value label at midpoint of the curve
      if (showValues && link.value != null) {
        // Approximate midpoint of bezier
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2
        linkSvg += `<text x="${mx.toFixed(1)}" y="${(my - 4).toFixed(1)}" text-anchor="middle" font-size="8" fill="var(--vibe-color-mutedFg)">${formatVal(link.value)}</text>`
      }

      return linkSvg
    }).join('')

    // ── Nodes ──
    svg += nodeList.map((node, i) => {
      const pos = nodeMap.get(node.id)
      if (!pos) return ''
      const color = node.color || getColor(i)

      let nodeSvg = `<rect x="${(pos.x0).toFixed(1)}" y="${(pos.y).toFixed(1)}" width="${nodeWidth}" height="${nodeWidth}" rx="3" fill="${color}" opacity="0.9"/>`

      // Label to the right of node
      const labelX = pos.x + nodeWidth / 2 + 6
      const labelY = pos.y + nodeWidth / 2 + 4
      nodeSvg += `<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" font-size="10" fill="var(--vibe-color-fg)">${esc(node.label || node.id)}</text>`

      return nodeSvg
    }).join('')

    svg += '</svg>'
    return svg
  },
})

// ── Layer Assignment ──────────────────────────────────────────
// Assign each node to a layer using BFS from source nodes.
// Nodes with no incoming links go to layer 0, then propagate.

function assignLayers(nodes, links) {
  const layers = {}
  const nodeIds = new Set(nodes.map(n => n.id))

  // Find root nodes (no incoming links)
  const hasIncoming = new Set()
  for (const l of links) {
    if (nodeIds.has(l.target)) hasIncoming.add(l.target)
  }

  // BFS from roots
  const queue = []
  for (const n of nodes) {
    if (!hasIncoming.has(n.id)) {
      layers[n.id] = { layer: 0 }
      queue.push(n.id)
    }
  }

  // Nodes with no links at all get layer 0
  if (queue.length === 0 && nodes.length > 0) {
    layers[nodes[0].id] = { layer: 0 }
    queue.push(nodes[0].id)
  }

  const adjacency = {}
  for (const n of nodes) adjacency[n.id] = []
  for (const l of links) {
    if (nodeIds.has(l.source) && nodeIds.has(l.target)) {
      adjacency[l.source].push(l.target)
    }
  }

  while (queue.length) {
    const current = queue.shift()
    const currentLayer = layers[current].layer
    for (const neighbor of (adjacency[current] || [])) {
      const nextLayer = currentLayer + 1
      if (!layers[neighbor] || layers[neighbor].layer < nextLayer) {
        layers[neighbor] = { layer: nextLayer }
        queue.push(neighbor)
      }
    }
  }

  // Any unplaced nodes get last layer
  for (const n of nodes) {
    if (!layers[n.id]) {
      const maxLayer = Math.max(0, ...Object.values(layers).map(l => l.layer))
      layers[n.id] = { layer: maxLayer + 1 }
    }
  }

  return layers
}

function formatVal(v) {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M'
  if (v >= 1000) return (v / 1000).toFixed(1) + 'K'
  return v >= 10 ? Math.round(v).toString() : v.toFixed(1)
}

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
