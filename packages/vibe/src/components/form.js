// ─── @uploop-vibe/vibe Form Component ─────────────────────────
// Schema-driven form. Given an @uploop/schema entity, auto-generates
// form fields with proper input types, validation, and layout.
//
// API:
//   VibeForm.create({
//     schema: userSchema,       // @uploop/schema entity
//     data: { name: 'John' },  // initial values
//     onSubmit: (values) => {}, // submit handler
//     layout: 'vertical',       // vertical|horizontal|inline
//   })

import { component } from '@uploop/html'
import { toFormSchema } from '@uploop/schema'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

// ── Helper: map schema field to input type & attributes ──────

function inputAttrs(field) {
  let type = 'text'
  let attrs = ''
  switch (field.inputType) {
    case 'email':    type = 'email'; break
    case 'url':      type = 'url'; break
    case 'number':   type = 'number'; break
    case 'date':     type = 'date'; break
    case 'checkbox': type = 'checkbox'; break
    case 'select':   type = 'select'; break
    default:         type = 'text'
  }
  if (field.step !== undefined) attrs += ` step="${field.step}"`
  if (field.min !== undefined) attrs += ` min="${field.min}"`
  if (field.max !== undefined) attrs += ` max="${field.max}"`
  if (field.minLength !== undefined) attrs += ` minlength="${field.minLength}"`
  if (field.maxLength !== undefined) attrs += ` maxlength="${field.maxLength}"`
  if (field.required) attrs += ' required'
  return { type, attrs }
}

// ── Helper: render a single field ────────────────────────────

function renderField(field, state, layout) {
  const { type, attrs } = inputAttrs(field)
  const value = state[field.name] != null ? state[field.name] : ''
  const error = state._errors?.[field.name]
  const hint = field.description || ''

  const fieldWrapper = layout === 'inline'
    ? 'display:flex;align-items:center;gap:0.5rem;'
    : 'display:flex;flex-direction:column;gap:0.25rem;'

  const labelHtml = field.label
    ? `<label for="ff-${field.name}" style="font-size:var(--vibe-font-size-sm);font-weight:var(--vibe-font-weight-medium);color:var(--vibe-color-mutedFg);white-space:nowrap;">${esc(field.label)}${field.required ? ' <span style="color:var(--vibe-color-error)">*</span>' : ''}</label>`
    : ''

  let inputHtml
  if (type === 'select') {
    const opts = (field.options || []).map(o =>
      `<option value="${esc(typeof o === 'string' ? o : o.value || o)}" ${value === (typeof o === 'string' ? o : o.value || o) ? 'selected' : ''}>${esc(typeof o === 'string' ? o : o.label || o)}</option>`
    ).join('')
    inputHtml = `<select id="ff-${field.name}" name="${field.name}" data-up-prop="value:${field.name}" ${attrs}
      style="padding:0.5rem 0.75rem;font-size:var(--vibe-font-size-sm);border:1px solid ${error ? 'var(--vibe-color-error)' : 'var(--vibe-color-border)'};border-radius:var(--vibe-radius-md);background:var(--vibe-color-bg);color:var(--vibe-color-fg);outline:none;width:100%;box-sizing:border-box;">${opts}</select>`
  } else if (type === 'checkbox') {
    inputHtml = `<label style="display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;">
      <input type="checkbox" id="ff-${field.name}" name="${field.name}" data-up-bool="checked:${field.name}" ${value ? 'checked' : ''} style="accent-color:var(--vibe-color-primary600);" />
      <span style="font-size:var(--vibe-font-size-sm);">${esc(field.label || field.name)}</span>
    </label>`
    // For checkboxes, the label is part of the input — skip labelHtml
    return `<div style="${fieldWrapper}">${inputHtml}${error ? `<span style="font-size:var(--vibe-font-size-xs);color:var(--vibe-color-error);">${esc(error)}</span>` : ''}${!error && hint ? `<span style="font-size:var(--vibe-font-size-xs);color:var(--vibe-color-muted);">${esc(hint)}</span>` : ''}</div>`
  } else {
    inputHtml = `<input type="${type}" id="ff-${field.name}" name="${field.name}" data-up-prop="value:${field.name}" value="${esc(String(value))}" ${attrs}
      placeholder="${esc(field.description || '')}"
      style="padding:0.5rem 0.75rem;font-size:var(--vibe-font-size-sm);border:1px solid ${error ? 'var(--vibe-color-error)' : 'var(--vibe-color-border)'};border-radius:var(--vibe-radius-md);background:var(--vibe-color-bg);color:var(--vibe-color-fg);outline:none;width:100%;box-sizing:border-box;transition:border-color var(--vibe-duration-fast) var(--vibe-easing-out);" />`
  }

  return `<div style="${fieldWrapper}">
    ${labelHtml}
    ${inputHtml}
    ${error ? `<span style="font-size:var(--vibe-font-size-xs);color:var(--vibe-color-error);">${esc(error)}</span>` : ''}
    ${!error && hint ? `<span style="font-size:var(--vibe-font-size-xs);color:var(--vibe-color-muted);">${esc(hint)}</span>` : ''}
  </div>`
}

