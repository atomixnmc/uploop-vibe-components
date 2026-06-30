import { describe, it, expect } from 'vitest'
import {
  ErrorCodes,
  createErrorResponse,
  getAlternatives,
  generateCreationSpec,
  createWarningResponse,
  createSuccessResponse,
} from '../src/errors.js'

// ─── ErrorCodes Enum ───────────────────────────────────────────

describe('ErrorCodes', () => {
  it('has all expected error code keys', () => {
    expect(ErrorCodes.COMPONENT_NOT_FOUND).toBe('component_not_found')
    expect(ErrorCodes.LAYOUT_NOT_FOUND).toBe('layout_not_found')
    expect(ErrorCodes.BEHAVIOR_NOT_SUPPORTED).toBe('behavior_not_supported')
    expect(ErrorCodes.GOAL_NOT_RECOGNIZED).toBe('goal_not_recognized')
    expect(ErrorCodes.INVALID_PROP).toBe('invalid_prop')
    expect(ErrorCodes.MISSING_REQUIRED_PROP).toBe('missing_required_prop')
    expect(ErrorCodes.PROP_TYPE_MISMATCH).toBe('prop_type_mismatch')
    expect(ErrorCodes.CONSTRAINT_CONFLICT).toBe('constraint_conflict')
    expect(ErrorCodes.LAYOUT_OVERFLOW).toBe('layout_overflow')
    expect(ErrorCodes.CIRCULAR_DEPENDENCY).toBe('circular_dependency')
    expect(ErrorCodes.ENTITY_FIELD_NOT_FOUND).toBe('entity_field_not_found')
    expect(ErrorCodes.DATA_SOURCE_UNREACHABLE).toBe('data_source_unreachable')
    expect(ErrorCodes.MISSING_LOADING_STATE).toBe('missing_loading_state')
    expect(ErrorCodes.MISSING_EMPTY_STATE).toBe('missing_empty_state')
    expect(ErrorCodes.MISSING_ERROR_STATE).toBe('missing_error_state')
    expect(ErrorCodes.ACCESSIBILITY_GAP).toBe('accessibility_gap')
    expect(ErrorCodes.PERFORMANCE_WARNING).toBe('performance_warning')
  })
})

// ─── createErrorResponse ───────────────────────────────────────

describe('createErrorResponse', () => {
  it('returns structured error for component_not_found with alternatives and suggestedFix', () => {
    const result = createErrorResponse({
      code: 'component_not_found',
      message: 'Component not found',
      value: 'Kanban',
    })

    expect(result.ok).toBe(false)
    expect(result.error).toEqual({
      code: 'component_not_found',
      message: 'Component not found',
      value: 'Kanban',
    })
    expect(result.alternatives).toBeInstanceOf(Array)
    expect(result.alternatives.length).toBeGreaterThan(0)
    // suggestedFix is only set when path is provided alongside alternatives
  })

  it('includes suggestedFix when path is provided for COMPONENT_NOT_FOUND', () => {
    const result = createErrorResponse({
      code: 'component_not_found',
      message: 'Component not found',
      value: 'KanbanBoard',
      path: 'sections.toolbar.components[0].type',
    })

    expect(result.suggestedFix).toEqual({
      op: 'replace',
      path: 'sections.toolbar.components[0].type',
      value: { type: 'Table', props: {} },
      reason: expect.any(String),
    })
  })

  it('returns alternatives for LAYOUT_NOT_FOUND', () => {
    const result = createErrorResponse({
      code: 'layout_not_found',
      message: 'Unknown layout',
      value: 'masonry',
      path: 'layout',
    })

    expect(result.ok).toBe(false)
    expect(result.alternatives.length).toBeGreaterThan(0)
    expect(result.alternatives[0]).toHaveProperty('layout')
    expect(result.alternatives[0]).toHaveProperty('reason')
    expect(result.suggestedFix).toEqual({
      op: 'replace',
      path: 'layout',
      value: 'full-width',
    })
  })

  it('returns alternatives for GOAL_NOT_RECOGNIZED', () => {
    const result = createErrorResponse({
      code: 'goal_not_recognized',
      message: 'Unknown goal',
      value: 'weird_goal',
    })

    expect(result.ok).toBe(false)
    expect(result.alternatives.length).toBeGreaterThan(0)
    expect(result.alternatives[0]).toHaveProperty('goal')
    expect(result.alternatives[0]).toHaveProperty('description')
  })

  it('returns alternatives for BEHAVIOR_NOT_SUPPORTED', () => {
    const result = createErrorResponse({
      code: 'behavior_not_supported',
      message: 'Behavior not supported',
      value: 'magic',
      path: 'behaviors.weird',
    })

    expect(result.ok).toBe(false)
    expect(result.alternatives.length).toBeGreaterThan(0)
    expect(result.suggestedFix).toHaveProperty('op', 'remove')
  })

  it('returns basic error for codes without special alternatives', () => {
    const result = createErrorResponse({
      code: 'invalid_prop',
      message: 'Invalid property',
      value: 42,
      path: 'props.size',
    })

    expect(result.ok).toBe(false)
    expect(result.error).toEqual({
      code: 'invalid_prop',
      message: 'Invalid property',
      path: 'props.size',
      value: 42,
    })
    expect(result.alternatives).toEqual([])
    expect(result.suggestedFix).toBeNull()
  })

  it('omits path and value from error object when not provided', () => {
    const result = createErrorResponse({
      code: 'prop_type_mismatch',
      message: 'Type mismatch',
    })

    expect(result.error).toEqual({
      code: 'prop_type_mismatch',
      message: 'Type mismatch',
    })
  })

  it('includes creationSpec for COMPONENT_NOT_FOUND with value', () => {
    const result = createErrorResponse({
      code: 'component_not_found',
      message: 'Missing component',
      value: 'SuperGrid',
      intent: { description: 'A super grid for data', props: { rows: 10 } },
    })

    expect(result.creationSpec).toBeDefined()
    expect(result.creationSpec.component).toBe('SuperGrid')
    expect(result.creationSpec.description).toBe('A super grid for data')
  })
})

