# Generative HyperGraphs: IFS Protocol for Vibe v0.x

> **Date:** 2026-06-27 · **Status:** Design
>
> Vibe 1.x will have a built-in SLM. Vibe 0.x will not. Instead, v0.x exposes a
> **Generative HyperGraph** protocol based on **Iterated Function Systems (IFS)**.
> External AI agents drive the iteration loop. Vibe executes and returns the new graph.

---

## 1. The Architectural Boundary

```
┌─────────────────────────────────────────────────────────┐
│                     VIBE 1.x (Future)                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │   SLM    │───▶│ Reasoning │───▶│ Intent Generation │   │
│  │ (built-in)│    │  Engine   │    │    + Execution    │   │
│  └──────────┘    └──────────┘    └──────────────────┘   │
│  Natural language → understanding → intent → UI          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                     VIBE 0.x (Now)                       │
│  ┌──────────────┐          ┌──────────────────────────┐ │
│  │  AI Agent    │◄────────▶│   Vibe IFS Engine         │ │
│  │  (external)  │  intent  │  ┌────────────────────┐  │ │
│  │  - LLM       │  patches │  │ Generative Graph   │  │ │
│  │  - Human     │─────────▶│  │ - validate         │  │ │
│  │  - Other AI  │ manifest │  │ - apply transform  │  │ │
│  │              │◄─────────│  │ - diff             │  │ │
│  └──────────────┘          │  │ - audit            │  │ │
│                            │  └────────────────────┘  │ │
│                            └──────────────────────────┘ │
│  Deterministic protocol. AI drives. Vibe executes.      │
└─────────────────────────────────────────────────────────┘
```

**The boundary is clean**: Vibe 0.x never understands natural language. It never reasons. It never decides. It executes deterministic transformations on a graph and returns the result. The AI agent (LLM, human, or other) does all understanding, reasoning, and decision-making.

---

## 2. IFS: Iterated Function Systems in HyperGraph Terms

### Mathematical Origin

An **Iterated Function System** is a set of contraction mappings applied repeatedly to an initial set. Each iteration applies all functions, producing a new set. The limit set is a **fractal** — complex structure emerging from simple rules.

```
S₀ = initial set
S₁ = f₁(S₀) ∪ f₂(S₀) ∪ ... ∪ fₙ(S₀)
S₂ = f₁(S₁) ∪ f₂(S₁) ∪ ... ∪ fₙ(S₁)
...
S∞ = fixed point (fractal attractor)
```

### HyperGraph Translation

```
G₀ = initial HyperGraph (seed intent)
G₁ = apply(T₁, G₀)  // AI proposes transform T₁
G₂ = apply(T₂, G₁)  // AI proposes transform T₂ based on G₁'s manifest
...
Gₙ = apply(Tₙ, Gₙ₋₁) // Converged UI graph
```

Where:
- **G** = a Vibe page manifest (typed graph of components, data, edges)
- **T** = a transformation function (intent patch, component addition, rewire)
- **apply(T, G)** = Vibe's deterministic graph transformation
- **The AI agent** chooses which T to apply at each step based on G's current state

### Why IFS?

| IFS Property | HyperGraph Translation |
|-------------|----------------------|
| **Deterministic transforms** | `applyPatch(intent, patch)` always produces the same output for the same input |
| **Iterative refinement** | AI → Vibe → AI loop: each round improves the graph |
| **Convergence** | The UI stabilizes when the AI has no more improvements to suggest |
| **Fractal nature** | Complex pages emerge from repeated application of simple operations (add component, change prop, rewire edge) |
| **Contractive** | Each operation is local — it affects a specific path in the graph, not the whole thing |
| **Union of transforms** | Multiple transforms can be batched into one iteration |

---

## 3. The IFS Protocol

### 3.1 Seed Intent (G₀)

The AI provides the initial seed — what the user wants at a high level:

```js
const G0 = {
  goal: 'data-management',
  entity: { name: 'User', fields: [...] },
  actions: ['search', 'create', 'edit', 'delete'],
  constraints: { density: 'comfortable' }
}
```

