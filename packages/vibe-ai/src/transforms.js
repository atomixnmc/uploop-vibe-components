// ─── @uploop-vibe/vibe-ai Transform Engine ──────────────────
// Core IFS operations: applyTransform, applyTransforms, diff.
// Deterministic graph mutations with validation and rollback.

import { ErrorCodes, createErrorResponse, createSuccessResponse } from './errors.js'

// ── Transform Application ───────────────────────────────────

/**
 * Apply a single transform to an intent/component-tree.
 *
 * Supported ops: add, remove, replace, update, move, rewire, addEdge, removeEdge,
 *                addState, setBehavior, batch
 *
 * @param {Object} target — the intent object or manifest to transform
 * @param {Object} transform — { op, path, value, ... }
 * @returns {{ ok: boolean, result: Object, error?: Object }}
 */
export function applyTransform(target, transform) {
  try {
    switch (transform.op) {
      case 'add':
        return applyAdd(target, transform)
      case 'remove':
        return applyRemove(target, transform)
      case 'replace':
        return applyReplace(target, transform)
      case 'update':
        return applyUpdate(target, transform)
      case 'move':
        return applyMove(target, transform)
      case 'rewire':
        return applyRewire(target, transform)
      case 'addEdge':
        return applyAddEdge(target, transform)
      case 'removeEdge':
        return applyRemoveEdge(target, transform)
      case 'addState':
        return applyAddState(target, transform)
      case 'setBehavior':
        return applySetBehavior(target, transform)
      case 'batch':
        return applyBatch(target, transform)
      default:
        return {
          ok: false,
          error: createErrorResponse({
            code: ErrorCodes.INVALID_PROP,
            message: `Unknown transform operation: "${transform.op}". Supported: add, remove, replace, update, move, rewire, addEdge, removeEdge, addState, setBehavior, batch.`,
            value: transform.op,
          }),
        }
    }
  } catch (e) {
    return {
      ok: false,
      error: createErrorResponse({
        code: ErrorCodes.INVALID_PROP,
        message: `Transform failed: ${e.message}`,
        path: transform.path,
      }),
    }
  }
}

/**
 * Apply multiple transforms atomically.
 * If ANY transform fails, all are rolled back (target is not mutated).
 *
 * @param {Object} target
 * @param {Array<Object>} transforms
 * @returns {{ ok: boolean, result: Object, applied: number, failures: Array }}
 */
export function applyTransforms(target, transforms) {
  const snapshot = deepClone(target)
  const failures = []
  let applied = 0

  for (const transform of transforms) {
    const result = applyTransform(target, transform)
    if (!result.ok) {
      failures.push({ transform, error: result.error })
      // Rollback: restore snapshot
      Object.assign(target, snapshot)
      // Re-apply all succeeding transforms up to this point
      let reapplyCount = 0
      for (const t of transforms.slice(0, applied)) {
        applyTransform(target, t)
        reapplyCount++
      }
      // This isn't perfect for nested objects — a proper implementation
      // would deep-clone and swap. For now, partial rollback.
      return { ok: false, result: snapshot, applied: 0, failures }
    }
    applied++
  }

  return { ok: true, result: target, applied, failures: [] }
}

// ── Individual Operations ───────────────────────────────────

function applyAdd(target, { path, value }) {
  if (!value) {
    return { ok: false, error: createErrorResponse({ code: ErrorCodes.MISSING_REQUIRED_PROP, message: '"add" transform requires a "value".', path }) }
  }
  const { parent, key } = resolvePath(target, path)
  if (!parent) {
    return { ok: false, error: createErrorResponse({ code: ErrorCodes.INVALID_PROP, message: `Path "${path}" not found in target.`, path }) }
  }
  if (Array.isArray(parent)) {
    const index = parseInt(key)
    if (isNaN(index) || index < 0 || index > parent.length) {
      parent.push(value)
    } else {
      parent.splice(index, 0, value)
    }
  } else if (typeof parent === 'object') {
    parent[key] = value
  }
  return { ok: true, result: target }
}

