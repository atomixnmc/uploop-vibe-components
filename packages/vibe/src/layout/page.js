// ─── @uploop-vibe/vibe Page Builder ───────────────────────────
// Intent-driven page composition. AI says "I need a dashboard"
// and gets a full page layout with the right components wired up.

import { component } from '@uploop/html'
import { Container, Grid, Stack, Flex } from './grid.js'
import { getComponent } from '../components/index.js'

/**
 * Page sections definition — maps intent names to layout presets.
 *
 * AI intent: "page: dashboard, sections: [header, sidebar, content]"
 */
export const pageLayouts = {
  dashboard: {
    regions: ['header', 'sidebar', 'content'],
    layout: 'sidebar-grid',
    sidebarWidth: '16rem',
  },
  form: {
    regions: ['header', 'content'],
    layout: 'centered',
    maxWidth: '40rem',
  },
  list: {
    regions: ['header', 'toolbar', 'content', 'pagination'],
    layout: 'full-width',
  },
  detail: {
    regions: ['header', 'content', 'sidebar'],
    layout: 'sidebar-right',
    sidebarWidth: '20rem',
  },
  landing: {
    regions: ['hero', 'features', 'cta', 'footer'],
    layout: 'stacked',
  },
  settings: {
    regions: ['header', 'sidebar', 'content'],
    layout: 'sidebar-grid',
    sidebarWidth: '14rem',
  },
  wizard: {
    regions: ['header', 'steps', 'content', 'actions'],
    layout: 'centered',
    maxWidth: '48rem',
  },
}

/**
 * Create a page component from an intent description.
 *
 * @param {Object} intent — page intent descriptor
 * @param {string} intent.type — page type: 'dashboard'|'form'|'list'|'detail'|'landing'|'settings'|'wizard'
 * @param {string} [intent.name] — component name
 * @param {Object} [intent.state] — initial page state
 * @param {Object} [intent.sections] — section descriptors { [region]: { component, props } }
 * @returns {Function} Uploop component descriptor
 */
export function createPage(intent = {}) {
  const layout = pageLayouts[intent.type] || pageLayouts.dashboard
  const name = intent.name || `Vibe${intent.type.charAt(0).toUpperCase() + intent.type.slice(1)}Page`
  const sections = intent.sections || {}

  // Build initial state from section defaults
  const initialState = {}
  for (const region of layout.regions) {
    const sec = sections[region] || {}
    initialState[region] = {
      component: sec.component || null,
      props: sec.props || {},
      visible: sec.visible !== false,
    }
  }

  return component(name, {
    state: {
      ...initialState,
      loading: false,
      error: null,
    },

    update: {
      configure: (s, props) => ({ ...s, ...props }),
      setSection: (s, { region, component, props: secProps }) => ({
        ...s,
        [region]: { ...s[region], component, props: { ...s[region].props, ...secProps } }
      }),
      setLoading: (s, loading) => ({ ...s, loading }),
      setError: (s, error) => ({ ...s, error }),
    },

    view(state) {
      let body = ''

      if (state.loading) {
        body = `<div style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
          <div class="vibe-skeleton vibe-animate-pulse" style="width:3rem;height:3rem;border-radius:var(--vibe-radius-full);background:var(--vibe-color-primary100);"></div>
        </div>`
      } else if (state.error) {
        body = `<div style="padding:2rem;text-align:center;color:var(--vibe-color-error);">
          <p>${String(state.error).replace(/&/g, '&amp;')}</p>
        </div>`
      } else {
        // Render regions based on layout type
        body = renderLayout(state, layout)
      }

      return `<div class="vibe-page vibe-page-${intent.type}">${body}</div>`
    }
  })
}

/**
 * Render a layout from page state + layout definition.
 */
