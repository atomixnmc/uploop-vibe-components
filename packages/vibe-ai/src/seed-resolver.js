// ─── @uploop-vibe/vibe-ai Seed Resolver ─────────────────────
// Full goal → intent → manifest resolution.
// Maps seed intents to complete page manifests with component trees,
// data flow edges, and state definitions.
//
// P1: Goal → Intent Resolver (full)

import { pageLayouts } from '@uploop-vibe/vibe'
import { suggestFlow } from '@uploop/flows'

/**
 * Resolve a seed intent into a full page manifest.
 * This is the "magic" — AI says what it wants, Vibe figures out the rest.
 *
 * @param {Object} seed — { goal, entity, actions, constraints, overrides }
 * @returns {{ manifest: Object, reasoning: string[] }}
 */
export function resolveSeedToManifest(seed) {
  const reasoning = []
  const nodes = []
  const edges = []
  const states = {}

  const goal = seed.goal || 'data-management'
  const entity = seed.entity || { name: 'Item', fields: [] }
  const actions = seed.actions || []
  const constraints = seed.constraints || {}
  const layout = constraints.layout || goalToLayout(goal)

  reasoning.push(`Goal: ${goal} → Layout: ${layout}`)

  // ── Header ────────────────────────────────────────────────
  const title = seed.overrides?.['sections.header.title'] ||
                (goal === 'dashboard' ? entity.name + ' Dashboard' :
                 goal === 'form' ? 'Edit ' + entity.name :
                 goal === 'settings' ? 'Settings' :
                 entity.name + 's')

  nodes.push({
    id: 'page-header', type: 'view', component: 'Heading',
    props: { level: 'h1', text: title },
    path: 'sections.header.components[0]',
  })
  reasoning.push(`Header: "${title}" (Heading h1)`)

  // ── Toolbar: map actions to components ────────────────────
  const toolbarComps = []
  let idx = 0

  if (actions.includes('search')) {
    const ph = seed.overrides?.['sections.toolbar.searchPlaceholder'] || `Search ${entity.name.toLowerCase()}s...`
    toolbarComps.push({ id: 'search-input', type: 'SearchInput', props: { placeholder: ph, debounce: 300, size: 'md' } })
    nodes.push({ id: 'search-query', type: 'data', value: '' })
    edges.push({ from: 'search-input', to: 'search-query', type: 'updates' })
    reasoning.push('Toolbar: SearchInput (debounce=300) — actions.includes("search")')
  }

  // Filter controls from entity fields
  const filterableFields = entity.fields?.filter(f => f.display === 'filterable')
  if (filterableFields?.length) {
    for (const field of filterableFields) {
      if (field.type === 'enum' && field.values) {
        const opts = ['all', ...field.values]
        toolbarComps.push({
          id: `filter-${field.name}`,
          type: 'SegmentedControl',
          props: { options: opts.map(v => ({ value: v, label: v })), value: 'all', size: 'sm' },
        })
        nodes.push({ id: `filter-${field.name}-value`, type: 'data', value: 'all' })
        edges.push({ from: `filter-${field.name}`, to: `filter-${field.name}-value`, type: 'updates' })
        reasoning.push(`Toolbar: SegmentedControl for ${field.name} (filterable enum)`)
      }
    }
  }

  if (actions.includes('create')) {
    toolbarComps.push({
      id: 'create-btn', type: 'Button',
      props: { label: `Add ${entity.name}`, variant: 'solid', size: 'md' },
    })
    reasoning.push('Toolbar: "Add" Button — actions.includes("create")')
  }

  if (actions.includes('export')) {
    toolbarComps.push({
      id: 'export-btn', type: 'Dropdown',
      props: {
        trigger: 'Export',
        items: [
          { id: 'export-csv', label: 'Export CSV' },
          { id: 'export-json', label: 'Export JSON' },
        ],
      },
    })
    reasoning.push('Toolbar: Export Dropdown — actions.includes("export")')
  }

  if (actions.includes('bulk-delete')) {
    toolbarComps.push({
      id: 'bulk-delete-btn', type: 'Button',
      props: { label: 'Delete Selected', variant: 'danger', size: 'md', disabled: true },
    })
    reasoning.push('Toolbar: Bulk Delete Button — actions.includes("bulk-delete")')
  }

  // Register toolbar components as nodes
  toolbarComps.forEach((comp, i) => {
    nodes.push({ ...comp, type: 'view', path: `sections.toolbar.components[${i}]` })
  })

  // ── Content: map entity fields to display components ──────
  const displayFields = entity.fields?.filter(f => f.display !== false) || []
  const columns = displayFields.map(f => ({
    key: f.name,
    label: f.name.charAt(0).toUpperCase() + f.name.slice(1),
    ...(f.display === 'badge' ? { render: 'badge' } : {}),
  }))

  if (goal === 'dashboard') {
    // Dashboard: use StatsCards in a Grid
    const widgets = []
    displayFields.forEach((field, i) => {
      widgets.push({
        id: `widget-${field.name}`,
        type: 'StatsCard',
        props: { label: field.name, value: '—', icon: fieldIcon(field.name) },
        span: Math.min(4, Math.max(3, 12 / Math.max(1, displayFields.length))),
      })
    })
    nodes.push(...widgets.map((w, i) => ({
      ...w, type: 'view', path: `sections.content.widgets[${i}]`,
    })))
    reasoning.push(`Content: ${widgets.length} StatsCard widgets in Grid`)
  } else if (goal === 'form') {
    // Form: Input/Select/Textarea per field
    displayFields.forEach((field, i) => {
      const compType = fieldToComponent(field)
      nodes.push({
        id: `field-${field.name}`, type: 'view', component: compType,
        props: {
          label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
          ...(field.type === 'enum' ? { options: (field.values || []).map(v => ({ value: v, label: v })) } : {}),
          ...(field.type === 'number' ? { type: 'number' } : {}),
          ...(field.type === 'email' ? { type: 'email' } : {}),
          required: !field.optional,
        },
        path: `sections.content.components[${i}]`,
      })
      nodes.push({ id: `field-${field.name}-value`, type: 'data', value: '' })
      edges.push({ from: `field-${field.name}`, to: `field-${field.name}-value`, type: 'updates' })
      reasoning.push(`Content: ${compType} for ${field.name} (${field.type})`)
    })

    // Submit + Reset buttons
    nodes.push({
      id: 'submit-btn', type: 'view', component: 'Button',
      props: { label: 'Save', variant: 'solid' },
      path: `sections.content.components[${displayFields.length}]`,
    })
    nodes.push({
      id: 'reset-btn', type: 'view', component: 'Button',
      props: { label: 'Reset', variant: 'ghost' },
      path: `sections.content.components[${displayFields.length + 1}]`,
    })
  } else {
    // Default: Table for data-management, list, etc.
    nodes.push({
      id: 'data-table', type: 'view', component: 'Table',
      props: {
        columns,
        rows: [],
        striped: true,
        hoverable: true,
        compact: constraints.density === 'compact',
      },
      path: 'sections.content.components[0]',
    })
    nodes.push({ id: 'table-data', type: 'data', source: `api/${entity.name.toLowerCase()}s` })
    edges.push({ from: 'table-data', to: 'data-table', type: 'renders', target: 'rows' })
    reasoning.push(`Content: Table with ${columns.length} columns`)

    // Pagination for data lists
    nodes.push({
      id: 'pagination', type: 'view', component: 'Pagination',
      props: { page: 1, total: 1 },
      path: 'sections.content.components[1]',
    })
    reasoning.push('Content: Pagination (auto-added for data tables)')
  }

  // ── States ────────────────────────────────────────────────
  states.loading = { component: 'Skeleton', props: { count: 3, variant: 'text' } }
  states.empty = { component: 'EmptyState', props: { title: `No ${entity.name.toLowerCase()}s found`, icon: '📭' } }
  states.error = { component: 'ErrorState', props: { message: `Failed to load ${entity.name.toLowerCase()}s` } }
  reasoning.push('States: loading (Skeleton), empty (EmptyState), error (ErrorState)')

  // ── Execution ─────────────────────────────────────────────
  const densityProps = constraints.density === 'compact' ? { compact: true } :
                       constraints.density === 'spacious' ? { compact: false } : {}
  const animLevel = constraints.animation === 'none' ? {} :
                    constraints.animation === 'rich' ? { animate: 'fade-in' } : {}

  reasoning.push(`Constraints: density=${constraints.density || 'comfortable'}, animation=${constraints.animation || 'minimal'}`)

  const manifest = {
    kind: 'uploop-vibe.manifest',
    version: '0.2.0',
    intent: seed,
    layout,
    nodes,
    edges,
    states,
    execution: suggestFlow({ describe: () => ({ nodes: {}, edges: {} }) }),
    _auditScore: null,
  }

  return { manifest, reasoning }
}

// ── Helpers ─────────────────────────────────────────────────

function goalToLayout(goal) {
  const map = {
    'dashboard': 'full-width',
    'data-management': 'full-width',
    'list': 'full-width',
    'form': 'centered',
    'settings': 'sidebar-grid',
    'wizard': 'centered',
    'detail': 'sidebar-right',
    'landing': 'stacked',
    'editor': 'full-width',
  }
  return map[goal] || 'full-width'
}

function fieldToComponent(field) {
  if (field.type === 'enum') return 'Select'
  if (field.type === 'boolean') return 'Switch'
  if (field.type === 'date') return 'Input'
  if (field.type === 'textarea' || (field.meta?.longtext)) return 'Textarea'
  if (field.type === 'number') return 'NumberInput'
  if (field.type === 'file') return 'FileUpload'
  return 'Input'
}

function fieldIcon(name) {
  const map = { revenue: '💰', users: '👥', orders: '📦', views: '👁', conversion: '📈', growth: '📊', sales: '💵', traffic: '🚦' }
  return map[name.toLowerCase()] || '📊'
}
