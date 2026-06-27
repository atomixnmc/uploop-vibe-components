# Stress Test: Can the AI Protocol Handle Complex UIs?

> **Date:** 2026-06-27
>
> The theory works for CRUD tables. What about multi-step wizards, real-time dashboards,
> collaborative editors, workflow systems, deeply nested layouts? Where does it break?

---

## Test Case 1: Multi-Step Wizard with Conditional Branching

**Scenario**: Insurance claim wizard. Step 2 changes based on Step 1 (auto vs home vs health). Step 3 collects different evidence per type. Back button preserves all data. Submit validates everything.

### Can the protocol express this?

```jsonc
{
  "goal": "wizard",
  "entity": "Claim",
  "steps": [
    { "id": "type", "title": "Claim Type",
      "components": [{ "type": "segmentedControl", "props": { "options": ["auto","home","health"] } }]
    },
    { "id": "details", "title": "Details",
      "variants": {
        "auto":   { "components": [{ "type": "input", "label": "VIN" }, { "type": "fileUpload" }] },
        "home":   { "components": [{ "type": "textarea" }, { "type": "fileUpload" }] },
        "health": { "components": [{ "type": "input", "label": "Policy #" }, { "type": "fileUpload" }] }
      }
    },
    { "id": "review", "title": "Review",
      "components": [{ "type": "descriptionList", "props": { "items": "data.summary" } }]
    }
  ],
  "behaviors": {
    "navigation": "sequential-with-back",
    "validation": "on-submit",
    "dataPersistence": "across-steps"
  }
}
```

**Verdict**: ✅ **Holds.** Variants express conditional rendering. `dataPersistence` handles state preservation.

**Limitation**: The manifest grows combinatorially. A 5-step wizard with 3 variants per step = 15 possible paths. The `describe()` output lists ALL possible nodes, not just the active path. An AI auditing this needs to understand "these 12 nodes are mutually exclusive."

---

## Test Case 2: Real-Time Dashboard with Cross-Filtering

**Scenario**: 6 widgets. Time range selector filters all. Clicking a widget drills down. Live data refresh.

**Verdict**: ✅ **Holds.** Cross-filtering is `affects: "all-widgets"` + `reactsTo: ["timeRange"]`. Drilldown is an intent-within-intent. Real-time is a `behaviors.dataRefresh: "realtime"` flag.

**Limitation**: Real-time data sources (WebSocket, SSE) need explicit edge definitions in the manifest. The protocol currently assumes REST-style data fetching. Streaming data sources need a different `source` type.

---

## Test Case 3: Collaborative Editor with Presence

**Scenario**: Document editor. Multiple users with colored cursors. Real-time sync. Conflict resolution. Version history.

### Can the protocol express this?

```jsonc
{
  "goal": "editor",
  "entity": "Document",
  "collaboration": {
    "type": "realtime",
    "presence": true,
    "cursors": true,
    "conflictResolution": "operational-transform",
    "history": { "snapshots": 50, "undoRedo": true }
  },
  "components": [
    { "type": "toolbar", "props": { "tools": ["bold","italic","heading","list","image"] } },
    { "type": "editorArea", "props": { "content": "data.document.content" } }
  ]
}
```

**Verdict**: ⚠️ **Partially holds.** The protocol can describe the UI structure. But collaborative editing requires:
- **OT/CRDT logic**: Not expressible as component intents. This is a UploopJS concern (flows, execution profiles).
- **Presence tracking**: Cursor positions, user names, colors. The protocol can describe the presence *display* (AvatarGroup + colored cursors) but not the real-time sync *logic*.
- **Conflict resolution**: The protocol can flag `conflictResolution: "operational-transform"` but can't implement it.

**Limitation**: The protocol describes UI, not application logic. Complex client-side logic (OT, CRDT, physics engines, game loops) is outside scope. The protocol can say "this component needs OT" but can't generate the OT code.

---

## Test Case 4: Workflow Approval System

**Scenario**: Purchase order approval. Manager approves ≤$5K. Director approves ≤$50K. VP approves >$50K. Each role sees different UI. Email notifications. Audit trail.

### Can the protocol express this?

