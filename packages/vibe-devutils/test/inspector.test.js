// ─── @uploop-vibe/vibe-devutils Inspector Tests ──────────────

import { describe, it, expect } from 'vitest'
import {
  inspectManifest,
  visualizeGraph,
  exportGraphAsMermaid,
  exportGraphAsJSON,
} from '../src/inspector.js'

// Sample manifest fixture
function makeManifest(overrides = {}) {
  return {
    kind: 'uploop-vibe.manifest',
    version: '0.2.0',
    intent: { goal: 'user-dashboard' },
    layout: 'sidebar',
    _auditScore: 92,
    nodes: [
      { id: 'header', type: 'view', component: 'Heading', props: { level: 'h1', text: 'Dashboard' } },
      { id: 'search', type: 'view', component: 'SearchInput', props: { placeholder: 'Search…' } },
      { id: 'table', type: 'view', component: 'Table', props: { striped: true } },
      { id: 'pager', type: 'view', component: 'Pagination', props: {} },
      { id: 'query', type: 'data', value: '' },
      { id: 'results', type: 'data', value: 'api/users', source: 'api/users' },
      { id: 'reload', type: 'update', component: 'Button', props: {} },
    ],
    edges: [
      { from: 'query', to: 'results', type: 'filter' },
      { from: 'results', to: 'table', type: 'renders' },
      { from: 'pager', to: 'results', type: 'updates' },
      { from: 'reload', to: 'results', type: 'event' },
    ],
    states: {
      empty: { component: 'EmptyState', props: { title: 'No users found' } },
      error: { component: 'ErrorState', props: { message: 'Failed to load' } },
      loading: { component: 'Spinner', props: {} },
    },
    ...overrides,
  }
}

// ── inspectManifest ───────────────────────────────────────────

describe('inspectManifest', () => {
  it('returns object with summary', () => {
    const manifest = makeManifest()
    const result = inspectManifest(manifest)

    expect(result).toBeDefined()
    expect(result.summary).toBeDefined()
    expect(typeof result.summary.totalNodes).toBe('number')
  })

  it('counts node types correctly', () => {
    const manifest = makeManifest()
    const result = inspectManifest(manifest)

    expect(result.summary.viewNodes).toBe(4)   // header, search, table, pager
    expect(result.summary.dataNodes).toBe(2)   // query, results
    expect(result.summary.updateNodes).toBe(1) // reload
    expect(result.summary.totalNodes).toBe(7)
  })

  it('counts edges correctly', () => {
    const manifest = makeManifest()
    const result = inspectManifest(manifest)

    expect(result.summary.totalEdges).toBe(4)
    expect(result.summary.dataFlowEdges).toBe(2)  // filter, renders
    expect(result.summary.eventFlowEdges).toBe(2) // updates, event
  })

  it('detects patterns', () => {
    const manifest = makeManifest()
    const result = inspectManifest(manifest)

    expect(result.patterns.hasSearch).toBe(true)
    expect(result.patterns.hasTable).toBe(true)
    expect(result.patterns.hasForm).toBe(false)
    expect(result.patterns.hasPagination).toBe(true)
  })

  it('reports state coverage', () => {
    const manifest = makeManifest()
    const result = inspectManifest(manifest)

    expect(result.stateCoverage.empty).toBe(true)
    expect(result.stateCoverage.error).toBe(true)
    expect(result.stateCoverage.loading).toBe(true)
    expect(result.stateCoverage.coverage).toBe(3)
    expect(result.stateCoverage.total).toBe(3)
  })

  it('lists component names', () => {
    const manifest = makeManifest()
    const result = inspectManifest(manifest)

    expect(result.components).toContain('Heading')
    expect(result.components).toContain('SearchInput')
    expect(result.components).toContain('Table')
    expect(result.components).toContain('Pagination')
  })

  it('handles empty manifest', () => {
    const result = inspectManifest({ nodes: [], edges: [], states: {} })
    expect(result.summary.totalNodes).toBe(0)
    expect(result.summary.totalEdges).toBe(0)
    expect(result.patterns.hasSearch).toBe(false)
    expect(result.patterns.hasTable).toBe(false)
  })

  it('reports definedStates keys', () => {
    const manifest = makeManifest()
    const result = inspectManifest(manifest)

    expect(result.summary.definedStates).toContain('empty')
    expect(result.summary.definedStates).toContain('error')
    expect(result.summary.definedStates).toContain('loading')
  })
})

