# AI ↔ Vibe Protocol: What the AI Gives, What Vibe Returns, and Why the Loop Works

> **Brainstorming session** · 2026-06-27
>
> Core question: What information does an AI need to provide to get back a usable UI?
> What makes that UI inspectable, improvable, and iterable by the AI itself?

---

## Part 1: The AI Input — What the AI Must Provide

There are three escalating levels of AI input, from "I know exactly what I want" to "I have a vague goal."

### Level 1: Explicit Intent (Current)

The AI knows exactly which components and props it wants.

```js
// AI provides: full component specification
{
  type: 'list',
  sections: {
    header: { component: 'heading', props: { text: 'Users', level: 'h1' } },
    toolbar: {
      components: [
        { id: 'search', type: 'searchInput', props: { placeholder: 'Search users...' } },
        { id: 'addBtn', type: 'button', props: { label: 'Add User', variant: 'solid' } }
      ]
    },
    content: {
      components: [
        { id: 'userTable', type: 'table', props: { columns: [...], rows: 'data.users' } }
      ]
    }
  }
}
```

**Pros**: Deterministic. Predictable. Testable.
**Cons**: The AI must know Vibe's component catalog. High token cost for complex pages. No flexibility.

### Level 2: Goal-Driven Intent (Next 3 months)

The AI describes **what the user wants to accomplish**, and Vibe resolves it to components.

```js
// AI provides: goal + constraints + data shape
{
  goal: 'data-management',
  description: 'A page to view, search, and manage users with bulk actions',
  entity: {
    name: 'User',
    fields: [
      { name: 'name', type: 'string', display: 'primary' },
      { name: 'email', type: 'email', display: 'primary' },
      { name: 'role', type: 'enum', values: ['admin', 'editor', 'viewer'], display: 'filterable' },
      { name: 'status', type: 'enum', values: ['active', 'inactive'], display: 'badge' },
      { name: 'createdAt', type: 'date', display: 'secondary' }
    ]
  },
  actions: ['create', 'edit', 'delete', 'export', 'bulk-delete'],
  constraints: {
    density: 'comfortable',
    responsiveness: 'desktop-first',
    accessibility: 'AA'
  }
}

// Vibe resolves → component tree with reasoning
// "User entity with 5 fields → Table with 5 columns"
// "status is enum with 'display: badge' → Badge component in status column"
// "role is 'filterable' → SegmentedControl in toolbar for role filtering"
// "6 actions → Dropdown for bulk, individual buttons for create/edit/delete"
// "search + filter → SearchInput + SegmentedControl in toolbar"
```

**Pros**: AI doesn't need to know Vibe internals. Lower token cost. Reasoning is transparent.
**Cons**: Resolver must be smart. Edge cases need handling. May guess wrong.

### Level 3: Natural Language Intent (Long-term)

The AI describes the page in plain language. Vibe parses, resolves, and composes.

```js
// AI provides: natural language
"I need a settings page where users can edit their profile photo and name at the top,
manage notification preferences grouped by email, push, and SMS categories with toggles,
and see a danger zone at the bottom with a delete account button behind a confirmation dialog."
```

**Pros**: Zero learning curve for AI. Maximum expressiveness.
**Cons**: Parsing is hard. Ambiguity resolution. Requires LLM in the loop or sophisticated NLP.

### What the AI MUST Provide at Minimum

Regardless of level, the AI must provide:

| Required | Why |
|----------|-----|
| **Goal type** | What kind of page? (list, form, dashboard, settings, detail, wizard, landing) |
| **Data shape** | What entity/entities are involved? What fields? |
| **Actions** | What can the user do? (create, edit, delete, search, filter, export, etc.) |
| **Constraints** (optional) | Density, responsiveness, accessibility level, theme |

From these four, Vibe can resolve everything else.

---

## Part 2: The Vibe Output — What Makes the UI Usable, Inspectable, Improvable

The output is not just a rendered page. It's a **living, inspectable, addressable graph** that the AI can read, modify, and verify.

### 2.1 The Rendered UI (Usable)

The user sees a real, interactive, theme-able page. Components are wired together with working data flow, event handling, and state management.

```js
const { page, manifest } = await compose({
  goal: 'data-management',
  entity: userEntity,
  actions: ['create', 'edit', 'delete', 'search', 'export']
})

page.mount(document.getElementById('app'))
// → User sees: Header "Users" | [Search...] [Add User] [Export]
//              Table with 5 columns, striped, hoverable
//              Role filter tabs above table
//              Pagination at bottom
```

### 2.2 The Graph Manifest (Inspectable)

Every composed page exports a `describe()` manifest — a complete, JSON-serializable map of what exists, what it does, and how it connects.