```jsonc
{
  "goal": "workflow",
  "entity": "PurchaseOrder",
  "roles": [
    {
      "role": "manager",
      "condition": "data.po.amount <= 5000",
      "view": {
        "components": [
          { "type": "card", "props": { "children": [{ "type": "descriptionList" }] } },
          { "type": "button", "props": { "label": "Approve", "variant": "success" } },
          { "type": "button", "props": { "label": "Reject", "variant": "danger" } }
        ]
      }
    },
    {
      "role": "director",
      "condition": "data.po.amount > 5000 && data.po.amount <= 50000",
      "view": { "components": [...] }
    },
    {
      "role": "vp",
      "condition": "data.po.amount > 50000",
      "view": { "components": [...] }
    }
  ],
  "behaviors": {
    "notifications": { "channel": "email", "events": ["submitted","approved","rejected"] },
    "auditTrail": { "enabled": true, "component": "timeline" }
  }
}
```

**Verdict**: ✅ **Holds.** Role-based views are `variants` with `condition`. Audit trail is a `Timeline` component. Notifications are `behaviors`.

**Limitation**: The `condition` expressions are JavaScript strings evaluated at runtime. This is a security concern if intents come from untrusted sources. The protocol needs a safe subset expression language.

---

## Test Case 5: Deeply Nested Layout (Enterprise Admin Panel)

**Scenario**: Admin panel with sidebar nav (3 levels deep), breadcrumbs, tabbed content area, split pane with detail panel, context-sensitive toolbar, global search.

**Verdict**: ✅ **Holds.** The intent format supports arbitrary nesting:
```jsonc
{
  "layout": "sidebar-grid",
  "sections": {
    "sidebar": {
      "components": [
        { "type": "nav", "props": { 
            "items": [
              { "label": "Users", "children": [
                { "label": "All Users" },
                { "label": "Roles", "children": [
                  { "label": "Admin" },
                  { "label": "Editor" }
                ]}
              ]}
            ]
          }
        }
      ]
    },
    "content": {
      "layout": "split-pane",
      "left": { "components": [{ "type": "tabs" }, { "type": "table" }] },
      "right": { "components": [{ "type": "card" }, { "type": "timeline" }] }
    }
  }
}
```

**Limitation**: The JSON gets deep. A 3-level nav + split pane + tabs + nested cards = 15+ levels of nesting. The manifest's path strings become long (`sections.content.right.components[1].props.items[3].children[0].label`). The protocol needs path aliases ("`@userDetailPanel`" instead of the full path).

---

## Test Case 6: Custom Interactive Component (Drag-Drop Kanban)

**Scenario**: Kanban board with drag-drop columns, cards with due dates and assignees, inline editing, swimlanes.

**Verdict**: ❌ **Fails.** The protocol can't express custom interaction patterns:
- Drag-drop: No `dragDrop` behavior in the protocol
- Swimlanes: Horizontal + vertical grouping not expressible as standard layout
- Inline editing on cards: Requires card-level state management beyond current Table component

**Limitation**: The protocol works for compositions of **existing** components. It can't invent new component behaviors. A Kanban would need a `KanbanBoard` component to exist in the registry first. The protocol can compose existing pieces, not invent new ones.

---

## Test Case 7: Data Pipeline Builder (Visual Programming)

**Scenario**: Node-and-edge canvas where users connect data sources to transforms to outputs. Drag from palette. Wire nodes together. Configure each node.

**Verdict**: ❌ **Fails.** This requires:
- Canvas rendering (2D drawing)
- Custom hit testing
- Drag-drop from palette to canvas
- Connection drawing (bezier curves between ports)
- Node configuration panels
- Serialization of the graph to/from JSON

The protocol can describe the surrounding UI (toolbar, palette panel, properties panel) but the core canvas interaction is custom rendering logic that doesn't map to existing Vibe components.

---

## Real Limitations (What the Protocol Can't Do)

| Limitation | Why | Mitigation |
|-----------|-----|------------|
| **Custom interaction patterns** | Drag-drop, draw, connect — need custom JS, not component composition | Protocol can describe the shell; custom logic lives in dedicated components |
| **Complex client-side logic** | OT/CRDT, physics, game loops, DSP | Flag as `behaviors`, delegate to UploopJS flows |
| **Component invention** | Can't create a KanbanBoard from Button + Card + DragDrop. Need the component to exist. | Expand the component registry. AI can suggest new component specs. |
| **Performance tuning** | Can't express "virtualize this list" or "debounce that input" at the component level | `execution` profiles handle this. `suggestFlow(graph)` auto-optimizes. |
| **Security boundaries** | Condition expressions (`data.po.amount > 5000`) are eval'd strings | Need a safe subset language or JSON Logic format |
| **Streaming/real-time data** | Protocol assumes request/response data fetching | Extend `source` types: `rest`, `ws`, `sse`, `poll` |
| **Offline/ sync** | No expression of local-first, queue, conflict resolution | `behaviors.offline` flag, delegate to `@uploop/sst` services |
| **Multi-page apps** | Protocol describes one page at a time. No navigation graph between pages. | Compose multiple pages; add `routes` to the protocol |

