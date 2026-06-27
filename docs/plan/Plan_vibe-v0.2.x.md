# v0.2.x — The AI Feedback Loop

> **Date:** 2026-06-27 · **Status:** Planning → Implementation
> 
> v0.1 proved the component library works. v0.2 makes AI-DevX smooth from day one.
> Every failure is a learning opportunity. Every gap is a spec waiting to be filled.

---

## The Core Insight

When an AI requests something Vibe can't do, the response must be **actionable**. Not "Component not found" — but:

> "`KanbanBoard` doesn't exist yet. Here are similar components you could compose instead (Card + DragDrop + Column). Here's the spec for what `KanbanBoard` would need. Here's how to adjust your intent to work with what exists today."

The AI should never be stuck. Every `no` comes with a `but here's what you can do instead.`

---

## Phase 1: Exception Taxonomy & Structured Error Responses

### Error Categories

```js
// The error taxonomy — every error has a code, message, alternatives, and creation spec

const ErrorCodes = {
  // Missing pieces
  COMPONENT_NOT_FOUND:     'component_not_found',      // AI asked for a component we don't have
  LAYOUT_NOT_FOUND:        'layout_not_found',          // Layout type doesn't exist
  BEHAVIOR_NOT_SUPPORTED:  'behavior_not_supported',    // Behavior flag not implemented
  GOAL_NOT_RECOGNIZED:     'goal_not_recognized',       // Goal type unknown
  
  // Invalid config
  INVALID_PROP:            'invalid_prop',              // Valid component, wrong prop value
  MISSING_REQUIRED_PROP:   'missing_required_prop',     // Required prop not provided
  PROP_TYPE_MISMATCH:      'prop_type_mismatch',        // Prop value has wrong type
  
  // Impossible requests
  CONSTRAINT_CONFLICT:     'constraint_conflict',        // Constraints contradict each other
  LAYOUT_OVERFLOW:         'layout_overflow',           // Too many components for layout
  CIRCULAR_DEPENDENCY:     'circular_dependency',        // Data flow creates a cycle
  
  // Data issues  
  ENTITY_FIELD_NOT_FOUND:  'entity_field_not_found',    // Referenced field doesn't exist in entity
  DATA_SOURCE_UNREACHABLE: 'data_source_unreachable',   // Can't connect to data source
  
  // Warnings (non-fatal)
  MISSING_LOADING_STATE:   'missing_loading_state',     // Data fetch without loading UI
  MISSING_EMPTY_STATE:     'missing_empty_state',       // List/table without empty state
  MISSING_ERROR_STATE:     'missing_error_state',       // Data fetch without error handling
  ACCESSIBILITY_GAP:       'accessibility_gap',         // Missing ARIA, keyboard, contrast
  PERFORMANCE_WARNING:     'performance_warning',       // Debounce recommended, etc.
}
```

### Structured Error Response Format

Every error/warning returned to the AI follows this shape:

```js
{
  // What went wrong
  error: {
    code: 'component_not_found',
    message: "Component 'KanbanBoard' is not in the registry.",
    path: 'sections.content.components[0].type',   // Where in the intent
    value: 'KanbanBoard',                            // What was provided
  },
  
  // What IS available (so the AI can adjust immediately)
  alternatives: [
    {
      approach: 'compose',
      description: 'Build a simple kanban from existing components',
      components: ['Card', 'Button', 'Flex'],
      intent: { /* example intent that works */ }
    },
    {
      approach: 'substitute',
      description: 'Use a Table with status columns instead of kanban columns',
      component: 'Table',
      intent: { /* table-based alternative */ }
    }
  ],
  
  // What would need to be created (spec for a new component)
  creationSpec: {
    component: 'KanbanBoard',
    description: 'A drag-and-drop kanban board with columns, cards, and swimlanes',
    requiredProps: {
      columns: { type: 'array', description: 'Column definitions with id, title, color' },
      cards: { type: 'array', description: 'Card objects with id, title, columnId, order' },
      onCardMove: { type: 'function', description: 'Called when card is dragged to new column' }
    },
    optionalProps: {
      swimlanes: { type: 'array', description: 'Horizontal swimlane grouping' },
      editable: { type: 'boolean', description: 'Allow inline editing of cards' }
    },
    behaviors: ['drag-drop', 'reorder', 'inline-edit'],
    estimatedComplexity: 'high',  // low | medium | high | very-high
    similarExisting: ['Table', 'List', 'Card'],  // Components with related patterns
    implementationGuide: 'Extend Table with drag-drop handlers. Use HTML5 Drag API or pointer events. Column containers are Flex stacks. Cards are Card components with drag handles.'
  },
  
  // How to adjust the intent to make it work NOW
  suggestedFix: {
    op: 'replace',
    path: 'sections.content.components[0]',
    value: { type: 'table', props: { columns: [...], rows: 'data.cards', striped: true } }
  }
}
```

