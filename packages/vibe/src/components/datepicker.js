// ─── @uploop-vibe/vibe DatePicker Component ──────────────────
// P2: DatePicker — date range, single date, month picker.
// Built on native HTML date inputs with enhanced styling.

import { component } from '@uploop/html'
import { resolveSize } from '../design/scales.js'

export const DatePicker = component('VibeDatePicker', {
  state: {
    value: '',           // ISO date string
    label: '',
    placeholder: 'Select date...',
    min: '',
    max: '',
    disabled: false,
    required: false,
    size: 'md',
    clearable: true,
    error: '',
    hint: '',
    fullWidth: false,
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setValue: (s, v) => ({ ...s, value: v }),
    clear: (s) => ({ ...s, value: '' }),
  },

  view(state) {
    const sz = resolveSize(state.size)
    const esc = (v) => String(v || '').replace(/&/g, '&amp;')
    const hasValue = !!state.value
    const displayValue = hasValue ? formatDate(state.value) : ''

    return `<div class="vibe-datepicker" style="${state.fullWidth ? 'width:100%;' : 'display:inline-block;'}">
      ${state.label ? `<label style="display:block;margin-bottom:0.25rem;font-size:0.8rem;font-weight:var(--vibe-font-weight-medium);color:var(--vibe-color-mutedFg);">${esc(state.label)}${state.required ? ' <span style="color:var(--vibe-color-error);">*</span>' : ''}</label>` : ''}
      <div style="display:flex;align-items:stretch;border:1px solid ${state.error ? 'var(--vibe-color-error)' : 'var(--vibe-color-border)'};border-radius:var(--vibe-radius-md);overflow:hidden;background:var(--vibe-color-bg);">
        <input type="date"
          data-up-prop="value:value"
          value="${state.value}"
          min="${state.min}"
          max="${state.max}"
          ${state.disabled ? 'disabled' : ''}
          ${state.required ? 'required' : ''}
          placeholder="${esc(state.placeholder)}"
          style="
            height:${sz.h}; padding:0 ${sz.px}; border:none; outline:none; flex:1;
            font-size:var(--vibe-font-size-${sz.text}); background:transparent;
            color:var(--vibe-color-fg);
            ${state.disabled ? 'opacity:0.5;cursor:not-allowed;' : ''}
          "
        />
        ${state.clearable && hasValue && !state.disabled ? `<button data-up-event="click:clear" style="
          padding:0 0.5rem; border:none; background:transparent; cursor:pointer;
          color:var(--vibe-color-muted); font-size:1.1rem;
        ">&times;</button>` : ''}
      </div>
      ${state.error ? `<span style="display:block;margin-top:0.25rem;font-size:0.75rem;color:var(--vibe-color-error);">${esc(state.error)}</span>` : ''}
      ${!state.error && state.hint ? `<span style="display:block;margin-top:0.25rem;font-size:0.75rem;color:var(--vibe-color-muted);">${esc(state.hint)}</span>` : ''}
    </div>`
  },
})

export const DateRangePicker = component('VibeDateRangePicker', {
  state: {
    startValue: '',
    endValue: '',
    label: '',
    placeholderStart: 'Start date',
    placeholderEnd: 'End date',
    size: 'md',
    disabled: false,
    clearable: true,
    error: '',
  },

  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setStart: (s, v) => ({ ...s, startValue: v }),
    setEnd: (s, v) => ({ ...s, endValue: v }),
    clear: (s) => ({ ...s, startValue: '', endValue: '' }),
  },

  view(state) {
    const sz = resolveSize(state.size)
    const esc = (v) => String(v || '').replace(/&/g, '&amp;')
    const hasValue = state.startValue || state.endValue

    return `<div class="vibe-daterange-picker">
      ${state.label ? `<label style="display:block;margin-bottom:0.25rem;font-size:0.8rem;font-weight:var(--vibe-font-weight-medium);color:var(--vibe-color-mutedFg);">${esc(state.label)}</label>` : ''}
      <div style="display:flex;align-items:stretch;gap:0;border:1px solid ${state.error ? 'var(--vibe-color-error)' : 'var(--vibe-color-border)'};border-radius:var(--vibe-radius-md);overflow:hidden;background:var(--vibe-color-bg);">
        <input type="date" data-up-prop="value:startValue" value="${state.startValue}" placeholder="${esc(state.placeholderStart)}" ${state.disabled ? 'disabled' : ''} style="
          height:${sz.h}; padding:0 ${sz.px}; border:none; border-right:1px solid var(--vibe-color-border); outline:none; flex:1;
          font-size:var(--vibe-font-size-${sz.text}); background:transparent; color:var(--vibe-color-fg);
        " />
        <span style="display:flex;align-items:center;padding:0 0.25rem;color:var(--vibe-color-muted);font-size:0.8rem;">→</span>
        <input type="date" data-up-prop="value:endValue" value="${state.endValue}" placeholder="${esc(state.placeholderEnd)}" ${state.disabled ? 'disabled' : ''} style="
          height:${sz.h}; padding:0 ${sz.px}; border:none; outline:none; flex:1;
          font-size:var(--vibe-font-size-${sz.text}); background:transparent; color:var(--vibe-color-fg);
        " />
        ${state.clearable && hasValue && !state.disabled ? `<button data-up-event="click:clear" style="
          padding:0 0.5rem; border:none; background:transparent; cursor:pointer;
          color:var(--vibe-color-muted); font-size:1.1rem;
        ">&times;</button>` : ''}
      </div>
    </div>`
  },
})

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
