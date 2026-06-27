// ─── @uploop-vibe/vibe-cli MCP Server ────────────────────────
// Exposes Vibe tools as MCP (Model Context Protocol) endpoints.
// AI agents can discover and call Vibe tools via standard MCP.
//
// MCP Tool List:
//   vibe.generate_page     — Generate a full page from seed intent
//   vibe.generate_component — Generate a single component
//   vibe.validate_intent   — Validate an intent before rendering
//   vibe.audit_manifest    — Audit a manifest for quality
//   vibe.list_components   — List available components
//   vibe.list_templates    — List available templates
//   vibe.diff_manifests    — Diff two manifests
//   vibe.request_component — Request a missing component

import { validateVibeIntent, auditManifest, diff, requestComponent, getRequestQueue } from '@uploop-vibe/vibe-ai'
import { listComponents } from '@uploop-vibe/vibe'
import { listTemplates, resolveComponentIntent, generateComponent } from '@uploop-vibe/vibe-ai'
import { runIFSLoop } from '@uploop-vibe/vibe-ai'

/**
 * MCP Tool definitions — what Vibe exposes to AI agents.
 */
export const mcpTools = [
  {
    name: 'vibe.generate_page',
    description: 'Generate a full page UI from a seed intent (goal + entity + actions + constraints). Returns the converged manifest with audit score and iteration history.',
    inputSchema: {
      type: 'object',
      properties: {
        goal: { type: 'string', description: 'Page type: data-management, form, dashboard, settings, wizard, detail, landing' },
        entityName: { type: 'string', description: 'Entity name (e.g., "User", "Product")' },
        fields: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, type: { type: 'string' }, display: { type: 'string' } } }, description: 'Entity field definitions' },
        actions: { type: 'array', items: { type: 'string' }, description: 'User actions: search, create, edit, delete, export, bulk-delete' },
        constraints: { type: 'object', properties: { density: { type: 'string' }, layout: { type: 'string' } }, description: 'Visual constraints' },
      },
    },
  },
  {
    name: 'vibe.generate_component',
    description: 'Generate a single Vibe component from an intent description. Returns the component descriptor or error with alternatives.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Component type (button, card, input, table, modal, etc.)' },
        props: { type: 'object', description: 'Component props' },
        style: { type: 'object', properties: { size: { type: 'string' }, variant: { type: 'string' }, animate: { type: 'string' } } },
      },
      required: ['type'],
    },
  },
  {
    name: 'vibe.validate_intent',
    description: 'Validate an intent before rendering. Returns structured errors with alternatives and fix suggestions.',
    inputSchema: {
      type: 'object',
      properties: {
        intent: { type: 'object', description: 'The intent object to validate' },
      },
      required: ['intent'],
    },
  },
  {
    name: 'vibe.audit_manifest',
    description: 'Audit a page manifest for quality issues. Returns score, grade, issues, and suggestions.',
    inputSchema: {
      type: 'object',
      properties: {
        manifest: { type: 'object', description: 'The manifest to audit' },
      },
      required: ['manifest'],
    },
  },
  {
    name: 'vibe.list_components',
    description: 'List all available Vibe components, optionally filtered by category.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Filter by category: layout, navigation, data-entry, etc.' },
      },
    },
  },
  {
    name: 'vibe.list_templates',
    description: 'List all available page templates.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'vibe.diff_manifests',
    description: 'Compute a structured diff between two page manifests.',
    inputSchema: {
      type: 'object',
      properties: {
        before: { type: 'object', description: 'The original manifest' },
        after: { type: 'object', description: 'The modified manifest' },
      },
      required: ['before', 'after'],
    },
  },
  {
    name: 'vibe.request_component',
    description: 'Request a missing component. Returns alternatives and a creation spec. Tracks requests for prioritization.',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: { type: 'string', description: 'Name of the missing component' },
        context: { type: 'object', description: 'What the AI was trying to do' },
      },
      required: ['componentName'],
    },
  },
  {
    name: 'vibe.request_queue',
    description: 'Get the queue of most-requested missing components.',
    inputSchema: { type: 'object', properties: {} },
  },
]

/**
 * Execute an MCP tool call and return the result.
 *
 * @param {string} toolName
 * @param {Object} args
 * @returns {Promise<Object>}
 */
export async function executeMCPTool(toolName, args = {}) {
  switch (toolName) {
    case 'vibe.generate_page': {
      const seed = {
        goal: args.goal || 'data-management',
        entity: { name: args.entityName || 'Item', fields: args.fields || [] },
        actions: args.actions || [],
        constraints: args.constraints || {},
      }
      return await runIFSLoop(seed)
    }

    case 'vibe.generate_component': {
      const resolved = resolveComponentIntent({
        type: args.type,
        props: args.props || {},
        style: args.style || {},
      })
      if (!resolved.component) {
        return {
          ok: false,
          error: `Component "${args.type}" not found.`,
          alternatives: resolved.config || {},
        }
      }
      return {
        ok: true,
        component: resolved.component.name || args.type,
        config: resolved.config,
      }
    }

    case 'vibe.validate_intent':
      return validateVibeIntent(args.intent)

    case 'vibe.audit_manifest':
      return auditManifest(args.manifest)

    case 'vibe.list_components':
      return { components: listComponents(args.category) }

    case 'vibe.list_templates':
      return { templates: listTemplates() }

    case 'vibe.diff_manifests':
      return diff(args.before, args.after)

    case 'vibe.request_component':
      return requestComponent(args.componentName, args.context || {})

    case 'vibe.request_queue':
      return { queue: getRequestQueue() }

    default:
      return { ok: false, error: `Unknown tool: ${toolName}` }
  }
}

/**
 * Create an MCP server instance (stdio transport).
 * Compatible with MCP clients (Claude Desktop, Cursor, etc.).
 *
 * @returns {Object} MCP server interface
 */
export function createMCPServer() {
  return {
    tools: mcpTools,
    execute: executeMCPTool,

    /**
     * Handle an MCP request (JSON-RPC style).
     *
     * @param {Object} request — { method, params }
     * @returns {Promise<Object>} response
     */
    async handleRequest(request) {
      const { method, params } = request

      switch (method) {
        case 'tools/list':
          return { tools: mcpTools }

        case 'tools/call':
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(await executeMCPTool(params.name, params.arguments || {}))
            }]
          }

        default:
          return { error: `Unknown method: ${method}` }
      }
    },

    /**
     * Generate MCP server configuration for common clients.
     */
    getConfig(client) {
      const configs = {
        claude: {
          mcpServers: {
            vibe: {
              command: 'npx',
              args: ['@uploop-vibe/vibe-cli', 'mcp'],
            },
          },
        },
        cursor: {
          mcpServers: {
            vibe: {
              command: 'npx',
              args: ['@uploop-vibe/vibe-cli', 'mcp'],
            },
          },
        },
      }
      return configs[client] || configs.claude
    },
  }
}
