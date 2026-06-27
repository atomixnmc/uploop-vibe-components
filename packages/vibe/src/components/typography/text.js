// ─── Typography: Heading, Text, Label, Caption, Highlight, Code, BlockCode, Kbd, Markdown, Blockquote ─

import { component } from '@uploop/html'

export const Heading = component('VibeHeading', {
  state: { level: 'h2', text: '', align: 'left', color: 'fg', weight: 'bold' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    const sizes = { h1: 'xl4', h2: 'xl2', h3: 'xl', h4: 'lg', h5: 'md', h6: 'base' }
    return `<${s.level} class="vibe-heading" style="
      margin:0; font-size:var(--vibe-font-size-${sizes[s.level] || 'xl2'});
      font-weight:var(--vibe-font-weight-${s.weight}); text-align:${s.align};
      color:var(--vibe-color-${s.color}); line-height:var(--vibe-line-height-tight);
    ">${esc(s.text)}</${s.level}>`
  }
})

export const Text = component('VibeText', {
  state: { text: '', size: 'base', color: 'fg', align: 'left', weight: 'normal', italic: false, truncate: false, maxLines: 1 },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<p class="vibe-text" style="
      margin:0; font-size:var(--vibe-font-size-${s.size}); color:var(--vibe-color-${s.color});
      text-align:${s.align}; font-weight:var(--vibe-font-weight-${s.weight});
      font-style:${s.italic ? 'italic' : 'normal'};
      ${s.truncate ? `overflow:hidden;text-overflow:ellipsis;white-space:${s.maxLines > 1 ? 'normal' : 'nowrap'};display:${s.maxLines > 1 ? '-webkit-box' : 'block'};-webkit-line-clamp:${s.maxLines};-webkit-box-orient:vertical;` : ''}
      ${s.maxLines > 1 && !s.truncate ? '' : ''}
    ">${esc(s.text)}</p>`
  }
})

export const Label = component('VibeLabel', {
  state: { text: '', htmlFor: '', required: false, size: 'sm' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<label class="vibe-label" ${s.htmlFor ? `for="${esc(s.htmlFor)}"` : ''} style="
      display:block; font-size:var(--vibe-font-size-${s.size});
      font-weight:var(--vibe-font-weight-medium); color:var(--vibe-color-mutedFg);
      margin-bottom:0.25rem;
    ">${esc(s.text)}${s.required ? ' <span style="color:var(--vibe-color-error);">*</span>' : ''}</label>`
  }
})

export const Caption = component('VibeCaption', {
  state: { text: '', color: 'muted' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    return `<span class="vibe-caption" style="font-size:var(--vibe-font-size-xs);color:var(--vibe-color-${s.color});">${String(s.text||'').replace(/&/g, '&amp;')}</span>`
  }
})

export const Highlight = component('VibeHighlight', {
  state: { text: '', color: 'primary' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const colors = { primary: 'var(--vibe-color-primary100)', success: '#d3f9d8', warning: '#fff3bf', error: '#ffe3e3' }
    return `<mark class="vibe-highlight" style="
      background:${colors[s.color] || colors.primary}; color:inherit;
      padding:0.125rem 0.25rem; border-radius:var(--vibe-radius-sm);
    ">${String(s.text||'').replace(/&/g, '&amp;')}</mark>`
  }
})

export const Code = component('VibeCode', {
  state: { code: '', language: '' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    return `<code class="vibe-code" style="
      font-family:var(--vibe-font-mono); font-size:0.85em;
      background:var(--vibe-color-neutral100); color:var(--vibe-color-error);
      padding:0.15em 0.4em; border-radius:var(--vibe-radius-sm);
      border:1px solid var(--vibe-color-neutral200);
    ">${String(s.code||'').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code>`
  }
})

export const BlockCode = component('VibeBlockCode', {
  state: { code: '', language: '', showLineNumbers: false, maxHeight: '' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    const lines = s.code.split('\n')
    return `<div class="vibe-block-code" style="position:relative;border-radius:var(--vibe-radius-lg);overflow:hidden;border:1px solid var(--vibe-color-border);">
      ${s.language ? `<div style="position:absolute;top:0;right:0;padding:0.25rem 0.75rem;font-size:0.7rem;color:var(--vibe-color-muted);background:var(--vibe-color-neutral100);border-radius:0 var(--vibe-radius-lg) 0 var(--vibe-radius-sm);text-transform:uppercase;">${esc(s.language)}</div>` : ''}
      <pre style="
        margin:0; padding:1rem; background:#1e1e2e; color:#cdd6f4;
        font-family:var(--vibe-font-mono); font-size:0.82rem;
        line-height:1.6; overflow-x:auto;
        ${s.maxHeight ? `max-height:${s.maxHeight};overflow-y:auto;` : ''}
      ">${s.showLineNumbers
        ? lines.map((l, i) => `<span style="display:block;"><span style="color:#6c7086;margin-right:1rem;user-select:none;display:inline-block;width:2rem;text-align:right;">${i + 1}</span>${l || ' '}</span>`).join('\n')
        : esc(s.code)
      }</pre>
    </div>`
  }
})

export const Kbd = component('VibeKbd', {
  state: { keys: [] },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    const keys = Array.isArray(s.keys) ? s.keys : [s.keys]
    return `<span class="vibe-kbd" style="display:inline-flex;gap:0.25rem;">
      ${keys.map(k => `<kbd style="
        display:inline-block; padding:0.15em 0.45em; font-family:var(--vibe-font-mono);
        font-size:0.8em; font-weight:var(--vibe-font-weight-medium);
        background:var(--vibe-color-neutral100); border:1px solid var(--vibe-color-neutral300);
        border-bottom-width:2px; border-radius:var(--vibe-radius-sm);
        color:var(--vibe-color-fg); box-shadow:0 1px 0 var(--vibe-color-neutral400);
      ">${esc(k)}</kbd>`).join('<span style="color:var(--vibe-color-muted);">+</span>')}
    </span>`
  }
})

export const Blockquote = component('VibeBlockquote', {
  state: { text: '', cite: '', color: 'primary' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<blockquote class="vibe-blockquote" style="
      margin:0; padding:0.75rem 1rem; border-left:3px solid var(--vibe-color-${s.color}500);
      background:var(--vibe-color-${s.color}50); border-radius:0 var(--vibe-radius-md) var(--vibe-radius-md) 0;
      font-style:italic; color:var(--vibe-color-mutedFg);
    ">
      <p style="margin:0;">${esc(s.text)}</p>
      ${s.cite ? `<cite style="display:block;margin-top:0.5rem;font-size:0.8rem;font-style:normal;color:var(--vibe-color-muted);">— ${esc(s.cite)}</cite>` : ''}
    </blockquote>`
  }
})
