// ─── @uploop-vibe/vibe-ai Composer ───────────────────────────
// Schema-to-page composition. Given an entity schema and layout intent,
// produces a complete, runnable Uploop page with forms, tables, and views.

import { component } from '@uploop/html'
import { entityComponent, entityFields } from '@uploop/schema'
import { createPage } from '@uploop-vibe/vibe'
import { getComponent } from '@uploop-vibe/vibe'
import { suggestFlow } from '@uploop/flows'

/**
 * Compose a full CRUD page from an entity schema + intent.
 *
 * @param {Object} options
 * @param {Object} options.schema - Uploop entity schema (from @uploop/schema)
 * @param {'form'|'table'|'display'} [options.mode='form'] - display mode
 * @param {'dashboard'|'form'|'list'|'detail'} [options.layout='form']
 * @param {string} [options.name] - page name
 * @param {Object} [options.actions] - custom actions { save, delete, reset, ... }
 * @returns {Object} { page: Function, entityComp: Function, layout, flow }
 */
export function composeEntityPage(options = {}) {
  const schema = options.schema
  const mode = options.mode || 'form'
  const layoutType = options.layout || (mode === 'table' ? 'list' : 'form')
  const name = options.name || (schema.entityName || 'Entity') + 'Page'

  // Generate entity component config from schema
  const entityConfig = entityComponent(schema, {
    mode,
    update: options.actions,
  })

  // Create entity component
  const EntityComp = component(entityConfig._entityName || 'EntityForm', entityConfig)

  // Build page sections
  const sections = {}

  // Header section
  if (mode === 'table') {
    sections.header = {
      component: 'comp:header',
      props: { title: entityConfig._entityName + ' List' },
      visible: true,
    }
  } else {
    sections.header = {
      component: 'comp:header',
      props: { title: (mode === 'form' ? 'Edit ' : '') + entityConfig._entityName },
      visible: true,
    }
  }

  // Content section — the entity component
  sections.content = {
    component: EntityComp,
    props: {},
    visible: true,
  }

  // Sidebar for detail view
  if (mode === 'display') {
    sections.sidebar = {
      component: 'comp:meta',
      props: { fields: entityFields(schema) },
      visible: true,
    }
  }

  // Build the page
  const page = createPage({
    type: layoutType,
    name,
    sections,
  })

  // Suggest the optimal flow for this graph
  const flow = suggestFlow({})

  return {
    page,
    entityComp: EntityComp,
    layout: layoutType,
    flow: flow.recommended,
    mode,
    sections,
  }
}

/**
 * Compose a dashboard from multiple widget intents.
 *
 * @param {Object} options
 * @param {string} [options.name='Dashboard']
 * @param {Array<{ title: string, component: string|Function, props?: Object, span?: number }>} options.widgets
 * @returns {Function} page component descriptor
 */
export function composeDashboard(options = {}) {
  const name = options.name || 'Dashboard'
  const widgets = Array.isArray(options.widgets) ? options.widgets : []

  // Build widget grid
  const widgetHtml = widgets.map((w, i) => {
    const span = w.span || 4
    return `<div style="grid-column:span ${span};">
      <div class="vibe-card" style="padding:1rem;background:var(--vibe-color-bg);border:1px solid var(--vibe-color-border);border-radius:var(--vibe-radius-lg);">
        <h3 style="margin:0 0 0.75rem;font-size:var(--vibe-font-size-sm);font-weight:var(--vibe-font-weight-semibold);color:var(--vibe-color-mutedFg);text-transform:uppercase;letter-spacing:var(--vibe-letter-spacing-wide);">${(w.title || '').replace(/&/g, '&amp;')}</h3>
        <div data-component="${typeof w.component === 'string' ? w.component : 'widget-' + i}" data-props='${JSON.stringify(w.props || {})}'></div>
      </div>
    </div>`
  }).join('')

  return component(name, {
    state: { widgets, loading: false },
    update: {
      setWidgets: (s, widgets) => ({ ...s, widgets }),
      setLoading: (s, loading) => ({ ...s, loading }),
    },
    view(state) {
      return `<div class="vibe-dashboard" style="padding:1.5rem;">
        <header style="margin-bottom:1.5rem;">
          <h1 style="margin:0;font-size:var(--vibe-font-size-xl2);font-weight:var(--vibe-font-weight-bold);">${name}</h1>
        </header>
        <div class="vibe-dashboard-grid" style="display:grid;grid-template-columns:repeat(12, 1fr);gap:1rem;">
          ${widgetHtml}
        </div>
        ${state.loading ? '<div style="text-align:center;padding:2rem;">Loading...</div>' : ''}
      </div>`
    }
  })
}

