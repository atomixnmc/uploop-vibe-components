// ─── @uploop-vibe/vibe-devutils — Public API ─────────────────
// DevX tools for humans and AI agents: inspector, debugger, diff viewer.
//
// Human DevX:
//   - HyperGraph Inspector: visualize page manifests as interactive graphs
//   - Intent Debugger: validate intents inline, see errors with fix suggestions
//   - Manifest Diff Viewer: visual diff between two graph versions
//   - Component Playground: quick component testing with live prop editing
//
// AI DevX:
//   - Manifest Serializer: compact token-efficient graph format for LLM context
//   - Intent Suggester: deterministic heuristics for improvement suggestions
//   - Audit Reporter: structured quality report generation
//   - Loop Monitor: visualize IFS convergence

// ── Inspector ────────────────────────────────────────────────

export {
  inspectManifest,
  visualizeGraph,
  exportGraphAsMermaid,
  exportGraphAsJSON,
} from './inspector.js'

// ── Debugger ─────────────────────────────────────────────────

export {
  debugIntent,
  debugManifest,
  formatValidationErrors,
} from './debugger.js'

// ── Diff Viewer ──────────────────────────────────────────────

export {
  viewDiff,
  diffSummary,
  diffToHTML,
} from './diff-viewer.js'

// ── Serializer (AI-optimized) ────────────────────────────────

export {
  serializeManifest,
  deserializeManifest,
  estimateTokens,
} from './serializer.js'
