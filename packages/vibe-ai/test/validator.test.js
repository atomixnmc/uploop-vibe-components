import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @uploop-vibe/vibe before importing the module under test
vi.mock('@uploop-vibe/vibe', () => ({
  componentRegistry: {
    Input: { _stateShape: { value: '', type: 'text', placeholder: '' } },
    Button: { _stateShape: { label: '', variant: 'primary', disabled: false } },
    Table: { _stateShape: { rows: [], columns: [], striped: false } },
    Card: { _stateShape: { title: '', children: [] } },
    Select: { _stateShape: { options: [], value: '', placeholder: '' } },
    Form: { _stateShape: { fields: [], submitLabel: 'Submit' } },
    Textarea: { _stateShape: { value: '', rows: 3, placeholder: '' } },
  },
  listComponents: () => ['Input', 'Button', 'Table', 'Card', 'Select', 'Form', 'Textarea'],
  pageLayouts: {
    'full-width': {},
    centered: {},
    'sidebar-grid': {},
    stacked: {},
  },
}))

import { validateVibeIntent } from '../src/validator.js'

// ─── Valid Intent ──────────────────────────────────────────────

describe('validateVibeIntent', () => {
  describe('valid intents', () => {
    it('returns ok for a valid dashboard intent with entity', () => {
      const result = validateVibeIntent({
        goal: 'dashboard',
        entity: {
          name: 'User',
          fields: [
            { name: 'email', type: 'string' },
            { name: 'age', type: 'number' },
          ],
        },
      })

      expect(result.ok).toBe(true)
      expect(result.errors).toBeUndefined()
    })

    it('returns ok for a valid form intent', () => {
      const result = validateVibeIntent({
        goal: 'form',
        constraints: { layout: 'centered', density: 'compact' },
      })

      expect(result.ok).toBe(true)
    })

    it('returns ok for a landing intent', () => {
      const result = validateVibeIntent({ goal: 'landing' })

      expect(result.ok).toBe(true)
    })
  })

  // ─── Missing Goal ─────────────────────────────────────────

  describe('missing goal', () => {
    it('returns errors when no goal is provided', () => {
      const result = validateVibeIntent({})

      expect(result.ok).toBe(false)
      expect(result.errors).toBeInstanceOf(Array)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].error.code).toBe('goal_not_recognized')
    })

    it('returns errors when goal is an empty string', () => {
      const result = validateVibeIntent({ goal: '' })

      // Empty string is falsy, so it falls into the !intent.goal branch
      expect(result.ok).toBe(false)
    })
  })

  // ─── Unknown Goal ─────────────────────────────────────────

  describe('unknown goal', () => {
    it('returns errors for an unrecognized goal type', () => {
      const result = validateVibeIntent({ goal: 'unknown_goal' })

      expect(result.ok).toBe(false)
      expect(result.errors).toBeInstanceOf(Array)
      expect(result.errors[0].error.code).toBe('goal_not_recognized')
      expect(result.errors[0].error.value).toBe('unknown_goal')
    })
  })

  // ─── Layout Validation ────────────────────────────────────

  describe('layout validation', () => {
    it('returns errors for an unrecognized layout', () => {
      const result = validateVibeIntent({
        goal: 'form',
        constraints: { layout: 'bogus' },
      })

      expect(result.ok).toBe(false)
      expect(result.errors).toBeInstanceOf(Array)
      const layoutError = result.errors.find(
        (e) => e.error.code === 'layout_not_found',
      )
      expect(layoutError).toBeDefined()
      expect(layoutError.error.value).toBe('bogus')
    })

    it('accepts recognized layout values', () => {
      const result = validateVibeIntent({
        goal: 'form',
        constraints: { layout: 'stacked' },
      })

      expect(result.ok).toBe(true)
    })
  })

  // ─── Component Validation ─────────────────────────────────

  describe('component validation', () => {
    it('returns errors for unknown component types in sections', () => {
      const result = validateVibeIntent({
        goal: 'form',
        sections: {
          toolbar: {
            components: [{ type: 'BogusComponent', props: {} }],
          },
        },
      })

      expect(result.ok).toBe(false)
      const compError = result.errors.find(
        (e) => e.error.code === 'component_not_found',
      )
      expect(compError).toBeDefined()
      expect(compError.error.value).toBe('BogusComponent')
    })

    it('returns errors for components missing a type property', () => {
      const result = validateVibeIntent({
        goal: 'form',
        sections: {
          content: {
            components: [{ props: { label: 'test' } }],
          },
        },
      })

      expect(result.ok).toBe(false)
      const missingTypeError = result.errors.find(
        (e) => e.error.code === 'missing_required_prop',
      )
      expect(missingTypeError).toBeDefined()
    })

    it('accepts known component types in sections', () => {
      const result = validateVibeIntent({
        goal: 'form',
        sections: {
          content: {
            components: [{ type: 'Input', props: { value: 'hello' } }],
          },
        },
      })

      expect(result.ok).toBe(true)
    })
  })

  // ─── Behavior Validation ──────────────────────────────────

  describe('behavior validation', () => {
    it('warns about unknown behavior flags', () => {
      const result = validateVibeIntent({
        goal: 'dashboard',
        behaviors: {
          magic: true,
          telepathy: 'enabled',
        },
      })

      expect(result.ok).toBe(true)
      expect(result.warnings).toBeInstanceOf(Array)
      const behaviorWarnings = result.warnings.filter(
        (w) => w.warning.code === 'behavior_not_supported',
      )
      expect(behaviorWarnings.length).toBe(2)
    })

    it('accepts known behaviors without warnings', () => {
      const result = validateVibeIntent({
        goal: 'dashboard',
        behaviors: {
          reactive: true,
          realtime: true,
        },
      })

      expect(result.ok).toBe(true)
      const behaviorWarnings = (result.warnings || []).filter(
        (w) => w.warning.code === 'behavior_not_supported',
      )
      expect(behaviorWarnings.length).toBe(0)
    })
  })

  // ─── Entity Field Validation ──────────────────────────────

  describe('entity field validation', () => {
    it('returns errors for entity fields missing a name', () => {
      const result = validateVibeIntent({
        goal: 'data-management',
        entity: {
          name: 'Task',
          fields: [{ type: 'string' }],
        },
      })

      expect(result.ok).toBe(false)
      const fieldError = result.errors.find(
        (e) => e.error.code === 'invalid_prop',
      )
      expect(fieldError).toBeDefined()
    })

    it('warns about unknown field types', () => {
      const result = validateVibeIntent({
        goal: 'data-management',
        entity: {
          name: 'Task',
          fields: [{ name: 'priority', type: 'weird_type' }],
        },
      })

      // Missing name error isn't triggered here, but unknown type warns
      expect(result.ok).toBe(true)
      expect(result.warnings).toBeDefined()
      if (result.warnings) {
        const typeWarning = result.warnings.find(
          (w) => w.warning.code === 'prop_type_mismatch',
        )
        expect(typeWarning).toBeDefined()
      }
    })
  })

  // ─── Density/Animation Constraints ────────────────────────

  describe('constraint warnings', () => {
    it('warns about unknown density values', () => {
      const result = validateVibeIntent({
        goal: 'dashboard',
        constraints: { density: 'ultra-tight' },
      })

      expect(result.warnings).toBeDefined()
      if (result.warnings) {
        const densityWarning = result.warnings.find(
          (w) => w.warning.code === 'invalid_prop' && w.warning.path === 'constraints.density',
        )
        expect(densityWarning).toBeDefined()
      }
    })

    it('warns about unknown animation values', () => {
      const result = validateVibeIntent({
        goal: 'dashboard',
        constraints: { animation: 'disco' },
      })

      expect(result.warnings).toBeDefined()
      if (result.warnings) {
        const animWarning = result.warnings.find(
          (w) => w.warning.code === 'invalid_prop' && w.warning.path === 'constraints.animation',
        )
        expect(animWarning).toBeDefined()
      }
    })
  })

  // ─── Module Structure ─────────────────────────────────────

  describe('module structure', () => {
    it('exports validateVibeIntent as a function', () => {
      expect(typeof validateVibeIntent).toBe('function')
    })
  })
})