```js
manifest = {
  kind: 'uploop-vibe.page',
  version: '0.1.0',
  intent: { goal: 'data-management', entity: 'User', actions: [...] },
  
  // What components are on the page, where they are, what props they have
  nodes: [
    { 
      id: 'page-header',
      type: 'view',
      component: 'Heading',
      props: { level: 'h1', text: 'Users' },
      path: 'sections.header.components[0]'
    },
    {
      id: 'search-input',
      type: 'view', 
      component: 'SearchInput',
      props: { placeholder: 'Search users...', debounce: 300 },
      path: 'sections.toolbar.components[0]'
    },
    {
      id: 'role-filter',
      type: 'view',
      component: 'SegmentedControl',
      props: { options: ['all', 'admin', 'editor', 'viewer'], value: 'all' },
      path: 'sections.toolbar.components[1]'
    },
    {
      id: 'user-table',
      type: 'view',
      component: 'Table',
      props: { columns: [...], rows: 'data.filteredUsers', striped: true },
      path: 'sections.content.components[0]'
    },
    // Data nodes
    { id: 'search-query', type: 'data', value: '' },
    { id: 'role-value', type: 'data', value: 'all' },
    { id: 'users-raw', type: 'data', source: 'api/users' },
    { id: 'filtered-users', type: 'data', derived: true },
    // Update nodes
    { id: 'fetch-users', type: 'update', async: true, metadata: { cache: { ttl: 30000, swr: true } } },
    { id: 'delete-user', type: 'update', async: true, metadata: { confirm: true } },
  ],
  
  // How data and events flow
  edges: [
    { from: 'search-query', to: 'filtered-users', type: 'filter' },
    { from: 'role-value', to: 'filtered-users', type: 'filter' },
    { from: 'users-raw', to: 'filtered-users', type: 'transform' },
    { from: 'filtered-users', to: 'user-table', type: 'renders', target: 'rows' },
    { from: 'search-input', to: 'search-query', type: 'updates', event: 'input' },
    { from: 'role-filter', to: 'role-value', type: 'updates', event: 'change' },
    { from: 'add-btn', to: 'navigate', type: 'event', payload: '/users/new' },
  ],
  
  // Runtime metadata
  execution: {
    flow: 'list',
    debounce: 150,
    cache: { strategy: 'lru', ttl: 120000 },
    swr: true
  },
  
  // What can go wrong and how it's handled
  states: {
    loading: { component: 'Skeleton', props: { count: 5 } },
    empty: { component: 'EmptyState', props: { title: 'No users found', icon: '👥' } },
    error: { component: 'ErrorState', props: { message: 'Failed to load users' } }
  }
}
```

**Why this matters**: An AI agent can read this manifest and understand EVERYTHING about the page — without looking at source code, without accessing the DOM, without running the app. It can:

- Query: "What components are on this page?"
- Audit: "Does every data fetch have a loading state? An error state?"
- Verify: "Is the search input debounced? What's the debounce value?"
- Trace: "If I change the role filter, what gets re-rendered?"

### 2.3 Addressability (Modifiable)

The AI must be able to say "change THIS specific thing" without ambiguity.

```js
// Path-based addressing
{ op: 'update', path: 'sections.toolbar.components[0].props.placeholder', value: 'Filter by name...' }

// Semantic addressing  
{ op: 'update', target: 'search-input', prop: 'placeholder', value: 'Filter by name...' }

// Pattern-based addressing
{ op: 'add', after: 'component:Table', component: { type: 'pagination', props: { pageSize: 20 } } }
```

Each operation is:
- **Validatable**: Can check the path exists before applying
- **Reversible**: Can store the old value and undo
- **Composable**: Multiple operations can be batched into a transaction
- **Safe**: Invalid operations are rejected with a clear error message

### 2.4 Feedback Loop (Improvable)

The AI doesn't just generate once and hope. It iterates.

```
┌──────────────────────────────────────────────────────┐
│                    THE AI LOOP                        │
│                                                      │
│  1. AI describes intent                              │
│       ↓                                              │
│  2. Vibe resolves → component tree                   │
│       ↓                                              │
│  3. Vibe renders → running UI                        │
│       ↓                                              │
│  4. Vibe exports → manifest (describe())              │
│       ↓                                              │
│  5. AI reads manifest → audits, suggests             │
│       ↓                                              │
│  6. AI produces intent patches                       │
│       ↓                                              │
│  7. Vibe applies patches → updated UI                │
│       ↓                                              │
│  8. Vibe diffs manifest (before vs after)             │
│       ↓                                              │
│  9. AI verifies diff matches intent                  │
│       ↓                                              │
│  10. Goto 4 (continuous improvement)                 │
└──────────────────────────────────────────────────────┘
```

The key enablers:
- **diff(beforeManifest, afterManifest)** → what changed? did the right thing change?
- **audit(manifest)** → what's missing? loading states? error handling? accessibility?
- **suggest(manifest, userBehavior)** → what should change based on usage patterns?

---

## Part 3: AI-DevX — Making the Feedback Loop Smooth

### 3.1 Error Messages That Help AI Iterate

When the AI sends an invalid intent, Vibe must respond with actionable errors:

