// ─── @uploop-vibe/vibe-ai Templates ──────────────────────────
// Pre-built page templates for common use cases.
// Each template is an intent descriptor that can be materialized via compose*().

import { composeDashboard, composeListPage, composeEntityPage } from './composer.js'
import { resolveComponentIntent } from './generator.js'
import { createPage } from '@uploop-vibe/vibe'

/**
 * Template registry — maps template names to generator functions.
 *
 * AI intent: "template: signup-form" → materializeTemplate('signup-form', { ... })
 */
export const templates = {

  /** Signup / registration form */
  signupForm: {
    name: 'SignupForm',
    description: 'User registration form with name, email, password, submit',
    intent: {
      type: 'form',
      layout: 'centered',
      maxWidth: '28rem',
      sections: {
        header: { title: 'Create Account' },
        content: {
          components: [
            { type: 'input', props: { label: 'Full Name', placeholder: 'Enter your name', required: true } },
            { type: 'input', props: { label: 'Email', inputType: 'email', placeholder: 'you@example.com', required: true } },
            { type: 'input', props: { label: 'Password', inputType: 'password', placeholder: '••••••••', required: true } },
            { type: 'button', props: { label: 'Sign Up', variant: 'solid', fullWidth: true } },
            { type: 'button', props: { label: 'Sign in instead', variant: 'ghost', fullWidth: true } },
          ]
        }
      }
    }
  },

  /** Login form */
  loginForm: {
    name: 'LoginForm',
    description: 'Login form with email, password, submit, forgot password',
    intent: {
      type: 'form',
      layout: 'centered',
      maxWidth: '24rem',
      sections: {
        header: { title: 'Welcome Back' },
        content: {
          components: [
            { type: 'input', props: { label: 'Email', inputType: 'email', placeholder: 'you@example.com' } },
            { type: 'input', props: { label: 'Password', inputType: 'password', placeholder: '••••••••' } },
            { type: 'button', props: { label: 'Log In', variant: 'solid', fullWidth: true } },
            { type: 'button', props: { label: 'Forgot password?', variant: 'ghost', fullWidth: true } },
          ]
        }
      }
    }
  },

  /** Settings page */
  settings: {
    name: 'Settings',
    description: 'Settings page with sidebar nav and content area',
    intent: {
      type: 'settings',
      layout: 'sidebar-grid',
      sidebarWidth: '14rem',
      sections: {
        header: { title: 'Settings' },
        sidebar: {
          components: [
            { type: 'nav', props: { variant: 'vertical', items: [
              { id: 'profile', label: 'Profile', active: true },
              { id: 'account', label: 'Account' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'billing', label: 'Billing' },
              { id: 'team', label: 'Team' },
            ]}}
          ]
        },
        content: {
          components: [
            { type: 'card', props: { padding: 'lg' } },
          ]
        }
      }
    }
  },

  /** Dashboard */
  dashboard: {
    name: 'Dashboard',
    description: 'Analytics dashboard with stat cards and charts',
    intent: {
      type: 'dashboard',
      layout: 'full-width',
      sections: {
        header: { title: 'Dashboard' },
        content: {
          widgets: [
            { title: 'Total Users', span: 3 },
            { title: 'Revenue', span: 3 },
            { title: 'Active Now', span: 3 },
            { title: 'Conversion', span: 3 },
            { title: 'Chart', span: 8 },
            { title: 'Recent Activity', span: 4 },
          ]
        }
      }
    }
  },

  /** Data table */
  dataTable: {
    name: 'DataTable',
    description: 'Data table with search, columns, pagination',
    intent: {
      type: 'list',
      layout: 'full-width',
      sections: {
        header: { title: 'Data' },
        toolbar: {
          components: [
            { type: 'input', props: { placeholder: 'Search...', inputType: 'search' } },
            { type: 'button', props: { label: 'Add New', variant: 'solid' } },
          ]
        },
        content: {
          components: [
            { type: 'table', props: { striped: true, hoverable: true } },
          ]
        },
        pagination: {
          components: [
            { type: 'pagination' }
          ]
        }
      }
    }
  },

  /** Error / 404 page */
  error404: {
    name: 'NotFound',
    description: '404 Not Found page',
    intent: {
      type: 'stacked',
      sections: {
        content: {
          components: [
            { type: 'text', props: { content: '404', size: 'xl4', align: 'center', color: 'muted' } },
            { type: 'text', props: { content: 'Page not found', size: 'xl', align: 'center' } },
            { type: 'button', props: { label: 'Go Home', variant: 'solid' } },
          ]
        }
      }
    }
  },

  /** Empty state */
  emptyState: {
    name: 'EmptyState',
    description: 'Empty state placeholder with icon, message, CTA',
    intent: {
      type: 'stacked',
      sections: {
        content: {
          components: [
            { type: 'icon', props: { name: 'empty', size: 'xl2', color: 'muted' } },
            { type: 'text', props: { content: 'Nothing here yet', size: 'lg', align: 'center', color: 'muted' } },
            { type: 'text', props: { content: 'Get started by creating your first item.', size: 'sm', align: 'center', color: 'muted' } },
            { type: 'button', props: { label: 'Create New', variant: 'solid' } },
          ]
        }
      }
    }
  },

  /** Profile card */
  profileCard: {
    name: 'ProfileCard',
    description: 'User profile card with avatar, name, bio, actions',
    intent: {
      type: 'card',
      sections: {
        content: {
          components: [
            { type: 'avatar', props: { size: 'xl', name: 'User' } },
            { type: 'text', props: { content: 'User Name', size: 'lg', weight: 'semibold' } },
            { type: 'text', props: { content: 'Short bio or description', size: 'sm', color: 'muted' } },
            { type: 'button', props: { label: 'View Profile', variant: 'outline' } },
          ]
        }
      }
    }
  },
}

/**
 * Materialize a template into a runnable component.
 *
 * @param {string} templateName - key in templates registry
 * @param {Object} [overrides] - overrides merged into the template intent
 * @returns {Function|null} component descriptor
 */
export function materializeTemplate(templateName, overrides = {}) {
  const tpl = templates[templateName]
  if (!tpl) return null

  const intent = deepMerge(tpl.intent, overrides)

  switch (intent.type) {
    case 'dashboard':
      return composeDashboard({ ...intent, name: overrides.name || tpl.name })

    case 'list':
      return composeListPage({ ...intent, name: overrides.name || tpl.name })

    case 'form':
    case 'settings':
      // Use createPage for structured layouts
      return createPageFromIntent(intent, tpl.name)

    default:
      return createPageFromIntent(intent, tpl.name)
  }
}

/**
 * Build a page component from a structured intent.
 */
function createPageFromIntent(intent, defaultName) {
  return createPage({
    type: intent.type || 'form',
    name: intent.name || defaultName,
    sections: intent.sections || {},
  })
}

/**
 * List all available template names.
 */
export function listTemplates() {
  return Object.keys(templates).map(k => ({
    name: k,
    description: templates[k].description,
    intent: templates[k].intent,
  }))
}

/**
 * Simple deep merge.
 */
function deepMerge(base, overrides) {
  const result = { ...base }
  for (const [key, val] of Object.entries(overrides)) {
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = deepMerge(result[key], val)
    } else {
      result[key] = val
    }
  }
  return result
}

// Re-export composers for direct use
export { composeDashboard, composeListPage, composeEntityPage } from './composer.js'