---

## What Holds vs. What Breaks

| UI Type | Holds? | Note |
|---------|--------|------|
| CRUD table with search, filter, pagination | ✅ | Core use case |
| Form with validation, conditional fields | ✅ | `variants` handles conditional |
| Dashboard with cross-filtering widgets | ✅ | `affects`/`reactsTo` edges |
| Multi-step wizard | ✅ | `steps` + `variants` + `behaviors` |
| Settings page with nested sections | ✅ | Arbitrary nesting |
| Workflow with role-based views | ✅ | `roles` + `conditions` |
| Admin panel with deep navigation | ✅ | Nested `nav.items` |
| Landing page with hero, features, CTA | ✅ | `stacked` layout |
| Collaborative editor (cursors, OT) | ⚠️ | UI structure only. Sync logic is custom. |
| Real-time dashboard (WebSocket) | ⚠️ | UI structure holds. Data source type needs extension. |
| Drag-drop Kanban board | ❌ | Custom interaction needs dedicated component |
| Visual pipeline builder (node canvas) | ❌ | Canvas rendering + custom hit testing |
| Whiteboard / drawing app | ❌ | Same as pipeline builder |
| 3D product viewer | ❌ | WebGL is entirely custom rendering |
| Game UI (HUD, inventory) | ❌ | Game loop + custom rendering |

---

## Pros of the Intent Protocol

1. **Deterministic**: Same intent → same output. Always. No hallucination risk.
2. **Validatable**: Reject invalid intents before rendering. Give actionable errors.
3. **Addressable**: Every node has a path. AI can target specific changes.
4. **Inspectable**: `describe()` exports the full graph. AI doesn't need source code.
5. **Token-efficient**: 18 tokens for a form vs. 200+ for JSX.
6. **Framework-agnostic AI**: The AI doesn't need to know Uploop, React, or Vue. It just generates JSON.
7. **Composable**: Intents can be merged, patched, diffed, versioned.
8. **Safe by default**: No code injection. No JSX. No eval. (Except condition expressions — needs fix.)

## Cons of the Intent Protocol

1. **Limited to existing components**: Can't express novel interactions. If there's no KanbanBoard component, you can't build a Kanban. The AI can only compose what exists.
2. **JSON verbosity at scale**: A complex admin panel produces 50KB+ of JSON intent. Path strings get long. Needs aliasing.
3. **Condition expressions are unsafe**: `"data.po.amount > 5000"` is eval'd. Needs a safe expression language (JSON Logic, jq-style).
4. **No custom rendering**: Canvas, WebGL, rich text editors — anything with custom `draw()` or `render()` logic — can't be expressed as intent.
5. **One page at a time**: No multi-page navigation graph. A full app needs multiple intents composed.
6. **Application logic lives outside**: Form validation rules, API calls, authorization — these are UploopJS concerns, not Vibe concerns. The protocol describes UI, not business logic.
7. **No learning from corrections**: The resolver always makes the same decisions. If the AI says "no, put the search on the right," there's no feedback mechanism.
8. **Manifest size grows with complexity**: A 200-node page produces a 10KB+ manifest. LLM context windows are finite.

---

## The Real Boundary

The protocol works for **UI composition** — arranging existing components, wiring data flow, defining navigation. It breaks when you need **custom behavior** — novel interactions, custom rendering, complex client-side logic.

This boundary is actually **correct**. The AI shouldn't generate interaction code (drag-drop physics, OT algorithms, canvas rendering). That's what the component library provides. The AI's job is to **compose the right components for the right context**.

The protocol's limit is Vibe's component catalog. Want a Kanban? Add a KanbanBoard component. Want a whiteboard? Add a Canvas component. The protocol can then compose them into pages — it just can't invent them.

---

## Bottom Line

The theory holds for **80% of real-world UIs**: CRUD, forms, dashboards, wizards, settings, workflows, admin panels, landing pages. These are compositions of standard components.

It breaks for **20%**: custom interactions, canvas apps, games, collaborative editors, visual programming tools. These need dedicated components with custom rendering logic.

**The protocol's ceiling is Vibe's component catalog.** Expand the catalog, expand the ceiling.
