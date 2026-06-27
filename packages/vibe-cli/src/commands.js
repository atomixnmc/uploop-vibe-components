// ─── @uploop-vibe/vibe-cli Commands ──────────────────────────
// Core CLI commands: generate pages/components, list, scaffold.

import { generateComponent, resolveComponentIntent } from '@uploop-vibe/vibe-ai'
import { runIFSLoop } from '@uploop-vibe/vibe-ai'
import { listComponents } from '@uploop-vibe/vibe'
import { listTemplates } from '@uploop-vibe/vibe-ai'

/**
 * Generate a page from a seed intent via the IFS loop.
 *
 * @param {Object} seed — { goal, entity, actions, constraints }
 * @param {Object} [opts] — IFS loop options { maxIterations, scoreThreshold }
 * @returns {Promise<Object>} { manifest, score, iterations, history }
 */
export async function generatePage(seed, opts = {}) {
  console.log(`\n⚡ Generating page: ${seed.goal || 'custom'}`)
  console.log(`   Entity: ${seed.entity?.name || 'none'}`)
  console.log(`   Actions: ${(seed.actions || []).join(', ') || 'none'}`)

  const result = await runIFSLoop(seed, {
    maxIterations: opts.maxIterations || 5,
    scoreThreshold: opts.scoreThreshold || 85,
    onIteration: (iteration, manifest, audit, transforms) => {
      const status = iteration === 0 ? 'Seed resolved' : `+${transforms.length} transforms applied`
      console.log(`   [${iteration}] Score: ${audit.score} (${audit.grade || '-'}) — ${status}`)
    },
  })

  if (result.success) {
    console.log(`\n✅ Converged after ${result.iterations} iterations. Final score: ${result.finalScore}`)
    console.log(`   Reason: ${result.reason}`)
  } else {
    console.log(`\n❌ Failed: ${result.reason}`)
  }

  return result
}

/**
 * Generate a single component from an intent.
 *
 * @param {Object} intent — { type, props, style }
 * @returns {Object|null} component descriptor
 */
export function generateComponentCLI(intent) {
  console.log(`\n🔘 Generating component: ${intent.type || 'unknown'}`)
  const comp = generateComponent(intent)
  if (comp) {
    console.log(`   ✅ Resolved to: ${comp.name || intent.type}`)
    return comp
  }
  console.log(`   ❌ Component "${intent.type}" not found`)
  const resolved = resolveComponentIntent(intent)
  if (resolved.config) {
    console.log(`   Available config: ${Object.keys(resolved.config.state || {}).join(', ')}`)
  }
  return null
}

/**
 * List available components, templates, and layouts.
 *
 * @param {string} [category] — filter by category
 */
export function listAvailable(category) {
  const components = listComponents(category)
  const templates = listTemplates()

  console.log(`\n📦 Vibe Components (${components.length} total)`)
  if (category) {
    console.log(`   Category: ${category}`)
    components.forEach(c => console.log(`   - ${c}`))
  } else {
    const cats = ['layout','navigation','data-entry','data-display','feedback','overlay','typography','media','utility','dataviz','button']
    cats.forEach(cat => {
      const inCat = listComponents(cat)
      console.log(`   ${cat}: ${inCat.length}`)
    })
  }

  console.log(`\n📄 Templates (${templates.length})`)
  templates.forEach(t => console.log(`   - ${t.name}: ${t.description}`))

  return { components, templates }
}

/**
 * Scaffold a new Vibe project.
 *
 * @param {string} name — project name
 * @param {Object} [opts]
 */
export function scaffoldProject(name, opts = {}) {
  console.log(`\n🏗️  Scaffolding new Vibe project: ${name}`)
  console.log(`   This would create:`)
  console.log(`   ${name}/`)
  console.log(`   ├── index.html`)
  console.log(`   ├── main.js          (entry point)`)
  console.log(`   ├── package.json`)
  console.log(`   └── vite.config.mjs`)
  console.log(`\n   Run: cd ${name} && pnpm install && pnpm dev`)
  // TODO: actual file generation
  return { project: name, status: 'planned' }
}
