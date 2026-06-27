// ─── @uploop-vibe/vibe-ai — Public API ───────────────────────
// AI-first component and page generation for Uploop.
//
// Breakthrough features:
//   - generateComponent(intent) → runnable Uploop component from intent
//   - composeEntityPage(schema, opts) → CRUD page from schema
//   - materializeTemplate('signupForm') → pre-built page
//   - Describe components, resolve intents, suggest flows
//
// v0.2 — AI Feedback Loop:
//   - validateVibeIntent(intent) → structured errors with alternatives
//   - auditManifest(manifest) → quality score + issues + suggestions
//   - requestComponent(name) → creation spec + queue tracking
//
// This is the AI bridge: describe what you want in plain intent,
// get a real, working Uploop component with Vibe design.

// ── Generator ────────────────────────────────────────────────

export {
  resolveComponentIntent,
  generateComponent,
  describeComponentIntent,
} from './generator.js'

// ── Schema Intent (re-export from @uploop/schema) ────────────

export {
  intent,
  resolveIntent,
  suggestIntent,
  intentToken
} from './generator.js'

// ── Composer ─────────────────────────────────────────────────

export {
  composeEntityPage,
  composeDashboard,
  composeListPage,
  entityComponent,
  entityFields,
} from './composer.js'

// ── Templates ────────────────────────────────────────────────

export {
  templates,
  materializeTemplate,
  listTemplates,
} from './templates.js'

// ── v0.2: AI Feedback Loop ──────────────────────────────────

export {
  ErrorCodes,
  getAlternatives,
  generateCreationSpec,
  createErrorResponse,
  createWarningResponse,
  createSuccessResponse,
} from './errors.js'

export {
  validateVibeIntent,
} from './validator.js'

export {
  auditManifest,
  quickScore,
} from './auditor.js'

export {
  requestComponent,
  getRequestQueue,
  getTopRequests,
  clearRequestQueue,
} from './spec-generator.js'

// ── Convenience re-exports ───────────────────────────────────

export { component } from '@uploop/html'
export { suggestFlow, flows, listFlows } from '@uploop/flows'
export { createPage, pageLayouts } from '@uploop-vibe/vibe'
