// ─── @uploop-vibe/vibe-ai Loop Guard ───────────────────────
// Prevents infinite loops, oscillation, and deadlocks in IFS iterations.
// Tracks convergence, detects stalls, enforces safety limits.

// ── Convergence State ───────────────────────────────────────

/**
 * Create a loop guard to track iteration state and prevent infinite loops.
 *
 * @param {Object} [opts]
 * @param {number} [opts.maxIterations=10] — hard cap on iterations
 * @param {number} [opts.scoreThreshold=90] — converge when score reaches this
 * @param {number} [opts.minImprovement=1] — minimum score improvement per iteration (else stall)
 * @param {number} [opts.stallLimit=3] — consecutive stalls before forced stop
 * @param {number} [opts.oscillationWindow=4] — lookback window for oscillation detection
 * @param {number} [opts.transformFailLimit=3] — consecutive transform failures before abort
 * @returns {Object} loop guard
 */
export function createLoopGuard(opts = {}) {
  const maxIterations = opts.maxIterations || 10
  const scoreThreshold = opts.scoreThreshold || 90
  const minImprovement = opts.minImprovement || 1
  const stallLimit = opts.stallLimit || 3
  const oscillationWindow = opts.oscillationWindow || 4
  const transformFailLimit = opts.transformFailLimit || 3

  let iteration = 0
  let bestScore = 0
  let consecutiveStalls = 0
  let consecutiveFailures = 0
  /** @type {Array<{ iteration: number, score: number, hash: string }>} */
  const history = []

  /**
   * Compute a hash for a graph manifest (for oscillation detection).
   * Uses a simple structural hash — fast, deterministic.
   */
  function graphHash(manifest) {
    const nodes = (manifest.nodes || []).map(n => `${n.id}:${n.type}:${n.component || ''}`).sort().join('|')
    const edges = (manifest.edges || []).map(e => `${e.from}→${e.to}`).sort().join('|')
    return `${nodes}::${edges}`
  }

  /**
   * Check if the graph is oscillating between two states.
   * Looks at the last N iterations for repeating patterns.
   */
  function detectOscillation(currentHash) {
    if (history.length < oscillationWindow) return false
    const recent = history.slice(-oscillationWindow).map(h => h.hash)
    recent.push(currentHash)
    // Check for pattern: A, B, A, B (oscillation between two states)
    for (let period = 2; period <= 3; period++) {
      let oscillating = true
      for (let i = period; i < recent.length; i++) {
        if (recent[i] !== recent[i - period]) {
          oscillating = false
          break
        }
      }
      if (oscillating) return { period, states: recent.slice(-period) }
    }
    return false
  }

  /**
   * Record an iteration and check for convergence/stall/oscillation.
   *
   * @param {Object} manifest — current graph manifest
   * @param {number} auditScore — score from auditManifest
   * @returns {{ continue: boolean, reason?: string, status: 'converged'|'stalled'|'oscillating'|'max_iterations'|'continuing' }}
   */
  function step(manifest, auditScore) {
    iteration++
    const hash = graphHash(manifest)
    history.push({ iteration, score: auditScore, hash })

    // Update best score
    if (auditScore > bestScore) {
      bestScore = auditScore
      consecutiveStalls = 0
    }

    // 1. Score threshold reached → converged
    if (auditScore >= scoreThreshold) {
      return { continue: false, reason: `Score ${auditScore} reached threshold ${scoreThreshold}`, status: 'converged' }
    }

    // 2. Max iterations reached
    if (iteration >= maxIterations) {
      return { continue: false, reason: `Max iterations (${maxIterations}) reached. Best score: ${bestScore}`, status: 'max_iterations' }
    }

    // 3. Oscillation detected
    const oscillation = detectOscillation(hash)
    if (oscillation) {
      return {
        continue: false,
        reason: `Oscillation detected (period ${oscillation.period}). UI is cycling between states without improving.`,
        status: 'oscillating',
      }
    }

    // 4. Stagnation check — no improvement
    if (auditScore <= bestScore && (bestScore - auditScore) < minImprovement) {
      consecutiveStalls++
      if (consecutiveStalls >= stallLimit) {
        return {
          continue: false,
          reason: `Stalled for ${consecutiveStalls} iterations. Best score: ${bestScore}. No improvement.`,
          status: 'stalled',
        }
      }
    } else {
      consecutiveStalls = 0
    }

    return { continue: true, status: 'continuing' }
  }

  /**
   * Record a transform application attempt.
   *
   * @param {boolean} success — did the transform apply successfully?
   * @returns {{ continue: boolean, reason?: string }}
   */
  function recordTransform(success) {
    if (success) {
      consecutiveFailures = 0
      return { continue: true }
    }
    consecutiveFailures++
    if (consecutiveFailures >= transformFailLimit) {
      return {
        continue: false,
        reason: `${consecutiveFailures} consecutive transform failures. Check the transforms for validity.`,
      }
    }
    return { continue: true }
  }

  /**
   * Get a summary of the loop state.
   */
  function summary() {
    return {
      iterations: iteration,
      bestScore,
      consecutiveStalls,
      consecutiveFailures,
      history: history.map(h => ({ iteration: h.iteration, score: h.score })),
      converged: bestScore >= scoreThreshold,
    }
  }

  /**
   * Check if a specific transform would likely cause oscillation.
   * Compares the proposed change against recent history.
   *
   * @param {Object} transform
   * @param {Object} manifest
   * @returns {{ risky: boolean, reason?: string }}
   */
  function wouldOscillate(transform, manifest) {
    if (history.length < 3) return { risky: false }

    // Build what the graph would look like after this transform
    const afterHash = graphHash(manifest) + '|' + JSON.stringify(transform)

    // Check if this exact transform was recently applied and then reversed
    const recentTransforms = history.slice(-4)
    // Simple heuristic: if the last 2 iterations had the same hash and we're about to change it again
    if (recentTransforms.length >= 2) {
      const lastTwo = recentTransforms.slice(-2)
      if (lastTwo[0].hash === lastTwo[1].hash && lastTwo[0].score < bestScore) {
        return {
          risky: true,
          reason: 'This transform may reverse a recent improvement. The last 2 iterations had the same output.',
        }
      }
    }

    return { risky: false }
  }

  return {
    step,
    recordTransform,
    summary,
    wouldOscillate,
    graphHash,
    get history() { return history },
    get iteration() { return iteration },
  }
}

