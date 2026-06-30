# @uploop-vibe/vibe-ai

**AI intent engine** for Uploop Vibe. Generates UIs from intents via deterministic IFS (Iterated Function System) loops. Every page exports a machine-readable manifest that AI agents can inspect, audit, and improve.

## Install

```bash
pnpm add @uploop-vibe/vibe-ai
```

## Quick Start

```js
import { generateComponent, resolveComponentIntent } from '@uploop-vibe/vibe-ai'

// Describe what you want
const btn = generateComponent({
  name: 'MyButton',
  type: 'button',
  props: { label: 'Save', variant: 'solid', size: 'lg' },
})
btn.mount(document.getElementById('app'))
```

## API

### Generator

```js
import { resolveComponentIntent, generateComponent, describeComponentIntent } from '@uploop-vibe/vibe-ai'

// Resolve intent → component
const comp = resolveComponentIntent({ type: 'button', props: { label: 'Save' } })

// Generate with full config
const comp = generateComponent({ name: 'MyComp', type: 'input', props: {...} })

// Describe what an intent resolves to
const desc = describeComponentIntent({ type: 'table' })
```

### Composer — Schema → Page

```js
import { composeEntityPage, composeDashboard, composeListPage, entityComponent } from '@uploop-vibe/vibe-ai'
import { object, string, number } from '@uploop/schema'

const userSchema = object({ name: string(), email: string(), age: number() })

const { page, entityComp, flow } = composeEntityPage({
  schema: userSchema,
  mode: 'form',
  layout: 'form',
})

page.mount(document.getElementById('app'))
```

### Templates

```js
import { templates, materializeTemplate, listTemplates } from '@uploop-vibe/vibe-ai'

console.log(listTemplates())
// → ['signupForm', 'loginForm', 'settings', 'dashboard', ...]

const signup = materializeTemplate('signupForm', { name: 'CustomSignup' })
signup.mount(el)
```

### Validator — Catch Bad Intents

```js
import { validateVibeIntent } from '@uploop-vibe/vibe-ai'

const result = validateVibeIntent({ type: 'kanban' })
// → { valid: false, errors: [{ code: 'COMPONENT_NOT_FOUND', message: '...', alternatives: ['Board'] }] }
```

### Auditor — Score Page Quality

```js
import { auditManifest, quickScore } from '@uploop-vibe/vibe-ai'

const report = auditManifest(pageManifest)
// → { score: 85, grade: 'B', gaps: [...], suggestions: [...] }

const score = quickScore(pageManifest)  // → 85
```

### IFS Engine — Generative HyperGraphs

```js
import { runIFSLoop, resolveSeedToManifest } from '@uploop-vibe/vibe-ai'

const result = await runIFSLoop({
  goal: 'dashboard',
  entity: { name: 'Product', fields: [...] },
  actions: ['search', 'create', 'edit'],
})
// → Converged after 3 iterations. Score: 91 (A).
// Each iteration: { manifest, audit, transforms, diff }
```

The IFS loop is deterministic. No AI understanding required at this layer. External AI agents drive the loop by proposing transforms. Vibe validates, applies, audits, and converges.

### Error System

```js
import { ErrorCodes, createErrorResponse, getAlternatives, generateCreationSpec } from '@uploop-vibe/vibe-ai'

// Structured error for AI agents
const err = createErrorResponse('COMPONENT_NOT_FOUND', { requested: 'Kanban' })
// → { ok: false, code: '...', message: '...', alternatives: ['Board'], creationSpec: {...} }

// When component is missing, get a creation spec the AI can build from
const spec = generateCreationSpec('Kanban', { category: 'data-display' })
```

### Loop Guard — Prevent Infinite Loops

```js
import { createLoopGuard, ScoreWeights, weightedAudit } from '@uploop-vibe/vibe-ai'

const guard = createLoopGuard({ maxIterations: 5, scoreThreshold: 85 })
// Detects oscillation (same manifest repeated), stalls (no score improvement), and dead loops
```

### Transforms

```js
import { applyTransform, applyTransforms, diff } from '@uploop-vibe/vibe-ai'

// Apply a single transform patch
const newManifest = applyTransform(manifest, { op: 'add', path: '/sections/0', value: {...} })

// Apply multiple transforms
const result = applyTransforms(manifest, [transform1, transform2])

// Diff two manifests
const delta = diff(beforeManifest, afterManifest)
// → { added: [...], removed: [...], changed: [...] }
```

## Architecture

```
Seed Intent
  → resolveSeedToManifest()    // Goal + entity → initial manifest
  → auditManifest()             // Score + gap report
  → AI proposes transforms      // External agent
  → applyTransforms()           // Deterministic patch
  → diff()                      // Track what changed
  → loopGuard.check()           // Prevent oscillation/stall
  → Repeat until converge
```

## License

MIT
