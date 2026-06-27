// ─── @uploop-vibe/vibe-ai Error System ──────────────────────
// Structured, AI-friendly error responses for every failure mode.
// Every "no" comes with "but here's what you CAN do instead."

/**
 * Error code taxonomy — every failure mode has a code.
 * AI agents can switch on these codes to decide next actions.
 */
export const ErrorCodes = {
  // Missing pieces
  COMPONENT_NOT_FOUND:     'component_not_found',
  LAYOUT_NOT_FOUND:        'layout_not_found',
  BEHAVIOR_NOT_SUPPORTED:  'behavior_not_supported',
  GOAL_NOT_RECOGNIZED:     'goal_not_recognized',

  // Invalid config
  INVALID_PROP:            'invalid_prop',
  MISSING_REQUIRED_PROP:   'missing_required_prop',
  PROP_TYPE_MISMATCH:      'prop_type_mismatch',

  // Impossible requests
  CONSTRAINT_CONFLICT:     'constraint_conflict',
  LAYOUT_OVERFLOW:         'layout_overflow',
  CIRCULAR_DEPENDENCY:     'circular_dependency',

  // Data issues
  ENTITY_FIELD_NOT_FOUND:  'entity_field_not_found',
  DATA_SOURCE_UNREACHABLE: 'data_source_unreachable',

  // Warnings (non-fatal)
  MISSING_LOADING_STATE:   'missing_loading_state',
  MISSING_EMPTY_STATE:     'missing_empty_state',
  MISSING_ERROR_STATE:     'missing_error_state',
  ACCESSIBILITY_GAP:       'accessibility_gap',
  PERFORMANCE_WARNING:     'performance_warning',
}

// ── Component Alternatives ───────────────────────────────────
// When a component isn't found, what CAN the AI use instead?

const componentAlternatives = {
  KanbanBoard: [
    { component: 'Table', reason: 'Use Table with status column for task tracking' },
    { component: 'Card', reason: 'Arrange Cards in Flex columns as a simpler kanban' },
    { composition: ['Flex', 'Card', 'Button'], reason: 'Compose columns with Flex + Card + drag buttons' },
  ],
  DatePicker: [
    { component: 'Input', reason: 'Use Input with type="date" for native date picker' },
    { component: 'Select', reason: 'Use Select with day/month/year dropdowns' },
  ],
  RichTextEditor: [
    { component: 'Textarea', reason: 'Use Textarea for plain text editing' },
    { composition: ['Toolbar', 'Textarea'], reason: 'Compose Toolbar + Textarea for basic rich editing' },
  ],
  GanttChart: [
    { component: 'Timeline', reason: 'Use Timeline for chronological task display' },
    { component: 'Table', reason: 'Use Table with start/end date columns + Progress bars' },
  ],
  Chart: [
    { component: 'Sparkline', reason: 'Use Sparkline for mini trend charts' },
    { component: 'Gauge', reason: 'Use Gauge for single-value display' },
    { component: 'StatsCard', reason: 'Use StatsCard with trend indicators' },
  ],
  DataGrid: [
    { component: 'Table', reason: 'Use Table with striped, hoverable, and pagination' },
  ],
  ColorPicker: [
    { component: 'Input', reason: 'Use Input with type="color" for native color picker' },
  ],
  FileUpload: [
    { component: 'Input', reason: 'Use Input with type="file" for native file upload' },
  ],
}

/**
 * Find alternatives for a missing component.
 *
 * @param {string} componentName
 * @returns {Array<{ component?: string, composition?: string[], reason: string }>}
 */
export function getAlternatives(componentName) {
  return componentAlternatives[componentName] || [
    { component: 'Card', reason: 'Wrap content in Card as a generic container' },
    { component: 'Box', reason: 'Use Box with custom styles as a fallback container' },
  ]
}

// ── Component Creation Spec ─────────────────────────────────

/**
 * Generate a creation spec for a missing component.
 * This tells the AI (or developer) exactly what to build.
 *
 * @param {string} componentName
 * @param {Object} [context] — what the AI was trying to do
 * @returns {Object} creation spec
 */
