// ─── @uploop-vibe/vibe-ai Component Spec Generator ──────────
// When a component is missing, generate a creation spec.
// Track requests to prioritize what to build next.

import { generateCreationSpec as baseSpec } from './errors.js'

// ── Request Queue ───────────────────────────────────────────

/** @type {Map<string, { component: string, count: number, contexts: Array }>} */
const _requestQueue = new Map()

/**
 * Record that an AI requested a missing component.
 * Builds the creation spec and increments the request count.
 *
 * @param {string} componentName
 * @param {Object} [context]
 * @returns {Object} creation spec with request metadata
 */
export function requestComponent(componentName, context = {}) {
  const existing = _requestQueue.get(componentName)
  if (existing) {
    existing.count++
    existing.contexts.push(context)
    existing.priority = existing.count > 10 ? 'popular' : existing.count > 3 ? 'requested' : 'new'
    return { ...existing.spec, requestCount: existing.count, priority: existing.priority }
  }

  const spec = baseSpec(componentName, {
    purpose: context.description || `Requested via AI intent`,
    props: context.props || {},
    similarTo: context.similarTo || [],
  })

  _requestQueue.set(componentName, {
    component: componentName,
    count: 1,
    contexts: [context],
    priority: 'new',
    spec,
  })

  return { ...spec, requestCount: 1, priority: 'new' }
}

/**
 * Get the full request queue, sorted by priority.
 *
 * @returns {Array<{ component: string, count: number, priority: string, spec: Object }>}
 */
export function getRequestQueue() {
  const items = Array.from(_requestQueue.values())
  items.sort((a, b) => {
    const priorityOrder = { popular: 0, requested: 1, new: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority] || b.count - a.count
  })
  return items.map(({ component, count, priority, spec }) => ({
    component,
    requests: count,
    priority,
    spec,
  }))
}

/**
 * Get the most requested missing components (top N).
 *
 * @param {number} [n=5]
 * @returns {Array}
 */
export function getTopRequests(n = 5) {
  return getRequestQueue().slice(0, n)
}

/**
 * Clear the request queue (for testing).
 */
export function clearRequestQueue() {
  _requestQueue.clear()
}

// Re-export for convenience
export { generateCreationSpec } from './errors.js'