---

## Phase 2: The Validate → Resolve → Audit Pipeline

Every intent goes through three stages:

```
Intent
  │
  ▼
┌──────────┐
│ VALIDATE │  → errors[], warnings[], alternatives[], creationSpecs[]
└──────────┘
  │ (if errors → return to AI with structured feedback)
  ▼
┌──────────┐
│ RESOLVE  │  → { page, manifest }
└──────────┘
  │
  ▼
┌──────────┐
│  AUDIT   │  → warnings[], suggestions[]
└──────────┘
  │
  ▼
Final output: { page, manifest, audit }
```

### Stage 1: Validate

Checks structure, types, and constraints. Returns structured errors.

```js
const result = validateVibeIntent(intent)
// → {
//     valid: false,
//     errors: [ /* structured error objects */ ],
//     warnings: [ /* non-fatal warnings */ ]
//   }
```

Key validation rules:
- Component type exists in registry
- Required props are present
- Prop values match expected types
- Layout type is valid
- Goal type is recognized
- No circular data dependencies
- Entity fields exist in schema
- Constraints don't conflict

### Stage 2: Resolve

If validation passes, resolve the intent to a component tree and manifest.

```js
const { page, manifest } = resolveVibeIntent(intent)
```

### Stage 3: Audit

After resolution, run automated quality checks on the manifest:

```js
const audit = auditManifest(manifest)
// → {
//     score: 85,
//     issues: [
//       { severity: 'warning', code: 'missing_empty_state', path: '...' },
//       { severity: 'info', code: 'accessibility_gap', path: '...' }
//     ],
//     suggestions: [
//       { code: 'add_debounce', path: 'searchInput', value: 300 }
//     ]
//   }
```

Audit rules:
- Every data-fetching component has loading + error + empty states
- Search inputs have debounce
- Forms have validation
- Tables with >20 rows have pagination
- Icon buttons have aria-labels
- Color contrast meets WCAG AA

---

## Phase 3: The Component Creation Spec

When a component is missing, Vibe doesn't just say "not found." It generates a **creation spec** — a structured description of what the new component needs, suitable for:

1. **AI to generate the implementation**: The spec has enough detail for an LLM to write the component code
2. **Human developer to implement**: Clear interface, props, behaviors
3. **Registry to track**: What's been requested, how many times, by whom

