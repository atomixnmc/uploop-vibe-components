// ─── @uploop-vibe/vibe-ai — Public API ───────────────────────
// AI-first component and page generation for Uploop.
//
// v0.1 — Component generation + templates
// v0.2 — AI Feedback Loop (validator, auditor, IFS engine)

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

// ── v0.2: Error System ──────────────────────────────────────

export {
  ErrorCodes,
  getAlternatives,
  generateCreationSpec,
  createErrorResponse,
  createWarningResponse,
  createSuccessResponse,
} from './errors.js'

// ── v0.2: Validator ─────────────────────────────────────────

export {
  validateVibeIntent,
} from './validator.js'

// ── v0.2: Auditor ───────────────────────────────────────────

export {
  auditManifest,
  quickScore,
} from './auditor.js'

// ── v0.2: Spec Generator ────────────────────────────────────

export {
  requestComponent,
  getRequestQueue,
  getTopRequests,
  clearRequestQueue,
} from './spec-generator.js'

// ── v0.2: Transform Engine ──────────────────────────────────

export {
  applyTransform,
  applyTransforms,
  diff,
} from './transforms.js'

// ── v0.2: Loop Guard ────────────────────────────────────────

export {
  createLoopGuard,
  ScoreWeights,
  weightedAudit,
} from './loop-guard.js'

// ── v0.2: IFS Engine ────────────────────────────────────────

export {
  runIFSLoop,
} from './ifs-engine.js'

// ── Convenience re-exports ───────────────────────────────────

export { component } from '@uploop/html'
export { suggestFlow, flows, listFlows } from '@uploop/flows'
export { createPage, pageLayouts } from '@uploop-vibe/vibe'
