# @uploop-vibe/vibe-devutils

**DevX tools** for humans and AI agents working with Uploop Vibe.

Inspect, debug, diff, and serialize page manifests. Built for the AI-DevX loop: AI generates → you inspect → AI improves.

## Install

```bash
pnpm add @uploop-vibe/vibe-devutils
```

## API

### Inspector — Visualize Page Manifests

```js
import { inspectManifest, visualizeGraph, exportGraphAsMermaid, exportGraphAsJSON } from '@uploop-vibe/vibe-devutils'

// Structured report
const report = inspectManifest(page.describe())
// → {
//   summary: { totalNodes: 15, viewNodes: 8, actionNodes: 3 },
//   patterns: { hasSearch: true, hasPagination: false },
//   sections: ['toolbar', 'content', 'footer'],
//   warnings: ['No empty state defined']
// }

// Graph visualization data
const graph = visualizeGraph(manifest)

// Export as Mermaid diagram
const mermaid = exportGraphAsMermaid(manifest)

// Export as clean JSON
const json = exportGraphAsJSON(manifest)
```

### Debugger — Validate Intents

```js
import { debugIntent, debugManifest, formatValidationErrors } from '@uploop-vibe/vibe-devutils'

// Debug an intent — full diagnostic
const result = debugIntent({ type: 'kanban', props: {} })
// → {
//   valid: false,
//   errors: [{ code: 'COMPONENT_NOT_FOUND', path: 'type', ... }],
//   suggestions: ['Try "Board" instead of "Kanban"']
// }

// Debug a manifest
const diag = debugManifest(pageManifest)

// Format errors for display
const html = formatValidationErrors(result.errors)
```

### Diff Viewer — Compare Manifests

```js
import { viewDiff, diffSummary, diffToHTML } from '@uploop-vibe/vibe-devutils'

// Structured diff
const delta = viewDiff(beforeManifest, afterManifest)
// → { added: 3, removed: 1, changed: 2, details: [...] }

// One-line summary
const summary = diffSummary(beforeManifest, afterManifest)
// → "Added Toolbar, Pagination; removed Spinner"

// HTML diff visualization
const html = diffToHTML(beforeManifest, afterManifest)
```

### Serializer — AI-Optimized Format

```js
import { serializeManifest, deserializeManifest, estimateTokens } from '@uploop-vibe/vibe-devutils'

// Compact format (~70% smaller than JSON) for LLM context
const compact = serializeManifest(manifest)
// → "V|Button|label:Save|variant:solid|size:md"

// Deserialize back
const restored = deserializeManifest(compact)

// Estimate token count for LLM context window
const tokens = estimateTokens(manifest)
```

## Why DevUtils?

1. **Human DevX** — Inspect what the AI generated. Debug intents before they crash.
2. **AI DevX** — Serialize manifests compactly for LLM context windows. Diff iterations to track convergence.
3. **The AI-DevX Loop** — Every tool is designed for the inspect→debug→improve cycle.

## License

MIT
