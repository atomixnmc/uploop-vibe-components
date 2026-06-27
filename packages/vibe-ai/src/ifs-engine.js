// ─── @uploop-vibe/vibe-ai IFS Engine ────────────────────────
// The Iterated Function System loop controller.
// Drives the AI → Vibe → AI cycle: validate, apply, diff, audit, converge.

import { validateVibeIntent } from './validator.js'
import { applyTransform, applyTransforms, diff } from './transforms.js'
import { auditManifest } from './auditor.js'
import { createLoopGuard, weightedAudit } from './loop-guard.js'
import { createErrorResponse, ErrorCodes } from './errors.js'

/**
 * Run the IFS loop: seed → resolve → iterate → converge.
 *
 * @param {Object} seedIntent — the initial intent (goal + entity + actions + constraints)
 * @param {Object} [opts]
 * @param {number} [opts.maxIterations=10]
 * @param {number} [opts.scoreThreshold=85]
 * @param {Function} [opts.aiAgent] — external AI agent that proposes transforms.
 *        Called as aiAgent(manifest, audit, iteration, history).
 *        Must return an array of transforms, or null/[] to stop.
 *        If omitted, uses built-in heuristic suggestions only.
 * @param {Function} [opts.onIteration] — callback(iteration, manifest, audit, transforms)
 * @returns {Promise<{ manifest: Object, iterations: number, score: number, history: Array }>}
 */
export async function runIFSLoop(seedIntent, opts = {}) {
  const guard = createLoopGuard({
    maxIterations: opts.maxIterations || 10,
    scoreThreshold: opts.scoreThreshold || 85,
  })

  // Step 1: Validate the seed
  const validation = validateVibeIntent(seedIntent)
  if (!validation.ok) {
    return {
      success: false,
      reason: 'seed_validation_failed',
      errors: validation.errors,
      iterations: 0,
    }
  }

  // Step 2: Resolve the seed into a manifest
  // For now, use the seed itself as the manifest (full resolver is Phase 3)
  const manifest = resolveSeedToManifest(seedIntent)
  let currentManifest = deepClone(manifest)
  const history = []

  // Step 3: Initial audit
  let audit = auditManifest(currentManifest)
  let guardResult = guard.step(currentManifest, audit.score)

  history.push({
    iteration: 0,
    manifest: deepClone(currentManifest),
    audit: { ...audit },
    transforms: [],
    diff: null,
  })

  if (opts.onIteration) {
    opts.onIteration(0, currentManifest, audit, [])
  }

  // Step 4: Iterate
  while (guardResult.continue) {
    // Get transforms from the AI agent (or built-in heuristics)
    let transforms = []
    if (opts.aiAgent) {
      transforms = await opts.aiAgent(currentManifest, audit, guard.iteration, history)
      if (!transforms || transforms.length === 0) {
        // AI agent chose to stop
        return finish(currentManifest, history, guard, 'ai_agent_stopped')
      }
    } else {
      // No AI agent — use built-in suggestions from the audit
      transforms = auditToTransforms(audit, currentManifest)
      if (transforms.length === 0) {
        return finish(currentManifest, history, guard, 'no_suggestions')
      }
    }

    // Check if any transform would cause oscillation
    for (const transform of transforms) {
      const risk = guard.wouldOscillate(transform, currentManifest)
      if (risk.risky) {
        // Skip this transform
        transforms = transforms.filter(t => t !== transform)
      }
    }
    if (transforms.length === 0) {
      return finish(currentManifest, history, guard, 'all_transforms_risky')
    }

    // Apply transforms
    const beforeManifest = deepClone(currentManifest)
    const result = applyTransforms(currentManifest, transforms)
    const transformSuccess = result.ok

    // Record transform attempt
    const tfResult = guard.recordTransform(transformSuccess)
    if (!tfResult.continue) {
      return finish(beforeManifest, history, guard, 'transform_failures')
    }

    // Compute diff
    const delta = diff(beforeManifest, currentManifest)

    // Re-audit
    audit = auditManifest(currentManifest)
    guardResult = guard.step(currentManifest, audit.score)

    history.push({
      iteration: guard.iteration,
      manifest: deepClone(currentManifest),
      audit: { ...audit },
      transforms: [...transforms],
      diff: delta,
    })

    if (opts.onIteration) {
      opts.onIteration(guard.iteration, currentManifest, audit, transforms)
    }
  }

  return finish(currentManifest, history, guard, guardResult.status || guardResult.reason)
}