### 3.2 Vibe Resolves the Seed (G₀ → G₁)

```js
const { page, manifest: G1 } = resolveVibeIntent(G0)
// G1 is the first materialized graph — Vibe's best guess at what G0 means
// { nodes: [...], edges: [...], states: {...} }
```

### 3.3 AI Audits (reads G₁)

```js
const audit = auditManifest(G1)
// → { score: 72, issues: [missing_empty_state, missing_error_state], suggestions: [...] }

// AI reasons: "Score is 72. Missing error state. Search has no debounce. 
//              Table has no pagination. These are fixable."
```

### 3.4 AI Proposes Transform (T₁)

The AI generates one or more intent patches:

```js
const T1 = [
  { op: 'add', path: 'states.empty', value: { type: 'emptyState', props: { title: 'No users' } } },
  { op: 'add', path: 'states.error', value: { type: 'errorState', props: { message: 'Failed to load' } } },
  { op: 'update', path: 'sections.toolbar.components[0].props.debounce', value: 300 },
]
```

### 3.5 Vibe Applies (G₁ → G₂)

```js
const G2 = applyTransforms(G1, T1)
// Vibe applies each patch. Each is validated before application.
// Returns the new manifest + diff from G1 → G2.
```

### 3.6 AI Verifies (reads G₂)

```js
const delta = diff(G1, G2)
// → { added: [emptyState, errorState], changed: [searchInput.debounce: undefined→300] }

// AI verifies: "I asked for 3 changes. Exactly 3 were applied. The diff matches my intent.
//              No unexpected side effects. Continue."

const audit2 = auditManifest(G2)
// → { score: 94, issues: [], suggestions: [minor_a11y] }

// AI decides: "Score is 94. Good enough. Converge here."
```

### 3.7 Convergence

The loop terminates when:
- `audit.score >= threshold` (AI is satisfied)
- `maxIterations` reached (safety limit)
- AI proposes no more transforms (stable state)
- Human approves (human-in-the-loop)

---

## 4. The Transform System

### Transform Types

```js
// Component-level transforms
{ op: 'add', path: 'sections.content.components', value: { type: 'table', props: {...} } }
{ op: 'remove', path: 'sections.content.components[2]' }
{ op: 'replace', path: 'sections.content.components[0]', value: { type: 'card', props: {...} } }
{ op: 'update', path: 'sections.toolbar.components[0].props.placeholder', value: 'Search...' }
{ op: 'move', from: 'sections.sidebar.components[0]', to: 'sections.header.components[0]' }

// Edge-level transforms
{ op: 'rewire', edge: { from: 'searchQuery', to: 'filteredUsers' }, newTarget: 'allUsers' }
{ op: 'addEdge', edge: { from: 'roleFilter', to: 'userTable', type: 'filters' } }
{ op: 'removeEdge', edge: { from: 'staleData', to: 'chartWidget' } }

// State-level transforms
{ op: 'addState', state: 'loading', value: { component: 'skeleton', props: { count: 5 } } }
{ op: 'addState', state: 'empty', value: { component: 'emptyState', props: { title: 'No data' } } }

// Behavior transforms
{ op: 'setBehavior', behavior: 'dataRefresh', value: 'realtime' }
{ op: 'setBehavior', behavior: 'crossFiltering', value: true }

// Batch transform (atomic)
{ op: 'batch', transforms: [T1, T2, T3] }
```

### Transform Validation

Every transform is validated before application:

```js
function validateTransform(G, transform) {
  // Does the path exist?
  // Is the value valid for the target?
  // Would this create a circular dependency?
  // Would this overflow the layout?
  // Would this violate any constraint?
  
  return { valid: true/false, error: null/structuredError }
}
```

Invalid transforms are **rejected with an error message** — the AI can read the error and propose a different transform.

### Transform Composition

Multiple transforms can be composed into a single iteration:

