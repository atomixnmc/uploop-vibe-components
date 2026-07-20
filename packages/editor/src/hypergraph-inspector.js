// @uploop-vibe/vibe-editor HyperGraph Inspector
// Shows real-time component state, graph structure, and data flow.

import { component } from '@uploop/html'

/**
 * Deep-inspect any Uploop component instance.
 * Reads live state, graph topology, and event handlers.
 */
export function inspectHyperGraph(comp) {
  const result = {
    name: comp?.name || comp?._name || 'Component',
    kind: 'uploop.component',
    state: {},
    graph: { nodes: [], edges: [] },
    handlers: [],
    resources: [],
  }

  // Read state from loop if available
  if (comp.loop) {
    try {
      const s = comp.loop.get()
      result.state = sanitize(s)
    } catch {}
  } else if (comp._state) {
    result.state = sanitize(comp._state)
  } else if (typeof comp === 'object' && comp !== null) {
    // Plain object — show as state
    for (const [k, v] of Object.entries(comp)) {
      if (k.startsWith('_')) continue
      result.state[k] = typeof v === 'function' ? '[function]' : sanitize(v)
    }
  }

  // Read describe() for graph topology
  if (typeof comp.describe === 'function') {
    try {
      const d = comp.describe()
      result.kind = d.kind || result.kind
      result.name = d.name || result.name
      result.graph.nodes = d.nodes || []
      result.graph.edges = d.edges || []
    } catch {}
  } else if (comp.loop && typeof comp.loop.describe === 'function') {
    try {
      const d = comp.loop.describe()
      result.graph.nodes = d.nodes || []
      result.graph.edges = d.edges || []
    } catch {}
  }

  // Extract update handler names
  if (comp._updateHandlers) {
    result.handlers = Object.keys(comp._updateHandlers)
  } else if (comp.loop?._updateHandlers) {
    result.handlers = Object.keys(comp.loop._updateHandlers)
  }

  return result
}

function sanitize(v) {
  if (v === null || v === undefined) return String(v)
  if (typeof v === 'function') return '[function]'
  if (Array.isArray(v)) {
    if (v.length > 20) return `Array(${v.length})`
    return v.map(sanitize)
  }
  if (typeof v === 'object') {
    const keys = Object.keys(v)
    if (keys.length > 30) return `Object(${keys.length} keys)`
    const out = {}
    for (const k of keys) out[k] = sanitize(v[k])
    return out
  }
  if (typeof v === 'string' && v.length > 200) return v.slice(0, 200) + '...'
  return v
}

// ── Visual Inspector Component ─────────────────────────────

const NODE_COLORS = { data: '#228be6', view: '#40c057', update: '#fab005', effect: '#fa5252', resource: '#7950f2', event: '#fd7e14' }
const NODE_ICONS = { data: 'D', view: 'V', update: 'U', effect: 'E', resource: 'R', event: '↗' }

export const HyperGraphInspector = component('HyperGraphInspector', {
  state: {
    visible: false,
    expanded: {},
    graph: null,
  },

  update: {
    inspect: (s, target) => {
      const graph = inspectHyperGraph(target)
      // Auto-expand first level
      const expanded = {}
      for (const n of (graph.graph.nodes || [])) expanded[n.id] = true
      return { ...s, graph, visible: true, expanded }
    },
    toggle: (s) => ({ ...s, visible: !s.visible }),
    hide: (s) => ({ ...s, visible: false }),
    toggleNode: (s, id) => ({ ...s, expanded: { ...s.expanded, [id]: !s.expanded[id] } }),
  },

  view(state) {
    if (!state.visible || !state.graph) return '<div></div>'

    const { graph, expanded } = state
    const { nodes, edges } = graph.graph

    // Build edge map: from → [to edges]
    const edgeMap = {}
    for (const e of edges) {
      if (!edgeMap[e.from]) edgeMap[e.from] = []
      edgeMap[e.from].push(e)
    }

    return `
    <div style="position:fixed;bottom:1rem;right:1rem;z-index:9998;width:480px;max-height:70vh;overflow:auto;background:#1a1b26;color:#a9b1d6;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,0.5);font-family:'JetBrains Mono','Fira Code',monospace;font-size:11px;line-height:1.5;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #24283b;position:sticky;top:0;background:#1a1b26;z-index:1;">
        <span style="font-weight:700;color:#7aa2f7;">🔍 HyperGraph: ${esc(graph.name)}</span>
        <div style="display:flex;gap:6px;">
          <span style="color:#565f89;font-size:10px;">${nodes.length}N ${edges.length}E</span>
          <button data-up-event="click:hide" style="background:none;border:none;color:#565f89;cursor:pointer;font-size:14px;padding:0 4px;">✕</button>
        </div>
      </div>

      <div style="padding:10px 14px;">
        <!-- State section -->
        <div style="margin-bottom:12px;">
          <div style="font-weight:600;color:#9ece6a;margin-bottom:6px;">📦 State</div>
          <div style="background:#1e2030;border-radius:6px;padding:8px 10px;max-height:200px;overflow:auto;">
            ${formatValue(graph.state)}
          </div>
        </div>

        <!-- Handlers section -->
        ${graph.handlers.length ? `
          <div style="margin-bottom:12px;">
            <div style="font-weight:600;color:#e0af68;margin-bottom:6px;">⚡ Events (${graph.handlers.length})</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${graph.handlers.map(h => `<span style="background:#2a2d3e;color:#e0af68;padding:2px 8px;border-radius:4px;font-size:10px;">${esc(h)}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Graph section -->
        ${nodes.length ? `
          <div>
            <div style="font-weight:600;color:#7dcfff;margin-bottom:6px;">🔗 Graph (${nodes.length} nodes, ${edges.length} edges)</div>
            ${nodes.map(n => renderNode(n, edgeMap[n.id] || [], expanded[n.id])).join('')}
          </div>
        ` : ''}

        ${!nodes.length && !Object.keys(graph.state).length ? `
          <div style="color:#565f89;text-align:center;padding:1rem;">
            No graph structure available.<br>
            <span style="font-size:10px;">Pass a component instance with describe() or loop</span>
          </div>
        ` : ''}
      </div>
    </div>`
  },

  mount(el, ctx) {
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-up-event]')
      if (!btn) return
      const ev = btn.getAttribute('data-up-event')
      if (ev === 'click:hide') ctx.send('hide')
      if (ev === 'click:toggleNode') ctx.send('toggleNode', btn.dataset.nodeId)
    })
  },
})

