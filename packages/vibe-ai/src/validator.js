// ─── @uploop-vibe/vibe-ai Intent Validator ──────────────────
// Validates AI intents before resolution. Returns structured errors
// with alternatives and creation specs for every failure.

import { componentRegistry, listComponents, pageLayouts } from '@uploop-vibe/vibe'
import { ErrorCodes, createErrorResponse, createWarningResponse, createSuccessResponse } from './errors.js'

/**
 * Recognized goal types and their expected structures.
 */
const recognizedGoals = [
  'data-management', 'form', 'dashboard', 'settings',
  'wizard', 'detail', 'landing', 'list', 'editor'
]

/**
 * Recognized layout types.
 */
const recognizedLayouts = Object.keys(pageLayouts)

/**
 * Recognized behavior flags and what they imply.
 */
const knownBehaviors = [
  'reactive', 'static', 'realtime', 'offline-first',
  'collaborative', 'streaming',
]

/**
 * Validate a Vibe intent and return structured errors.
 *
 * @param {Object} intent
 * @param {string} [intent.goal] — What kind of page?
 * @param {Object} [intent.entity] — Data entity
 * @param {string[]} [intent.actions] — User actions
 * @param {Object} [intent.constraints] — Visual/behavioral constraints
 * @param {Object} [intent.sections] — Explicit UI structure
 * @returns {{ ok: boolean, errors?: Array, warnings?: Array }}
 */
export function validateVibeIntent(intent = {}) {
  const errors = []
  const warnings = []

  // ── Goal validation ──────────────────────────────────────

  if (!intent.goal) {
    errors.push(createErrorResponse({
      code: ErrorCodes.GOAL_NOT_RECOGNIZED,
      message: 'No goal specified. A goal is required (e.g., "data-management", "form", "dashboard").',
      path: 'goal',
      value: undefined,
      intent,
    }))
  } else if (!recognizedGoals.includes(intent.goal)) {
    errors.push(createErrorResponse({
      code: ErrorCodes.GOAL_NOT_RECOGNIZED,
      message: `Unknown goal type "${intent.goal}". Recognized goals: ${recognizedGoals.join(', ')}.`,
      path: 'goal',
      value: intent.goal,
      intent,
    }))
  }

  // ── Entity validation ────────────────────────────────────

  if (intent.entity && intent.entity.fields) {
    for (const field of intent.entity.fields) {
      if (!field.name) {
        errors.push(createErrorResponse({
          code: ErrorCodes.INVALID_PROP,
          message: 'Entity field is missing a "name" property.',
          path: `entity.fields`,
          value: field,
          intent,
        }))
      }
      if (field.type && !['string','number','boolean','date','email','url','enum','ref'].includes(field.type)) {
        warnings.push(createWarningResponse({
          code: ErrorCodes.PROP_TYPE_MISMATCH,
          message: `Unknown field type "${field.type}" for field "${field.name}". Treated as string.`,
          path: `entity.fields[${field.name}].type`,
        }))
      }
    }
  }

  // ── Layout validation ────────────────────────────────────

  if (intent.constraints?.layout && !recognizedLayouts.includes(intent.constraints.layout)) {
    errors.push(createErrorResponse({
      code: ErrorCodes.LAYOUT_NOT_FOUND,
      message: `Unknown layout "${intent.constraints.layout}". Recognized layouts: ${recognizedLayouts.join(', ')}.`,
      path: 'constraints.layout',
      value: intent.constraints.layout,
      intent,
    }))
  }

  // ── Behavior validation ──────────────────────────────────

  if (intent.behaviors) {
    for (const [key, value] of Object.entries(intent.behaviors)) {
      if (!knownBehaviors.includes(key) && key !== 'dataRefresh' && key !== 'navigation' && key !== 'validation' && key !== 'dataPersistence' && key !== 'notifications' && key !== 'auditTrail' && key !== 'crossFiltering' && key !== 'drilldown') {
        warnings.push(createWarningResponse({
          code: ErrorCodes.BEHAVIOR_NOT_SUPPORTED,
          message: `Unknown behavior "${key}". Ignored. Supported behaviors: ${knownBehaviors.join(', ')}.`,
          path: `behaviors.${key}`,
        }))
      }
    }
  }

  // ── Sections/component validation ────────────────────────

  if (intent.sections) {
    validateSections(intent.sections, errors, warnings, intent)
  }

  // ── Constraint validation ───────────────────────────────

  if (intent.constraints) {
    if (intent.constraints.density && !['compact','comfortable','spacious'].includes(intent.constraints.density)) {
      warnings.push(createWarningResponse({
        code: ErrorCodes.INVALID_PROP,
        message: `Unknown density "${intent.constraints.density}". Using "comfortable".`,
        path: 'constraints.density',
      }))
    }
    if (intent.constraints.animation && !['none','minimal','rich'].includes(intent.constraints.animation)) {
      warnings.push(createWarningResponse({
        code: ErrorCodes.INVALID_PROP,
        message: `Unknown animation level "${intent.constraints.animation}". Using "minimal".`,
        path: 'constraints.animation',
      }))
    }
  }

  return {
    ok: errors.length === 0,
    ...(errors.length > 0 ? { errors } : {}),
    ...(warnings.length > 0 ? { warnings } : {}),
  }
}

