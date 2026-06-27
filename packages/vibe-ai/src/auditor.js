// ─── @uploop-vibe/vibe-ai Manifest Auditor ──────────────────
// Post-resolution quality audit. Checks the generated manifest for
// missing states, performance issues, and accessibility gaps.

import { ErrorCodes, createWarningResponse } from './errors.js'

/**
 * Audit a page manifest and return quality issues + suggestions.
 *
 * @param {Object} manifest — page.describe() output
 * @returns {{ score: number, issues: Array, suggestions: Array }}
 */
export function auditManifest(manifest = {}) {
  const issues = []
  const suggestions = []
  const nodes = manifest.nodes || []
  const edges = manifest.edges || []

  // ── Missing state detection ──────────────────────────────

  const dataNodes = nodes.filter(n => n.type === 'data')
  const viewNodes = nodes.filter(n => n.type === 'view')
  const updateNodes = nodes.filter(n => n.type === 'update')
  const hasEmptyState = nodes.some(n => n.component === 'EmptyState')
  const hasErrorState = nodes.some(n => n.component === 'ErrorState')
  const hasLoadingState = nodes.some(n => n.component === 'Skeleton' || n.component === 'Spinner' || n.component === 'LoadingOverlay')

  // Check: any async data node → need loading + error states
  const hasAsync = updateNodes.some(n => n.async)
  if (hasAsync && !hasLoadingState) {
    issues.push(createWarningResponse({
      code: ErrorCodes.MISSING_LOADING_STATE,
      message: 'Page has async data fetches but no loading state component. Add Skeleton or LoadingOverlay.',
      fix: 'Add { type: "skeleton", props: { count: 3 } } to states.loading',
    }))
  }
  if (hasAsync && !hasErrorState) {
    issues.push(createWarningResponse({
      code: ErrorCodes.MISSING_ERROR_STATE,
      message: 'Page has async data fetches but no error state. Add ErrorState for graceful failure handling.',
      fix: 'Add { type: "errorState", props: { message: "Failed to load" } } to states.error',
    }))
  }

  // Check: data display components → need empty state
  const displayComponents = viewNodes.filter(n =>
    ['Table', 'List', 'Timeline', 'TreeView', 'Carousel'].includes(n.component)
  )
  if (displayComponents.length > 0 && !hasEmptyState && !hasAsync) {
    suggestions.push(createWarningResponse({
      code: ErrorCodes.MISSING_EMPTY_STATE,
      message: `Data display components found (${displayComponents.map(d => d.component).join(', ')}) but no empty state defined.`,
      fix: 'Add { type: "emptyState", props: { title: "No data" } } to states.empty',
    }))
  }

  // ── Performance checks ───────────────────────────────────

  // Check: search inputs without debounce
  const searchInputs = viewNodes.filter(n => n.component === 'SearchInput')
  searchInputs.forEach(si => {
    if (!si.props?.debounce) {
      suggestions.push(createWarningResponse({
        code: ErrorCodes.PERFORMANCE_WARNING,
        message: `SearchInput "${si.id}" has no debounce. Add debounce: 300 to prevent excessive re-renders.`,
        path: si.path,
        fix: 'Add { debounce: 300 } to SearchInput props',
      }))
    }
  })

  // Check: tables with many rows but no pagination
  const tables = viewNodes.filter(n => n.component === 'Table')
  const hasPagination = viewNodes.some(n => n.component === 'Pagination')
  tables.forEach(t => {
    if (!hasPagination) {
      suggestions.push(createWarningResponse({
        code: ErrorCodes.PERFORMANCE_WARNING,
        message: `Table "${t.id}" has no pagination. For >20 rows, add Pagination component.`,
        path: t.path,
        fix: 'Add Pagination component after the Table',
      }))
    }
  })

  // ── Accessibility checks ─────────────────────────────────

  // Check: icon buttons without labels
  const iconComponents = viewNodes.filter(n =>
    n.component === 'Icon' || n.component === 'Button'
  )
  iconComponents.forEach(ic => {
    if (ic.props?.icon && !ic.props?.label && !ic.props?.ariaLabel) {
      suggestions.push(createWarningResponse({
        code: ErrorCodes.ACCESSIBILITY_GAP,
        message: `Button "${ic.id}" has an icon but no label or ariaLabel. Screen readers need this.`,
        path: ic.path,
        fix: 'Add { ariaLabel: "description" } to the component',
      }))
    }
  })

  // Check: images without alt text
  const images = viewNodes.filter(n => n.component === 'Image' || n.component === 'Figure')
  images.forEach(img => {
    if (!img.props?.alt) {
      suggestions.push(createWarningResponse({
        code: ErrorCodes.ACCESSIBILITY_GAP,
        message: `Image "${img.id}" has no alt text. Add alt prop for screen readers.`,
        path: img.path,
        fix: 'Add { alt: "description of image" } to the component',
      }))
    }
  })

  // ── Data flow checks ─────────────────────────────────────

  // Check: orphan views (rendered but no data source)
  const displayViews = viewNodes.filter(n =>
    ['Table', 'List', 'Stat', 'Timeline', 'Sparkline', 'Gauge'].includes(n.component)
  )
  displayViews.forEach(dv => {
    const hasDataSource = edges.some(e => e.to === dv.id || (e.target && dv.id.includes(e.target)))
    if (!hasDataSource && !dv.props?.rows && !dv.props?.data && !dv.props?.value) {
      suggestions.push(createWarningResponse({
        code: ErrorCodes.PERFORMANCE_WARNING,
        message: `Display component "${dv.id}" (${dv.component}) has no visible data source. It will render empty.`,
        path: dv.path,
      }))
    }
  })

  // ── Compute score ────────────────────────────────────────

  const issuePoints = issues.filter(i => i.warning?.severity === 'high').length * 15 +
                      issues.filter(i => i.warning?.severity === 'medium').length * 5 +
                      issues.filter(i => i.warning?.severity === 'low').length * 2
  const suggestionPoints = suggestions.length * 3
  const score = Math.max(0, 100 - issuePoints - suggestionPoints)

  return {
    score: Math.round(score),
    grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F',
    issues,
    suggestions,
  }
}

/**
 * Quick audit — just the score, no details.
 *
 * @param {Object} manifest
 * @returns {number}
 */
export function quickScore(manifest) {
  const { score } = auditManifest(manifest)
  return score
}
