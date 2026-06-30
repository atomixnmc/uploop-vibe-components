// ─── @uploop-vibe/vibe Tabs Component ─────────────────────────

import { component } from '@uploop/html'

export const Tabs = component('VibeTabs', {
  state: {
    tabs: [],             // [{ id, label, icon?, badge? }]
    panels: {},           // { tabId: 'html content' } — rendered below tabs
    activeTab: '',
    variant: 'underline', // underline|pills|segmented
    fullWidth: false,
  },

  update: {
    configure: (s, props) => ({ ...s, ...props }),
    setActive: (s, activeTab) => ({ ...s, activeTab }),
    setTabs: (s, tabs) => ({ ...s, tabs }),
    setPanels: (s, panels) => ({ ...s, panels }),
  },

  view(state) {
    const items = Array.isArray(state.tabs) ? state.tabs : []
    const active = state.activeTab || (items[0]?.id || '')
    const panels = state.panels || {}
    const activePanel = panels[active] || ''

    const tabStyle = state.variant === 'pills'
      ? (id) => 'padding:0.375rem 0.875rem;border-radius:var(--vibe-radius-full);background:' + (id === active ? 'var(--vibe-color-primary600)' : 'transparent') + ';color:' + (id === active ? 'white' : 'var(--vibe-color-mutedFg)') + ';font-size:var(--vibe-font-size-sm);font-weight:var(--vibe-font-weight-medium);cursor:pointer;transition:all var(--vibe-duration-fast) var(--vibe-easing-out);border:none;'
      : state.variant === 'segmented'
      ? (id) => 'padding:0.375rem 0.875rem;border-radius:var(--vibe-radius-md);background:' + (id === active ? 'var(--vibe-color-bg)' : 'transparent') + ';color:' + (id === active ? 'var(--vibe-color-fg)' : 'var(--vibe-color-mutedFg)') + ';font-size:var(--vibe-font-size-sm);font-weight:var(--vibe-font-weight-medium);cursor:pointer;transition:all var(--vibe-duration-fast) var(--vibe-easing-out);border:none;box-shadow:' + (id === active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none') + ';'
      : (id) => 'padding:0.5rem 0.25rem;background:transparent;color:' + (id === active ? 'var(--vibe-color-primary600)' : 'var(--vibe-color-mutedFg)') + ';font-size:var(--vibe-font-size-sm);font-weight:' + (id === active ? 'var(--vibe-font-weight-semibold)' : 'var(--vibe-font-weight-medium)') + ';cursor:pointer;border:none;border-bottom:2px solid ' + (id === active ? 'var(--vibe-color-primary600)' : 'transparent') + ';transition:all var(--vibe-duration-fast) var(--vibe-easing-out);'

    const tabButtons = items.map(t => {
      const esc = (s) => String(s||'').replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      return '<button data-up-event="click:setActive" data-tab-id="' + esc(t.id) + '" style="' + tabStyle(t.id) + '">' +
        (t.icon ? '<span style="margin-right:0.375rem;">' + esc(t.icon) + '</span>' : '') +
        esc(t.label) +
        (t.badge ? '<span style="margin-left:0.375rem;padding:0.125rem 0.375rem;border-radius:var(--vibe-radius-full);background:var(--vibe-color-primary100);color:var(--vibe-color-primary700);font-size:0.7rem;">' + esc(String(t.badge)) + '</span>' : '') +
      '</button>'
    }).join('')

    const containerStyle = state.variant === 'segmented'
      ? 'display:inline-flex;padding:0.25rem;background:var(--vibe-color-neutral100);border-radius:var(--vibe-radius-lg);gap:0.125rem;'
      : 'display:flex;gap:' + (state.variant === 'pills' ? '0.5rem' : '0') + ';' + (state.fullWidth ? 'width:100%;' : '') + 'border-bottom:' + (state.variant === 'underline' ? '1px solid var(--vibe-color-border)' : 'none') + ';'

    var html = '<div class="vibe-tabs">'
    html += '<div style="' + containerStyle + '">' + tabButtons + '</div>'

    // Content panels
    if (activePanel) {
      html += '<div class="vibe-tabs-panel" style="padding:1rem 0;">' + activePanel + '</div>'
    }

    html += '</div>'
    return html
  }
})