// ─── getAlternatives ───────────────────────────────────────────

describe('getAlternatives', () => {
  it('returns alternatives for a known component', () => {
    const result = getAlternatives('KanbanBoard')

    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('reason')
    expect(result[0].component || result[0].composition).toBeDefined()
  })

  it('returns fallback with Card and Box for unknown component', () => {
    const result = getAlternatives('UnknownThing')

    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBe(2)
    expect(result[0]).toEqual({
      component: 'Card',
      reason: 'Wrap content in Card as a generic container',
    })
    expect(result[1]).toEqual({
      component: 'Box',
      reason: 'Use Box with custom styles as a fallback container',
    })
  })

  it('returns alternatives for DatePicker', () => {
    const result = getAlternatives('DatePicker')
    expect(result.length).toBeGreaterThan(0)
    expect(result.some(a => a.component === 'Input')).toBe(true)
  })
})

// ─── generateCreationSpec ──────────────────────────────────────

describe('generateCreationSpec', () => {
  it('returns a spec with template string', () => {
    const spec = generateCreationSpec('MyComponent', { category: 'layout' })

    expect(spec.component).toBe('MyComponent')
    expect(spec.category).toBe('layout')
    expect(spec.template).toEqual(expect.stringContaining('import { component }'))
    expect(spec.template).toEqual(expect.stringContaining('MyComponent'))
    expect(spec.template).toEqual(expect.stringContaining('@uploop/html'))
    expect(spec.props).toEqual({ required: {}, optional: {} })
    expect(spec.states).toHaveProperty('default')
    expect(spec.states).toHaveProperty('loading')
    expect(spec.states).toHaveProperty('empty')
    expect(spec.states).toHaveProperty('error')
    expect(spec.a11y).toBeDefined()
    expect(spec.complexity).toBe('medium')
  })

  it('defaults category to uncategorized when not provided', () => {
    const spec = generateCreationSpec('Foo')
    expect(spec.category).toBe('uncategorized')
  })

  it('uses context.props as required props', () => {
    const spec = generateCreationSpec('Bar', {
      props: { title: 'string', count: 'number' },
    })
    expect(spec.props.required).toEqual({ title: 'string', count: 'number' })
  })

  it('uses context.purpose as description', () => {
    const spec = generateCreationSpec('Baz', { purpose: 'A baz component' })
    expect(spec.description).toBe('A baz component')
  })

  it('uses context.similarTo as similarComponents', () => {
    const spec = generateCreationSpec('Qux', { similarTo: ['Foo', 'Bar'] })
    expect(spec.similarComponents).toEqual(['Foo', 'Bar'])
  })
})

// ─── createWarningResponse ─────────────────────────────────────

describe('createWarningResponse', () => {
  it('returns structured warning response', () => {
    const result = createWarningResponse({
      code: 'missing_loading_state',
      message: 'No loading state defined',
      path: 'sections.data.components[0]',
      fix: 'Add Skeleton',
    })

    expect(result.ok).toBe(true)
    expect(result.warning).toEqual({
      code: 'missing_loading_state',
      message: 'No loading state defined',
      severity: 'high',
      path: 'sections.data.components[0]',
      suggestedFix: 'Add Skeleton',
    })
  })

  it('assigns high severity to missing_* codes', () => {
    const result = createWarningResponse({
      code: 'missing_empty_state',
      message: 'Empty state missing',
    })
    expect(result.warning.severity).toBe('high')
  })

  it('assigns medium severity to accessibility codes', () => {
    const result = createWarningResponse({
      code: 'accessibility_gap',
      message: 'Missing alt text',
    })
    expect(result.warning.severity).toBe('medium')
  })

  it('assigns low severity to other codes', () => {
    const result = createWarningResponse({
      code: 'performance_warning',
      message: 'Slow render',
    })
    expect(result.warning.severity).toBe('low')
  })

  it('omits optional fields when not provided', () => {
    const result = createWarningResponse({
      code: 'missing_error_state',
      message: 'No error state',
    })

    expect(result.warning).not.toHaveProperty('path')
    expect(result.warning).not.toHaveProperty('suggestedFix')
  })
})

// ─── createSuccessResponse ─────────────────────────────────────

describe('createSuccessResponse', () => {
  it('returns ok: true with empty warnings by default', () => {
    const result = createSuccessResponse()

    expect(result.ok).toBe(true)
    expect(result.warnings).toEqual([])
  })

  it('returns warnings when provided', () => {
    const warnings = [
      { code: 'missing_loading_state', message: 'No loading' },
      { code: 'accessibility_gap', message: 'No alt' },
    ]
    const result = createSuccessResponse(warnings)

    expect(result.ok).toBe(true)
    expect(result.warnings).toBe(warnings)
  })
})
