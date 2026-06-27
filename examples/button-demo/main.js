// ─── Button Demo — Showcases all button variants, sizes, states ─

import { component, html } from '@uploop/html'
import { Button } from '@uploop-vibe/vibe'

export const ButtonDemo = component('ButtonDemo', {
  state: {
    clickCount: 0,
    loadingDemo: false,
  },

  update: {
    increment: (s) => ({ ...s, clickCount: s.clickCount + 1 }),
    toggleLoading: (s) => ({ ...s, loadingDemo: !s.loadingDemo }),
  },

  view: (state, { send }) => html`
    <div style="padding:1.5rem;">
      <h3 style="margin:0 0 1rem;font-size:1.1rem;font-weight:600;">Button Variants</h3>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem;">
        ${['solid','outline','ghost','subtle','danger','success','warning','neutral'].map(v => {
          const b = Button.create({ label: v.charAt(0).toUpperCase() + v.slice(1), variant: v })
          return `<div data-comp="button-${v}"></div>`
        })}
      </div>

      <h3 style="margin:0 0 1rem;font-size:1.1rem;font-weight:600;">Button Sizes</h3>
      <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;margin-bottom:1.5rem;">
        ${['xs','sm','md','lg','xl'].map(sz => {
          const b = Button.create({ label: sz.toUpperCase(), size: sz })
          return `<div data-comp="size-${sz}"></div>`
        })}
      </div>

      <h3 style="margin:0 0 1rem;font-size:1.1rem;font-weight:600;">With Icons</h3>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem;">
        <div data-comp="icon-btn"></div>
        <div data-comp="icon-right-btn"></div>
      </div>

      <h3 style="margin:0 0 1rem;font-size:1.1rem;font-weight:600;">Loading & Disabled</h3>
      <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;margin-bottom:1.5rem;">
        <div data-comp="loading-btn"></div>
        <div data-comp="disabled-btn"></div>
      </div>

      <h3 style="margin:0 0 0.5rem;font-size:1.1rem;font-weight:600;">Interactive</h3>
      <p style="margin:0 0 0.5rem;color:#666;font-size:0.85rem;">Clicks: ${state.clickCount}</p>
      <div data-comp="click-btn"></div>
    </div>
  `,

  mount(el, ctx) {
    // Mount all button instances
    const variants = ['solid','outline','ghost','subtle','danger','success','warning','neutral']
    const sizes = ['xs','sm','md','lg','xl']

    variants.forEach(v => {
      const target = el.querySelector(`[data-comp="button-${v}"]`)
      if (target) Button.create({ label: v.charAt(0).toUpperCase() + v.slice(1), variant: v }).mount(target)
    })

    sizes.forEach(sz => {
      const target = el.querySelector(`[data-comp="size-${sz}"]`)
      if (target) Button.create({ label: sz.toUpperCase(), size: sz }).mount(target)
    })

    const iconTarget = el.querySelector('[data-comp="icon-btn"]')
    if (iconTarget) Button.create({ label: 'Save', icon: '💾', variant: 'solid' }).mount(iconTarget)

    const iconRightTarget = el.querySelector('[data-comp="icon-right-btn"]')
    if (iconRightTarget) Button.create({ label: 'Next', iconRight: '→', variant: 'outline' }).mount(iconRightTarget)

    const loadingTarget = el.querySelector('[data-comp="loading-btn"]')
    if (loadingTarget) Button.create({ label: 'Loading...', loading: true, variant: 'primary' }).mount(loadingTarget)

    const disabledTarget = el.querySelector('[data-comp="disabled-btn"]')
    if (disabledTarget) Button.create({ label: 'Disabled', disabled: true }).mount(disabledTarget)

    const clickTarget = el.querySelector('[data-comp="click-btn"]')
    if (clickTarget) {
      const btn = Button.create({ label: `Clicked ${0} times`, variant: 'solid' })
      btn.mount(clickTarget)
      btn.loop.subscribe(() => {
        // update label by re-mounting — simplified demo
      })
    }
  }
})
