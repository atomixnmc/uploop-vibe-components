import { describe, it, expect } from 'vitest'
import { applyTransform, applyTransforms, diff } from '../src/transforms.js'

// ─── applyTransform — add ──────────────────────────────────────

describe('applyTransform', () => {
  describe('op: add', () => {
    it('adds a value at the specified path on an object', () => {
      const target = { sections: { header: {} } }
      const result = applyTransform(target, {
        op: 'add',
        path: 'sections.header.title',
        value: 'Dashboard',
      })

      expect(result.ok).toBe(true)
      expect(target.sections.header.title).toBe('Dashboard')
    })

    it('adds a value to an array at a specific index', () => {
      const target = { items: ['a', 'b', 'c'] }
      const result = applyTransform(target, {
        op: 'add',
        path: 'items[1]',
        value: 'x',
      })

      expect(result.ok).toBe(true)
      expect(target.items).toEqual(['a', 'x', 'b', 'c'])
    })

    it('pushes to array when index is out of bounds', () => {
      const target = { items: ['a', 'b'] }
      const result = applyTransform(target, {
        op: 'add',
        path: 'items[99]',
        value: 'z',
      })

      expect(result.ok).toBe(true)
      expect(target.items).toEqual(['a', 'b', 'z'])
    })

    it('returns error when no value is provided', () => {
      const target = { sections: { header: {} } }
      const result = applyTransform(target, {
        op: 'add',
        path: 'sections.header.title',
      })

      expect(result.ok).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error.error.code).toBe('missing_required_prop')
    })
  })

  // ─── applyTransform — remove ──────────────────────────────

  describe('op: remove', () => {
    it('removes a key from an object', () => {
      const target = { sections: { header: { title: 'Old', subtitle: 'Sub' } } }
      const result = applyTransform(target, {
        op: 'remove',
        path: 'sections.header.subtitle',
      })

      expect(result.ok).toBe(true)
      expect(target.sections.header).toEqual({ title: 'Old' })
      expect(target.sections.header.subtitle).toBeUndefined()
    })

    it('removes an element from an array by index', () => {
      const target = { items: ['a', 'b', 'c'] }
      const result = applyTransform(target, {
        op: 'remove',
        path: 'items[1]',
      })

      expect(result.ok).toBe(true)
      expect(target.items).toEqual(['a', 'c'])
    })

    it('returns error when path does not exist', () => {
      const target = { sections: {} }
      const result = applyTransform(target, {
        op: 'remove',
        path: 'sections.nonexistent.field',
      })

      expect(result.ok).toBe(false)
    })

    it('returns error when array index is out of bounds', () => {
      const target = { items: ['a'] }
      const result = applyTransform(target, {
        op: 'remove',
        path: 'items[99]',
      })

      expect(result.ok).toBe(false)
    })
  })

  // ─── applyTransform — replace ─────────────────────────────

  describe('op: replace', () => {
    it('replaces an existing value on an object', () => {
      const target = { config: { theme: 'light' } }
      const result = applyTransform(target, {
        op: 'replace',
        path: 'config.theme',
        value: 'dark',
      })

      expect(result.ok).toBe(true)
      expect(target.config.theme).toBe('dark')
    })

    it('replaces an element in an array by index', () => {
      const target = { items: ['a', 'b', 'c'] }
      const result = applyTransform(target, {
        op: 'replace',
        path: 'items[1]',
        value: 'x',
      })

      expect(result.ok).toBe(true)
      expect(target.items).toEqual(['a', 'x', 'c'])
    })

    it('returns error when intermediate path does not exist', () => {
      const target = { config: {} }
      const result = applyTransform(target, {
        op: 'replace',
        path: 'config.missing.nonexistent',
        value: 'new',
      })

      expect(result.ok).toBe(false)
    })
  })

  // ─── applyTransform — unknown op ──────────────────────────

  describe('unknown op', () => {
    it('returns error for an unsupported operation', () => {
      const target = { foo: 'bar' }
      const result = applyTransform(target, {
        op: 'destroy',
        path: 'foo',
      })

      expect(result.ok).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error.error.code).toBe('invalid_prop')
      expect(result.error.error.message).toContain('Unknown transform operation')
    })
  })

  // ─── applyTransform — update ──────────────────────────────

  describe('op: update', () => {
    it('updates an existing value on an object', () => {
      const target = { config: { theme: 'light', version: 1 } }
      const result = applyTransform(target, {
        op: 'update',
        path: 'config.theme',
        value: 'dark',
      })

      expect(result.ok).toBe(true)
      expect(target.config.theme).toBe('dark')
      expect(target.config.version).toBe(1)
    })
  })

  // ─── applyTransform — move ────────────────────────────────

  describe('op: move', () => {
    it('moves a value from one path to another', () => {
      const target = {
        sections: {
          header: { title: 'Dashboard' },
          body: {},
        },
      }
      const result = applyTransform(target, {
        op: 'move',
        from: 'sections.header.title',
        to: 'sections.body.heading',
      })

      expect(result.ok).toBe(true)
      expect(target.sections.header.title).toBeUndefined()
      expect(target.sections.body.heading).toBe('Dashboard')
    })
  })

  // ─── applyTransform — addEdge / removeEdge ────────────────

  describe('edge operations', () => {
    it('adds an edge to target.edges', () => {
      const target = { nodes: [], edges: [] }
      const result = applyTransform(target, {
        op: 'addEdge',
        edge: { from: 'a', to: 'b' },
      })

      expect(result.ok).toBe(true)
      expect(target.edges).toContainEqual({ from: 'a', to: 'b' })
    })

    it('removes an edge from target.edges', () => {
      const target = {
        nodes: [],
        edges: [
          { from: 'a', to: 'b' },
          { from: 'c', to: 'd' },
        ],
      }
      const result = applyTransform(target, {
        op: 'removeEdge',
        edge: { from: 'a', to: 'b' },
      })

      expect(result.ok).toBe(true)
      expect(target.edges).toEqual([{ from: 'c', to: 'd' }])
    })
  })

  // ─── applyTransform — rewire ──────────────────────────────

  describe('op: rewire', () => {
    it('changes the target of an existing edge', () => {
      const target = {
        nodes: [],
        edges: [{ from: 'fetch', to: 'table' }],
      }
      const result = applyTransform(target, {
        op: 'rewire',
        edge: { from: 'fetch', to: 'table' },
        newTarget: 'newTable',
      })

      expect(result.ok).toBe(true)
      expect(target.edges[0].to).toBe('newTable')
    })
  })

  // ─── applyTransform — addState / setBehavior ──────────────

  describe('op: addState', () => {
    it('adds a state to the target', () => {
      const target = { sections: {} }
      const result = applyTransform(target, {
        op: 'addState',
        state: 'loading',
        value: { component: 'Skeleton' },
      })

      expect(result.ok).toBe(true)
      expect(target.states.loading).toEqual({ component: 'Skeleton' })
    })
  })

  describe('op: setBehavior', () => {
    it('sets a behavior on the target', () => {
      const target = {}
      const result = applyTransform(target, {
        op: 'setBehavior',
        behavior: 'reactive',
        value: true,
      })

      expect(result.ok).toBe(true)
      expect(target.behaviors.reactive).toBe(true)
    })
  })
})

