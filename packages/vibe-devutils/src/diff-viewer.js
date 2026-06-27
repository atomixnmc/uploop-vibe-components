// ─── @uploop-vibe/vibe-devutils Diff Viewer ──────────────────
// Visual diff between two page manifests.
// For human review and AI verification.

import { diff } from '@uploop-vibe/vibe-ai'

/**
 * View a structured diff between two manifests.
 *
 * @param {Object} before — original manifest
 * @param {Object} after — modified manifest
 * @returns {Object} diff result with summary
 */
export function viewDiff(before, after) {
  const delta = diff(before, after)

  return {
    ...delta,
    summary: diffSummary(delta),
  }
}

/**
 * Generate a human-readable summary of a diff.
 *
 * @param {Object} delta
 * @returns {string}
 */
export function diffSummary(delta) {
  const parts = []

  const nodeAdded = delta.added.filter(d => d.type === 'node')
  const nodeRemoved = delta.removed.filter(d => d.type === 'node')
  const nodeChanged = delta.changed.filter(d => d.type === 'node')
  const edgeAdded = delta.added.filter(d => d.type === 'edge')
  const edgeRemoved = delta.removed.filter(d => d.type === 'edge')
  const stateAdded = delta.added.filter(d => d.type === 'state')

  if (nodeAdded.length) parts.push(`+${nodeAdded.length} component(s) added`)
  if (nodeRemoved.length) parts.push(`-${nodeRemoved.length} component(s) removed`)
  if (nodeChanged.length) parts.push(`~${nodeChanged.length} component(s) modified`)
  if (edgeAdded.length) parts.push(`+${edgeAdded.length} edge(s) added`)
  if (edgeRemoved.length) parts.push(`-${edgeRemoved.length} edge(s) removed`)
  if (stateAdded.length) parts.push(`+${stateAdded.length} state(s) added`)

  if (parts.length === 0) return 'No changes'
  return parts.join(', ')
}

/**
 * Render a diff as an HTML table (for embedding in pages).
 *
 * @param {Object} delta
 * @returns {string} HTML
 */
export function diffToHTML(delta) {
  if (!delta.added?.length && !delta.removed?.length && !delta.changed?.length) {
    return '<div style="padding:1rem;text-align:center;color:var(--vibe-color-muted);">No changes</div>'
  }

  let html = '<div style="font-family:monospace;font-size:0.8rem;">'

  // Added
  for (const item of delta.added || []) {
    html += `<div style="padding:0.2rem 0.5rem;background:#d3f9d8;color:#2b8a3e;margin-bottom:0.15rem;border-radius:3px;">
      <span style="font-weight:700;">+ added</span> ${item.type}: ${item.component || item.state || `${item.from}→${item.to}`}
    </div>`
  }

  // Removed
  for (const item of delta.removed || []) {
    html += `<div style="padding:0.2rem 0.5rem;background:#ffe3e3;color:#c92a2a;margin-bottom:0.15rem;border-radius:3px;">
      <span style="font-weight:700;">- removed</span> ${item.type}: ${item.component || `${item.from}→${item.to}`}
    </div>`
  }

  // Changed
  for (const item of delta.changed || []) {
    const changes = (item.propChanges || []).map(c => `${c.key}: ${JSON.stringify(c.from)} → ${JSON.stringify(c.to)}`).join(', ')
    html += `<div style="padding:0.2rem 0.5rem;background:#fff3bf;color:#e67700;margin-bottom:0.15rem;border-radius:3px;">
      <span style="font-weight:700;">~ modified</span> ${item.component || item.id}: ${changes}
    </div>`
  }

  html += '</div>'
  return html
}
