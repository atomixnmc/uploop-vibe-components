# v0.2 Advanced Examples: IFS Loop Showcase

> **Date:** 2026-06-27 · **Status:** Design
>
> The IFS demo shows the generative HyperGraph in action — seed → iterate → converge.
> AI agents, whether external LLM or built-in heuristics, drive the loop.

---

## Demo 1: The IFS Loop Visualizer

**Goal**: Show the full `seed → G₁ → audit → patch → G₂ → ... → converge` cycle in real time.

**UX**:
```
┌──────────────────────────────────────────────────────────┐
│  🌊 IFS Loop Demo                                       │
│                                                          │
│  Seed Intent:                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ { goal: "data-management",                       │   │
│  │   entity: { name: "Product", fields: [...] },    │   │
│  │   actions: ["search","create","delete","export"] │   │
│  │ }                                                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [▶ Run Loop]  [⏸ Pause]  [↺ Reset]  Iterations: 3/10  │
│                                                          │
│  ┌─ Iteration 0 (Seed) ────────────────────────────┐   │
│  │ Score: 62 (D)  │  Nodes: 5  │  Edges: 2         │   │
│  │ Issues: missing_error_state, missing_empty_state │   │
│  │ Render: [Header] [Search] [Add] [Export] [Table] │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Iteration 1 (Auto-fix) ────────────────────────┐   │
│  │ Score: 78 (C)  │  +2 nodes  │  +2 edges         │   │
│  │ Applied: +emptyState, +errorState, debounce=300  │   │
│  │ Diff: added: [emptyState, errorState]            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Iteration 2 (Polish) ──────────────────────────┐   │
│  │ Score: 91 (A)  │  +1 node  │  +1 edge           │   │
│  │ Applied: +pagination, +ariaLabels               │   │
│  │ Diff: added: [pagination], changed: [button.aria]│   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ✅ Converged! Score 91 — threshold 85 reached.         │
│                                                          │
│  Score history:  [62]──[78]──[91]                       │
│                  D      C      A                        │
└──────────────────────────────────────────────────────────┘
```

**Implementation**: Each iteration is a card showing the manifest, audit score, applied transforms, and diff. The score history is a visual bar chart. User can click "Run Loop" to watch it auto-converge, or step through manually.

---

## Demo 2: AI Agent Simulator

**Goal**: Show how an external AI agent drives the loop by proposing transforms.

**UX**:
```
┌──────────────────────────────────────────────────────────┐
│  🤖 AI Agent Simulator                                  │
│                                                          │
│  Current Graph (G₂, Score: 78):                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Nodes: 8  │  Edges: 5  │  States: empty, error   │   │
│  │ Components: Heading, SearchInput, Button×2, Table │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  AI Agent proposes transforms:                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 1. [add] pagination below table (pageSize: 20)   │   │
│  │ 2. [update] searchInput.debounce: undefined→300  │   │
│  │ 3. [addState] loading: Skeleton(count:5)          │   │
│  │ 4. [rewire] searchQuery→filteredProducts          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [Apply All]  [Apply #1 Only]  [Reject All]  [Ask AI]   │
│                                                          │
│  After applying (G₃, Score: 88):                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ +3 nodes, +2 edges, 0 failures                   │   │
│  │ Score improved: 78 → 88 (+10)                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  AI reasoning: "Added pagination for >20 rows. Debounce │
│  prevents re-render spam. Loading state improves UX."   │
└──────────────────────────────────────────────────────────┘
```

**Implementation**: Uses a simulated AI agent (deterministic heuristics) that reads the manifest + audit and returns transform suggestions. User can accept/reject individual transforms.

---

## Demo 3: What-If Explorer

**Goal**: Branch from any iteration, try different transforms, compare results.

**UX**:
```
┌──────────────────────────────────────────────────────────┐
│  🔀 What-If Explorer                                    │
│                                                          │
│  Base: G₂ (Score: 78)                                   │
│                                                          │
│  ┌─ Branch A: Add pagination ───────────────────────┐   │
│  │ Score: 88 (B)  │  +1 node  │  +0 edges           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Branch B: Add real-time refresh ────────────────┐   │
│  │ Score: 82 (B)  │  +0 nodes  │  Behavior changed  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Branch C: Full polish (A+B+accessibility) ──────┐   │
│  │ Score: 94 (A)  │  +3 nodes  │  +4 edges          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Comparison:                                             │
│  ┌──────────┬────────┬────────┬────────┐               │
│  │          │ Score  │ Nodes  │ Time   │               │
│  ├──────────┼────────┼────────┼────────┤               │
│  │ Branch A │   88   │   9    │  +1    │               │
│  │ Branch B │   82   │   8    │  +1    │               │
│  │ Branch C │   94   │  11    │  +2    │               │
│  └──────────┴────────┴────────┴────────┘               │
│                                                          │
│  Best path: Branch C (Score 94, 2 additional iterations) │
└──────────────────────────────────────────────────────────┘
```