```js
// Generated when AI requests a non-existent component
{
  component: 'KanbanBoard',
  category: 'data-display',
  priority: 'requested',        // requested | popular (5+ AI requests) | planned | implemented
  requestCount: 1,
  
  // Interface
  props: {
    required: {
      columns: { type: 'Column[]', desc: 'Board columns' },
      cards: { type: 'Card[]', desc: 'Cards to display' }
    },
    optional: {
      swimlanes: { type: 'Swimlane[]', desc: 'Horizontal grouping' },
      onCardMove: { type: '(cardId, fromCol, toCol, index) => void' },
      editable: { type: 'boolean', default: false },
      cardRenderer: { type: '(card: Card) => string', desc: 'Custom card HTML' }
    }
  },
  
  // Visual spec
  states: {
    default: 'Cards arranged in columns. Drag handles on each card.',
    empty: 'EmptyState per column: "No cards in this column"',
    loading: 'Skeleton cards in each column',
    dragActive: 'Dragged card elevated with shadow. Drop zone highlighted.',
    error: 'ErrorState if card move fails'
  },
  
  // Behavioral spec
  behaviors: [
    { name: 'dragStart', desc: 'Card picked up. Show drag preview. Highlight drop zones.' },
    { name: 'dragOver', desc: 'Card dragged over column. Show insertion indicator.' },
    { name: 'drop', desc: 'Card released. Call onCardMove. Animate to new position.' },
    { name: 'addColumn', desc: 'Button at end of column row to add new column.' },
    { name: 'addCard', desc: 'Button at bottom of each column to add new card.' }
  ],
  
  // Accessibility
  a11y: {
    keyboardNav: 'Arrow keys to move between cards. Space to pick up. Arrow keys to move. Space to drop.',
    screenReader: 'Live region announces card movements. Cards have role="button".',
    focusManagement: 'Focus follows dragged card to new position.'
  },
  
  complexity: 'high',
  similarComponents: ['Table', 'List', 'Card', 'DragDrop'],
  estimatedLines: '~400 lines',
  template: `import { component } from '@uploop/html'\n\nexport const KanbanBoard = component('KanbanBoard', {\n  state: { columns: [], cards: [], dragging: null },\n  // ...\n})`
}
```

---

## Phase 4: The Component Request Queue

As AIs request missing components, Vibe tracks them:

```js
const queue = getComponentRequestQueue()
// → [
//     { component: 'DatePicker', requests: 42, priority: 'critical' },
//     { component: 'KanbanBoard', requests: 7, priority: 'popular' },
//     { component: 'RichTextEditor', requests: 5, priority: 'requested' },
//     { component: 'GanttChart', requests: 3, priority: 'requested' },
//   ]
```

This becomes the roadmap. The most-requested missing components get built first.

---

## Implementation Plan for v0.2.0

### Step 1: `validateVibeIntent(intent) → { valid, errors, warnings }`

New file: `packages/vibe-ai/src/validator.js`

- Component type registry check
- Required prop validation per component
- Type checking for prop values
- Layout type validation
- Goal type recognition
- Constraint conflict detection

### Step 2: Structured error responses

New file: `packages/vibe-ai/src/errors.js`

- `ErrorCodes` enum
- `createErrorResponse(error, intent)` → structured error with alternatives + creation spec
- `createWarningResponse(warning)` → warning with fix suggestion
- Component alternatives mapping (if X not found, suggest Y or Z composition)

### Step 3: `auditManifest(manifest) → { score, issues, suggestions }`

New file: `packages/vibe-ai/src/auditor.js`

- Missing loading/empty/error state detection
- Debounce recommendation for search inputs
- Pagination check for large tables
- Accessibility gap detection (aria-labels, contrast)
- Performance warnings

### Step 4: `resolveVibeIntent(intent) → { page, manifest }`

Enhance: `packages/vibe-ai/src/composer.js`

- Goal → layout mapping (data-management → full-width, form → centered, etc.)
- Entity fields → component mapping (string → Input, enum → SegmentedControl, badge → Badge)
- Actions → toolbar components (search → SearchInput, create → Button, export → Dropdown)
- Constraints → component props (density → Table.compact, animation → Transition presets)
- Manifest generation with nodes + edges

### Step 5: `ComponentCreationSpec` generator

New file: `packages/vibe-ai/src/spec-generator.js`

- Generate creation spec from component name + context
- Track request counts
- Component request queue

### Step 6: Wire into the AI demo page

Update: `examples/vibe-ai/main.js`

- Add "Request Missing Component" section
- Show validation errors with fix suggestions
- Show audit results
- Show component request queue

---

## Files to Create/Modify

| File | Status | Purpose |
|------|--------|---------|
| `packages/vibe-ai/src/validator.js` | New | Intent validation with structured errors |
| `packages/vibe-ai/src/errors.js` | New | Error codes, response builders, alternatives |
| `packages/vibe-ai/src/auditor.js` | New | Manifest quality audit |
| `packages/vibe-ai/src/spec-generator.js` | New | Component creation spec generator |
| `packages/vibe-ai/src/composer.js` | Modify | Add resolveVibeIntent with goal→component mapping |
| `packages/vibe-ai/src/index.js` | Modify | Export new APIs |
| `examples/vibe-ai/main.js` | Modify | Error display, audit display, request queue |
| `docs/progress/progress-v0.2.md` | New | v0.2 progress tracking |
| `docs/plan/Plan_vibe-v0.2.x.md` | New | v0.2 detailed plan |

## Start with `validator.js`

The validator is the foundation — everything else builds on it. It's the first thing the AI hits, so it needs to be right.
