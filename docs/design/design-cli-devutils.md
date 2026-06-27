# Design: @uploop-vibe/vibe-cli & vibe-devutils

> **Date:** 2026-06-27 · **Status:** ✅ v0.2 scaffolded
> **Packages:** `packages/vibe-cli/`, `packages/vibe-devutils/`

---

## Package: vibe-cli

### Purpose
Generate UI on demand from the command line. Expose Vibe tools as MCP (Model Context Protocol) endpoints for AI agents.

### Commands
```
vibe generate page      --goal dashboard --entity Product --actions search,create,delete
vibe generate component --type button --label "Save" --variant solid
vibe list               [--category navigation]
vibe mcp                (start MCP server for AI agent connections)
vibe scaffold <name>    (scaffold new Vibe project)
```

### MCP Tools
9 tools exposed to AI agents:

| Tool | Description |
|------|-------------|
| `vibe.generate_page` | Generate a full page from seed intent via IFS loop |
| `vibe.generate_component` | Generate a single component from intent |
| `vibe.validate_intent` | Validate an intent, return structured errors with alternatives |
| `vibe.audit_manifest` | Audit a manifest for quality, return score + issues |
| `vibe.list_components` | List available components, optionally by category |
| `vibe.list_templates` | List available page templates |
| `vibe.diff_manifests` | Compute structured diff between two manifests |
| `vibe.request_component` | Request missing component, get alternatives + creation spec |
| `vibe.request_queue` | Get most-requested missing components |

### AI Agent Integration
```json
// Claude Desktop / Cursor MCP config
{
  "mcpServers": {
    "vibe": {
      "command": "npx",
      "args": ["@uploop-vibe/vibe-cli", "mcp"]
    }
  }
}
```

---

## Package: vibe-devutils

### Purpose
DevX tools for both human developers and AI agents. Inspect, debug, diff, and serialize HyperGraph manifests.

### Modules

| Module | Purpose | Key APIs |
|--------|---------|----------|
| `inspector.js` | Visualize manifests as interactive diagrams | `inspectManifest()`, `visualizeGraph()`, `exportGraphAsMermaid()` |
| `debugger.js` | Intent + manifest debugging | `debugIntent()`, `debugManifest()`, `formatValidationErrors()` |
| `diff-viewer.js` | Visual diff between manifest versions | `viewDiff()`, `diffSummary()`, `diffToHTML()` |
| `serializer.js` | Token-efficient format for AI context | `serializeManifest()`, `deserializeManifest()`, `estimateTokens()` |

### Key Features

**HyperGraph Inspector** — read any page manifest and get a structured summary:
- Component inventory with types and props
- Data flow analysis (which data nodes feed which views)
- Pattern detection (hasSearch, hasTable, hasForm, hasPagination)
- State coverage report (loading/empty/error states)

**Manifest Serializer** — compact format (~70% smaller than JSON):
```
v:1|g:dashboard|l:full-width|s:85
n:header|Heading||level:h1|text:Users
n:search|SearchInput||debounce:300
d:query||
e:query→filtered|filter
st:empty|EmptyState|title:No data
```

**Intent Debugger** — format validation errors for humans and AI:
```
❌ Validation Failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [component_not_found] Component "KanbanBoard" is not in the registry.
       at: sections.content.components[0].type
       value: "KanbanBoard"
       alternatives:
         - Table: Use with status column for task tracking
         - Card+Flex: Compose columns manually
       suggested fix: replace sections.content.components[0]
       creation spec: KanbanBoard (complexity: high)
```

**Diff Viewer** — structured before/after comparison:
- HTML output with color-coded additions (green), removals (red), changes (yellow)
- Summary string: "+2 component(s) added, ~1 component(s) modified, +3 edge(s) added"