function renderNode(node, outEdges, isExpanded) {
  const color = NODE_COLORS[node.type] || '#565f89'
  const icon = NODE_ICONS[node.type] || '?'

  let html = `
    <div style="border-left:2px solid ${color};padding:4px 0 4px 10px;margin:2px 0;">
      <div style="display:flex;align-items:center;gap:6px;cursor:pointer;" data-up-event="click:toggleNode" data-node-id="${node.id}">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:4px;background:${color}22;color:${color};font-weight:700;font-size:10px;">${icon}</span>
        <span style="color:#c0caf5;font-weight:500;">${esc(node.id)}</span>
        <span style="color:${color};font-size:10px;">${node.type || '?'}</span>
        ${node.component ? `<span style="color:#9aa5ce;">${esc(node.component)}</span>` : ''}
        ${node.length != null ? `<span style="color:#f9e2af;">×${node.length}</span>` : ''}
      </div>`

  // Show node details when expanded
  if (isExpanded) {
    // Show props
    if (node.props && Object.keys(node.props).length) {
      html += `<div style="margin:4px 0 4px 24px;font-size:10px;color:#787c99;">`
      for (const [k, v] of Object.entries(node.props)) {
        html += `<div><span style="color:#9aa5ce;">${esc(k)}</span>: <span style="color:#c0caf5;">${esc(String(v).slice(0,60))}</span></div>`
      }
      html += `</div>`
    }
    // Show outgoing edges
    if (outEdges.length) {
      html += `<div style="margin:4px 0 4px 24px;font-size:10px;color:#565f89;">`
      for (const e of outEdges) {
        html += `<div>→ <span style="color:#7dcfff;">${esc(e.to)}</span>${e.type ? ` <span style="color:#9ece6a;">[${esc(e.type)}]</span>` : ''}</div>`
      }
      html += `</div>`
    }
    // Show other metadata
    for (const [k, v] of Object.entries(node)) {
      if (['id','type','component','props','length'].includes(k)) continue
      if (v != null && v !== '' && !(Array.isArray(v) && v.length === 0)) {
        html += `<div style="margin:2px 0 2px 24px;font-size:10px;"><span style="color:#9aa5ce;">${esc(k)}</span>: <span style="color:#c0caf5;">${esc(String(v).slice(0,80))}</span></div>`
      }
    }
  }

  html += `</div>`
  return html
}

function formatValue(v, depth = 0) {
  if (depth > 3) return '<span style="color:#565f89;">[nested]</span>'
  const indent = '  '.repeat(depth)

  if (v === null) return `<span style="color:#565f89;">null</span>`
  if (v === undefined) return `<span style="color:#565f89;">undefined</span>`
  if (typeof v === 'boolean') return `<span style="color:#ff9e64;">${v}</span>`
  if (typeof v === 'number') return `<span style="color:#ff9e64;">${v}</span>`
  if (typeof v === 'string') {
    if (v.startsWith('[') && v.endsWith(']')) return `<span style="color:#565f89;">${esc(v)}</span>`
    return `<span style="color:#9ece6a;">"${esc(v)}"</span>`
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return `<span style="color:#565f89;">[]</span>`
    let html = `<div>${indent}[</div>`
    for (let i = 0; i < Math.min(v.length, 20); i++) {
      html += `<div style="margin-left:12px;"><span style="color:#565f89;">${i}:</span> ${formatValue(v[i], depth + 1)}</div>`
    }
    if (v.length > 20) html += `<div style="margin-left:12px;color:#565f89;">... ${v.length - 20} more items</div>`
    html += `<div>${indent}]</div>`
    return html
  }
  if (typeof v === 'object') {
    const keys = Object.keys(v)
    if (keys.length === 0) return `<span style="color:#565f89;">{}</span>`
    let html = `<div>${indent}{</div>`
    for (const k of keys.slice(0, 25)) {
      html += `<div style="margin-left:12px;"><span style="color:#7dcfff;">${esc(k)}</span>: ${formatValue(v[k], depth + 1)}</div>`
    }
    if (keys.length > 25) html += `<div style="margin-left:12px;color:#565f89;">... ${keys.length - 25} more keys</div>`
    html += `<div>${indent}}</div>`
    return html
  }
  return `<span>${esc(String(v).slice(0, 100))}</span>`
}

// ── Global helpers ─────────────────────────────────────────

let _inspectorInst = null

export function showInspector(comp) {
  if (!_inspectorInst) {
    const el = document.createElement('div')
    el.id = 'vibe-hg-inspector'
    document.body.appendChild(el)
    _inspectorInst = HyperGraphInspector.create({})
    _inspectorInst.mount(el)
  }
  _inspectorInst?.loop?.send('inspect', comp)
}

export function hideInspector() {
  _inspectorInst?.loop?.send('hide')
}

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;') }