export function generateCreationSpec(componentName, context = {}) {
  const baseSpec = {
    component: componentName,
    description: `New component: ${componentName}`,
    category: context.category || 'uncategorized',
    props: {
      required: {},
      optional: {},
    },
    states: {
      default: `Default rendering of ${componentName}`,
      loading: `${componentName} loading state`,
      empty: `${componentName} empty state`,
      error: `${componentName} error state`,
    },
    behaviors: [],
    a11y: {
      keyboardNav: 'Tab through interactive elements',
      screenReader: `Use aria-label on ${componentName} elements`,
      focusManagement: 'Focus first interactive element on mount',
    },
    complexity: 'medium',
    similarComponents: [],
    template: `import { component } from '@uploop/html'

export const ${componentName} = component('${componentName}', {
  state: { /* TODO: define state */ },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view: (state) => '<div class="vibe-${componentName.toLowerCase()}">${componentName}</div>'
})`,
  }

  // Augment with context if available
  if (context.props) {
    baseSpec.props.required = { ...context.props }
  }
  if (context.purpose) {
    baseSpec.description = context.purpose
  }
  if (context.similarTo) {
    baseSpec.similarComponents = context.similarTo
  }

  return baseSpec
}

// ── Error Response Builder ──────────────────────────────────

/**
 * Create a structured error response for the AI.
 *
 * @param {Object} params
 * @param {string} params.code — ErrorCodes key
 * @param {string} params.message — Human-readable explanation
 * @param {string} [params.path] — Path in the intent where the error occurred
 * @param {*} [params.value] — The invalid value provided
 * @param {Object} [params.intent] — The full intent (for context)
 * @returns {Object} structured error response
 */
export function createErrorResponse({ code, message, path, value, intent }) {
  const response = {
    ok: false,
    error: {
      code,
      message,
      ...(path ? { path } : {}),
      ...(value !== undefined ? { value } : {}),
    },
    alternatives: [],
    suggestedFix: null,
  }

  // Add alternatives based on error code
  if (code === ErrorCodes.COMPONENT_NOT_FOUND && value) {
    response.alternatives = getAlternatives(value)
    response.creationSpec = generateCreationSpec(value, {
      purpose: intent?.description || `Component requested via AI intent`,
      props: intent?.props || {},
    })
    // Suggest the first alternative as a fix
    const first = response.alternatives[0]
    if (first && path) {
      if (first.component) {
        response.suggestedFix = {
          op: 'replace',
          path,
          value: { type: first.component, props: intent?.props || {} },
          reason: first.reason,
        }
      }
    }
  }

  if (code === ErrorCodes.LAYOUT_NOT_FOUND && value) {
    response.alternatives = [
      { layout: 'full-width', reason: 'Full-width layout works for most data pages' },
      { layout: 'centered', reason: 'Centered layout for forms and focused content' },
      { layout: 'sidebar-grid', reason: 'Sidebar layout for navigation-heavy pages' },
      { layout: 'stacked', reason: 'Stacked layout for landing pages' },
    ]
    response.suggestedFix = {
      op: 'replace',
      path: path || 'layout',
      value: 'full-width',
    }
  }

  if (code === ErrorCodes.GOAL_NOT_RECOGNIZED && value) {
    response.alternatives = [
      { goal: 'data-management', description: 'CRUD tables with search, filter, actions' },
      { goal: 'form', description: 'Input forms with validation' },
      { goal: 'dashboard', description: 'Widget grid with metrics and charts' },
      { goal: 'settings', description: 'Settings page with sidebar navigation' },
      { goal: 'wizard', description: 'Multi-step sequential form' },
      { goal: 'detail', description: 'Single entity detail view' },
      { goal: 'landing', description: 'Marketing landing page' },
    ]
  }

  if (code === ErrorCodes.BEHAVIOR_NOT_SUPPORTED && value) {
    response.alternatives = [
      { behavior: 'static', reason: 'Static rendering — simplest, most reliable' },
      { behavior: 'reactive', reason: 'Reactive updates on state change' },
    ]
    response.suggestedFix = {
      op: 'remove',
      path: path || 'behaviors',
      reason: 'Remove unsupported behavior and default to reactive',
    }
  }

  return response
}

/**
 * Create a structured warning response (non-fatal).
 *
 * @param {Object} params
 * @param {string} params.code — ErrorCodes key
 * @param {string} params.message — Description of the warning
 * @param {string} [params.path] — Path in the intent
 * @param {string} [params.fix] — Suggested fix description
 * @returns {Object}
 */
export function createWarningResponse({ code, message, path, fix }) {
  return {
    ok: true,
    warning: {
      code,
      message,
      severity: code.startsWith('missing_') ? 'high' : code.startsWith('accessibility') ? 'medium' : 'low',
      ...(path ? { path } : {}),
      ...(fix ? { suggestedFix: fix } : {}),
    },
  }
}

/**
 * Create a successful validation response.
 *
 * @param {Object} [warnings]
 * @returns {Object}
 */
export function createSuccessResponse(warnings = []) {
  return {
    ok: true,
    warnings,
  }
}