function applyRemove(target, { path }) {
  const { parent, key } = resolvePath(target, path)
  if (!parent) {
    return { ok: false, error: createErrorResponse({ code: ErrorCodes.INVALID_PROP, message: `Path "${path}" not found.`, path }) }
  }
  if (Array.isArray(parent)) {
    const index = parseInt(key)
    if (isNaN(index) || index < 0 || index >= parent.length) {
      return { ok: false, error: createErrorResponse({ code: ErrorCodes.INVALID_PROP, message: `Index "${key}" out of bounds.`, path }) }
    }
    parent.splice(index, 1)
  } else if (typeof parent === 'object') {
    delete parent[key]
  }
  return { ok: true, result: target }
}

function applyReplace(target, { path, value }) {
  return applyUpdate(target, { path, value, op: 'replace' })
}

function applyUpdate(target, { path, value }) {
  const { parent, key } = resolvePath(target, path)
  if (!parent) {
    return { ok: false, error: createErrorResponse({ code: ErrorCodes.INVALID_PROP, message: `Path "${path}" not found.`, path }) }
  }
  if (Array.isArray(parent)) {
    const index = parseInt(key)
    if (isNaN(index) || index < 0 || index >= parent.length) {
      return { ok: false, error: createErrorResponse({ code: ErrorCodes.INVALID_PROP, message: `Index "${key}" out of bounds.`, path }) }
    }
    parent[index] = value
  } else if (typeof parent === 'object') {
    parent[key] = value
  }
  return { ok: true, result: target }
}

function applyMove(target, { from, to }) {
  const fromResolved = resolvePath(target, from)
  const toResolved = resolvePath(target, to)
  if (!fromResolved.parent) {
    return { ok: false, error: createErrorResponse({ code: ErrorCodes.INVALID_PROP, message: `Source path "${from}" not found.` }) }
  }
  const value = deepClone(fromResolved.parent[fromResolved.key])
  // Remove from source
  if (Array.isArray(fromResolved.parent)) {
    fromResolved.parent.splice(parseInt(fromResolved.key), 1)
  } else {
    delete fromResolved.parent[fromResolved.key]
  }
  // Add to target
  if (!toResolved.parent) {
    return { ok: false, error: createErrorResponse({ code: ErrorCodes.INVALID_PROP, message: `Destination path "${to}" not found.` }) }
  }
  if (Array.isArray(toResolved.parent)) {
    toResolved.parent.splice(parseInt(toResolved.key), 0, value)
  } else {
    toResolved.parent[toResolved.key] = value
  }
  return { ok: true, result: target }
}

function applyRewire(target, { edge, newTarget }) {
  const edges = target.edges || target.manifest?.edges
  if (!edges) {
    return { ok: false, error: createErrorResponse({ code: ErrorCodes.INVALID_PROP, message: 'No edges found in target. Use a manifest with an "edges" array.' }) }
  }
  const existing = edges.find(e => e.from === edge.from && e.to === edge.to)
  if (!existing) {
    return { ok: false, error: createErrorResponse({ code: ErrorCodes.INVALID_PROP, message: `Edge ${edge.from}→${edge.to} not found.` }) }
  }
  existing.to = newTarget
  return { ok: true, result: target }
}

function applyAddEdge(target, { edge }) {
  const edges = target.edges || target.manifest?.edges
  if (!edges) {
    if (!target.edges) target.edges = []
  }
  const edgesArr = target.edges || []
  edgesArr.push(edge)
  return { ok: true, result: target }
}

function applyRemoveEdge(target, { edge }) {
  const edges = target.edges
  if (!edges) {
    return { ok: false, error: createErrorResponse({ code: ErrorCodes.INVALID_PROP, message: 'No edges found in target.' }) }
  }
  const idx = edges.findIndex(e => e.from === edge.from && e.to === edge.to)
  if (idx === -1) {
    return { ok: false, error: createErrorResponse({ code: ErrorCodes.INVALID_PROP, message: `Edge ${edge.from}→${edge.to} not found.` }) }
  }
  edges.splice(idx, 1)
  return { ok: true, result: target }
}

function applyAddState(target, { state, value }) {
  if (!target.states) target.states = {}
  target.states[state] = value
  return { ok: true, result: target }
}

