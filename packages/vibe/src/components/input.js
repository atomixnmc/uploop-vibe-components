// ─── @uploop-vibe/vibe Input Component ────────────────────────

import { component } from '@uploop/html'
import { resolveSize } from '../design/scales.js'

export const Input = component('VibeInput', {
  state: {
    type: 'text',       // text|email|password|number|search|url|tel
    placeholder: '',
    value: '',
    label: '',
    size: 'md',         // xs|sm|md|lg|xl
    disabled: false,
    readonly: false,
    error: '',
    hint: '',
    required: false,
    fullWidth: true,
  },

  update: {
    configure: (s, props) => ({ ...s, ...props }),
    setValue: (s, value) => ({ ...s, value }),
    setError: (s, error) => ({ ...s, error }),
  },

  view(state) {
    const sz = resolveSize(state.size)
    const wCls = state.fullWidth ? 'vibe-w-full' : ''
    const errCls = state.error ? 'vibe-input-error' : ''
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

    return `<div class="vibe-input-group ${wCls}">
      ${state.label ? `<label class="vibe-input-label" style="display:block; margin-bottom:0.375rem; font-size:var(--vibe-font-size-sm); font-weight:var(--vibe-font-weight-medium); color:var(--vibe-color-mutedFg);">${esc(state.label)}${state.required ? ' <span style="color:var(--vibe-color-error)">*</span>' : ''}</label>` : ''}
      <input
        type="${state.type}"
        placeholder="${esc(state.placeholder)}"
        data-up-prop="value:value"
        ${state.disabled ? 'disabled' : ''}
        ${state.readonly ? 'readonly' : ''}
        ${state.required ? 'required' : ''}
        class="vibe-input ${errCls}"
        style="
          height:${sz.h}; padding:0 ${sz.px};
          font-size:var(--vibe-font-size-${sz.text});
          border:1px solid ${state.error ? 'var(--vibe-color-error)' : 'var(--vibe-color-border)'};
          border-radius:var(--vibe-radius-md);
          background:var(--vibe-color-bg);
          color:var(--vibe-color-fg);
          width:100%; box-sizing:border-box;
          outline:none;
          transition:border-color var(--vibe-duration-fast) var(--vibe-easing-out);
        "
      />
      ${state.error ? `<span class="vibe-input-error-msg" style="display:block; margin-top:0.25rem; font-size:var(--vibe-font-size-xs); color:var(--vibe-color-error);">${esc(state.error)}</span>` : ''}
      ${!state.error && state.hint ? `<span class="vibe-input-hint" style="display:block; margin-top:0.25rem; font-size:var(--vibe-font-size-xs); color:var(--vibe-color-muted);">${esc(state.hint)}</span>` : ''}
    </div>`
  }
})

export const Textarea = component('VibeTextarea', {
  state: {
    placeholder: '',
    value: '',
    label: '',
    rows: 4,
    disabled: false,
    error: '',
    fullWidth: true,
  },

  update: {
    configure: (s, props) => ({ ...s, ...props }),
    setValue: (s, value) => ({ ...s, value }),
    setError: (s, error) => ({ ...s, error }),
  },

  view(state) {
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
    return `<div class="vibe-input-group ${state.fullWidth ? 'vibe-w-full' : ''}">
      ${state.label ? `<label class="vibe-input-label" style="display:block; margin-bottom:0.375rem; font-size:var(--vibe-font-size-sm); font-weight:var(--vibe-font-weight-medium); color:var(--vibe-color-mutedFg);">${esc(state.label)}</label>` : ''}
      <textarea
        placeholder="${esc(state.placeholder)}"
        data-up-prop="value:value"
        rows="${state.rows}"
        ${state.disabled ? 'disabled' : ''}
        class="vibe-textarea"
        style="
          padding:0.75rem;
          font-size:var(--vibe-font-size-base);
          border:1px solid ${state.error ? 'var(--vibe-color-error)' : 'var(--vibe-color-border)'};
          border-radius:var(--vibe-radius-md);
          background:var(--vibe-color-bg);
          color:var(--vibe-color-fg);
          width:100%; box-sizing:border-box; resize:vertical;
          outline:none;
          font-family:inherit;
          transition:border-color var(--vibe-duration-fast) var(--vibe-easing-out);
        "
      ></textarea>
      ${state.error ? `<span class="vibe-input-error-msg" style="display:block; margin-top:0.25rem; font-size:var(--vibe-font-size-xs); color:var(--vibe-color-error);">${esc(state.error)}</span>` : ''}
    </div>`
  }
})

export const Select = component('VibeSelect', {
  state: {
    value: '',
    label: '',
    options: [],    // [{ value, label }]
    size: 'md',
    disabled: false,
    placeholder: 'Select...',
    fullWidth: true,
  },

  update: {
    configure: (s, props) => ({ ...s, ...props }),
    setValue: (s, value) => ({ ...s, value }),
    setOptions: (s, options) => ({ ...s, options }),
  },

  view(state) {
    const sz = resolveSize(state.size)
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
    const opts = Array.isArray(state.options) ? state.options : []
    return `<div class="vibe-input-group ${state.fullWidth ? 'vibe-w-full' : ''}">
      ${state.label ? `<label class="vibe-input-label" style="display:block; margin-bottom:0.375rem; font-size:var(--vibe-font-size-sm); font-weight:var(--vibe-font-weight-medium); color:var(--vibe-color-mutedFg);">${esc(state.label)}</label>` : ''}
      <select
        data-up-prop="value:value"
        ${state.disabled ? 'disabled' : ''}
        class="vibe-select"
        style="
          height:${sz.h}; padding:0 ${sz.px};
          font-size:var(--vibe-font-size-${sz.text});
          border:1px solid var(--vibe-color-border);
          border-radius:var(--vibe-radius-md);
          background:var(--vibe-color-bg);
          color:var(--vibe-color-fg);
          width:100%; box-sizing:border-box;
          outline:none; cursor:pointer;
        "
      >
        <option value="" disabled selected>${esc(state.placeholder)}</option>
        ${opts.map(o => `<option value="${esc(o.value)}" ${state.value === o.value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
      </select>
    </div>`
  }
})

export const Checkbox = component('VibeCheckbox', {
  state: {
    checked: false,
    label: '',
    disabled: false,
  },

  update: {
    configure: (s, props) => ({ ...s, ...props }),
    setChecked: (s, checked) => ({ ...s, checked }),
    toggle: (s) => ({ ...s, checked: !s.checked }),
  },

  view(state) {
    return `<label class="vibe-checkbox" style="display:inline-flex;align-items:center;gap:0.5rem;cursor:${state.disabled ? 'not-allowed' : 'pointer'};opacity:${state.disabled ? '0.5' : '1'};">
      <input type="checkbox" data-up-bool="checked:checked" ${state.checked ? 'checked' : ''} ${state.disabled ? 'disabled' : ''} style="accent-color:var(--vibe-color-primary600);" />
      ${state.label ? `<span style="font-size:var(--vibe-font-size-base);">${state.label.replace(/&/g, '&amp;')}</span>` : ''}
    </label>`
  }
})
