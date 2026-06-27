// ─── Data Entry Advanced: PinInput, ColorPicker, FileUpload, TagInput, Rating, Combobox, SegmentedControl ─

import { component } from '@uploop/html'
import { resolveSize } from '../../design/scales.js'

export const PinInput = component('VibePinInput', {
  state: { value: '', length: 4, mask: false, disabled: false, size: 'md', error: '' },
  update: { configure: (s, p) => ({ ...s, ...p }), setValue: (s, v) => ({ ...s, value: v.slice(0, s.length) }) },
  view(s) {
    const sz = { sm: '2rem', md: '2.75rem', lg: '3.5rem' }
    const chars = s.value.split('').concat(Array(Math.max(0, s.length - s.value.length)).fill(''))
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    return `<div class="vibe-pin-input">
      <div style="display:flex;gap:0.5rem;justify-content:center;">
        ${chars.map((ch, i) => `<input type="${s.mask ? 'password' : 'text'}" maxlength="1" data-index="${i}"
          value="${s.mask && ch ? '•' : ch}" ${s.disabled ? 'disabled' : ''} style="
          width:${sz[s.size]}; height:${sz[s.size]}; text-align:center;
          font-size:1.25rem; font-weight:var(--vibe-font-weight-semibold);
          border:2px solid ${s.error ? 'var(--vibe-color-error)' : ch ? 'var(--vibe-color-primary400)' : 'var(--vibe-color-border)'};
          border-radius:var(--vibe-radius-md); outline:none;
          background:var(--vibe-color-bg); color:var(--vibe-color-fg);
          transition:border-color var(--vibe-duration-fast);
        " />`).join('')}
      </div>
      ${s.error ? `<p style="text-align:center;margin-top:0.5rem;font-size:0.78rem;color:var(--vibe-color-error);">${esc(s.error)}</p>` : ''}
    </div>`
  }
})

export const ColorPicker = component('VibeColorPicker', {
  state: { value: '#646cff', label: '', disabled: false, showInput: true, showSwatch: true },
  update: { configure: (s, p) => ({ ...s, ...p }), setValue: (s, v) => ({ ...s, value: v }) },
  view(s) {
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    const presets = ['#646cff','#40c057','#fab005','#fa5252','#228be6','#f06595','#20c997','#fd7e14','#7950f2','#212529']
    return `<div class="vibe-color-picker">
      ${s.label ? `<label style="display:block;margin-bottom:0.375rem;font-size:0.8rem;font-weight:var(--vibe-font-weight-medium);color:var(--vibe-color-mutedFg);">${esc(s.label)}</label>` : ''}
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <div style="position:relative;">
          <input type="color" data-up-prop="value:value" value="${s.value}" ${s.disabled ? 'disabled' : ''} style="
            width:2.5rem; height:2.5rem; padding:0; border:2px solid var(--vibe-color-border);
            border-radius:var(--vibe-radius-md); cursor:pointer; background:none;
          " />
        </div>
        ${s.showInput ? `<input type="text" data-up-prop="value:value" value="${s.value}" ${s.disabled ? 'disabled' : ''} style="
          width:7rem; height:2.5rem; padding:0 0.5rem; border:1px solid var(--vibe-color-border);
          border-radius:var(--vibe-radius-md); font-family:monospace; font-size:0.85rem;
          outline:none;
        " />` : ''}
        ${s.showSwatch ? `<div style="width:2.5rem;height:2.5rem;border-radius:var(--vibe-radius-md);background:${s.value};border:1px solid var(--vibe-color-border);"></div>` : ''}
      </div>
      <div style="display:flex;gap:0.375rem;margin-top:0.5rem;flex-wrap:wrap;">
        ${presets.map(c => `<button data-up-event="click:setValue" data-value="${c}" style="
          width:1.5rem;height:1.5rem;border-radius:var(--vibe-radius-full);background:${c};
          border:2px solid ${s.value === c ? 'var(--vibe-color-fg)' : 'transparent'};
          cursor:pointer; transition:border-color var(--vibe-duration-faster);
        "></button>`).join('')}
      </div>
    </div>`
  }
})

export const FileUpload = component('VibeFileUpload', {
  state: { accept: '*', multiple: false, maxSize: null, disabled: false, label: 'Choose file', dragLabel: 'Drop files here', files: [] },
  update: { configure: (s, p) => ({ ...s, ...p }), setFiles: (s, files) => ({ ...s, files }), clear: (s) => ({ ...s, files: [] }) },
  view(s) {
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    const hasFiles = s.files.length > 0
    return `<div class="vibe-file-upload">
      <label style="
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        padding:2rem; border:2px dashed ${hasFiles ? 'var(--vibe-color-primary400)' : 'var(--vibe-color-border)'};
        border-radius:var(--vibe-radius-lg); cursor:${s.disabled ? 'not-allowed' : 'pointer'};
        background:${hasFiles ? 'var(--vibe-color-primary50)' : 'transparent'};
        transition:all var(--vibe-duration-fast); text-align:center;
        opacity:${s.disabled ? '0.5' : '1'};
      ">
        <div style="font-size:2rem;margin-bottom:0.5rem;">${hasFiles ? '&#128196;' : '&#128194;'}</div>
        <div style="font-weight:var(--vibe-font-weight-medium);">${esc(hasFiles ? `${s.files.length} file(s) selected` : s.dragLabel)}</div>
        <div style="font-size:0.78rem;color:var(--vibe-color-muted);margin-top:0.25rem;">${esc(s.label)}</div>
        <input type="file" accept="${s.accept}" ${s.multiple ? 'multiple' : ''} ${s.disabled ? 'disabled' : ''} style="display:none;" data-up-event="change:setFiles" />
      </label>
      ${hasFiles ? `<div style="margin-top:0.5rem;display:flex;gap:0.375rem;flex-wrap:wrap;">
        ${s.files.map((f,i) => `<span style="padding:0.2rem 0.5rem;background:var(--vibe-color-primary50);border-radius:var(--vibe-radius-full);font-size:0.75rem;display:flex;align-items:center;gap:0.25rem;">
          ${esc(f.name || f)}
          <button data-up-event="click:clear" style="background:none;border:none;cursor:pointer;font-size:1rem;line-height:1;padding:0;">&times;</button>
        </span>`).join('')}
      </div>` : ''}
    </div>`
  }
})

export const TagInput = component('VibeTagInput', {
  state: { tags: [], value: '', placeholder: 'Type and press Enter', disabled: false, size: 'md', maxTags: null },
  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setValue: (s, v) => ({ ...s, value: v }),
    addTag: (s) => {
      const tag = s.value.trim()
      if (!tag || s.tags.includes(tag) || (s.maxTags && s.tags.length >= s.maxTags)) return s
      return { ...s, tags: [...s.tags, tag], value: '' }
    },
    removeTag: (s, index) => ({ ...s, tags: s.tags.filter((_, i) => i !== index) }),
  },
  view(s) {
    const sz = resolveSize(s.size)
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    return `<div class="vibe-tag-input" style="display:flex;flex-wrap:wrap;gap:0.375rem;padding:0.375rem;border:1px solid var(--vibe-color-border);border-radius:var(--vibe-radius-md);min-height:${sz.h};align-items:center;background:var(--vibe-color-bg);cursor:text;">
      ${s.tags.map((t, i) => `<span style="
        display:inline-flex;align-items:center;gap:0.25rem;
        padding:0.125rem 0.5rem;background:var(--vibe-color-primary50);
        color:var(--vibe-color-primary700);border-radius:var(--vibe-radius-full);
        font-size:0.8rem;font-weight:var(--vibe-font-weight-medium);
      ">
        ${esc(t)}
        <button data-up-event="click:removeTag" data-index="${i}" style="background:none;border:none;cursor:pointer;font-size:1rem;line-height:1;padding:0;color:var(--vibe-color-primary400);">&times;</button>
      </span>`).join('')}
      ${(!s.maxTags || s.tags.length < s.maxTags) ? `<input data-up-prop="value:value" value="${s.value}" placeholder="${esc(s.placeholder)}" ${s.disabled ? 'disabled' : ''} style="
        border:none;outline:none;flex:1;min-width:8rem;font-size:var(--vibe-font-size-${sz.text});
        background:transparent;color:var(--vibe-color-fg);
      " data-up-event="keydown:addTag" />` : ''}
    </div>`
  }
})

export const Rating = component('VibeRating', {
  state: { value: 0, max: 5, size: 'md', readonly: false, icon: 'star', color: 'warning' },
  update: { configure: (s, p) => ({ ...s, ...p }), setValue: (s, v) => ({ ...s, value: Math.min(s.max, Math.max(0, Number(v))) }) },
  view(s) {
    const icons = { star: '★', heart: '♥', thumb: '👍' }
    const sz = { sm: '1rem', md: '1.35rem', lg: '1.75rem' }
    const icon = icons[s.icon] || icons.star
    return `<div class="vibe-rating" style="display:inline-flex;gap:0.125rem;">
      ${Array.from({ length: s.max }, (_, i) => {
        const active = i < s.value
        return `<span data-up-event="${s.readonly ? '' : 'click:setValue'}" data-value="${i + 1}" style="
          font-size:${sz[s.size]}; cursor:${s.readonly ? 'default' : 'pointer'};
          color:${active ? `var(--vibe-color-${s.color})` : 'var(--vibe-color-neutral300)'};
          transition:color var(--vibe-duration-fast); user-select:none;
        ">${icon}</span>`
      }).join('')}
    </div>`
  }
})

export const Combobox = component('VibeCombobox', {
  state: { value: '', options: [], open: false, placeholder: 'Select...', disabled: false, size: 'md', searchable: true, clearable: false },
  update: {
    configure: (s, p) => ({ ...s, ...p }),
    setValue: (s, v) => ({ ...s, value: v, open: false }),
    setSearch: (s, query) => ({ ...s, query, open: true }),
    toggle: (s) => ({ ...s, open: !s.open }),
    close: (s) => ({ ...s, open: false }),
    clear: (s) => ({ ...s, value: '', open: false }),
  },
  view(s) {
    const sz = resolveSize(s.size)
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    const q = (s.query || '').toLowerCase()
    const options = Array.isArray(s.options) ? s.options : []
    const filtered = s.searchable && q ? options.filter(o => o.label.toLowerCase().includes(q)) : options
    const selected = options.find(o => o.value === s.value)
    return `<div class="vibe-combobox" style="position:relative;display:inline-block;">
      <div style="display:flex;align-items:stretch;border:1px solid var(--vibe-color-border);border-radius:var(--vibe-radius-md);overflow:hidden;background:var(--vibe-color-bg);">
        ${s.searchable
          ? `<input data-up-prop="value:query" placeholder="${esc(selected?.label || s.placeholder)}" ${s.disabled ? 'disabled' : ''} style="
            height:${sz.h}; padding:0 ${sz.px}; border:none; outline:none; flex:1;
            font-size:var(--vibe-font-size-${sz.text}); background:transparent;
            color:var(--vibe-color-fg); min-width:8rem;
          " data-up-event="focus:toggle" />`
          : `<span style="height:${sz.h};padding:0 ${sz.px};display:flex;align-items:center;font-size:var(--vibe-font-size-${sz.text});flex:1;color:${s.value ? 'var(--vibe-color-fg)' : 'var(--vibe-color-muted)'};">${esc(selected?.label || s.placeholder)}</span>`
        }
        ${s.clearable && s.value ? `<button data-up-event="click:clear" style="padding:0 0.5rem;border:none;background:transparent;cursor:pointer;color:var(--vibe-color-muted);">&times;</button>` : ''}
        <button data-up-event="click:toggle" style="padding:0 0.5rem;border:none;border-left:1px solid var(--vibe-color-border);background:transparent;cursor:pointer;color:var(--vibe-color-muted);">&#9660;</button>
      </div>
      ${s.open ? `<div class="vibe-combobox-dropdown" style="
        position:absolute; top:100%; left:0; right:0; z-index:var(--vibe-z-dropdown);
        max-height:14rem; overflow-y:auto; margin-top:0.25rem;
        border:1px solid var(--vibe-color-border); border-radius:var(--vibe-radius-md);
        background:var(--vibe-color-bg); box-shadow:var(--vibe-shadow-lg);
      " data-up-event-stop>
        ${filtered.map(o => `<button data-up-event="click:setValue" data-value="${esc(o.value)}" style="
          display:block; width:100%; padding:${sz.px}; border:none; background:${o.value === s.value ? 'var(--vibe-color-primary50)' : 'transparent'};
          text-align:left; cursor:pointer; font-size:var(--vibe-font-size-${sz.text});
          color:var(--vibe-color-fg);
        ">${esc(o.label)}</button>`).join('')}
        ${!filtered.length ? `<div style="padding:0.75rem;text-align:center;color:var(--vibe-color-muted);font-size:0.8rem;">No options</div>` : ''}
      </div>` : ''}
    </div>`
  }
})

export const SegmentedControl = component('VibeSegmentedControl', {
  state: { value: '', options: [], size: 'md', disabled: false, fullWidth: false },
  update: { configure: (s, p) => ({ ...s, ...p }), setValue: (s, v) => ({ ...s, value: v }) },
  view(s) {
    const options = Array.isArray(s.options) ? s.options : []
    const sz = { sm: { h: '1.75rem', px: '0.75rem', fs: 'xs' }, md: { h: '2.25rem', px: '1rem', fs: 'sm' }, lg: { h: '2.75rem', px: '1.25rem', fs: 'base' } }
    const d = sz[s.size] || sz.md
    const esc = (v) => String(v||'').replace(/&/g, '&amp;')
    return `<div class="vibe-segmented-control" style="
      display:inline-flex; padding:0.25rem; background:var(--vibe-color-neutral100);
      border-radius:var(--vibe-radius-lg); ${s.fullWidth ? 'width:100%;' : ''}
      ${s.disabled ? 'opacity:0.5;pointer-events:none;' : ''}
    ">
      ${options.map(o => {
        const active = o.value === s.value
        return `<button data-up-event="click:setValue" data-value="${esc(o.value)}" style="
          padding:0 ${d.px}; height:${d.h}; border:none; border-radius:var(--vibe-radius-md);
          background:${active ? 'var(--vibe-color-bg)' : 'transparent'};
          color:${active ? 'var(--vibe-color-fg)' : 'var(--vibe-color-mutedFg)'};
          font-size:var(--vibe-font-size-${d.fs}); font-weight:var(--vibe-font-weight-medium);
          cursor:pointer; transition:all var(--vibe-duration-fast);
          box-shadow:${active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
          ${s.fullWidth ? 'flex:1;' : ''}
        ">${o.icon ? `<span style="margin-right:0.25rem;">${esc(o.icon)}</span>` : ''}${esc(o.label)}</button>`
      }).join('')}
    </div>`
  }
})
