// ─── AI Intent Demo — Intent → Component generation ─────────

import { component, html } from '@uploop/html'
import { Input, Button, Card, Badge, Stack, Flex } from '@uploop-vibe/vibe'
import {
  resolveComponentIntent,
  generateComponent,
  describeComponentIntent,
  composeEntityPage,
  materializeTemplate,
  listTemplates,
  intent,
  resolveIntent,
  intentToken,
} from '@uploop-vibe/vibe-ai'
import { string, number, boolean, object } from '@uploop/schema'

export const AIDemo = component('AIDemo', {
  state: {
    // Intent explorer state
    selectedType: 'button',
    generatedDesc: null,
    showSchemaDemo: false,
    showTemplateDemo: false,

    // Template list
    templates: listTemplates(),
    selectedTemplate: '',

    // Schema example
    schemaEntity: null,
    schemaResult: null,
  },

  update: {
    setType: (s, selectedType) => ({ ...s, selectedType }),
    toggleSchemaDemo: (s) => ({ ...s, showSchemaDemo: !s.showSchemaDemo }),
    toggleTemplateDemo: (s) => ({ ...s, showTemplateDemo: !s.showTemplateDemo }),
    setTemplate: (s, selectedTemplate) => ({ ...s, selectedTemplate }),
    generateSchemaPage: (s) => {
      // Build a user entity schema
      const userSchema = object({
        name: string(),
        email: string(),
        role: string({ enum: ['admin', 'editor', 'viewer'] }),
        active: boolean({ default: true }),
      }).describe()

      const result = composeEntityPage({
        schema: {
          describe: () => userSchema,
          entityName: 'User',
          validate: (v) => ({ ok: true, errors: [], value: v }),
        },
        mode: 'form',
        layout: 'form',
      })

      return { ...s, schemaEntity: userSchema, schemaResult: 'Page generated! Layout: ' + result.layout + ', Flow: ' + result.flow }
    },
  },

  view: (state, { send }) => {
    const types = ['button', 'card', 'input', 'badge', 'avatar', 'table', 'modal', 'dialog', 'progress', 'tabs']

    // Resolve current intent
    const currentIntent = { name: 'Demo', type: state.selectedType, props: {}, style: { size: 'md', variant: 'solid' } }
    const resolved = resolveComponentIntent(currentIntent)

    return html`<div style="padding:1.5rem;">
      <h3 style="margin:0 0 0.25rem;font-size:1.1rem;font-weight:600;">🤖 AI Intent Explorer</h3>
      <p style="margin:0 0 1rem;color:#666;font-size:0.82rem;">Describe a component by intent — Vibe resolves it to a real Uploop component.</p>

      <!-- Intent Type Selector -->
      <div style="margin-bottom:1.25rem;">
        <label style="display:block;font-size:0.8rem;font-weight:600;margin-bottom:0.375rem;color:#888;">Component Type</label>
        <div style="display:flex;gap:0.375rem;flex-wrap:wrap;">
          ${types.map(t => html`
            <button @click=${() => send('setType', t)} style="
              padding:0.3rem 0.7rem;border:1px solid ${state.selectedType === t ? 'var(--vibe-color-primary600)' : 'var(--vibe-color-border)'};
              border-radius:var(--vibe-radius-full);cursor:pointer;font-size:0.75rem;
              background:${state.selectedType === t ? 'var(--vibe-color-primary50)' : 'transparent'};
              color:${state.selectedType === t ? 'var(--vibe-color-primary700)' : '#555'};
              font-weight:${state.selectedType === t ? '600' : '400'};
              transition:all 0.15s;
            ">${t}</button>
          `)}
        </div>
      </div>

      <!-- Intent → Result -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;">
        <!-- Intent description -->
        <div style="padding:1rem;background:#f8f9ff;border:1px solid #e0e4f0;border-radius:8px;font-family:monospace;font-size:0.78rem;">
          <div style="font-weight:600;margin-bottom:0.5rem;color:#555;">📋 Intent</div>
          <pre style="margin:0;white-space:pre-wrap;line-height:1.5;">{
  name: 'Demo${state.selectedType.charAt(0).toUpperCase() + state.selectedType.slice(1)}',
  type: '${state.selectedType}',
  props: {},
  style: { size: 'md', variant: 'solid' }
}</pre>
        </div>

        <!-- Resolved result -->
        <div style="padding:1rem;background:#f0fdf4;border:1px solid #d0f0d8;border-radius:8px;font-family:monospace;font-size:0.78rem;">
          <div style="font-weight:600;margin-bottom:0.5rem;color:#555;">⚡ Resolved</div>
          <div>Component: <strong>${resolved.component ? '✅ Found' : '❌ Not found'}</strong></div>
          <div style="margin-top:0.375rem;">State keys: ${resolved.config?.state ? Object.keys(resolved.config.state).join(', ') : 'none'}</div>
        </div>
      </div>

      <!-- Schema → Page Demo -->
      <div style="margin-bottom:1.25rem;">
        <button @click=${() => send('toggleSchemaDemo')} style="
          padding:0.5rem 1rem;border:1px solid var(--vibe-color-border);border-radius:8px;cursor:pointer;
          background:${state.showSchemaDemo ? 'var(--vibe-color-primary50)' : 'transparent'};font-size:0.82rem;
        ">📐 Schema → Page Demo ${state.showSchemaDemo ? '▼' : '▶'}</button>

        ${state.showSchemaDemo ? html`<div style="margin-top:0.75rem;padding:1rem;background:#fafafa;border:1px solid #e8e8ed;border-radius:8px;">
          <p style="font-size:0.78rem;color:#666;margin:0 0 0.75rem;">Define an entity schema and auto-generate a CRUD page:</p>
          <pre style="background:#1e1e2e;color:#cdd6f4;padding:0.75rem;border-radius:6px;font-size:0.72rem;margin:0 0 0.75rem;overflow-x:auto;">
const userSchema = object({
  name: string(),
  email: string(),
  role: string({ enum: ['admin','editor','viewer'] }),
  active: boolean({ default: true })
})

const page = composeEntityPage({
  schema: userSchema,
  mode: 'form',
  layout: 'form'
})</pre>
          <button @click=${() => send('generateSchemaPage')} style="
            padding:0.5rem 1rem;background:var(--vibe-color-primary600);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:500;
          ">Generate Page</button>
          ${state.schemaResult ? html`<div style="margin-top:0.5rem;padding:0.5rem;background:#f0fdf4;border-radius:4px;font-size:0.78rem;color:#166534;">✅ ${state.schemaResult}</div>` : ''}
        </div>` : ''}
      </div>

      <!-- Template Demo -->
      <div style="margin-bottom:1rem;">
        <button @click=${() => send('toggleTemplateDemo')} style="
          padding:0.5rem 1rem;border:1px solid var(--vibe-color-border);border-radius:8px;cursor:pointer;
          background:${state.showTemplateDemo ? 'var(--vibe-color-primary50)' : 'transparent'};font-size:0.82rem;
        ">📄 Materialize Template ${state.showTemplateDemo ? '▼' : '▶'}</button>

        ${state.showTemplateDemo ? html`<div style="margin-top:0.75rem;padding:1rem;background:#fafafa;border:1px solid #e8e8ed;border-radius:8px;">
          <p style="font-size:0.78rem;color:#666;margin:0 0 0.5rem;">Pre-built page templates ready to materialize:</p>
          <div style="display:flex;gap:0.375rem;flex-wrap:wrap;margin-bottom:0.75rem;">
            ${state.templates.map(t => html`
              <span style="
                padding:0.2rem 0.6rem;background:var(--vibe-color-primary50);color:var(--vibe-color-primary700);
                border-radius:var(--vibe-radius-full);font-size:0.72rem;font-weight:500;
              ">${t.name}</span>
            `)}
          </div>
          <p style="font-size:0.75rem;color:#888;margin:0;">Use <code>materializeTemplate('signupForm')</code> to get a complete signup page with validation, wired to Uploop's update loop.</p>
        </div>` : ''}
      </div>

      <!-- Intent Token Demo -->
      <div style="padding:1rem;background:#1e1e2e;border-radius:8px;">
        <div style="font-size:0.72rem;color:#888;margin-bottom:0.5rem;">🔤 Intent Token (AI-optimized communication):</div>
        <code style="color:#646cff;font-size:0.8rem;">intent({ name: 's', email: 'e', age: 'i', active: 'b' }).toTokens()</code>
        <div style="margin-top:0.375rem;color:#cdd6f4;font-family:monospace;font-size:0.78rem;">
          → ${intent({ name: 's', email: 'e', age: 'i', active: 'b' }).toTokens()}
        </div>
      </div>
    </div>`
  }
})
