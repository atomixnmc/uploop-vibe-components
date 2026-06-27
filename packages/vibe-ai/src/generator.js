// ─── @uploop-vibe/vibe-ai Generator ──────────────────────────
// AI-driven component generation from intent descriptions.
// This is the breakthrough: describe what you want, get a running Uploop component.

import { component } from '@uploop/html'
import { intent as schemaIntent, resolveIntent, suggestIntent } from '@uploop/schema'
import { suggestFlow } from '@uploop/flows'
import {
  componentRegistry, getComponent, resolveSize, resolveVariant,
  motionPresets, sizeScale, variantScale
} from '@uploop-vibe/vibe'

/**
 * Component generation intent schema.
 * AI describes a component and we resolve it to a real Uploop component.
 *
 * Intent shape:
 * {
 *   name: string,            // component name
 *   type: 'button'|'card'|'input'|'modal'|'table'|'form'|'custom',
 *   props: { ... },          // type-specific props
 *   layout?: 'stack'|'grid'|'flex',
 *   style?: { ... },         // size, variant, colors...
 *   actions?: string[],       // event names: ['click', 'submit', 'change']
 *   data?: { ... },          // initial state
 *   children?: IntentDesc[], // child component intents
 * }
 */

/**
 * Resolve a component intent to a real Vibe component instance config.
 *
 * @param {Object} intent - component intent description
 * @param {string} intent.name - component name
 * @param {string} intent.type - component type
 * @param {Object} [intent.props] - component props
 * @param {Object} [intent.style] - visual style overrides
 * @returns {{ component: Function, config: Object }}
 */
export function resolveComponentIntent(intent = {}) {
  const type = intent.type || 'custom'
  const style = intent.style || {}
  const props = intent.props || {}

  // Resolve size/variant from style intent
  const size = style.size || props.size || 'md'
  const variant = style.variant || props.variant || 'solid'

  // Build config by type
  switch (type) {
    case 'button':
      return {
        component: getComponent('Button'),
        config: {
          state: {
            label: props.label || intent.name || 'Button',
            size: sizeScale[size] ? size : 'md',
            variant: variantScale[variant] ? variant : 'solid',
            disabled: props.disabled || false,
            loading: props.loading || false,
            icon: props.icon || '',
            iconRight: props.iconRight || '',
            fullWidth: props.fullWidth || false,
            animate: style.animate || '',
          }
        }
      }

    case 'card':
      return {
        component: getComponent('Card'),
        config: {
          state: {
            padding: props.padding || 'md',
            shadow: props.shadow || 'sm',
            radius: props.radius || 'lg',
            bordered: props.bordered !== false,
            hoverable: props.hoverable || false,
            clickable: props.clickable || false,
          }
        }
      }

    case 'input':
      return {
        component: getComponent('Input'),
        config: {
          state: {
            type: props.inputType || 'text',
            placeholder: props.placeholder || '',
            value: props.value || '',
            label: props.label || '',
            size: sizeScale[size] ? size : 'md',
            disabled: props.disabled || false,
            required: props.required || false,
            error: '',
            hint: props.hint || '',
            fullWidth: props.fullWidth !== false,
          }
        }
      }

    case 'textarea':
      return {
        component: getComponent('Textarea'),
        config: {
          state: {
            placeholder: props.placeholder || '',
            value: props.value || '',
            label: props.label || '',
            rows: props.rows || 4,
            disabled: props.disabled || false,
          }
        }
      }

    case 'select':
      return {
        component: getComponent('Select'),
        config: {
          state: {
            value: props.value || '',
            label: props.label || '',
            options: props.options || [],
            placeholder: props.placeholder || 'Select...',
            size: sizeScale[size] ? size : 'md',
          }
        }
      }

    case 'badge':
      return {
        component: getComponent('Badge'),
        config: {
          state: {
            label: props.label || '',
            variant: variantScale[variant] ? variant : 'solid',
            color: props.color || 'primary',
            size: sizeScale[size] ? size : 'md',
            dot: props.dot || false,
          }
        }
      }

    case 'avatar':
      return {
        component: getComponent('Avatar'),
        config: {
          state: {
            src: props.src || '',
            alt: props.alt || '',
            name: props.name || '',
            size: sizeScale[size] ? size : 'md',
            radius: props.radius || 'full',
            status: props.status || '',
          }
        }
      }

    case 'table':
      return {
        component: getComponent('Table'),
        config: {
          state: {
            columns: props.columns || [],
            rows: props.rows || [],
            striped: props.striped !== false,
            hoverable: props.hoverable !== false,
            bordered: props.bordered !== false,
            compact: props.compact || false,
            emptyMessage: props.emptyMessage || 'No data',
          }
        }
      }

    case 'tabs':
      return {
        component: getComponent('Tabs'),
        config: {
          state: {
            tabs: props.tabs || [],
            activeTab: props.activeTab || '',
            variant: props.tabVariant || 'underline',
          }
        }
      }

    case 'modal':
      return {
        component: getComponent('Modal'),
        config: {
          state: {
            open: props.open || false,
            title: props.title || '',
            size: props.size || 'md',
            closeOnOverlay: props.closeOnOverlay !== false,
          }
        }
      }

    case 'dialog':
      return {
        component: getComponent('Dialog'),
        config: {
          state: {
            open: props.open || false,
            title: props.title || '',
            message: props.message || '',
            confirmLabel: props.confirmLabel || 'Confirm',
            cancelLabel: props.cancelLabel || 'Cancel',
            variant: variant || 'primary',
          }
        }
      }

    case 'progress':
      return {
        component: getComponent('Progress'),
        config: {
          state: {
            value: props.value || 0,
            max: props.max || 100,
            size: sizeScale[size] ? size : 'md',
            variant: variant || 'primary',
            showLabel: props.showLabel || false,
          }
        }
      }

    default:
      // Unknown type → return null, caller can handle
      return { component: null, config: { state: {}, type } }
  }
}

/**
 * Generate a full Uploop component from a component intent.
 * Resolves the right Vibe component, wires events, applies styles.
 *
 * @param {Object} intent - component intent
 * @returns {Function|null} component descriptor or null if unresolvable
 */
export function generateComponent(intent = {}) {
  const resolved = resolveComponentIntent(intent)
  if (!resolved.component) return null

  const config = resolved.config

  // Wire actions as event handlers
  if (intent.actions && Array.isArray(intent.actions)) {
    if (!config.update) config.update = {}
    for (const action of intent.actions) {
      config.update[action] = (s) => s // placeholder — caller overrides
    }
  }

  // Add any custom state from intent.data
  if (intent.data && typeof intent.data === 'object') {
    config.state = { ...config.state, ...intent.data }
  }

  // Wire effect hooks from intent
  if (intent.effects && typeof intent.effects === 'object') {
    config.effect = intent.effects
  }

  return component(intent.name || 'Generated', config)
}

/**
 * Describe what a generated component would look like.
 * Useful for AI introspection before generation.
 *
 * @param {Object} intent
 * @returns {Object} description
 */
export function describeComponentIntent(intent = {}) {
  const resolved = resolveComponentIntent(intent)
  return {
    name: intent.name || 'Unnamed',
    type: intent.type || 'custom',
    component: resolved.component ? intent.type : 'unknown',
    available: !!resolved.component,
    props: resolved.config?.state || {},
    suggestedFlow: resolved.component ? suggestFlow({}) : null,
  }
}

// Re-export schema intent utilities for convenience
export { intent, resolveIntent, suggestIntent, intentToken } from '@uploop/schema'