// ─── applyTransforms (atomic) ──────────────────────────────────

describe('applyTransforms', () => {
  it('applies multiple transforms and returns ok', () => {
    const target = {
      title: 'Old',
      sections: { header: {} },
    }
    const transforms = [
      { op: 'replace', path: 'title', value: 'New' },
      { op: 'add', path: 'sections.header.subtitle', value: 'Sub' },
    ]

    const result = applyTransforms(target, transforms)

    expect(result.ok).toBe(true)
    expect(result.applied).toBe(2)
    expect(result.failures).toEqual([])
    expect(target.title).toBe('New')
    expect(target.sections.header.subtitle).toBe('Sub')
  })

  it('rolls back and returns failures if any transform fails', () => {
    const target = {
      title: 'Original',
      items: ['a', 'b'],
    }
    const transforms = [
      { op: 'replace', path: 'title', value: 'Changed' },
      { op: 'remove', path: 'items[99]' }, // fails: index out of bounds
      { op: 'add', path: 'items[0]', value: 'x' },
    ]

    const result = applyTransforms(target, transforms)

    expect(result.ok).toBe(false)
    expect(result.applied).toBe(0)
    expect(result.failures.length).toBeGreaterThan(0)
    expect(result.failures[0]).toHaveProperty('transform')
    expect(result.failures[0]).toHaveProperty('error')
  })
})

