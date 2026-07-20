// Editor Demo — WYSIWYG, Code, Spreadsheet, Layout

import { vibeLight, applyVibeTheme } from '@uploop-vibe/vibe'
import {
  WysiwygEditor,
  CodeEditor,
  Spreadsheet,
  LayoutEditor,
} from '@uploop-vibe/vibe-editor'

applyVibeTheme(vibeLight)

// ── WYSIWYG ──────────────────────────────────────────────────

const wysiwyg = WysiwygEditor.create({ showToolbar: true })
wysiwyg.mount(document.getElementById('demo-wysiwyg'))
WysiwygEditor.setContent(
  '<h2>Welcome to Vibe Editor</h2>' +
  '<p>This is a <strong>rich text</strong> editor built on Uploop HyperGraph.</p>' +
  '<p>Try <em>formatting</em>, <u>lists</u>, and inserting media!</p>'
)

// ── Code Editor ──────────────────────────────────────────────

const code = CodeEditor.create({
  language: 'javascript',
})
code.mount(document.getElementById('demo-code'))
CodeEditor.setCode(
  '// Uploop Component\n' +
  'import { component } from "@uploop/html"\n\n' +
  'export const Counter = component("Counter", {\n' +
  '  state: { count: 0 },\n' +
  '  update: {\n' +
  '    increment: (s) => ({ count: s.count + 1 }),\n' +
  '    decrement: (s) => ({ count: s.count - 1 }),\n' +
  '  },\n' +
  '  view: (s) => `<div>\n' +
  '    <button @click="decrement">-</button>\n' +
  '    <span>${s.count}</span>\n' +
  '    <button @click="increment">+</button>\n' +
  '  </div>`,\n' +
  '})\n'
)

// ── Spreadsheet ──────────────────────────────────────────────

const sheet = Spreadsheet.create({
  columns: [
    { key: 'product', label: 'Product', type: 'string' },
    { key: 'q1', label: 'Q1', type: 'number' },
    { key: 'q2', label: 'Q2', type: 'number' },
    { key: 'q3', label: 'Q3', type: 'number' },
    { key: 'total', label: 'Total', type: 'formula' },
  ],
  rows: [
    { product: 'Widget A', q1: 120, q2: 145, q3: 160 },
    { product: 'Widget B', q1: 85, q2: 92, q3: 110 },
    { product: 'Widget C', q1: 200, q2: 180, q3: 210 },
    { product: 'Widget D', q1: 55, q2: 65, q3: 70 },
  ],
})
sheet.mount(document.getElementById('demo-spreadsheet'))

// ── Layout Builder ───────────────────────────────────────────

const layout = LayoutEditor.create({})
layout.mount(document.getElementById('demo-layout'))
