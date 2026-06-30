// ─── @uploop-vibe/vibe-devutils Serializer Tests ──────────────

import { describe, it, expect } from 'vitest'
import {
  serializeManifest,
  deserializeManifest,
  estimateTokens,
} from '../src/serializer.js'

// Sample manifest fixture
function makeManifest(overrides = {}) {
  return {
    kind: 'uploop-vibe.manifest',
    version: '0.2.0',
    intent: { goal: 'dashboard' },
    layout: 'full-width',
    _auditScore: 85,
    nodes: [
      { id: 'header', type: 'view', component: 'Heading', props: { level: 'h1', text: 'Users' } },
      { id: 'search', type: 'view', component: 'SearchInput', props: { placeholder: 'Search...' } },
      { id: 'table', type: 'view', component: 'Table', props: { striped: 'true' } },
      { id: 'query', type: 'data', value: '' },
      { id: 'results', type: 'data', value: 'api/users', derived: true, source: 'api/users' },
    ],
    edges: [
      { from: 'query', to: 'results', type: 'filter' },
    ],
    states: {
      empty: { component: 'EmptyState', props: { title: 'No data' } },
      loading: { component: 'Spinner', props: {} },
    },
    ...overrides,
  }
}

// ── serializeManifest ─────────────────────────────────────────

describe('serializeManifest', () => {
  it('converts manifest to compact string format', () => {
    const manifest = makeManifest()
    const result = serializeManifest(manifest)

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)

    // Header line
    expect(result).toContain('v:1|g:dashboard|l:full-width|s:85')

    // View nodes
    expect(result).toContain('n:header|Heading|level:h1|text:Users')
    expect(result).toContain('n:search|SearchInput|placeholder:Search...')
    expect(result).toContain('n:table|Table|striped:true')

    // Data nodes
    expect(result).toContain('d:query|')
    expect(result).toContain('d:results|api/users|src:api/users|derived')

    // Edges
    expect(result).toContain('e:query→results|filter')

    // States
    expect(result).toContain('st:empty|EmptyState|title:No data')
    expect(result).toContain('st:loading|Spinner|')
  })

  it('handles minimal manifest', () => {
    const result = serializeManifest({ intent: { goal: 'home' }, nodes: [], edges: [], states: {} })
    expect(result).toBe('v:1|g:home|l:?|s:?')
  })

  it('handles null/undefined gracefully', () => {
    const result = serializeManifest({ intent: {}, nodes: [], edges: [], states: {} })
    expect(result).toContain('g:?')
    expect(result).toContain('l:?')
  })
})

// ── deserializeManifest ───────────────────────────────────────

describe('deserializeManifest', () => {
  it('reconstructs manifest from compact string', () => {
    const serialized = [
      'v:1|g:dashboard|l:full-width|s:85',
      'n:header|Heading|level:h1|text:Users',
      'n:search|SearchInput|placeholder:Search...',
      'd:query||',
      'e:query→results|filter',
      'st:empty|EmptyState|title:No data',
    ].join('\n')

    const manifest = deserializeManifest(serialized)

    expect(manifest.kind).toBe('uploop-vibe.manifest')
    expect(manifest.version).toBe('0.2.0')
    expect(manifest.intent.goal).toBe('dashboard')
    expect(manifest.layout).toBe('full-width')
    expect(manifest._auditScore).toBe(85)

    // Nodes
    expect(manifest.nodes).toHaveLength(3)
    expect(manifest.nodes[0]).toEqual({ id: 'header', type: 'view', component: 'Heading', props: { level: 'h1', text: 'Users' } })
    expect(manifest.nodes[2]).toEqual({ id: 'query', type: 'data', value: '' })

    // Edges
    expect(manifest.edges).toHaveLength(1)
    expect(manifest.edges[0]).toEqual({ from: 'query', to: 'results', type: 'filter' })

    // States
    expect(manifest.states.empty).toEqual({ component: 'EmptyState', props: { title: 'No data' } })
  })

  it('handles boolean props', () => {
    const serialized = 'v:1|g:test|l:stack|s:0\nn:btn|Button|disabled:true|visible:false'
    const manifest = deserializeManifest(serialized)
    expect(manifest.nodes[0].props.disabled).toBe(true)
    expect(manifest.nodes[0].props.visible).toBe(false)
  })

  it('handles data nodes with derived flag', () => {
    const serialized = 'v:1|g:x|l:x|s:0\nd:cache|cached|src:db|derived'
    const manifest = deserializeManifest(serialized)
    expect(manifest.nodes[0].derived).toBe(true)
    expect(manifest.nodes[0].source).toBe('db')
  })
})

// ── Round-trip ────────────────────────────────────────────────

describe('round-trip', () => {
  it('serialize then deserialize preserves key data', () => {
    const original = makeManifest()
    const serialized = serializeManifest(original)
    const reconstructed = deserializeManifest(serialized)

    expect(reconstructed.intent.goal).toBe(original.intent.goal)
    expect(reconstructed.layout).toBe(original.layout)
    expect(reconstructed._auditScore).toBe(original._auditScore)
    expect(reconstructed.nodes).toHaveLength(original.nodes.length)
    expect(reconstructed.edges).toHaveLength(original.edges.length)
    expect(Object.keys(reconstructed.states)).toHaveLength(Object.keys(original.states).length)
  })

  it('preserves node types and ids', () => {
    const original = makeManifest()
    const serialized = serializeManifest(original)
    const reconstructed = deserializeManifest(serialized)

    for (const node of original.nodes) {
      const found = reconstructed.nodes.find(n => n.id === node.id)
      expect(found).toBeDefined()
      expect(found.type).toBe(node.type)
      expect(found.component).toBe(node.component)
    }
  })

  it('preserves edge connections', () => {
    const original = makeManifest()
    const serialized = serializeManifest(original)
    const reconstructed = deserializeManifest(serialized)

    for (const edge of original.edges) {
      const found = reconstructed.edges.find(e => e.from === edge.from && e.to === edge.to)
      expect(found).toBeDefined()
      expect(found.type).toBe(edge.type)
    }
  })
})

// ── estimateTokens ────────────────────────────────────────────

describe('estimateTokens', () => {
  it('returns { full, compact, saved, savings }', () => {
    const manifest = makeManifest()
    const result = estimateTokens(manifest)

    expect(result).toHaveProperty('full')
    expect(result).toHaveProperty('compact')
    expect(result).toHaveProperty('saved')
    expect(result).toHaveProperty('savings')

    expect(typeof result.full).toBe('number')
    expect(typeof result.compact).toBe('number')
    expect(typeof result.saved).toBe('number')
    expect(typeof result.savings).toBe('string')
  })

  it('savings string contains percentage', () => {
    const manifest = makeManifest()
    const result = estimateTokens(manifest)

    expect(result.savings).toContain('%')
  })

  it('compact tokens are <= full tokens', () => {
    const manifest = makeManifest()
    const result = estimateTokens(manifest)

    expect(result.compact).toBeLessThanOrEqual(result.full)
  })

  it('calculates correct savings', () => {
    const manifest = makeManifest()
    const result = estimateTokens(manifest)

    expect(result.saved).toBe(result.full - result.compact)
  })

  it('accepts string argument', () => {
    const serialized = serializeManifest(makeManifest())
    const result = estimateTokens(serialized)

    expect(result.compact).toBe(result.full) // same string for both
    expect(result.saved).toBe(0)
  })

  it('savings string includes token count', () => {
    const manifest = makeManifest()
    const result = estimateTokens(manifest)

    expect(result.savings).toContain('tokens saved')
  })
})