// ─── diff ──────────────────────────────────────────────────────

describe('diff', () => {
  it('returns empty arrays for identical manifests', () => {
    const before = {
      nodes: [{ id: 'a', component: 'Table', props: { rows: 10 } }],
      edges: [{ from: 'fetch', to: 'a' }],
      states: { loading: {} },
    }
    const after = {
      nodes: [{ id: 'a', component: 'Table', props: { rows: 10 } }],
      edges: [{ from: 'fetch', to: 'a' }],
      states: { loading: {} },
    }

    const result = diff(before, after)

    expect(result.added).toEqual([])
    expect(result.removed).toEqual([])
    expect(result.changed).toEqual([])
  })

  it('detects added nodes', () => {
    const before = {
      nodes: [{ id: 'a', component: 'Table' }],
    }
    const after = {
      nodes: [
        { id: 'a', component: 'Table' },
        { id: 'b', component: 'Card' },
      ],
    }

    const result = diff(before, after)

    expect(result.added).toContainEqual({
      type: 'node',
      id: 'b',
      component: 'Card',
    })
  })

  it('detects removed nodes', () => {
    const before = {
      nodes: [
        { id: 'a', component: 'Table' },
        { id: 'b', component: 'Card' },
      ],
    }
    const after = {
      nodes: [{ id: 'a', component: 'Table' }],
    }

    const result = diff(before, after)

    expect(result.removed).toContainEqual({
      type: 'node',
      id: 'b',
      component: 'Card',
    })
  })

  it('detects changed props on nodes', () => {
    const before = {
      nodes: [{ id: 'a', component: 'Table', props: { rows: 10, title: 'Old' } }],
    }
    const after = {
      nodes: [{ id: 'a', component: 'Table', props: { rows: 20, title: 'Old' } }],
    }

    const result = diff(before, after)

    expect(result.changed.length).toBe(1)
    expect(result.changed[0]).toEqual({
      type: 'node',
      id: 'a',
      component: 'Table',
      propChanges: [{ key: 'rows', from: 10, to: 20 }],
    })
  })

  it('detects removed props as changes', () => {
    const before = {
      nodes: [{ id: 'a', component: 'Table', props: { rows: 10, title: 'T' } }],
    }
    const after = {
      nodes: [{ id: 'a', component: 'Table', props: { rows: 10 } }],
    }

    const result = diff(before, after)

    expect(result.changed.length).toBe(1)
    expect(result.changed[0].propChanges).toContainEqual({
      key: 'title',
      from: 'T',
      to: undefined,
    })
  })

  it('detects added edges', () => {
    const before = { edges: [{ from: 'a', to: 'b' }] }
    const after = {
      edges: [
        { from: 'a', to: 'b' },
        { from: 'c', to: 'd' },
      ],
    }

    const result = diff(before, after)

    expect(result.added).toContainEqual({
      type: 'edge',
      from: 'c',
      to: 'd',
    })
  })

  it('detects removed edges', () => {
    const before = {
      edges: [
        { from: 'a', to: 'b' },
        { from: 'c', to: 'd' },
      ],
    }
    const after = { edges: [{ from: 'a', to: 'b' }] }

    const result = diff(before, after)

    expect(result.removed).toContainEqual({
      type: 'edge',
      from: 'c',
      to: 'd',
    })
  })

  it('detects added states', () => {
    const before = { states: { loading: {} } }
    const after = { states: { loading: {}, error: {} } }

    const result = diff(before, after)

    expect(result.added).toContainEqual({
      type: 'state',
      state: 'error',
    })
  })

  it('handles missing nodes/edges gracefully', () => {
    const result = diff({}, {})

    expect(result).toEqual({
      added: [],
      removed: [],
      changed: [],
    })
  })
})
