// ─── Data Entry: Radio, Switch, Slider, NumberInput, SearchInput ─

import { component } from '@uploop/html'
import { resolveSize } from '../../design/scales.js'

export const Radio = component('VibeRadio', {
  state: { name: '', value: '', checked: false, label: '', disabled: false, size: 'md' },
  update: { configure: (s, p) => ({ ...s, ...p }), check: (s) => ({ ...s, checked: true }) },
  view(s) {
    const sz = { sm: '0.875rem', md: '1rem', lg: '1.25rem' }
    return `<label class="vibe-radio" style="display:inline-flex;align-items:center;gap:0.5rem;cursor:${s.disabled ? 'not-allowed' : 'pointer'};opacity:${s.disabled ? '0.5' : '1'};">
      <input type="radio" name="${s.name}" value="${s.value}" ${s.checked ? 'checked' : ''} ${s.disabled ? 'disabled' : ''} style="accent-color:var(--vibe-color-primary600);width:${sz[s.size]};height:${sz[s.size]};" />
      <span style="font-size:var(--vibe-font-size-base);">${(s.label||'').replace(/&/g, '&amp;')}</span>
    </label>`
  }
})

export const Switch = component('VibeSwitch', {
  state: { checked: false, disabled: false, label: '', size: 'md', color: 'primary' },
  update: { configure: (s, p) => ({ ...s, ...p }), toggle: (s) => ({ ...s, checked: !s.checked }), setChecked: (s, checked) => ({ ...s, checked }) },
  view(s) {
    const dims = { sm: { w: '2rem', h: '1rem', dot: '0.75rem' }, md: { w: '2.75rem', h: '1.5rem', dot: '1.125rem' }, lg: { w: '3.5rem', h: '2rem', dot: '1.5rem' } }
    const d = dims[s.size] || dims.md
    return `<label class="vibe-switch" style="display:inline-flex;align-items:center;gap:0.5rem;cursor:${s.disabled ? 'not-allowed' : 'pointer'};opacity:${s.disabled ? '0.5' : '1'};">
      <input type="checkbox" data-up-bool="checked:checked" ${s.checked ? 'checked' : ''} ${s.disabled ? 'disabled' : ''} style="display:none;" />
      <span style="
        display:inline-block; width:${d.w}; height:${d.h}; border-radius:var(--vibe-radius-full);
        background:${s.checked ? `var(--vibe-color-${s.color}600)` : 'var(--vibe-color-neutral300)'};
        position:relative; transition:background var(--vibe-duration-fast);
      ">
        <span style="
          position:absolute; top:50%; transform:translateY(-50%);
          left:${s.checked ? `calc(100% - ${d.dot} - 0.125rem)` : '0.125rem'};
          width:${d.dot}; height:${d.dot}; border-radius:var(--vibe-radius-full);
          background:white; transition:left var(--vibe-duration-fast); box-shadow:0 1px 3px rgba(0,0,0,0.2);
        "></span>
      </span>
      ${s.label ? `<span style="font-size:var(--vibe-font-size-base);">${s.label.replace(/&/g, '&amp;')}</span>` : ''}
    </label>`
  }
})

export const Slider = component('VibeSlider', {
  state: { value: 50, min: 0, max: 100, step: 1, disabled: false, label: '', showValue: false, size: 'md', color: 'primary' },
  update: { configure: (s, p) => ({ ...s, ...p }), setValue: (s, value) => ({ ...s, value: Number(value) }) },
  view(s) {
    const pct = ((s.value - s.min) / (s.max - s.min)) * 100
    return `<div class="vibe-slider" style="width:100%;">
      ${s.label ? `<div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
        <label style="font-size:0.8rem;font-weight:var(--vibe-font-weight-medium);color:var(--vibe-color-mutedFg);">${s.label.replace(/&/g, '&amp;')}</label>
        ${s.showValue ? `<span style="font-size:0.8rem;color:var(--vibe-color-mutedFg);">${s.value}</span>` : ''}
      </div>` : ''}
      <input type="range" data-up-prop="value:value" min="${s.min}" max="${s.max}" step="${s.step}" value="${s.value}" ${s.disabled ? 'disabled' : ''} style="
        width:100%; accent-color:var(--vibe-color-${s.color}600); height:0.375rem; cursor:${s.disabled ? 'not-allowed' : 'pointer'};
      " />
    </div>`
  }
})