// ── visualizeGraph ────────────────────────────────────────────

describe('visualizeGraph', () => {
  it('returns graph data as string', () => {
    const manifest = makeManifest()
    const result = visualizeGraph(manifest)

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes page goal and layout', () => {
    const manifest = makeManifest()
    const result = visualizeGraph(manifest)

    expect(result).toContain('user-dashboard')
    expect(result).toContain('sidebar')
  })

  it('includes component names', () => {
    const manifest = makeManifest()
    const result = visualizeGraph(manifest)

    expect(result).toContain('Heading')
    expect(result).toContain('SearchInput')
    expect(result).toContain('Table')
  })

  it('includes data nodes', () => {
    const manifest = makeManifest()
    const result = visualizeGraph(manifest)

    expect(result).toContain('Data Nodes:')
    expect(result).toContain('query')
    expect(result).toContain('results')
  })

  it('includes edges', () => {
    const manifest = makeManifest()
    const result = visualizeGraph(manifest)

    expect(result).toContain('Edges:')
    expect(result).toContain('→')
  })

  it('marks derived data nodes', () => {
    const manifest = makeManifest()
    // results is already derived:true via makeManifest
    const result = visualizeGraph(manifest)
    // Won't show '(derived)' unless the node has derived:true
    // results is plain data with source, not derived
    // Let's add a derived node
    manifest.nodes.push({ id: 'cached', type: 'data', value: 'cache', derived: true, source: 'api/users' })
    const result2 = visualizeGraph(manifest)
    expect(result2).toContain('derived')
  })
})

// ── exportGraphAsMermaid ──────────────────────────────────────

describe('exportGraphAsMermaid', () => {
  it('returns string starting with graph', () => {
    const manifest = makeManifest()
    const result = exportGraphAsMermaid(manifest)

    expect(typeof result).toBe('string')
    expect(result.startsWith('graph')).toBe(true)
  })

  it('includes node definitions', () => {
    const manifest = makeManifest()
    const result = exportGraphAsMermaid(manifest)

    // View nodes use square brackets
    expect(result).toContain('header[Heading]')
    expect(result).toContain('search[SearchInput]')
    expect(result).toContain('table[Table]')

    // Data nodes use parentheses
    expect(result).toContain('query(')
    expect(result).toContain('results(')
  })

  it('includes edge definitions with types', () => {
    const manifest = makeManifest()
    const result = exportGraphAsMermaid(manifest)

    expect(result).toContain('-->|filter|')
    expect(result).toContain('-->|renders|')
  })

  it('handles manifest with no nodes', () => {
    const result = exportGraphAsMermaid({ nodes: [], edges: [] })
    expect(result).toBe('graph LR\n')
  })
})

// ── exportGraphAsJSON ─────────────────────────────────────────

describe('exportGraphAsJSON', () => {
  it('returns valid JSON string', () => {
    const manifest = makeManifest()
    const result = exportGraphAsJSON(manifest)

    expect(typeof result).toBe('string')

    // Should parse without error
    let parsed
    expect(() => { parsed = JSON.parse(result) }).not.toThrow()
    expect(parsed.kind).toBe('uploop-vibe.manifest')
  })

  it('preserves all keys', () => {
    const manifest = makeManifest()
    const result = exportGraphAsJSON(manifest)
    const parsed = JSON.parse(result)

    expect(parsed.intent.goal).toBe('user-dashboard')
    expect(parsed.layout).toBe('sidebar')
    expect(parsed.nodes).toHaveLength(7)
    expect(parsed.edges).toHaveLength(4)
    expect(Object.keys(parsed.states)).toHaveLength(3)
  })

  it('produces pretty-printed JSON', () => {
    const manifest = makeManifest()
    const result = exportGraphAsJSON(manifest)

    // Pretty-printed JSON has newlines and indentation
    expect(result).toContain('\n')
    expect(result).toContain('  ')
  })
})