/**
 * Compose a list page from a collection of items.
 *
 * @param {Object} options
 * @param {string} options.name
 * @param {Array} options.items
 * @param {Function} options.renderItem - (item: any) => string (HTML)
 * @param {Object} [options.search] - search config { placeholder, onSearch }
 * @returns {Function} component descriptor
 */
export function composeListPage(options = {}) {
  const name = options.name || 'ListPage'
  const renderItem = options.renderItem || ((item) => `<div>${JSON.stringify(item)}</div>`)

  return component(name, {
    state: {
      items: options.items || [],
      search: '',
      loading: false,
      page: 1,
      pageSize: 20,
    },

    update: {
      setItems: (s, items) => ({ ...s, items }),
      setSearch: (s, search) => ({ ...s, search }),
      setLoading: (s, loading) => ({ ...s, loading }),
      setPage: (s, page) => ({ ...s, page }),
    },

    view(state) {
      const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      const filtered = state.search
        ? state.items.filter(item => JSON.stringify(item).toLowerCase().includes(state.search.toLowerCase()))
        : state.items

      const start = (state.page - 1) * state.pageSize
      const paged = filtered.slice(start, start + state.pageSize)
      const totalPages = Math.ceil(filtered.length / state.pageSize)

      return `<div class="vibe-list-page" style="padding:1.5rem;">
        <header style="margin-bottom:1.5rem;">
          <h1 style="margin:0 0 1rem;font-size:var(--vibe-font-size-xl2);font-weight:var(--vibe-font-weight-bold);">${esc(name)}</h1>
          ${options.search ? `<input type="search" placeholder="${esc(options.search.placeholder || 'Search...')}" data-up-prop="value:search" style="
            padding:0.5rem 0.75rem;border:1px solid var(--vibe-color-border);border-radius:var(--vibe-radius-md);
            font-size:var(--vibe-font-size-sm);width:100%;max-width:20rem;outline:none;
          " />` : ''}
        </header>

        ${state.loading
          ? '<div style="text-align:center;padding:3rem;color:var(--vibe-color-muted);">Loading...</div>'
          : paged.length === 0
          ? '<div style="text-align:center;padding:3rem;color:var(--vibe-color-muted);border:1px dashed var(--vibe-color-border);border-radius:var(--vibe-radius-lg);">No items found</div>'
          : `<div class="vibe-list-items" style="display:flex;flex-direction:column;gap:0.5rem;">
              ${paged.map(item => renderItem(item)).join('')}
            </div>`
        }

        ${totalPages > 1 ? `<div style="display:flex;justify-content:center;gap:0.5rem;margin-top:1.5rem;">
          ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p =>
            `<button data-up-event="click:setPage" data-page="${p}" style="
              padding:0.375rem 0.75rem;border:1px solid var(--vibe-color-border);
              border-radius:var(--vibe-radius-md);
              background:${p === state.page ? 'var(--vibe-color-primary600)' : 'transparent'};
              color:${p === state.page ? 'white' : 'var(--vibe-color-fg)'};
              font-size:var(--vibe-font-size-sm);cursor:pointer;
            ">${p}</button>`
          ).join('')}
        </div>` : ''}
      </div>`
    }
  })
}

// Re-export for convenience
export { entityComponent, entityFields } from '@uploop/schema'