// ── Helper: collect values from state ────────────────────────

function collectValues(state, fields) {
  const values = {}
  for (const f of fields) {
    if (f.type === 'computed') continue
    values[f.name] = state[f.name]
  }
  return values
}

// ── Helper: validate values against schema ───────────────────

function validateForm(schema, values) {
  if (typeof schema.validate === 'function') {
    const result = schema.validate(values)
    if (!result.ok) {
      const errors = {}
      for (const err of (result.errors || [])) {
        const path = err.path || '_form'
        errors[path] = err.message
      }
      return { valid: false, errors }
    }
  }
  return { valid: true, errors: {} }
}

// ── VibeForm factory ─────────────────────────────────────────

export const VibeForm = {
  /**
   * Create a form component from an entity schema.
   *
   * @param {Object} options
   * @param {Object} options.schema   - @uploop/schema entity
   * @param {Object} [options.data]   - initial field values
   * @param {Function} [options.onSubmit]  - (values) => void
   * @param {'vertical'|'horizontal'|'inline'} [options.layout='vertical']
   * @returns {Function} Uploop component descriptor
   */
  create({ schema, data = {}, onSubmit, layout = 'vertical' }) {
    const fields = toFormSchema(schema)

    // Build initial state from data + field defaults
    const initialState = { _submitted: false, _errors: {}, _schema: schema, _onSubmit: onSubmit, _fields: fields }
    for (const f of fields) {
      if (f.type === 'computed') continue
      let dv = data[f.name]
      if (dv === undefined) dv = f.default !== undefined && f.default !== '<fn>' ? f.default
        : f.type === 'number' ? 0
        : f.type === 'boolean' ? false
        : ''
      initialState[f.name] = dv
    }

    // Layout CSS
    const layoutStyles = {
      vertical:   'flex-direction:column;gap:1rem;',
      horizontal: 'flex-direction:row;flex-wrap:wrap;gap:1rem;align-items:flex-start;',
      inline:     'flex-direction:row;flex-wrap:wrap;gap:0.75rem;align-items:center;',
    }

    return component('VibeForm', {
      state: initialState,

      update: {
        configure: (s, props) => ({ ...s, ...props }),
        setField: (s, { name, value }) => ({ ...s, [name]: value, _errors: { ...s._errors, [name]: null } }),
        reset: (s) => {
          const fresh = {}
          for (const f of (s._fields || fields)) {
            if (f.type === 'computed') continue
            fresh[f.name] = f.default !== undefined && f.default !== '<fn>' ? f.default
              : f.type === 'number' ? 0
              : f.type === 'boolean' ? false
              : ''
          }
          return { ...s, ...fresh, _submitted: false, _errors: {} }
        },
        submit: (s) => {
          const values = collectValues(s, fields)
          const { valid, errors } = validateForm(schema, values)
          if (!valid) {
            console.warn('[VibeForm] Validation failed:', errors)
            return { ...s, _errors: errors, _submitted: true }
          }
          // Call onSubmit if provided
          if (typeof s._onSubmit === 'function') {
            try { s._onSubmit(values) } catch (e) { console.error('[VibeForm] onSubmit error:', e) }
          }
          return { ...s, _submitted: true, _errors: {} }
        },
      },

      view(state) {
        const f = state._fields || fields
        const formFields = f.filter(ff => ff.type !== 'computed')

        return `<form class="vibe-form" style="display:flex;${layoutStyles[layout] || layoutStyles.vertical}">
          ${formFields.map(ff => renderField(ff, state, layout)).join('')}
          <div class="vibe-form-actions" style="display:flex;gap:0.75rem;align-items:center;${layout === 'horizontal' ? 'width:100%;' : ''}">
            <button type="button" data-up-event="click:submit" class="vibe-btn vibe-btn-primary" style="
              padding:0.5rem 1.25rem;font-size:var(--vibe-font-size-sm);font-weight:var(--vibe-font-weight-medium);
              background:var(--vibe-color-primary600);color:white;border:none;
              border-radius:var(--vibe-radius-md);cursor:pointer;
              transition:background var(--vibe-duration-fast) var(--vibe-easing-out);
            ">Submit</button>
            <button type="button" data-up-event="click:reset" class="vibe-btn vibe-btn-ghost" style="
              padding:0.5rem 1.25rem;font-size:var(--vibe-font-size-sm);font-weight:var(--vibe-font-weight-medium);
              background:transparent;color:var(--vibe-color-fg);border:1px solid var(--vibe-color-border);
              border-radius:var(--vibe-radius-md);cursor:pointer;
              transition:background var(--vibe-duration-fast) var(--vibe-easing-out);
            ">Reset</button>
          </div>
        </form>`
      }
    })
  }
}
