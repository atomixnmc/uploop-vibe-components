# @uploop-vibe/vibe-cli

**CLI for on-demand UI generation** and **MCP server** for AI agent tooling.

Generate pages, components, and scaffold projects from the command line. Expose 9 tools via Model Context Protocol for AI agents (Claude Desktop, Cursor, etc.) to generate UIs programmatically.

## Install

```bash
pnpm add @uploop-vibe/vibe-cli
```

## CLI Commands

```bash
# Generate a full page via IFS loop
vibe generate page --goal dashboard --entity Product --actions search,create,delete

# Generate a single component
vibe generate component --type button --label "Save" --variant solid --size lg

# List available components
vibe list                    # all
vibe list --category navigation
vibe list --category data-entry

# Start MCP server (for AI agent connections)
vibe mcp

# Scaffold a new project
vibe scaffold my-app
```

## Programmatic API

```js
import { generatePage, generateComponent, listAvailable, scaffoldProject } from '@uploop-vibe/vibe-cli'

// Generate page programmatically
const page = await generatePage({
  goal: 'dashboard',
  entity: 'Product',
  actions: ['search', 'create', 'edit', 'delete'],
})
page.mount(document.getElementById('app'))

// Generate a component
const btn = generateComponent({ type: 'button', props: { label: 'Save' } })

// List available components
const all = listAvailable()
const nav = listAvailable('navigation')
```

## MCP — AI Agent Integration

Vibe exposes 9 tools via Model Context Protocol. Configure in your MCP client:

```json
{
  "mcpServers": {
    "vibe": {
      "command": "npx",
      "args": ["@uploop-vibe/vibe-cli", "mcp"]
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `generate_page` | Generate a full page from goal + entity + actions |
| `generate_component` | Generate a single component from type + props |
| `validate_intent` | Validate an intent before generation |
| `audit_manifest` | Audit a page manifest for quality gaps |
| `list_components` | List available components by category |
| `list_templates` | List available page templates |
| `diff_manifests` | Diff two page manifests |
| `request_component` | Request a missing component (generates creation spec) |
| `request_queue` | View the component request queue |

### Example: AI Agent generates a page

```
User: "Build a CRM dashboard for tracking deals"

AI Agent:
  1. Calls generate_page({ goal: 'dashboard', entity: 'Deal', actions: ['search','create','edit'] })
  2. Vibe returns page manifest { sections: {...}, components: [...] }
  3. AI audits: audit_manifest(manifest) → { score: 78, gaps: ['missing_empty_state'] }
  4. AI patches: applyTransforms(manifest, [...]) → score: 91
  5. Page is mounted and ready
```

## License

MIT
