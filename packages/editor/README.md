# @uploop-vibe/vibe-editor

Rich editing components for the Uploop platform — WYSIWYG documents,
spreadsheets with a formula engine, drag-and-drop layout editing, and
code editing with syntax highlighting.

All editors are built on top of [Uploop](https://uploop.dev) concepts:
**@uploop/html** for DOM rendering, **@uploop/store** for spreadsheet
state, and **@uploop/flows** graph for layout-editor structure.

---

## Installation

```bash
pnpm add @uploop-vibe/vibe-editor
```

The package requires the following Uploop peer dependencies (installed
alongside if you already use `@uploop/core`):

| Package          | Role                              |
|------------------|-----------------------------------|
| `@uploop/html`   | DOM / HTML rendering for all editors |
| `@uploop/store`  | Reactive state for spreadsheet    |
| `@uploop/schema` | Spreadsheet column definitions    |
| `@uploop/flows`  | Graph model backing layout editor |

---

## Editors

### 1. WYSIWYG Editor (`wysiwyg`)

Rich-text document editor. Renders editable HTML via `@uploop/html`.

```js
import { WysiwygEditor } from '@uploop-vibe/vibe-editor'

const editor = WysiwygEditor.create({
  content: '<h1>Hello</h1><p>Start typing…</p>',
  placeholder: 'Write something…',
  toolbar: ['bold', 'italic', 'heading', 'link', 'image'],
})

// Mount into the DOM
editor.view(document.getElementById('app'))
```

| Method / Property    | Description                          |
|----------------------|--------------------------------------|
| `create(opts)`       | Factory: returns an editor instance  |
| `view(container)`    | Mount the editor into a DOM node     |
| `getContent()`       | Returns current HTML string          |
| `setContent(html)`   | Replaces the document content        |

**Uploop concept:** All content is **@uploop/html** — the same
reactive HTML engine used across the platform.

---

### 2. Code Editor (`code`)

Syntax-highlighted code editor with line numbers. Supports many
languages via the underlying `@uploop/html` renderer.

```js
import { CodeEditor } from '@uploop-vibe/vibe-editor'

const editor = CodeEditor.create({
  language: 'javascript',
  value: 'console.log("hello");',
  theme: 'uploop-dark',
  readOnly: false,
})

editor.view(document.getElementById('code-panel'))
```

| Method / Property | Description                          |
|-------------------|--------------------------------------|
| `create(opts)`    | Factory with language, value, theme  |
| `view(container)` | Mount into DOM                       |
| `getValue()`      | Returns current code string          |
| `setValue(code)`  | Replaces the editor content          |

**Uploop concept:** The code view is rendered with **@uploop/html**,
so it integrates naturally with the rest of the component tree.

---

### 3. Spreadsheet (`spreadsheet`)

Tabular data editor with a built-in **formula engine**. Columns are
defined via `@uploop/schema` schemas and state lives in
`@uploop/store`.

```js
import { Spreadsheet } from '@uploop-vibe/vibe-editor'

const sheet = Spreadsheet.create({
  columns: [
    { key: 'name',  title: 'Name',  type: 'string' },
    { key: 'qty',   title: 'Qty',   type: 'number' },
    { key: 'price', title: 'Price', type: 'number' },
    {
      key: 'total',
      title: 'Total',
      type: 'formula',
      formula: '=B{row} * C{row}',
    },
  ],
  rows: [
    { name: 'Widget', qty: 5,  price: 9.99 },
    { name: 'Gadget', qty: 10, price: 4.50 },
  ],
  editable: true,
})

sheet.view(document.getElementById('sheet'))
```

| Method / Property   | Description                            |
|----------------------|----------------------------------------|
| `create(opts)`       | Factory with columns, rows, options    |
| `view(container)`    | Mount into DOM                         |
| `getRows()`          | Returns current row data (computed formulas resolved) |
| `setRows(rows)`      | Replaces all row data                  |

**Formula engine** supports arithmetic (`+`, `-`, `*`, `/`),
`SUM(range)`, `AVERAGE(range)`, `IF(cond, a, b)`, and cell references
via `A{row}` / `R{row}C{col}` syntax. Formulas are live-computed in
the Uploop store — changing a source cell immediately updates
dependent cells.

**Uploop concepts:**

- **@uploop/store** — every spreadsheet instance owns a reactive
  store; formula dependencies are tracked automatically.
- **@uploop/schema** — column definitions enforce types and drive the
  formula engine's type checking.
- **@uploop/html** — the grid UI is rendered as reactive HTML rows.

---

### 4. Layout Editor (`layout`)

Drag-and-drop interface for building page layouts. The layout
structure is backed by a **@uploop/flows** directed graph, making
the hierarchy inspectable, serialisable, and diffable.

```js
import { LayoutEditor } from '@uploop-vibe/vibe-editor'

const layout = LayoutEditor.create({
  graph: {
    nodes: [
      { id: 'root', type: 'container', children: ['header', 'body'] },
      { id: 'header', type: 'header' },
      { id: 'body', type: 'grid', columns: 2, children: ['col1', 'col2'] },
      { id: 'col1', type: 'text' },
      { id: 'col2', type: 'image' },
    ],
  },
  components: ['text', 'image', 'button', 'container', 'grid', 'header', 'footer'],
})

layout.view(document.getElementById('layout-canvas'))
```

| Method / Property  | Description                                |
|---------------------|--------------------------------------------|
| `create(opts)`      | Factory with initial graph and palette     |
| `view(container)`   | Mount the drag-and-drop canvas into DOM    |
| `getGraph()`        | Returns the current flow graph             |
| `setGraph(graph)`   | Replaces the entire graph                  |

**Drag-and-drop** supports:

- Dragging new components from the palette into the canvas
- Reordering nodes within a container
- Nesting nodes via drop zones
- Resizing grid columns / rows
- Undo / redo via the graph's transaction log

**Uploop concepts:**

- **@uploop/flows** — every layout is a directed acyclic graph; nodes
  are layout blocks, edges define parent → child relationships.
- **@uploop/html** — the canvas renders every node as its
  corresponding HTML element (after resolving from `@uploop-vibe/vibe`
  design tokens).

---

## Running Tests

```bash
# From the workspace root, or inside the editor package:
pnpm test
```

Tests use [Vitest](https://vitest.dev) with jsdom. The test suite
validates that every editor module exports the expected symbols
(`create`, `view`) and that imports resolve correctly.

---

## License

MIT — see the root [LICENSE](../../LICENSE) file.
