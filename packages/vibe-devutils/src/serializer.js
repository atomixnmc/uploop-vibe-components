// ─── @uploop-vibe/vibe-devutils Serializer ───────────────────
// Token-efficient manifest serialization for AI context windows.
// Compact format: ~70% smaller than full JSON. LLM-optimized.

/**
 * Serialize a manifest to a compact, token-efficient format.
 *
 * Compact format:
 *   v:1|g:dashboard|l:full-width|s:85
 *   n:header|Heading|h1|level:h1|text:Users
 *   n:search|SearchInput||placeholder:Search...
 *   n:table|Table||striped:true
 *   d:query||
 *   d:data||api/users
 *   e:query→data|filter
 *   st:empty|EmptyState|title:No data
 *
 * @param {Object} manifest
 * @returns {string} compact serialized form
 */
export function serializeManifest(manifest) {
  const parts = []

  // Header
  parts.push(`v:1|g:${manifest.intent?.goal || '?'}|l:${manifest.layout || '?'}|s:${manifest._auditScore || '?'}`)

  // Nodes
  for (const node of (manifest.nodes || [])) {
    if (node.type === 'view') {
      const props = node.props ? Object.entries(node.props).map(([k, v]) => `${k}:${v}`).join('|') : ''
      parts.push(`n:${node.id || '?'}|${node.component || '?'}|${props}`)
    } else if (node.type === 'data') {
      const extras = []
      if (node.source) extras.push(`src:${node.source}`)
      if (node.derived) extras.push('derived')
      parts.push(`d:${node.id || '?'}|${node.value || ''}|${extras.join('|')}`)
    }
  }

  // Edges
  for (const edge of (manifest.edges || [])) {
    parts.push(`e:${edge.from}→${edge.to}|${edge.type || ''}`)
  }

  // States
  for (const [key, value] of Object.entries(manifest.states || {})) {
    const comp = value?.component || '?'
    const props = value?.props ? Object.entries(value.props).map(([k, v]) => `${k}:${v}`).join('|') : ''
    parts.push(`st:${key}|${comp}|${props}`)
  }

  return parts.join('\n')
}

/**
 * Deserialize a compact manifest back to full form.
 *
 * @param {string} serialized
 * @returns {Object} manifest
 */
export function deserializeManifest(serialized) {
  const lines = serialized.split('\n').filter(Boolean)
  const manifest = {
    kind: 'uploop-vibe.manifest',
    version: '0.2.0',
    intent: {},
    nodes: [],
    edges: [],
    states: {},
  }

  for (const line of lines) {
    const [type, ...rest] = line.split('|')

    if (type === 'v:1') {
      // Header: v:1|g:dashboard|l:full-width|s:85
      for (const part of rest) {
        const [key, val] = part.split(':')
        if (key === 'g') manifest.intent.goal = val
        if (key === 'l') manifest.layout = val
        if (key === 's') manifest._auditScore = parseInt(val)
      }
    } else if (type.startsWith('n:')) {
      // View node: n:id|Component|prop1:val1|prop2:val2
      const id = type.slice(2)
      const component = rest[0]
      const props = {}
      for (let i = 1; i < rest.length; i++) {
        const [key, val] = rest[i].split(':')
        if (key) props[key] = val === 'true' ? true : val === 'false' ? false : val
      }
      manifest.nodes.push({ id, type: 'view', component, props })
    } else if (type.startsWith('d:')) {
      // Data node: d:id|value|src:source|derived
      const id = type.slice(2)
      const value = rest[0]
      const node = { id, type: 'data', value }
      for (let i = 1; i < rest.length; i++) {
        if (rest[i] === 'derived') node.derived = true
        else if (rest[i].startsWith('src:')) node.source = rest[i].slice(4)
      }
      manifest.nodes.push(node)
    } else if (type.startsWith('e:')) {
      // Edge: e:from→to|type
      const edgeStr = type.slice(2)
      const [fromTo, edgeType] = [edgeStr, rest[0] || '']
      const arrowIdx = fromTo.indexOf('→')
      if (arrowIdx > -1) {
        manifest.edges.push({
          from: fromTo.slice(0, arrowIdx),
          to: fromTo.slice(arrowIdx + 1),
          type: edgeType,
        })
      }
    } else if (type.startsWith('st:')) {
      // State: st:empty|Component|prop:val
      const stateName = type.slice(3)
      const component = rest[0]
      const props = {}
      for (let i = 1; i < rest.length; i++) {
        const [key, val] = rest[i].split(':')
        if (key) props[key] = val
      }
      manifest.states[stateName] = { component, props }
    }
  }

  return manifest
}

/**
 * Estimate the token count for a manifest (rough: 1 token ≈ 4 chars).
 *
 * @param {Object|string} manifest — full manifest or serialized string
 * @returns {{ full: number, compact: number, savings: string }}
 */
export function estimateTokens(manifest) {
  const full = typeof manifest === 'string' ? manifest : JSON.stringify(manifest)
  const compact = typeof manifest === 'string' ? manifest : serializeManifest(manifest)

  const fullTokens = Math.ceil(full.length / 4)
  const compactTokens = Math.ceil(compact.length / 4)
  const saved = fullTokens - compactTokens
  const pct = Math.round((saved / fullTokens) * 100)

  return {
    full: fullTokens,
    compact: compactTokens,
    saved,
    savings: `${pct}% smaller (${saved} tokens saved)`,
  }
}