export const NumberInput = component('VibeNumberInput', {
  state: { value: 0, min: null, max: null, step: 1, disabled: false, label: '', size: 'md', fullWidth: false, placeholder: '' },
  update: { configure: (s, p) => ({ ...s, ...p }), setValue: (s, v) => ({ ...s, value: Number(v) }), increment: (s) => ({ ...s, value: Math.min(s.max ?? Infinity, s.value + s.step) }), decrement: (s) => ({ ...s, value: Math.max(s.min ?? -Infinity, s.value - s.step) }) },
  view(s) {
    const sz = resolveSize(s.size)
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    return `<div class="vibe-number-input" style="${s.fullWidth ? 'width:100%;' : 'display:inline-flex;'}">
      ${s.label ? `<label style="display:block;margin-bottom:0.25rem;font-size:0.8rem;font-weight:var(--vibe-font-weight-medium);color:var(--vibe-color-mutedFg);">${esc(s.label)}</label>` : ''}
      <div style="display:flex;align-items:stretch;">
        <button data-up-event="click:decrement" ${s.disabled ? 'disabled' : ''} style="
          padding:0 0.5rem; border:1px solid var(--vibe-color-border); border-right:none;
          border-radius:var(--vibe-radius-md) 0 0 var(--vibe-radius-md);
          background:var(--vibe-color-surface); cursor:${s.disabled ? 'not-allowed' : 'pointer'};
          font-size:1rem; color:var(--vibe-color-mutedFg); font-family:monospace;
        ">&minus;</button>
        <input type="number" data-up-prop="value:value" value="${s.value}" min="${s.min ?? ''}" max="${s.max ?? ''}" step="${s.step}"
          ${s.disabled ? 'disabled' : ''} placeholder="${esc(s.placeholder)}" style="
          width:5rem; height:${sz.h}; padding:0 ${sz.px}; border:1px solid var(--vibe-color-border);
          font-size:var(--vibe-font-size-${sz.text}); text-align:center; outline:none;
          background:var(--vibe-color-bg); color:var(--vibe-color-fg);
        " />
        <button data-up-event="click:increment" ${s.disabled ? 'disabled' : ''} style="
          padding:0 0.5rem; border:1px solid var(--vibe-color-border); border-left:none;
          border-radius:0 var(--vibe-radius-md) var(--vibe-radius-md) 0;
          background:var(--vibe-color-surface); cursor:${s.disabled ? 'not-allowed' : 'pointer'};
          font-size:1rem; color:var(--vibe-color-mutedFg); font-family:monospace;
        ">+</button>
      </div>
    </div>`
  }
})

export const SearchInput = component('VibeSearchInput', {
  state: { value: '', placeholder: 'Search...', size: 'md', disabled: false, fullWidth: false, clearable: true },
  update: { configure: (s, p) => ({ ...s, ...p }), setValue: (s, value) => ({ ...s, value }), clear: (s) => ({ ...s, value: '' }) },
  view(s) {
    const sz = resolveSize(s.size)
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    return `<div class="vibe-search-input" style="position:relative;${s.fullWidth ? 'width:100%;' : 'display:inline-block;'}">
      <span style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);color:var(--vibe-color-muted);pointer-events:none;font-size:0.9rem;">&#128269;</span>
      <input type="search" data-up-prop="value:value" value="${s.value}" placeholder="${esc(s.placeholder)}" ${s.disabled ? 'disabled' : ''} style="
        width:100%; height:${sz.h}; padding:0 ${sz.px} 0 2.25rem; border:1px solid var(--vibe-color-border);
        border-radius:var(--vibe-radius-full); font-size:var(--vibe-font-size-${sz.text});
        outline:none; background:var(--vibe-color-bg); color:var(--vibe-color-fg);
        box-sizing:border-box; transition:border-color var(--vibe-duration-fast);
      " />
      ${s.clearable && s.value ? `<button data-up-event="click:clear" style="
        position:absolute; right:0.5rem; top:50%; transform:translateY(-50%);
        background:none; border:none; cursor:pointer; color:var(--vibe-color-muted);
        font-size:1.1rem; line-height:1; padding:0.25rem;
      ">&times;</button>` : ''}
    </div>`
  }
})
