// ─── @uploop-vibe/vibe-cli — Public API ──────────────────────
// CLI for generating UI on demand. MCP server for AI agent tooling.

export { generatePage, generateComponent, listAvailable, scaffoldProject } from './commands.js'
export { createMCPServer } from './mcp-server.js'
