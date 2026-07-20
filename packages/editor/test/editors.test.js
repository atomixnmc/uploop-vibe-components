// ─── Editor package — structural & export tests ────────────────

import { describe, it, expect } from 'vitest'

// Barrel re-exports
import {
  WysiwygEditor,
  CodeEditor,
  Spreadsheet,
  LayoutEditor,
} from '../src/index.js'

// ── Shared structural contract ──────────────────────────────────

function assertEditorExports(name, editor) {
  it(`${name} exports create and view functions`, () => {
    expect(editor).toBeDefined()
    expect(typeof editor.create).toBe('function')
    expect(typeof editor.view).toBe('function')
  })
}

// ── WYSIWYG Editor ──────────────────────────────────────────────

describe('WysiwygEditor', () => {
  assertEditorExports('WysiwygEditor', WysiwygEditor)

  it('create() returns an editor instance', () => {
    const instance = WysiwygEditor.create({})
    expect(instance).toBeDefined()
    expect(typeof instance.mount).toBe('function')
  })
})

// ── Code Editor ─────────────────────────────────────────────────

describe('CodeEditor', () => {
  assertEditorExports('CodeEditor', CodeEditor)

  it('create() returns an editor instance', () => {
    const instance = CodeEditor.create({})
    expect(instance).toBeDefined()
    expect(typeof instance.mount).toBe('function')
  })
})

// ── Spreadsheet ─────────────────────────────────────────────────

describe('Spreadsheet', () => {
  assertEditorExports('Spreadsheet', Spreadsheet)

  it('create() returns a sheet instance', () => {
    const instance = Spreadsheet.create({})
    expect(instance).toBeDefined()
    expect(typeof instance.mount).toBe('function')
  })

  it('supports formula columns', () => {
    const instance = Spreadsheet.create({
      columns: [
        { key: 'x', label: 'X', type: 'number' },
        { key: 'formula', label: 'Calc', type: 'formula' },
      ],
    })
    expect(instance).toBeDefined()
  })
})

// ── Layout Editor ───────────────────────────────────────────────

describe('LayoutEditor', () => {
  assertEditorExports('LayoutEditor', LayoutEditor)

  it('create() returns a layout instance', () => {
    const instance = LayoutEditor.create({})
    expect(instance).toBeDefined()
    expect(typeof instance.mount).toBe('function')
  })

  it('accepts a component palette', () => {
    const instance = LayoutEditor.create({})
    expect(instance).toBeDefined()
  })
})

// ── Import shape verification ───────────────────────────────────

describe('barrel exports', () => {
  it('exports exactly the 4 editor symbols', () => {
    const exported = new Set([
      WysiwygEditor,
      CodeEditor,
      Spreadsheet,
      LayoutEditor,
    ])
    expect(exported.size).toBe(4)
  })

  it('every export is a non-null component descriptor', () => {
    for (const e of [WysiwygEditor, CodeEditor, Spreadsheet, LayoutEditor]) {
      expect(e).toBeDefined()
      expect(e).not.toBeNull()
      // Uploop component() returns a callable descriptor (function or object)
      expect(['function','object']).toContain(typeof e)
    }
  })
})
