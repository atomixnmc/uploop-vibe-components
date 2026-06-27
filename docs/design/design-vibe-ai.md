# Design: @uploop-vibe/vibe-ai

> **Status:** ✅ v0.1.0 complete
> **Package:** `packages/vibe-ai/`

---

## Overview

The Vibe AI package is the AI bridge layer. It converts high-level intent descriptions into real, runnable Uploop components. This is the breakthrough: AI describes what it wants, Vibe resolves it to working code.

## Core Concepts

### Intent

An intent is a plain JavaScript object describing what you want:

```js
{
  name: 'SaveButton',
  type: 'button',
  props: { label: 'Save', variant: 'solid', size: 'lg' },
  style: { animate: 'scale-in' },
  actions: ['click'],
}
```

### Resolution Pipeline

```
Intent (plain object)
    │
    ▼
resolveComponentIntent(intent)
    │  Maps type → Vibe component
    │  Maps props → component state
    │  Maps style → size/variant resolution
    ▼
{ component: Function, config: { state, update, view } }
    │
    ▼
generateComponent(intent)
    │  Wraps config in component(name, config)
    │  Wires action handlers
    ▼
Uploop component (mountable, subscribable)
```

## Generator

`generator.js` — intent resolver + component generator.

### `resolveComponentIntent(intent) → { component, config }`

Maps intent types to Vibe components:

| intent.type | Vibe component | Config mapping |
|-------------|---------------|----------------|
| `button` | `Button` | label, size, variant, icon, disabled, loading |
| `card` | `Card` | padding, shadow, radius, bordered, hoverable |
| `input` | `Input` | type, placeholder, label, error, hint |
| `textarea` | `Textarea` | placeholder, label, rows |
| `select` | `Select` | value, label, options, placeholder |
| `badge` | `Badge` | label, variant, color, size |
| `avatar` | `Avatar` | src, name, size, status |
| `table` | `Table` | columns, rows, striped, hoverable |
| `tabs` | `Tabs` | tabs, activeTab, variant |
| `modal` | `Modal` | title, size, closeOnOverlay |
| `dialog` | `Dialog` | title, message, confirmLabel, variant |
| `progress` | `Progress` | value, max, size, variant |

### `generateComponent(intent) → component`

Full pipeline: resolve → wire actions → create `component()`.

### `describeComponentIntent(intent) → description`

Introspection for AI consumers — tells what would be generated without creating it.

## Composer

`composer.js` — schema-to-page composition.

### `composeEntityPage(schema, opts) → { page, entityComp, layout, flow }`

Takes an `@uploop/schema` entity and generates a full CRUD page:
- Auto-generates form/table/display views from schema fields
- Wires validation from schema constraints
- Builds page layout (dashboard/form/list/detail)
- Suggests optimal execution flow

### `composeDashboard(opts) → component`

Generates dashboard with widget grid:
- 12-column responsive grid
- Widget cards with title + content slots
- Loading state

### `composeListPage(opts) → component`

Generates list page with:
- Search/filter
- Pagination
- Empty state
- Custom item renderer

## Templates

`templates.js` — pre-built page templates.

| Template | Type | Layout |
|----------|------|--------|
| `signupForm` | form | centered (28rem) |
| `loginForm` | form | centered (24rem) |
| `settings` | settings | sidebar-grid |
| `dashboard` | dashboard | full-width |
| `dataTable` | list | full-width |
| `error404` | stacked | stacked |
| `emptyState` | stacked | stacked |
| `profileCard` | card | card |

### `materializeTemplate(name, overrides) → component`

Resolves a template to a runnable component. Overrides are deep-merged into the template intent.

## Integration with @uploop/schema

The composer leverages `@uploop/schema`'s:
- `entityComponent(schema, opts)` — auto-generates form/table/display configs
- `entityFields(schema)` — extracts field metadata for display
- `intent()` / `resolveIntent()` — fuzzy schema matching for AI
- `intentToken()` — compact token representation for AI communication

## Integration with @uploop/flows

The composer calls `suggestFlow()` from `@uploop/flows` to recommend the optimal execution profile for generated pages. The flow suggestion is returned alongside the generated component.

## Dependencies

```
@uploop-vibe/vibe  → components, design tokens, layout, createPage
@uploop/core       → component() (via @uploop/html)
@uploop/html       → component(), html template tag
@uploop/css        → theme, design tokens
@uploop/schema     → entityComponent(), intent(), resolveIntent()
@uploop/flows      → suggestFlow()
```

## File Structure

```
packages/vibe-ai/src/
├── index.js        # Barrel export
├── generator.js    # resolveComponentIntent, generateComponent, describeComponentIntent
├── composer.js     # composeEntityPage, composeDashboard, composeListPage
└── templates.js    # 8 pre-built templates, materializeTemplate, listTemplates
```