// ── Scoring Enhancements ────────────────────────────────────

/**
 * Weighted scoring — different issues have different severity weights.
 * More nuanced than the simple point-deduction in auditor.js.
 */
export const ScoreWeights = {
  // Critical (fail the page)
  missing_error_state:     20,
  missing_loading_state:   15,
  circular_dependency:     25,

  // High (degraded UX)
  missing_empty_state:     10,
  performance_warning:      8,
  prop_type_mismatch:       5,

  // Medium (polish)
  accessibility_gap:        4,
  missing_aria_label:       3,
  missing_alt_text:         3,

  // Low (nice-to-have)
  missing_debounce:         2,
  missing_pagination:       2,
}

/**
 * Enhanced audit with weighted scoring.
 * Replaces simple point deduction with weighted severity.
 *
 * @param {Object} manifest
 * @returns {{ score: number, grade: string, breakdown: Object }}
 */
export function weightedAudit(manifest, auditResult) {
  const { issues = [], suggestions = [] } = auditResult || {}

  let totalDeduction = 0
  const breakdown = { critical: [], high: [], medium: [], low: [] }

  for (const issue of issues) {
    const code = issue.warning?.code || issue.code
    const weight = ScoreWeights[code] || 5
    totalDeduction += weight

    const category = weight >= 20 ? 'critical' : weight >= 10 ? 'high' : weight >= 4 ? 'medium' : 'low'
    breakdown[category].push({ code, weight, message: issue.warning?.message || issue.message })
  }

  for (const suggestion of suggestions) {
    const code = suggestion.warning?.code || suggestion.code
    const weight = (ScoreWeights[code] || 2) * 0.5 // suggestions are half weight
    totalDeduction += weight

    const category = weight >= 4 ? 'medium' : 'low'
    breakdown[category].push({ code, weight: Math.round(weight), message: suggestion.warning?.message || suggestion.message, suggestion: true })
  }

  const score = Math.max(0, Math.round(100 - totalDeduction))
  const grade = score >= 95 ? 'A+' : score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 55 ? 'D' : 'F'

  return { score, grade, breakdown }
}