function finish(manifest, history, guard, reason) {
  return {
    success: true,
    reason,
    manifest,
    iterations: history.length - 1,
    finalScore: history[history.length - 1]?.audit?.score || 0,
    history,
    summary: guard.summary(),
  }
}

// ── Seed Resolution (Phase 3 preview) ───────────────────────

/**
 * Resolve a seed intent into a manifest structure.
 * This is a simplified resolver — the full goal→intent resolver is Phase 3.
 */
function resolveSeedToManifest(seed) {
  const nodes = []
  const edges = []

  // Header
  if (seed.entity) {
    const title = seed.overrides?.['sections.header.title'] || seed.entity.name + 's'
    nodes.push({
      id: 'page-header',
      type: 'view',
      component: 'Heading',
      props: { level: 'h1', text: title },
      path: 'sections.header.components[0]',
    })
  }

  // Toolbar from actions
  const actions = seed.actions || []
  if (actions.includes('search')) {
    nodes.push({
      id: 'search-input',
      type: 'view',
      component: 'SearchInput',
      props: { placeholder: 'Search...', debounce: 300 },
      path: 'sections.toolbar.components[0]',
    })
    nodes.push({ id: 'search-query', type: 'data', value: '' })
    edges.push({ from: 'search-input', to: 'search-query', type: 'updates' })
  }
  if (actions.includes('create')) {
    nodes.push({
      id: 'create-btn',
      type: 'view',
      component: 'Button',
      props: { label: 'Add ' + (seed.entity?.name || 'Item'), variant: 'solid' },
      path: 'sections.toolbar.components[1]',
    })
  }
  if (actions.includes('export')) {
    nodes.push({
      id: 'export-btn',
      type: 'view',
      component: 'Button',
      props: { label: 'Export', variant: 'outline' },
      path: 'sections.toolbar.components[2]',
    })
  }

  // Content from entity fields
  if (seed.entity?.fields) {
    const columns = seed.entity.fields.filter(f => f.display !== false).map(f => ({
      key: f.name,
      label: f.name.charAt(0).toUpperCase() + f.name.slice(1),
    }))
    nodes.push({
      id: 'data-table',
      type: 'view',
      component: 'Table',
      props: { columns, rows: [], striped: true, hoverable: true },
      path: 'sections.content.components[0]',
    })
    nodes.push({ id: 'table-data', type: 'data', source: `api/${seed.entity.name.toLowerCase()}` })
    edges.push({ from: 'table-data', to: 'data-table', type: 'renders', target: 'rows' })
  }

  // Layout
  const layout = seed.constraints?.layout || 'full-width'

  return {
    kind: 'uploop-vibe.manifest',
    version: '0.2.0',
    intent: seed,
    layout,
    nodes,
    edges,
    states: {},
  }
}

// ── Built-in Heuristic Transform Suggestions ────────────────

/**
 * Convert audit issues and suggestions into concrete transforms.
 * This is the built-in "AI" — deterministic heuristics.
 */
function auditToTransforms(audit, manifest) {
  const transforms = []

  for (const issue of audit.issues || []) {
    const code = issue.warning?.code || issue.code
    if (code === 'missing_empty_state' || code === 'missing_loading_state' || code === 'missing_error_state') {
      transforms.push({
        op: 'addState',
        state: code.replace('missing_', '').replace('_state', ''),
        value: {
          component: code === 'missing_loading_state' ? 'Skeleton' : code === 'missing_error_state' ? 'ErrorState' : 'EmptyState',
          props: code === 'missing_loading_state' ? { count: 3 } : code === 'missing_error_state' ? { message: 'Something went wrong' } : { title: 'No data' },
        },
      })
    }
  }

  for (const suggestion of audit.suggestions || []) {
    const code = suggestion.warning?.code || suggestion.code
    if (code === 'performance_warning' || code === 'missing_debounce') {
      // Find the search input and add debounce
      const searchNode = (manifest.nodes || []).find(n => n.component === 'SearchInput')
      if (searchNode) {
        transforms.push({
          op: 'update',
          path: `nodes[${manifest.nodes.indexOf(searchNode)}].props.debounce`,
          value: 300,
        })
      }
    }
  }

  return transforms
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