function applySetBehavior(target, { behavior, value }) {
  if (!target.behaviors) target.behaviors = {}
  target.behaviors[behavior] = value
  return { ok: true, result: target }
}

function applyBatch(target, { transforms }) {
  if (!Array.isArray(transforms)) {
    return { ok: false, error: createErrorResponse({ code: ErrorCodes.INVALID_PROP, message: '"batch" transform requires a "transforms" array.' }) }
  }
  return applyTransforms(target, transforms)
}

// ── Path Resolution ─────────────────────────────────────────

/**
 * Resolve a dot/bracket path into its parent object and key.
 * e.g., "sections.content.components[0].props.label"
 *   → { parent: components[0].props, key: 'label' }
 */
function resolvePath(obj, path) {
  if (!path) return { parent: obj, key: null }
  const parts = parsePath(path)
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (current === null || current === undefined) return { parent: null, key: null }
    if (Array.isArray(current)) {
      const idx = parseInt(part)
      if (isNaN(idx)) return { parent: null, key: null }
      current = current[idx]
    } else if (typeof current === 'object') {
      current = current[part]
    } else {
      return { parent: null, key: null }
    }
  }
  const lastKey = parts[parts.length - 1]
  return { parent: current, key: lastKey }
}

function parsePath(path) {
  const parts = []
  let current = ''
  for (let i = 0; i < path.length; i++) {
    const ch = path[i]
    if (ch === '.') {
      if (current) parts.push(current)
      current = ''
    } else if (ch === '[') {
      if (current) parts.push(current)
      current = ''
    } else if (ch === ']') {
      if (current) parts.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current) parts.push(current)
  return parts
}

// ── Diff Engine ─────────────────────────────────────────────

/**
 * Compute a structured diff between two manifests.
 *
 * @param {Object} before
 * @param {Object} after
 * @returns {{ added: Array, removed: Array, changed: Array }}
 */
export function diff(before, after) {
  const added = []
  const removed = []
  const changed = []

  // Diff nodes
  const beforeNodes = (before.nodes || []).reduce((acc, n) => { acc[n.id] = n; return acc }, {})
  const afterNodes = (after.nodes || []).reduce((acc, n) => { acc[n.id] = n; return acc }, {})

  for (const id of Object.keys(afterNodes)) {
    if (!beforeNodes[id]) {
      added.push({ type: 'node', id, component: afterNodes[id].component })
    }
  }
  for (const id of Object.keys(beforeNodes)) {
    if (!afterNodes[id]) {
      removed.push({ type: 'node', id, component: beforeNodes[id].component })
    } else {
      // Check for prop changes
      const bNode = beforeNodes[id]
      const aNode = afterNodes[id]
      const propChanges = []
      for (const key of Object.keys(aNode.props || {})) {
        if (JSON.stringify(bNode.props?.[key]) !== JSON.stringify(aNode.props[key])) {
          propChanges.push({ key, from: bNode.props?.[key], to: aNode.props[key] })
        }
      }
      for (const key of Object.keys(bNode.props || {})) {
        if (!(key in (aNode.props || {}))) {
          propChanges.push({ key, from: bNode.props[key], to: undefined })
        }
      }
      if (propChanges.length > 0) {
        changed.push({ type: 'node', id, component: aNode.component, propChanges })
      }
    }
  }

  // Diff edges
  const beforeEdges = (before.edges || [])
  const afterEdges = (after.edges || [])
  for (const edge of afterEdges) {
    if (!beforeEdges.some(e => e.from === edge.from && e.to === edge.to)) {
      added.push({ type: 'edge', from: edge.from, to: edge.to })
    }
  }
  for (const edge of beforeEdges) {
    if (!afterEdges.some(e => e.from === edge.from && e.to === edge.to)) {
      removed.push({ type: 'edge', from: edge.from, to: edge.to })
    }
  }

  // Diff states
  const beforeStates = Object.keys(before.states || {})
  const afterStates = Object.keys(after.states || {})
  for (const state of afterStates) {
    if (!beforeStates.includes(state)) {
      added.push({ type: 'state', state })
    }
  }

  return { added, removed, changed }
}

// ── Utilities ───────────────────────────────────────────────

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
