// ─── @uploop-vibe/vibe Badge & Avatar Components ──────────────

import { component } from '@uploop/html'

export const Badge = component('VibeBadge', {
  state: {
    label: '',
    variant: 'solid',   // solid|outline|subtle
    color: 'primary',   // primary|success|warning|error|info|neutral
    size: 'md',         // sm|md|lg
    dot: false,         // dot-only mode
  },

  update: {
    configure: (s, props) => ({ ...s, ...props }),
  },

  view(state) {
    const colorMap = {
      primary: { bg: 'primary100', fg: 'primary700', border: 'primary300' },
      success: { bg: '#d3f9d8', fg: '#2b8a3e', border: '#8ce99a' },
      warning: { bg: '#fff3bf', fg: '#e67700', border: '#ffc078' },
      error:   { bg: '#ffe3e3', fg: '#c92a2a', border: '#ffa8a8' },
      info:    { bg: '#d0ebff', fg: '#1864ab', border: '#74c0fc' },
      neutral: { bg: 'neutral100', fg: 'neutral700', border: 'neutral300' },
    }
    const szMap = { sm: { h: '1.25rem', px: '0.375rem', fs: 'xs' }, md: { h: '1.5rem', px: '0.5rem', fs: 'xs' }, lg: { h: '1.75rem', px: '0.625rem', fs: 'sm' } }
    const c = colorMap[state.color] || colorMap.primary
    const sz = szMap[state.size] || szMap.md

    if (state.dot) {
      return `<span class="vibe-badge vibe-badge-dot" style="
        display:inline-block; width:${sz.h}; height:${sz.h};
        border-radius:var(--vibe-radius-full);
        background:var(--vibe-color-${c.bg});
        ${state.variant === 'outline' ? `border:2px solid var(--vibe-color-${c.border}); background:transparent;` : ''}
        ${state.variant === 'subtle' ? `opacity:0.6;` : ''}
      "></span>`
    }

    return `<span class="vibe-badge" style="
      display:inline-flex; align-items:center;
      height:${sz.h}; padding:0 ${sz.px};
      font-size:var(--vibe-font-size-${sz.fs});
      font-weight:var(--vibe-font-weight-medium);
      border-radius:var(--vibe-radius-full);
      background:var(--vibe-color-${c.bg});
      color:var(--vibe-color-${c.fg});
      ${state.variant === 'outline' ? `border:1px solid var(--vibe-color-${c.border}); background:transparent;` : ''}
      ${state.variant === 'subtle' ? `background:transparent; opacity:0.8;` : ''}
      white-space:nowrap;
    ">${state.label.replace(/&/g, '&amp;')}</span>`
  }
})

export const Avatar = component('VibeAvatar', {
  state: {
    src: '',
    alt: '',
    name: '',       // fallback initials
    size: 'md',     // xs|sm|md|lg|xl|xl2
    radius: 'full', // none|sm|md|lg|xl|full
    bordered: false,
    status: '',     // online|offline|away|busy
  },

  update: { configure: (s, props) => ({ ...s, ...props }) },

  view(state) {
    const szMap = { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem', xl: '3.75rem', xl2: '5rem' }
    const rMap = { none: '0', sm: 'var(--vibe-radius-sm)', md: 'var(--vibe-radius-md)', lg: 'var(--vibe-radius-lg)', xl: 'var(--vibe-radius-xl)', full: 'var(--vibe-radius-full)' }
    const sz = szMap[state.size] || szMap.md
    const rad = rMap[state.radius] || rMap.full
    const statusColors = { online: '#40c057', offline: '#868e96', away: '#fab005', busy: '#fa5252' }

    // Compute initials
    let initials = ''
    if (state.name) {
      initials = state.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    }

    return `<span class="vibe-avatar" style="
      display:inline-flex; align-items:center; justify-content:center; position:relative;
      width:${sz}; height:${sz}; border-radius:${rad};
      background:var(--vibe-color-neutral200);
      ${state.bordered ? 'border:2px solid var(--vibe-color-bg); box-shadow:0 0 0 2px var(--vibe-color-primary400);' : ''}
      overflow:hidden; flex-shrink:0; user-select:none;
    ">
      ${state.src
        ? `<img src="${state.src}" alt="${(state.alt || state.name).replace(/&/g, '&amp;')}" style="width:100%;height:100%;object-fit:cover;" />`
        : `<span style="font-size:calc(${sz} * 0.4); font-weight:var(--vibe-font-weight-semibold); color:var(--vibe-color-neutral600);">${initials}</span>`
      }
      ${state.status ? `<span style="
        position:absolute; bottom:0; right:0;
        width:calc(${sz} * 0.3); height:calc(${sz} * 0.3);
        border-radius:var(--vibe-radius-full);
        background:${statusColors[state.status] || statusColors.offline};
        border:2px solid var(--vibe-color-bg);
      "></span>` : ''}
    </span>`
  }
})
