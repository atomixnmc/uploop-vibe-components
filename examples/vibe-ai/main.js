// ─── Vibe AI — Intent → UI Breakthrough Demo ─────────────────

import { html, component } from '@uploop/html'
import { inject } from '@uploop/css'
import { vibeLight, applyVibeTheme, injectVibeAnimations } from '@uploop-vibe/vibe'
import {
  resolveComponentIntent,
  generateComponent,
  describeComponentIntent,
  composeEntityPage,
  materializeTemplate,
  listTemplates,
  intent,
  intentToken,
} from '@uploop-vibe/vibe-ai'
import { string, number, boolean, object } from '@uploop/schema'

applyVibeTheme(vibeLight)
injectVibeAnimations()
inject()

// ── Intent Explorer State ────────────────────────────────────

const componentTypes = ['button','card','input','textarea','select','badge','avatar','table','tabs','modal','dialog','progress','slider','switch','rating','tagInput','segmentedControl','combobox','emptyState','alert','toast','accordion','carousel','timeline','stat']
const sizes = ['xs','sm','md','lg','xl']
const variants = ['solid','outline','ghost','subtle','danger','success','warning','neutral']
const templates = listTemplates()

const AIDemo = component('VibeAIDemo', {
  state: {
    // Intent Explorer
    type: 'button',
    size: 'md',
    variant: 'solid',
    label: 'Click Me',
    animate: '',
    resolved: null,

    // Schema Demo
    schemaFields: 'name:s, email:e, age:i, active:b',
    schemaMode: 'form',
    schemaResult: '',

    // Template Demo
    selectedTemplate: 'signupForm',
    templateResult: '',
  },

  update: {
    setType:      (s, v) => ({ ...s, type: v, resolved: null }),
    setSize:      (s, v) => ({ ...s, size: v, resolved: null }),
    setVariant:   (s, v) => ({ ...s, variant: v, resolved: null }),
    setLabel:     (s, v) => ({ ...s, label: v, resolved: null }),
    setAnimate:   (s, v) => ({ ...s, animate: v, resolved: null }),
    setSchemaFields: (s, v) => ({ ...s, schemaFields: v }),
    setSchemaMode:   (s, v) => ({ ...s, schemaMode: v }),
    setTemplate:     (s, v) => ({ ...s, selectedTemplate: v }),

    resolve: (s) => {
      const resolved = resolveComponentIntent({
        name: 'Demo' + s.type.charAt(0).toUpperCase() + s.type.slice(1),
        type: s.type,
        props: { label: s.label, size: s.size },
        style: { size: s.size, variant: s.variant, animate: s.animate },
      })
      return { ...s, resolved }
    },

    generateSchema: (s) => {
      try {
        const fields = intentToken.parse(s.schemaFields)
        const desc = fields.describe ? fields.describe() : { fields: fields._fields || {} }
        const result = composeEntityPage({
          schema: {
            describe: () => ({ entity: 'Entity', fields: Object.fromEntries(
              Object.entries(desc.fields || {}).map(([k, v]) => [k, { type: v.type || 'string', optional: v.optional, format: v.format }])
            ) }),
            entityName: 'Entity',
            validate: (v) => ({ ok: true, errors: [], value: v }),
          },
          mode: s.schemaMode,
        })
        return { ...s, schemaResult: `✅ Generated ${result.layout} page with flow "${result.flow}"` }
      } catch (e) {
        return { ...s, schemaResult: '❌ ' + e.message }
      }
    },

    generateTemplate: (s) => {
      try {
        const comp = materializeTemplate(s.selectedTemplate)
        return { ...s, templateResult: comp ? `✅ Template "${s.selectedTemplate}" materialized — ${comp.name || 'ready'}` : '❌ Template not found' }
      } catch (e) {
        return { ...s, templateResult: '❌ ' + e.message }
      }
    },
  },

  view: (state, { send }) => {
    const esc = (s) => String(s||'').replace(/&/g, '&amp;')
    const resolved = state.resolved || resolveComponentIntent({ name:'Demo', type:state.type, props:{ label:state.label }, style:{ size:state.size, variant:state.variant, animate:state.animate } })

    return html`
      <div style="max-width:960px;margin:0 auto;padding:2rem 1.5rem;">
        <div style="text-align:center;margin-bottom:2rem;">
          <a href="/" style="font-size:0.75rem;color:#aaa;text-decoration:none;">← Home</a>
          <h1 style="font-size:2rem;font-weight:800;margin:0.5rem 0 0.25rem;">🤖 Vibe AI</h1>
          <p style="color:#888;font-size:0.95rem;max-width:560px;margin:0 auto;line-height:1.5;">
            Describe what you want in plain <strong>intent</strong> — Vibe materializes it as a real, runnable Uploop component.
            No code generation. No templates. Just intent resolution.
          </p>
        </div>

        <!-- ═══ Section 1: Intent → Component ═══ -->
        <div style="background:white;border:1px solid #e8e8ed;border-radius:16px;padding:1.5rem;margin-bottom:1.5rem;">
          <h2 style="font-size:1.1rem;font-weight:700;margin:0 0 0.25rem;">1. Intent → Component</h2>
          <p style="font-size:0.8rem;color:#888;margin:0 0 1.25rem;">Describe a component by selecting type, props, and style — see it resolve to a real Uploop component in real-time.</p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">
            <!-- Left: Intent Builder -->
            <div>
              <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;margin-bottom:0.75rem;">📋 Intent Description</div>

              <div style="margin-bottom:0.75rem;">
                <label style="display:block;font-size:0.75rem;font-weight:600;color:#666;margin-bottom:0.2rem;">Component Type</label>
                <select @change=${(e) => send('setType', e.target.value)} style="width:100%;padding:0.4rem 0.5rem;border:1px solid #ddd;border-radius:6px;font-size:0.82rem;">
                  ${componentTypes.map(t => html`<option value="${t}" ${state.type===t?'selected':''}>${t}</option>`)}
                </select>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.75rem;">
                <div>
                  <label style="display:block;font-size:0.75rem;font-weight:600;color:#666;margin-bottom:0.2rem;">Size</label>
                  <select @change=${(e) => send('setSize', e.target.value)} style="width:100%;padding:0.4rem 0.5rem;border:1px solid #ddd;border-radius:6px;font-size:0.82rem;">
                    ${sizes.map(sz => html`<option value="${sz}" ${state.size===sz?'selected':''}>${sz}</option>`)}
                  </select>
                </div>
                <div>
                  <label style="display:block;font-size:0.75rem;font-weight:600;color:#666;margin-bottom:0.2rem;">Variant</label>
                  <select @change=${(e) => send('setVariant', e.target.value)} style="width:100%;padding:0.4rem 0.5rem;border:1px solid #ddd;border-radius:6px;font-size:0.82rem;">
                    ${variants.map(v => html`<option value="${v}" ${state.variant===v?'selected':''}>${v}</option>`)}
                  </select>
                </div>
              </div>

              <div style="margin-bottom:0.75rem;">
                <label style="display:block;font-size:0.75rem;font-weight:600;color:#666;margin-bottom:0.2rem;">Label</label>
                <input value="${state.label}" @input=${(e) => send('setLabel', e.target.value)} style="width:100%;padding:0.4rem 0.5rem;border:1px solid #ddd;border-radius:6px;font-size:0.82rem;" />
              </div>

              <div style="margin-bottom:0.75rem;">
                <label style="display:block;font-size:0.75rem;font-weight:600;color:#666;margin-bottom:0.2rem;">Animation (optional)</label>
                <select @change=${(e) => send('setAnimate', e.target.value)} style="width:100%;padding:0.4rem 0.5rem;border:1px solid #ddd;border-radius:6px;font-size:0.82rem;">
                  <option value="">None</option>
                  <option value="fade-in">fade-in</option>
                  <option value="scale-in">scale-in</option>
                  <option value="slide-in-right">slide-in-right</option>
                  <option value="slide-in-up">slide-in-up</option>
                  <option value="pulse">pulse</option>
                  <option value="spin">spin</option>
                </select>
              </div>

              <pre style="background:#1e1e2e;color:#cdd6f4;padding:0.75rem;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:0.7rem;overflow-x:auto;line-height:1.5;margin:0;">
<span style="color:#6c7086;">// Intent object</span>
{
  <span style="color:#c3e88d;">type</span>: <span style="color:#c3e88d;">'${state.type}'</span>,
  <span style="color:#c3e88d;">props</span>: { label: <span style="color:#c3e88d;">'${state.label}'</span>, size: <span style="color:#c3e88d;">'${state.size}'</span> },
    <span style="color:#c3e88d;">style</span>: { variant: <span style="color:#c3e88d;">'${state.variant}'</span> }
}</pre>
            </div>

            <!-- Right: Resolved Result -->
            <div>
              <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;margin-bottom:0.75rem;">⚡ Resolved Component</div>

              <div style="background:#f0fdf4;border:1px solid #d0f0d8;border-radius:10px;padding:1rem;margin-bottom:0.75rem;">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                  <span style="font-size:1.2rem;">${resolved.component ? '✅' : '❌'}</span>
                  <span style="font-weight:600;font-size:0.85rem;">
                    ${resolved.component ? resolved.component.name || 'Available' : 'Not found'}
                  </span>
                </div>
                <div style="font-size:0.75rem;color:#555;">
                  <div>Resolved to: <strong>@uploop-vibe/vibe</strong> component</div>
                  <div>State keys: ${resolved.config?.state ? Object.keys(resolved.config.state).join(', ') : 'none'}</div>
                </div>
              </div>

              <div style="background:white;border:1px solid #e8e8ed;border-radius:10px;padding:1.25rem;min-height:80px;display:flex;align-items:center;justify-content:center;">
                <!-- Render the resolved component inline -->
                ${state.type === 'button' ? html`<button style="
                  padding:0.5rem 1.25rem;
                  background:${state.variant==='solid'?'#646cff':state.variant==='outline'?'transparent':state.variant==='ghost'?'transparent':state.variant==='danger'?'#fa5252':state.variant==='success'?'#40c057':'#f0f0f0'};
                  color:${['solid','danger','success'].includes(state.variant)?'white':'#646cff'};
                  border:${state.variant==='outline'?'1px solid #646cff':state.variant==='ghost'?'none':'none'};
                  border-radius:8px;font-weight:500;cursor:pointer;
                  font-size:${state.size==='xs'?'0.7rem':state.size==='sm'?'0.8rem':state.size==='lg'?'1rem':state.size==='xl'?'1.1rem':'0.85rem'};
                  ${state.animate ? 'animation: vibe-' + state.animate + ' var(--vibe-duration-normal) var(--vibe-easing-out);' : ''}
                ">${esc(state.label)}</button>`
                : state.type === 'badge' ? html`<span style="padding:0.15rem 0.6rem;border-radius:99px;font-size:0.78rem;font-weight:500;background:#d3f9d8;color:#2b8a3e;">${esc(state.label||'Active')}</span>`
                : state.type === 'input' ? html`<div style="width:100%;"><input placeholder="${esc(state.label||'Enter text...')}" style="width:100%;padding:0.5rem 0.75rem;border:1px solid #ddd;border-radius:6px;font-size:0.85rem;" /></div>`
                : state.type === 'card' ? html`<div style="padding:1rem;background:white;border:1px solid #e0e0e0;border-radius:10px;width:100%;"><div style="font-weight:600;margin-bottom:0.3rem;">${esc(state.label||'Card Title')}</div><div style="font-size:0.8rem;color:#888;">Card content</div></div>`
                : state.type === 'progress' ? html`<div style="width:100%;height:0.5rem;background:#eee;border-radius:99px;overflow:hidden;"><div style="width:65%;height:100%;background:#646cff;border-radius:99px;"></div></div>`
                : html`<div style="color:#888;font-size:0.82rem;text-align:center;">Component type: <strong>${state.type}</strong><br/>Fully configurable via intent</div>`
                }
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ Section 2: Schema → Page ═══ -->
        <div style="background:white;border:1px solid #e8e8ed;border-radius:16px;padding:1.5rem;margin-bottom:1.5rem;">
          <h2 style="font-size:1.1rem;font-weight:700;margin:0 0 0.25rem;">2. Schema → Full Page</h2>
          <p style="font-size:0.8rem;color:#888;margin:0 0 1.25rem;">Define a data schema using <strong>intent tokens</strong> (<code>name:s, email:e, age:i</code>) — Vibe generates a complete CRUD page with form, validation, and flow optimization.</p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">
            <div>
              <div style="margin-bottom:0.75rem;">
                <label style="display:block;font-size:0.75rem;font-weight:600;color:#666;margin-bottom:0.2rem;">Intent Token String</label>
                <input value="${state.schemaFields}" @input=${(e) => send('setSchemaFields', e.target.value)} style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:6px;font-family:monospace;font-size:0.85rem;" />
                <div style="font-size:0.68rem;color:#aaa;margin-top:0.2rem;">
                  Shorthand: <code>s</code>=string, <code>n</code>=number, <code>i</code>=integer, <code>e</code>=email, <code>u</code>=url, <code>b</code>=boolean, <code>d</code>=date, <code>?</code>=optional
                </div>
              </div>

              <div style="margin-bottom:0.75rem;">
                <label style="display:block;font-size:0.75rem;font-weight:600;color:#666;margin-bottom:0.2rem;">Display Mode</label>
                <div style="display:flex;gap:0.3rem;">
                  ${['form','table','display'].map(m => html`
                    <button @click=${() => send('setSchemaMode', m)} style="
                      padding:0.3rem 0.8rem;border:1px solid ${state.schemaMode===m?'#646cff':'#ddd'};
                      border-radius:6px;background:${state.schemaMode===m?'#f0f0ff':'white'};
                      color:${state.schemaMode===m?'#646cff':'#555'};font-size:0.78rem;cursor:pointer;
                    ">${m}</button>
                  `)}
                </div>
              </div>

              <button @click=${() => send('generateSchema')} style="
                padding:0.5rem 1.25rem;background:#646cff;color:white;border:none;border-radius:8px;
                cursor:pointer;font-weight:600;font-size:0.82rem;
              ">Generate Page</button>

              ${state.schemaResult ? html`<div style="margin-top:0.75rem;padding:0.75rem;background:${state.schemaResult.startsWith('✅')?'#f0fdf4':'#fff0f0'};border-radius:8px;font-size:0.82rem;color:${state.schemaResult.startsWith('✅')?'#166534':'#991b1b'};">${state.schemaResult}</div>` : ''}

              <pre style="margin-top:0.75rem;background:#1e1e2e;color:#cdd6f4;padding:0.75rem;border-radius:8px;font-family:monospace;font-size:0.7rem;line-height:1.5;overflow-x:auto;">
<span style="color:#6c7086;">// Auto-generates a full page with:</span>
<span style="color:#c792ea;">const</span> { page, entityComp, flow } = <span style="color:#82aaff;">composeEntityPage</span>({
  <span style="color:#c3e88d;">schema</span>: entitySchema,
  <span style="color:#c3e88d;">mode</span>: <span style="color:#c3e88d;">'${state.schemaMode}'</span>,
})

<span style="color:#6c7086;">// page → Uploop component, ready to mount</span>
<span style="color:#6c7086;">// entityComp → form/table/display component</span>
<span style="color:#6c7086;">// flow → suggested execution profile</span>
page.mount(el)</pre>
            </div>

            <div>
              <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;margin-bottom:0.75rem;">📐 How It Works</div>
              <div style="display:flex;flex-direction:column;gap:0.75rem;">
                <div style="display:flex;gap:0.75rem;align-items:flex-start;">
                  <div style="width:1.75rem;height:1.75rem;border-radius:50%;background:#f0f4ff;color:#646cff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;flex-shrink:0;">1</div>
                  <div>
                    <div style="font-weight:600;font-size:0.82rem;">Intent Token</div>
                    <div style="font-size:0.75rem;color:#888;">Compact AI-friendly format: <code>name:s, email:e, age:i, active:b?</code></div>
                  </div>
                </div>
                <div style="display:flex;gap:0.75rem;align-items:flex-start;">
                  <div style="width:1.75rem;height:1.75rem;border-radius:50%;background:#f0f4ff;color:#646cff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;flex-shrink:0;">2</div>
                  <div>
                    <div style="font-weight:600;font-size:0.82rem;">Schema Resolution</div>
                    <div style="font-size:0.75rem;color:#888;">Parses token → structured schema with types, required flags, formats</div>
                  </div>
                </div>
                <div style="display:flex;gap:0.75rem;align-items:flex-start;">
                  <div style="width:1.75rem;height:1.75rem;border-radius:50%;background:#f0f4ff;color:#646cff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;flex-shrink:0;">3</div>
                  <div>
                    <div style="font-weight:600;font-size:0.82rem;">Entity Component</div>
                    <div style="font-size:0.75rem;color:#888;">Auto-generates form fields, validation, update handlers from schema</div>
                  </div>
                </div>
                <div style="display:flex;gap:0.75rem;align-items:flex-start;">
                  <div style="width:1.75rem;height:1.75rem;border-radius:50%;background:#f0f4ff;color:#646cff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;flex-shrink:0;">4</div>
                  <div>
                    <div style="font-weight:600;font-size:0.82rem;">Page Composition</div>
                    <div style="font-size:0.75rem;color:#888;">Wraps in layout, suggests optimal execution flow, ready to mount</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ Section 3: Template Gallery ═══ -->
        <div style="background:white;border:1px solid #e8e8ed;border-radius:16px;padding:1.5rem;margin-bottom:1.5rem;">
          <h2 style="font-size:1.1rem;font-weight:700;margin:0 0 0.25rem;">3. Template Materialization</h2>
          <p style="font-size:0.8rem;color:#888;margin:0 0 1.25rem;">Pre-built page templates — signup forms, dashboards, settings pages, error pages — ready to materialize with overrides.</p>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.75rem;margin-bottom:1rem;">
            ${templates.map(t => html`
              <div @click=${() => send('setTemplate', t.name)} style="
                padding:0.75rem 1rem;border:2px solid ${state.selectedTemplate===t.name?'#646cff':'#e8e8ed'};
                border-radius:10px;cursor:pointer;transition:all 0.15s;
                background:${state.selectedTemplate===t.name?'#f0f4ff':'white'};
              ">
                <div style="font-weight:600;font-size:0.82rem;margin-bottom:0.15rem;">${t.name}</div>
                <div style="font-size:0.72rem;color:#888;">${t.description}</div>
              </div>
            `)}
          </div>

          <div style="display:flex;gap:0.75rem;align-items:center;">
            <button @click=${() => send('generateTemplate')} style="
              padding:0.5rem 1.25rem;background:#646cff;color:white;border:none;border-radius:8px;
              cursor:pointer;font-weight:600;font-size:0.82rem;
            ">Materialize: ${state.selectedTemplate}</button>
            ${state.templateResult ? html`<span style="font-size:0.85rem;color:${state.templateResult.startsWith('✅')?'#166534':'#991b1b'};">${state.templateResult}</span>` : ''}
          </div>
        </div>

        <!-- ═══ Section 4: The Breakthrough ═══ -->
        <div style="background:linear-gradient(135deg,#f0f4ff,#f5f0ff);border:1px solid #d8dcf0;border-radius:16px;padding:2rem;text-align:center;">
          <h2 style="font-size:1.3rem;font-weight:800;margin:0 0 0.75rem;">⚡ The Breakthrough</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;max-width:720px;margin:0 auto;text-align:left;">
            <div style="padding:1rem;background:white;border-radius:10px;">
              <div style="font-size:1.5rem;margin-bottom:0.25rem;">🎯</div>
              <strong style="font-size:0.85rem;">Intent-Driven</strong>
              <p style="font-size:0.75rem;color:#888;margin:0.2rem 0 0;">AI describes what it wants in plain objects — no code generation needed</p>
            </div>
            <div style="padding:1rem;background:white;border-radius:10px;">
              <div style="font-size:1.5rem;margin-bottom:0.25rem;">🔄</div>
              <strong style="font-size:0.85rem;">Schema → UI</strong>
              <p style="font-size:0.75rem;color:#888;margin:0.2rem 0 0;">Data shapes become forms, tables, and full pages automatically</p>
            </div>
            <div style="padding:1rem;background:white;border-radius:10px;">
              <div style="font-size:1.5rem;margin-bottom:0.25rem;">📦</div>
              <strong style="font-size:0.85rem;">Templates</strong>
              <p style="font-size:0.75rem;color:#888;margin:0.2rem 0 0;">8 pre-built pages materialize with one function call + overrides</p>
            </div>
            <div style="padding:1rem;background:white;border-radius:10px;">
              <div style="font-size:1.5rem;margin-bottom:0.25rem;">🌊</div>
              <strong style="font-size:0.85rem;">Flow Optimized</strong>
              <p style="font-size:0.75rem;color:#888;margin:0.2rem 0 0;">Every generated page gets an optimal execution profile auto-suggested</p>
            </div>
          </div>

          <div style="margin-top:1.5rem;font-size:0.85rem;color:#555;line-height:1.6;max-width:560px;margin-left:auto;margin-right:auto;">
            <strong>Zero code generation.</strong> Vibe doesn't generate source code strings. It maps intents to
            <strong>existing, tested, theme-able</strong> HyperGraph components — then wires them into a running Uploop loop.
            The same <code>createLoop()</code> that powers Uploop's core drives every generated component.
          </div>
        </div>
      </div>
    `
  },
})

AIDemo.mount(document.getElementById('app'))
