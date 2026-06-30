// ─── @uploop-vibe/vibe Component Registry Tests ────────────────
import { describe, it, expect } from 'vitest'

import {
  getComponent,
  listComponents,
  componentRegistry,
} from '../src/components/index.js'

// ── getComponent ───────────────────────────────────────────────

describe('getComponent', () => {
  it('returns a component for a known name (Button)', () => {
    const button = getComponent('Button')
    expect(button).toBeDefined()
    expect(typeof button).toBe('function')
  })

  it('returns a component for Card', () => {
    const card = getComponent('Card')
    expect(card).toBeDefined()
    expect(typeof card).toBe('function')
  })

  it('returns a component for Input', () => {
    const input = getComponent('Input')
    expect(input).toBeDefined()
    expect(typeof input).toBe('function')
  })

  it('returns undefined for a nonexistent component', () => {
    expect(getComponent('Nonexistent')).toBeUndefined()
  })

  it('returns undefined for an empty string', () => {
    expect(getComponent('')).toBeUndefined()
  })
})

// ── listComponents (no filter) ─────────────────────────────────

describe('listComponents', () => {
  describe('with no category filter', () => {
    it('returns an array', () => {
      const result = listComponents()
      expect(Array.isArray(result)).toBe(true)
    })

    it('includes Button, Card, and Input', () => {
      const result = listComponents()
      expect(result).toContain('Button')
      expect(result).toContain('Card')
      expect(result).toContain('Input')
    })

    it('returns all registered component names', () => {
      const result = listComponents()
      const directKeys = Object.keys(componentRegistry)
      expect(result).toEqual(directKeys)
    })
  })

  // ── Category filters ──────────────────────────────────────

  describe('with category filter', () => {
    it('"navigation" returns Nav, Dropdown, Tabs', () => {
      const nav = listComponents('navigation')
      expect(nav).toContain('Nav')
      expect(nav).toContain('Dropdown')
      expect(nav).toContain('Tabs')
    })

    it('"navigation" does not include unrelated components', () => {
      const nav = listComponents('navigation')
      expect(nav).not.toContain('Button')
      expect(nav).not.toContain('Card')
    })

    it('"dataviz" returns Sparkline, Gauge, StatsCard, TrendIndicator', () => {
      const dv = listComponents('dataviz')
      expect(dv).toContain('Sparkline')
      expect(dv).toContain('Gauge')
      expect(dv).toContain('StatsCard')
      expect(dv).toContain('TrendIndicator')
    })

    it('"dataviz" has exactly 4 components', () => {
      const dv = listComponents('dataviz')
      expect(dv).toHaveLength(4)
    })

    it('"nonexistent" returns an empty array', () => {
      const result = listComponents('nonexistent')
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })

    it('"layout" returns expected components', () => {
      const layout = listComponents('layout')
      expect(layout).toContain('Container')
      expect(layout).toContain('Grid')
      expect(layout).toContain('Stack')
    })

    it('"feedback" returns Toast, Alert, Spinner', () => {
      const fb = listComponents('feedback')
      expect(fb).toContain('Toast')
      expect(fb).toContain('Alert')
      expect(fb).toContain('Spinner')
    })
  })
})