/**
 * Recursively validate section components.
 */
function validateSections(sections, errors, warnings, intent, basePath = 'sections') {
  for (const [key, section] of Object.entries(sections)) {
    const path = `${basePath}.${key}`

    if (section.components && Array.isArray(section.components)) {
      section.components.forEach((comp, i) => {
        validateComponent(comp, errors, warnings, intent, `${path}.components[${i}]`)
      })
    }

    // Recurse into nested sections
    if (typeof section === 'object' && section !== null) {
      for (const [subKey, subValue] of Object.entries(section)) {
        if (subValue && typeof subValue === 'object' && !Array.isArray(subValue) && subValue.components) {
          validateSections({ [subKey]: subValue }, errors, warnings, intent, `${path}.${subKey}`)
        }
      }
    }

    // Validate variant sections
    if (section.variants) {
      for (const [variantName, variantSection] of Object.entries(section.variants)) {
        if (variantSection && typeof variantSection === 'object') {
          validateSections({ [variantName]: variantSection }, errors, warnings, intent, `${path}.variants.${variantName}`)
        }
      }
    }
  }
}

/**
 * Validate a single component in the intent.
 */
function validateComponent(comp, errors, warnings, intent, path) {
  if (!comp.type) {
    errors.push(createErrorResponse({
      code: ErrorCodes.MISSING_REQUIRED_PROP,
      message: 'Component is missing a "type" property.',
      path: `${path}.type`,
      intent,
    }))
    return
  }

  const componentFn = componentRegistry[comp.type.charAt(0).toUpperCase() + comp.type.slice(1)] ||
                      componentRegistry[comp.type]

  if (!componentFn) {
    errors.push(createErrorResponse({
      code: ErrorCodes.COMPONENT_NOT_FOUND,
      message: `Component "${comp.type}" is not in the Vibe registry. Available: ${listComponents().slice(0, 10).join(', ')}...`,
      path: `${path}.type`,
      value: comp.type,
      intent,
    }))
    return
  }

  // Validate props against component's expected state shape
  if (comp.props && typeof comp.props === 'object') {
    const stateShape = componentFn._stateShape || {}
    for (const [propKey, propValue] of Object.entries(comp.props)) {
      // Basic type checking — warn, don't error, for flexibility
      if (stateShape[propKey] !== undefined) {
        const expectedType = typeof stateShape[propKey]
        const actualType = typeof propValue
        if (expectedType !== actualType && stateShape[propKey] !== null && propValue !== null) {
          warnings.push(createWarningResponse({
            code: ErrorCodes.PROP_TYPE_MISMATCH,
            message: `Prop "${propKey}" on ${comp.type}: expected ${expectedType}, got ${actualType}.`,
            path: `${path}.props.${propKey}`,
          }))
        }
      }
    }
  }

  // Warn about missing recommended states
  if (comp.type === 'table' || comp.type === 'list' || comp.type === 'searchInput') {
    if (!intent.states?.empty) {
      warnings.push(createWarningResponse({
        code: ErrorCodes.MISSING_EMPTY_STATE,
        message: `Component "${comp.type}" typically needs an empty state. Consider adding one.`,
        path: `${path}`,
      }))
    }
  }

  if (comp.type === 'table' || comp.type === 'list') {
    if (!intent.states?.loading) {
      warnings.push(createWarningResponse({
        code: ErrorCodes.MISSING_LOADING_STATE,
        message: `Component "${comp.type}" loads data but has no loading state. Add Skeleton or Spinner.`,
        path: `${path}`,
      }))
    }
    if (!intent.states?.error) {
      warnings.push(createWarningResponse({
        code: ErrorCodes.MISSING_ERROR_STATE,
        message: `Component "${comp.type}" has no error state. Add ErrorState for data fetch failures.`,
        path: `${path}`,
      }))
    }
  }
}
