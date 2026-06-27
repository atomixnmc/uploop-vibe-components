#!/usr/bin/env node
// ─── @uploop-vibe/vibe-cli Entry Point ──────────────────────
// Usage: vibe <command> [args]
//   vibe generate page --goal dashboard --entity Product
//   vibe generate component --type button --label "Save"
//   vibe list [--category navigation]
//   vibe mcp                          (start MCP server)
//   vibe scaffold <project-name>

import { generatePage, generateComponentCLI, listAvailable, scaffoldProject } from './commands.js'
import { createMCPServer, executeMCPTool } from './mcp-server.js'

const args = process.argv.slice(2)
const command = args[0]
const subcommand = args[1]

async function main() {
  if (!command || command === 'help' || command === '--help') {
    showHelp()
    return
  }

  switch (command) {
    case 'generate':
      await handleGenerate(subcommand, args.slice(2))
      break
    case 'list':
      listAvailable(args[1]?.replace('--category=', ''))
      break
    case 'mcp':
      await startMCPServer()
      break
    case 'scaffold':
      scaffoldProject(subcommand || 'my-vibe-app')
      break
    default:
      console.log(`Unknown command: ${command}`)
      showHelp()
  }
}

async function handleGenerate(subcommand, rest) {
  const flags = parseFlags(rest)

  switch (subcommand) {
    case 'page':
      await generatePage({
        goal: flags.goal || flags.g || 'data-management',
        entity: { name: flags.entity || flags.e || 'Item', fields: [] },
        actions: (flags.actions || flags.a || '').split(',').filter(Boolean),
        constraints: {
          density: flags.density || 'comfortable',
          layout: flags.layout || flags.l || 'full-width',
        },
      }, {
        maxIterations: parseInt(flags.iterations || '5'),
        scoreThreshold: parseInt(flags.threshold || '85'),
      })
      break
    case 'component':
      generateComponentCLI({
        type: flags.type || flags.t || 'button',
        props: { label: flags.label || 'Button', size: flags.size || 'md' },
        style: { variant: flags.variant || 'solid', animate: flags.animate || '' },
      })
      break
    default:
      console.log(`Usage: vibe generate <page|component> [flags]`)
  }
}

async function startMCPServer() {
  console.log('🔌 Vibe MCP Server starting...')
  console.log('   Available tools:', createMCPServer().tools.map(t => t.name).join(', '))

  // In a real implementation, this would use stdio transport
  // For now, demonstrate the interface
  const server = createMCPServer()

  // Read from stdin, write to stdout (MCP stdio transport)
  process.stdin.setEncoding('utf8')
  let buffer = ''

  process.stdin.on('data', async (chunk) => {
    buffer += chunk
    try {
      const request = JSON.parse(buffer)
      buffer = ''
      const response = await server.handleRequest(request)
      process.stdout.write(JSON.stringify(response) + '\n')
    } catch (e) {
      // Incomplete JSON — wait for more data
    }
  })

  console.log('   Ready. Waiting for MCP client connections...')
}

function parseFlags(args) {
  const flags = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true
      flags[key] = value
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1)
      const value = args[i + 1] && !args[i + 1].startsWith('-') ? args[++i] : true
      flags[key] = value
    }
  }
  return flags
}

function showHelp() {
  console.log(`
⚡ Uploop Vibe CLI

Usage: vibe <command> [subcommand] [flags]

Commands:
  vibe generate page     Generate a full page from intent
    --goal, -g           Page type (data-management, form, dashboard, etc.)
    --entity, -e         Entity name
    --actions, -a        Comma-separated actions (search,create,edit,delete)
    --layout, -l         Layout type (full-width, centered, sidebar-grid)
    --density            Density (compact, comfortable, spacious)
    --iterations         Max IFS iterations (default: 5)
    --threshold          Score convergence threshold (default: 85)

  vibe generate component  Generate a single component
    --type, -t           Component type (button, card, input, etc.)
    --label              Button/label text
    --variant            Variant (solid, outline, ghost, danger)
    --size               Size (xs, sm, md, lg, xl)
    --animate            Animation preset

  vibe list              List available components and templates
    --category           Filter by category

  vibe mcp               Start MCP server for AI agent connections
  vibe scaffold <name>   Scaffold a new Vibe project

Examples:
  vibe generate page --goal dashboard --entity Product
  vibe generate component --type button --label "Save" --variant solid
  vibe list --category navigation
  vibe mcp
`)
}

main().catch(console.error)