```js
const T = compose([
  addEmptyState('No users found'),
  addErrorState('Failed to load users'),
  debounceSearch(300),
  addPagination(20),
])

const G2 = applyTransforms(G1, T)
```

---

## 5. The IFS Engine API

```js
// ── IFS Engine ──────────────────────────────────────────────

/**
 * Resolve a seed intent into the first materialized graph.
 */
function resolveSeed(seedIntent) → { page, manifest: G1 }

/**
 * Apply a single transform to a graph.
 * Returns the new graph + the diff from old to new.
 */
function applyTransform(graph, transform) → { manifest: G2, diff: Delta }

/**
 * Apply multiple transforms in one atomic iteration.
 * If any transform fails, the entire batch is rolled back.
 */
function applyTransforms(graph, transforms) → { manifest: G2, diff: Delta, failures: TransformError[] }

/**
 * Diff two graph manifests.
 * Returns structured delta: added, removed, changed, rewired.
 */
function diff(G_before, G_after) → Delta

/**
 * Merge two intents (e.g., base intent + overrides).
 * Conflicts are flagged, not silently resolved.
 */
function mergeIntents(base, overrides) → { intent, conflicts: Conflict[] }

/**
 * Serialize a graph to a compact, token-efficient format
 * suitable for LLM context windows.
 */
function serializeGraph(G) → string

/**
 * Deserialize a compact graph back to a full manifest.
 */
function deserializeGraph(serialized) → G

/**
 * Suggest the next transform to improve the graph.
 * Deterministic heuristic — not AI. AI calls this for inspiration.
 */
function suggestTransform(G) → Transform[]
```

---

## 6. Knowledge and Execution Model

Vibe v0.x has **no understanding** but it has **knowledge**:

| Knowledge Type | What Vibe Knows | How It Uses It |
|---------------|-----------------|----------------|
| **Component catalog** | 98 components, their props, states, behaviors | `resolveVibeIntent` maps entity fields → components |
| **Layout patterns** | 7 layout types, their regions, constraints | Goal → layout mapping |
| **Behavior patterns** | Data fetching, validation, navigation patterns | `behaviors` block in intent |
| **Execution profiles** | 24 pre-tuned flows with lanes, tuning, detection | `suggestFlow(graph)` |
| **Design tokens** | 60+ tokens, theme engine, motion presets | Consistent theming across all generated pages |
| **Audit rules** | Missing state detection, performance checks, accessibility gaps | `auditManifest(G)` |
| **Error taxonomy** | 18 error codes, alternatives, creation specs | `validateVibeIntent(intent)` |

This is **deterministic, encoded knowledge** — not learned, not inferred. It's a rule system, not an AI. But it's a *rich* rule system that an external AI can leverage.

---

## 7. The Generative Engine

The IFS engine is the **execution layer** between the AI agent and the HyperGraph:

```
                    ┌─────────────────────┐
                    │    AI AGENT (LLM)    │
                    │  - Understands NL    │
                    │  - Reasons about UI  │
                    │  - Chooses transforms│
                    └────────┬────────────┘
                             │ intent patches
                             ▼
┌────────────────────────────────────────────────────────┐
│                 VIBE IFS ENGINE (v0.x)                  │
│                                                        │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────┐   │
│  │ Validate │──▶│  Apply   │──▶│      Diff        │   │
│  │Transform │   │Transform │   │  (before/after)  │   │
│  └──────────┘   └──────────┘   └──────────────────┘   │
│                                        │               │
│                                        ▼               │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────┐   │
│  │  Audit   │◀──│ Manifest │◀──│   New HyperGraph │   │
│  │Manifest  │   │  Export  │   │       (Gₙ₊₁)     │   │
│  └──────────┘   └──────────┘   └──────────────────┘   │
│       │                                               │
│       ▼                                               │
│  { score, issues, suggestions }                       │
│       │                                               │
└───────┼───────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────┐
│    AI AGENT (LLM)    │
│  - Reads audit      │
│  - Reads diff       │
│  - Decides: done?   │
│  - Or: new Tₙ₊₁     │
└─────────────────────┘
```