```js
// Bad: AI sends intent with wrong component type
{ type: 'datepicker', props: { ... } }

// Bad response (current):
"Component not found"

// Good response (AI-DevX):
{
  error: 'unknown_component',
  component: 'datepicker',
  message: "Component 'datepicker' is not in the registry.",
  suggestions: [
    { component: 'Input', reason: 'Use Input with type="date" for date input' },
    { component: 'Calendar', reason: 'Calendar component for date selection' },
  ],
  similarComponents: ['Input', 'Select', 'Calendar'],
  docs: '/docs/components/data-entry'
}
```

### 3.2 Intent Validation Before Render

```js
const result = validate(intent)
// → { 
//     valid: false,
//     errors: [
//       { path: 'sections.content.components[0].props.columns', 
//         message: 'columns is required for Table component',
//         fix: { op: 'add', path: '...columns', value: [] } }
//     ],
//     warnings: [
//       { path: 'sections.toolbar', 
//         message: 'Consider adding a SearchInput for better UX with 5+ data fields' }
//     ]
//   }
```

### 3.3 Manifest Diff for Verification

```js
const before = currentPage.describe()
applyPatches(currentPage, patches)
const after = currentPage.describe()

const delta = diff(before, after)
// → {
//     added: [{ id: 'emptyState', component: 'EmptyState' }],
//     removed: [],
//     changed: [{ id: 'searchInput', prop: 'placeholder', from: 'Search...', to: 'Filter by name...' }]
//   }

// AI verifies: "I asked for an empty state and a placeholder change.
//               Did ONLY those things change?"
```

### 3.4 Audit Hooks

```js
// After every composition, run automated audits
const issues = audit(manifest)
// → [
//     { severity: 'warning', type: 'missing_loading_state', 
//       message: 'Table "userTable" fetches data but has no loading state defined' },
//     { severity: 'error', type: 'missing_error_state',
//       message: 'Data fetch "fetch-users" has no error state — page will crash silently on failure' },
//     { severity: 'info', type: 'accessibility',
//       message: 'SearchInput is missing aria-label for screen readers' }
//   ]
```

---

## Part 4: The Minimum Viable Protocol

What must be built first to make this real?

### Phase 1: Manifest Protocol (this session)
Every composed page exports `describe()` with:
- `nodes`: all components, their types, props, and paths
- `edges`: data flow and event connections
- `states`: loading, empty, error definitions

### Phase 2: Addressable Patches (next session)
- `applyPatch(intent, { op, path, value })` → modified intent
- `validate(intent)` → errors + suggestions
- `diff(beforeManifest, afterManifest)` → structured delta

### Phase 3: Audit + Suggest (following session)
- `audit(manifest)` → issues and fixes
- `suggest(manifest, goal)` → improvements based on goal type

### Phase 4: Goal → Intent Resolver
- `resolve({ goal, entity, actions, constraints })` → full intent
- `explain(intent)` → human-readable reasoning for each decision

---

## Part 5: The Data Format — What the AI Actually Sends

The AI sends a single JSON object. No code. No JSX. No framework knowledge.

```jsonc
{
  // REQUIRED: What kind of page?
  "goal": "data-management",   // data-management | form | dashboard | settings | detail | landing
  
  // REQUIRED: What data?
  "entity": {
    "name": "User",
    "fields": [
      { "name": "id", "type": "string", "display": false },
      { "name": "name", "type": "string", "display": "primary" },
      { "name": "email", "type": "email", "display": "primary" },
      { "name": "role", "type": "enum", "values": ["admin","editor","viewer"], "display": "filterable" },
      { "name": "status", "type": "enum", "values": ["active","inactive"], "display": "badge" }
    ]
  },
  
  // REQUIRED: What can the user do?
  "actions": ["create", "edit", "delete", "export", "bulk-delete", "search"],
  
  // OPTIONAL: How should it look/feel?
  "constraints": {
    "density": "comfortable",       // compact | comfortable | spacious
    "layout": "full-width",         // centered | full-width | sidebar-grid | sidebar-right
    "responsiveness": "desktop-first",
    "animation": "minimal",         // none | minimal | rich
    "theme": "light"                // light | dark | system
  },
  
  // OPTIONAL: Specific overrides
  "overrides": {
    "sections.header.title": "User Management",
    "sections.content.pageSize": 25,
    "sections.toolbar.searchPlaceholder": "Filter by name or email..."
  }
}
```

**That's it.** 4 required fields, 1 optional constraint block, 1 optional override block. Vibe resolves everything else.

---

## Summary

| Concept | What it is | Why it matters |
|---------|-----------|----------------|
| **Intent** | What the AI sends (goal + entity + actions) | Deterministic, validatable, low-token |
| **Manifest** | What Vibe returns (`describe()`) | AI can read, audit, verify |
| **Paths** | How to address specific parts | AI can say "change THIS" |
| **Patches** | How to modify | Safe, reversible, composable |
| **Diff** | Before vs after comparison | AI verifies changes |
| **Audit** | Automated quality checks | AI catches missing loading/error/empty states |
| **Validate** | Pre-render safety net | AI gets actionable error messages |