function renderLayout(state, layout) {
  const esc = (s) => String(s).replace(/&/g, '&amp;')

  switch (layout.layout) {
    case 'sidebar-grid': {
      const sidebar = renderSection(state, 'sidebar')
      const header = renderSection(state, 'header')
      const content = renderSection(state, 'content')
      return `<div class="vibe-page-layout" style="display:flex;min-height:100vh;">
        ${sidebar ? `<aside class="vibe-page-sidebar" style="width:${layout.sidebarWidth || '16rem'};flex-shrink:0;border-right:1px solid var(--vibe-color-border);padding:1rem;">${sidebar}</aside>` : ''}
        <div class="vibe-page-main" style="flex:1;display:flex;flex-direction:column;">
          ${header ? `<header class="vibe-page-header" style="padding:1rem 1.5rem;border-bottom:1px solid var(--vibe-color-border);">${header}</header>` : ''}
          <main class="vibe-page-content" style="flex:1;padding:1.5rem;overflow-y:auto;">${content}</main>
        </div>
      </div>`
    }

    case 'sidebar-right': {
      const sidebar = renderSection(state, 'sidebar')
      const header = renderSection(state, 'header')
      const content = renderSection(state, 'content')
      return `<div style="display:flex;flex-direction:column;min-height:100vh;">
        ${header ? `<header style="padding:1rem 1.5rem;border-bottom:1px solid var(--vibe-color-border);">${header}</header>` : ''}
        <div style="display:flex;flex:1;">
          <main style="flex:1;padding:1.5rem;overflow-y:auto;">${content}</main>
          ${sidebar ? `<aside style="width:${layout.sidebarWidth || '20rem'};flex-shrink:0;border-left:1px solid var(--vibe-color-border);padding:1rem;overflow-y:auto;">${sidebar}</aside>` : ''}
        </div>
      </div>`
    }

    case 'centered': {
      const header = renderSection(state, 'header')
      const content = renderSection(state, 'content')
      const actions = renderSection(state, 'actions')
      const steps = renderSection(state, 'steps')
      return `<div style="display:flex;flex-direction:column;min-height:100vh;">
        ${header ? `<header style="padding:1rem 1.5rem;border-bottom:1px solid var(--vibe-color-border);">${header}</header>` : ''}
        ${steps ? `<div style="padding:1rem 1.5rem;border-bottom:1px solid var(--vibe-color-border);">${steps}</div>` : ''}
        <main style="flex:1;max-width:${layout.maxWidth || '40rem'};width:100%;margin:0 auto;padding:1.5rem;">${content}</main>
        ${actions ? `<footer style="padding:1rem 1.5rem;border-top:1px solid var(--vibe-color-border);">${actions}</footer>` : ''}
      </div>`
    }

    case 'full-width': {
      const header = renderSection(state, 'header')
      const toolbar = renderSection(state, 'toolbar')
      const content = renderSection(state, 'content')
      const pagination = renderSection(state, 'pagination')
      return `<div style="display:flex;flex-direction:column;min-height:100vh;">
        ${header ? `<header style="padding:1rem 1.5rem;border-bottom:1px solid var(--vibe-color-border);">${header}</header>` : ''}
        ${toolbar ? `<div style="padding:0.75rem 1.5rem;border-bottom:1px solid var(--vibe-color-border);">${toolbar}</div>` : ''}
        <main style="flex:1;padding:1.5rem;overflow-y:auto;">${content}</main>
        ${pagination ? `<footer style="padding:1rem 1.5rem;border-top:1px solid var(--vibe-color-border);">${pagination}</footer>` : ''}
      </div>`
    }

    case 'stacked': {
      // Landing page: render all visible sections in order
      return layout.regions.map(region => {
        const sec = state[region]
        if (!sec || !sec.visible) return ''
        return `<section class="vibe-page-section vibe-page-${region}" style="padding:2rem 1.5rem;">${renderSectionContent(sec)}</section>`
      }).join('')
    }

    default:
      return `<div style="padding:1.5rem;">${renderSection(state, 'content')}</div>`
  }
}

function renderSection(state, region) {
  const sec = state[region]
  if (!sec || !sec.visible) return ''
  return renderSectionContent(sec)
}

function renderSectionContent(sec) {
  if (!sec.component) return `<div data-up-slot><slot name="${sec.component}"></slot></div>`

  // If component is a string, try to resolve from registry
  if (typeof sec.component === 'string') {
    const Comp = getComponent(sec.component)
    if (Comp) {
      // Return a custom element tag that can be mounted
      return `<div data-component="${sec.component}" data-props='${JSON.stringify(sec.props)}'></div>`
    }
    return `<div>Unknown component: ${sec.component}</div>`
  }

  // If it's a function, it should be a component descriptor
  if (typeof sec.component === 'function') {
    return `<div data-component="custom" data-props='${JSON.stringify(sec.props)}'></div>`
  }

  return ''
}

// Re-export layout components
export { Container, Grid, Stack, Flex, Spacer, Divider } from './grid.js'