---

## 8. Example: Full IFS Loop

### Seed (AI → Vibe)

```js
const G0 = {
  goal: 'data-management',
  entity: {
    name: 'Product',
    fields: [
      { name: 'name', type: 'string', display: 'primary' },
      { name: 'price', type: 'number', display: 'primary' },
      { name: 'category', type: 'enum', values: ['electronics','clothing','food'], display: 'filterable' },
      { name: 'stock', type: 'number', display: 'badge' },
    ]
  },
  actions: ['search', 'create', 'edit', 'delete', 'export'],
  constraints: { density: 'comfortable' }
}
```

### Iteration 1 (Vibe resolves → G₁)

```
G₁: Full-width layout
    Header: "Products" (Heading)
    Toolbar: [SearchInput, SegmentedControl(category), Button("Add Product"), Dropdown("Export")]
    Content: Table(name, price, category, stock) — striped, hoverable
    Missing: loading state, error state, empty state, pagination
    Audit score: 68 (C)
```

### Iteration 2 (AI patches → G₂)

```
AI proposes: addEmptyState, addErrorState, debounceSearch, addPagination
Vibe applies: 4 transforms. Diff confirms all applied.
G₂ audit score: 89 (B)
AI: "Close. One more round."
```

### Iteration 3 (AI patches → G₃)

```
AI proposes: addLoadingState, addAriaLabels, compactDensity
Vibe applies: 3 transforms.
G₃ audit score: 96 (A)
AI: "Converged. Deploy."
```

**Result**: A production-quality product management page, generated from a 6-line seed intent, refined through 3 deterministic IFS iterations. The AI never generated code. Vibe never reasoned. The loop produced the result.

---

## 9. Why IFS, Not Just "Patch System"?

| Aspect | Simple Patch System | IFS Protocol |
|--------|-------------------|--------------|
| **Mental model** | "Edit a JSON file" | "Evolve a graph through iterations" |
| **Convergence** | Manual. Stop when you're done. | Defined exit criteria: score threshold, max iterations, stable state |
| **Fractal property** | Not applicable | Complex UIs emerge from repeated simple transforms |
| **AI compatibility** | AI sends patches | AI participates in a loop — observe → decide → act → observe |
| **Rollback** | Manual revert | Each iteration is a graph version. Rollback to any Gₙ. |
| **Audit integration** | Separate | Built into the loop — every Gₙ is audited, AI sees the score |
| **Batching** | Apply patches sequentially | Atomic batch: all or nothing |
| **Mathematics** | None | IFS provides a theoretical foundation (contraction mappings, fixed points) |

---

## 10. What Vibe 1.x Adds (The SLM Layer)

When Vibe 1.x ships with a built-in SLM, the IFS engine doesn't change. The SLM becomes **another AI agent** that can drive the loop — but now it's internal.

```
Vibe 0.x:   External AI Agent ←→ IFS Engine ←→ HyperGraph
Vibe 1.x:   [Internal SLM] ←→ IFS Engine ←→ HyperGraph
                        ↕
              External AI Agent (optional, for complex cases)
```

The IFS protocol is the **stable foundation**. The SLM (1.x) is a faster, built-in driver for the same protocol.

---

## 11. Implementation for v0.2

The IFS engine requires these pieces (building on what we already have):

### Already implemented ✅
- `validateVibeIntent(intent)` → validator.js
- `auditManifest(manifest)` → auditor.js
- `createErrorResponse(...)` → errors.js
- `generateCreationSpec(...)` → errors.js

### To implement (next)
- `applyTransform(graph, transform)` — the core operation
- `applyTransforms(graph, transforms)` — batched, atomic
- `diff(beforeGraph, afterGraph)` — structured delta
- `resolveSeed(seedIntent)` — the goal → intent resolver
- `suggestTransform(graph)` — deterministic heuristics for improvement suggestions

The IFS loop is the user-facing story. The transforms are the implementation.
