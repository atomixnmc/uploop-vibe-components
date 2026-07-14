// ─── @uploop-vibe/vibe Layout Basics — Box, Center, AspectRatio, Wrap ──

import { component } from '@uploop/html'

export const Box = component('VibeBox', {
  state: { padding: '0', margin: '0', width: 'auto', height: 'auto', bg: 'transparent', radius: 'none', shadow: 'none', border: false, overflow: 'visible', display: 'block', position: 'static' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    return `<div class="vibe-box" style="
      padding:${s.padding}; margin:${s.margin}; width:${s.width}; height:${s.height};
      background:${s.bg}; border-radius:var(--vibe-radius-${s.radius});
      box-shadow:${s.shadow === 'none' ? 'none' : `var(--vibe-shadow-${s.shadow})`};
      ${s.border ? 'border:1px solid var(--vibe-color-border)' : ''};
      overflow:${s.overflow}; display:${s.display}; position:${s.position};
    " data-up-slot><slot></slot></div>`
  }
})

export const Center = component('VibeCenter', {
  state: { inline: false, maxWidth: 'none' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    return `<div class="vibe-center" style="
      display:${s.inline ? 'inline-flex' : 'flex'};
      align-items:center; justify-content:center;
      max-width:${s.maxWidth}; margin-left:auto; margin-right:auto;
      width:${s.maxWidth !== 'none' ? '100%' : 'auto'};
    " data-up-slot><slot></slot></div>`
  }
})

export const AspectRatio = component('VibeAspectRatio', {
  state: { ratio: '16/9', maxWidth: '100%' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const [w, h] = s.ratio.split('/').map(Number)
    const pct = w && h ? (h / w) * 100 : 56.25
    return `<div class="vibe-aspect-ratio" style="max-width:${s.maxWidth};position:relative;width:100%;">
      <div style="padding-bottom:${pct}%;"></div>
      <div style="position:absolute;inset:0;" data-up-slot><slot></slot></div>
    </div>`
  }
})

export const Wrap = component('VibeWrap', {
  state: { gap: 'md', align: 'center', justify: 'start' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const gapMap = { sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.5rem' }
    const jMap = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' }
    return `<div class="vibe-wrap" style="
      display:flex; flex-wrap:wrap; gap:${gapMap[s.gap] || gapMap.md};
      align-items:${s.align}; justify-content:${jMap[s.justify] || 'flex-start'};
    " data-up-slot><slot></slot></div>`
  }
})

export const SkipNav = component('VibeSkipNav', {
  state: { href: '#main', label: 'Skip to content' },
  view(s) {
    return `<a href="${s.href}" class="vibe-skip-nav" style="
      position:absolute; top:-100%; left:0.5rem; z-index:var(--vibe-z-toast);
      padding:0.5rem 1rem; background:var(--vibe-color-primary600); color:white;
      border-radius:var(--vibe-radius-md); font-weight:var(--vibe-font-weight-medium);
      text-decoration:none; transition:top var(--vibe-duration-fast);
    " onfocus="this.style.top='0.5rem'" onblur="this.style.top='-100%'">${s.label}</a>`
  }
})

export const BackToTop = component('VibeBackToTop', {
  state: { threshold: 300, visible: false },
  update: { setVisible: (s, v) => ({ ...s, visible: v }) },
  view(s) {
    if (!s.visible) return '<div style="display:none;"></div>'
    return `<button class="vibe-back-to-top vibe-animate-fade-in" onclick="window.scrollTo({top:0,behavior:'smooth'})" style="
      position:fixed; bottom:2rem; right:2rem; z-index:var(--vibe-z-docked);
      width:2.75rem; height:2.75rem; border-radius:var(--vibe-radius-full);
      border:1px solid var(--vibe-color-border); background:var(--vibe-color-bg);
      color:var(--vibe-color-fg); cursor:pointer; font-size:1.25rem;
      box-shadow:var(--vibe-shadow-md); display:flex; align-items:center; justify-content:center;
    ">&uarr;</button>`
  }
})
