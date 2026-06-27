// ─── @uploop-vibe/vibe-devutils Inspector ────────────────────
// Visualize HyperGraph manifests as interactive diagrams.
// Export as Mermaid, JSON, or ASCII tree.

/**
 * Inspect a page manifest and return a structured summary.
 *
 * @param {Object} manifest — page.describe() output
 * @returns {Object} structured inspection result
 */
export function inspectManifest(manifest) {
  const nodes = manifest.nodes || []
  const edges = manifest.edges || []
  const states = manifest.states || {}

  // Categorize nodes
  const views = nodes.filter(n => n.type === 'view')
  const dataNodes = nodes.filter(n => n.type === 'data')
  const updates = nodes.filter(n => n.type === 'update')

  // Analyze edges
  const dataFlow = edges.filter(e => e.type === 'renders' || e.type === 'filter' || e.type === 'transform')
  const eventFlow = edges.filter(e => e.type === 'updates' || e.type === 'event')

  // Detect patterns
  const hasSearch = views.some(n => n.component === 'SearchInput')
  const hasTable = views.some(n => n.component === 'Table')
  const hasForm = views.some(n => ['Input','Textarea','Select','Checkbox'].includes(n.component))
  const hasPagination = views.some(n => n.component === 'Pagination')
  const hasEmptyState = states.empty !== undefined
  const hasErrorState = states.error !== undefined
  const hasLoadingState = states.loading !== undefined

  return {
    summary: {
      totalNodes: nodes.length,
      viewNodes: views.length,
      dataNodes: dataNodes.length,
      updateNodes: updates.length,
      totalEdges: edges.length,
      dataFlowEdges: dataFlow.length,
      eventFlowEdges: eventFlow.length,
      definedStates: Object.keys(states),
    },
    components: views.map(v => v.component).filter(Boolean),
    patterns: {
      hasSearch,
      hasTable,
      hasForm,
      hasPagination,
    },
    stateCoverage: {
      empty: hasEmptyState,
      error: hasErrorState,
      loading: hasLoadingState,
      coverage: [hasEmptyState, hasErrorState, hasLoadingState].filter(Boolean).length,
      total: 3,
    },
  }
}

/**
 * Visualize a manifest as an ASCII tree (for terminal/AI context).
 *
 * @param {Object} manifest
 * @returns {string}
 */
export function visualizeGraph(manifest) {
  const nodes = manifest.nodes || []
  const edges = manifest.edges || []

  let out = ''
  out += `Page: ${manifest.intent?.goal || 'unknown'}\n`
  out += `Layout: ${manifest.layout || 'unknown'}\n`
  out += `Score: ${manifest._auditScore || '?'}\n\n`

  out += 'Components:\n'
  for (const node of nodes) {
    if (node.type !== 'view') continue
    out += `  ├── ${node.component || '?'}`
    if (node.id) out += ` (${node.id})`
    if (node.props) {
      const keys = Object.keys(node.props).slice(0, 3)
      if (keys.length) out += ` [${keys.join(', ')}]`
    }
    out += '\n'
  }

  out += '\nData Nodes:\n'
  for (const node of nodes) {
    if (node.type !== 'data') continue
    out += `  ├── ${node.id}`
    if (node.source) out += ` <- ${node.source}`
    if (node.derived) out += ` (derived)`
    out += '\n'
  }

  out += '\nEdges:\n'
  for (const edge of edges) {
    out += `  ├── ${edge.from} → ${edge.to}`
    if (edge.type) out += ` [${edge.type}]`
    out += '\n'
  }

  return out
}

/**
 * Export a manifest as a Mermaid diagram (for docs/GitHub).
 *
 * @param {Object} manifest
 * @returns {string} Mermaid graph definition
 */
export function exportGraphAsMermaid(manifest) {
  const nodes = manifest.nodes || []
  const edges = manifest.edges || []

  let out = 'graph LR\n'

  // Define nodes with styles
  for (const node of nodes) {
    const label = node.component || node.id || '?'
    const shape = node.type === 'view' ? `[${label}]` : node.type === 'data' ? `(${label})` : `{${label}}`
    out += `  ${node.id}${shape}\n`
  }

  // Define edges
  for (const edge of edges) {
    out += `  ${edge.from} -->|${edge.type || ''}| ${edge.to}\n`
  }

  return out
}

/**
 * Export a manifest as formatted JSON.
 *
 * @param {Object} manifest
 * @returns {string}
 */
export function exportGraphAsJSON(manifest) {
  return JSON.stringify(manifest, null, 2)
}