---

## Demo 4: Component Request & Creation

**Goal**: Show the error → alternatives → creation spec flow when a component is missing.

**UX**:
```
┌──────────────────────────────────────────────────────────┐
│  🔧 Component Request Demo                              │
│                                                          │
│  Try requesting a component that doesn't exist:          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Component: [KanbanBoard        ] [Request]        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ❌ "KanbanBoard" not found.                            │
│                                                          │
│  📋 Alternatives:                                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 1. Table — Use with status column for tracking   │   │
│  │ 2. Card + Flex — Compose columns manually        │   │
│  │ 3. Combo: Flex + Card + Button (drag handlers)   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  📦 Creation Spec (AI can use this to build it):        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Component: KanbanBoard                           │   │
│  │ Props: columns[], cards[], onCardMove()          │   │
│  │ States: default, empty, loading, dragActive      │   │
│  │ Behaviors: dragStart, dragOver, drop, addCard    │   │
│  │ Template: import { component } from ...          │   │
│  │                                                  │   │
│  │ [Copy Spec]  [Send to AI Agent]                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  📊 Request Queue (most requested missing components):   │
│  ┌──────────────┬──────────┬────────────┐              │
│  │ Component    │ Requests │ Priority   │              │
│  ├──────────────┼──────────┼────────────┤              │
│  │ DatePicker   │    12    │ Popular    │              │
│  │ KanbanBoard  │     3    │ Requested  │              │
│  │ RichEditor   │     2    │ New        │              │
│  └──────────────┴──────────┴────────────┘              │
└──────────────────────────────────────────────────────────┘
```

**Implementation**: Uses `requestComponent()` from spec-generator.js. Shows alternatives from `getAlternatives()`. Creation spec from `generateCreationSpec()`. Request queue from `getRequestQueue()`.

---

## Demo 5: Loop Safety & Convergence Monitor

**Goal**: Show how the loop guard prevents infinite loops, oscillation, and deadlocks.

**UX**:
```
┌──────────────────────────────────────────────────────────┐
│  🛡️ Loop Safety Monitor                                 │
│                                                          │
│  ┌─ Normal Convergence ─────────────────────────────┐   │
│  │ Iteration 0: Score 62  ████████░░░░░░░░░░░░░     │   │
│  │ Iteration 1: Score 78  ██████████████░░░░░░░     │   │
│  │ Iteration 2: Score 91  ██████████████████░░░     │   │
│  │ ✅ Converged at threshold 85                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Oscillation Detected ──────────────────────────┐   │
│  │ Iteration 3: Score 82  ████████████████░░░░░     │   │
│  │ Iteration 4: Score 78  ██████████████░░░░░░░     │   │
│  │ Iteration 5: Score 82  ████████████████░░░░░     │   │
│  │ Iteration 6: Score 78  ██████████████░░░░░░░     │   │
│  │ ⚠️ Oscillation period 2 detected! Loop stopped. │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Stalled ───────────────────────────────────────┐   │
│  │ Iteration 7: Score 88  █████████████████░░░░     │   │
│  │ Iteration 8: Score 88  █████████████████░░░░     │   │
│  │ Iteration 9: Score 88  █████████████████░░░░     │   │
│  │ ⚠️ Stalled for 3 iterations. No improvement.     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Safety limits:                                          │
│  • Max iterations: 10                                    │
│  • Score threshold: 85                                   │
│  • Stall limit: 3                                        │
│  • Oscillation window: 4                                 │
│  • Transform fail limit: 3                               │
│                                                          │
│  [Change Limits]                                         │
└──────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: IFS Loop Visualizer (Demo 1)
- Seed input form
- Run loop button → `runIFSLoop(seed)`
- Iteration cards with manifest summary + audit score + diff
- Score history visualization

### Phase 2: AI Agent Simulator (Demo 2)
- Show current manifest
- AI agent (heuristics) proposes transforms
- User can accept/reject individual transforms
- Show before/after diff

### Phase 3: What-If Explorer (Demo 3)
- Branch from any iteration
- Apply different transform sets
- Compare branches side-by-side

### Phase 4: Error & Creation Demo (Demo 4)
- Request missing component
- Show alternatives + creation spec
- Display request queue

### Phase 5: Loop Safety Monitor (Demo 5)
- Visual convergence chart
- Oscillation/stall detection display
- Adjustable safety limits

### Files to create
- `examples/vibe-ai/ifs-demo.js` — main IFS demo page
- `examples/vibe-ai/ifs-demo/index.html` — shell

Update `vibe-ai/main.js` to include nav to IFS demos.
