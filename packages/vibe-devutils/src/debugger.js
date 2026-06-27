// ─── @uploop-vibe/vibe-devutils Debugger ─────────────────────
// Intent validation debugging with inline error display.
// For both human developers and AI agents.

import { validateVibeIntent, auditManifest, ErrorCodes } from '@uploop-vibe/vibe-ai'

/**
 * Debug an intent — validate and return a human-readable report.
 *
 * @param {Object} intent
 * @returns {Object} debug report
 */
export function debugIntent(intent) {
  const result = validateVibeIntent(intent)

  const report = {
    valid: result.ok,
    intent,
    errors: result.errors || [],
    warnings: result.warnings || [],
    summary: '',
    suggestions: [],
  }

  if (result.ok) {
    report.summary = '✅ Intent is valid.'
    if (result.warnings?.length) {
      report.summary += ` ${result.warnings.length} warning(s).`
      report.suggestions = result.warnings.map(w => w.warning?.fix || w.warning?.message || w.message).filter(Boolean)
    }
  } else {
    report.summary = `❌ Intent has ${result.errors.length} error(s).`
    report.suggestions = result.errors
      .filter(e => e.suggestedFix)
      .map(e => ({ fix: e.suggestedFix, reason: e.suggestedFix?.reason }))
  }

  return report
}

/**
 * Debug a manifest — audit and return a quality report.
 *
 * @param {Object} manifest
 * @returns {Object} debug report
 */
export function debugManifest(manifest) {
  const audit = auditManifest(manifest)

  return {
    score: audit.score,
    grade: audit.grade,
    issues: audit.issues?.map(i => ({
      code: i.warning?.code || i.code,
      severity: i.warning?.severity || 'medium',
      message: i.warning?.message || i.message,
      fix: i.warning?.fix,
    })) || [],
    suggestions: audit.suggestions?.map(s => ({
      code: s.warning?.code || s.code,
      message: s.warning?.message || s.message,
      fix: s.warning?.fix,
    })) || [],
    summary: audit.score >= 90 ? '✅ Excellent quality.' :
             audit.score >= 75 ? '⚠️ Good, needs polish.' :
             audit.score >= 60 ? '🔶 Fair, several issues.' :
             '❌ Poor, needs significant work.',
  }
}

/**
 * Format validation errors for display (terminal or AI context).
 *
 * @param {Object} validationResult
 * @returns {string}
 */
export function formatValidationErrors(validationResult) {
  let out = ''

  if (validationResult.ok === false) {
    out += '❌ Validation Failed\n'
    out += '━'.repeat(40) + '\n'
    for (const error of (validationResult.errors || [])) {
      const e = error.error || error
      out += `\n  [${e.code}] ${e.message}`
      if (e.path) out += `\n       at: ${e.path}`
      if (e.value !== undefined) out += `\n       value: ${JSON.stringify(e.value)}`

      if (error.alternatives?.length) {
        out += '\n       alternatives:'
        for (const alt of error.alternatives) {
          out += `\n         - ${alt.component || alt.composition?.join('+') || alt.layout || alt.goal || alt.behavior}: ${alt.reason || alt.description || ''}`
        }
      }

      if (error.suggestedFix) {
        out += `\n       suggested fix: ${error.suggestedFix.op} ${error.suggestedFix.path || ''}`
        if (error.suggestedFix.reason) out += ` (${error.suggestedFix.reason})`
      }

      if (error.creationSpec) {
        out += `\n       creation spec: ${error.creationSpec.component} (complexity: ${error.creationSpec.complexity || 'unknown'})`
      }

      out += '\n'
    }
  }

  if (validationResult.warnings?.length) {
    out += '\n⚠️  Warnings\n'
    out += '━'.repeat(40) + '\n'
    for (const warning of validationResult.warnings) {
      const w = warning.warning || warning
      out += `\n  [${w.code}] ${w.message}`
      if (w.path) out += `\n       at: ${w.path}`
      if (w.fix || w.suggestedFix) out += `\n       fix: ${w.fix || w.suggestedFix}`
      out += '\n'
    }
  }

  if (validationResult.ok !== false && !validationResult.warnings?.length) {
    out += '✅ All checks passed.\n'
  }

  return out
}
