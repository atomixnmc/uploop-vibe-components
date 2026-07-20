// ─── @uploop-vibe/vibe-editor VibeSpreadsheet ──────────────────
//
// Table-like grid editor with:
//  - Click to select cell, double-click / type to edit
//  - Column headers with click-to-sort
//  - Simple formulas: =SUM(A1:A5), =AVG(B1:B10), =A1+B2*C3
//  - Add / delete row and column buttons
//  - Tab / Enter to navigate cells
//  - getData() / setData(data) API
//
// State lives in a @uploop/store; the component subscribes for
// reactivity and holds its own UI state (selection, editing, sort).

import { component } from '@uploop/html'
import { store } from '@uploop/store'

// ---------------------------------------------------------------------------
// Helpers — column letter <-> index conversion
// ---------------------------------------------------------------------------

/** "A"→0, "B"→1, …, "Z"→25, "AA"→26, … */
function colToIndex(col) {
  let n = 0
  for (let i = 0; i < col.length; i++) {
    n = n * 26 + (col.charCodeAt(i) - 64)
  }
  return n - 1
}

/** 0→"A", 1→"B", …, 25→"Z", 26→"AA", … */
function indexToCol(idx) {
  let n = idx + 1
  let s = ''
  while (n > 0) {
    n--
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26)
  }
  return s
}

/** Parse "A1" → { col: 0, row: 0 } */
function parseCellRef(ref) {
  const m = /^([A-Z]+)(\d+)$/i.exec(ref.trim().toUpperCase())
  if (!m) return null
  return { col: colToIndex(m[1]), row: parseInt(m[2], 10) - 1 }
}

/**
 * Simple arithmetic evaluator — no eval / Function constructor.
 * Handles + - * / and parentheses with correct precedence.
 */
function evalArithmetic(expr) {
  const tokens = []
  let i = 0
  while (i < expr.length) {
    const ch = expr[i]
    if (/\s/.test(ch)) { i++; continue }
    if (/\d/.test(ch) || (ch === '.' && i + 1 < expr.length && /\d/.test(expr[i + 1]))) {
      let num = ''
      while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
        num += expr[i++]
      }
      tokens.push({ type: 'num', val: parseFloat(num) })
      continue
    }
    if ('+-*/()'.includes(ch)) {
      tokens.push({ type: 'op', val: ch })
      i++
      continue
    }
    i++ // skip unknown
  }

  // Shunting-yard → RPN → evaluate
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 }
  const output = []
  const ops = []
  for (const t of tokens) {
    if (t.type === 'num') {
      output.push(t)
    } else if (t.val === '(') {
      ops.push(t)
    } else if (t.val === ')') {
      while (ops.length && ops[ops.length - 1].val !== '(') output.push(ops.pop())
      ops.pop() // discard '('
    } else {
      while (ops.length && ops[ops.length - 1].val !== '(' && prec[ops[ops.length - 1].val] >= prec[t.val]) {
        output.push(ops.pop())
      }
      ops.push(t)
    }
  }
  while (ops.length) output.push(ops.pop())

  const stack = []
  for (const t of output) {
    if (t.type === 'num') {
      stack.push(t.val)
    } else {
      const b = stack.pop()
      const a = stack.pop()
      switch (t.val) {
        case '+': stack.push(a + b); break
        case '-': stack.push(a - b); break
        case '*': stack.push(a * b); break
        case '/': stack.push(b === 0 ? NaN : a / b); break
      }
    }
  }
  return stack[0]
}

// ---------------------------------------------------------------------------
// Formula evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate a formula string (without leading "=").
 * `getCellValue(colIdx, rowIdx)` returns the numeric value of a cell.
 *
 * Supports:
 *   SUM(A1:A5)   — sum of range in one column
 *   AVG(B1:B10)  — average of range in one column
 *   A1+B2*C3     — arithmetic with cell references
 */
function evalFormula(formula, getCellValue) {
  let expr = formula.trim()

  // 1. Replace function calls: SUM(colRow:colRow) / AVG(colRow:colRow)
  expr = expr.replace(/\b(SUM|AVG)\s*\(\s*([A-Z]+\d+)\s*:\s*([A-Z]+\d+)\s*\)/gi,
    (_, fn, startRef, endRef) => {
      const s = parseCellRef(startRef)
      const e = parseCellRef(endRef)
      if (!s || !e || s.col !== e.col) return '0'
      const from = Math.min(s.row, e.row)
      const to = Math.max(s.row, e.row)
      let sum = 0
      let count = 0
      for (let r = from; r <= to; r++) {
        const v = getCellValue(s.col, r)
        if (typeof v === 'number' && !isNaN(v)) { sum += v; count++ }
      }
      return fn.toUpperCase() === 'AVG' ? String(count ? sum / count : 0) : String(sum)
    })

  // 2. Replace individual cell references: A1, B2, …
  expr = expr.replace(/\b([A-Z]+\d+)\b/gi, (ref) => {
    const c = parseCellRef(ref)
    if (!c) return '0'
    const v = getCellValue(c.col, c.row)
    return typeof v === 'number' && !isNaN(v) ? String(v) : '0'
  })

  // 3. Evaluate remaining arithmetic
  return evalArithmetic(expr)
}

// ---------------------------------------------------------------------------
// Spreadsheet data store
// ---------------------------------------------------------------------------

export const spreadsheetStore = store({
  name: 'vibe-spreadsheet',
  state: {
    columns: [],
    rows: [],
  },
  update: {
    setData: (_s, data) => ({
      columns: Array.isArray(data.columns) ? data.columns : [],
      rows: Array.isArray(data.rows) ? data.rows : [],
    }),
    updateCell: (s, rowIdx, colKey, value) => {
      const rows = s.rows.map((row, i) => {
        if (i !== rowIdx) return row
        return { ...row, [colKey]: value }
      })
      return { ...s, rows }
    },
    addRow: (s) => {
      const newRow = {}
      for (const col of s.columns) newRow[col.key] = ''
      return { ...s, rows: [...s.rows, newRow] }
    },
    deleteRow: (s, idx) => {
      if (s.rows.length <= 1) return s
      const targetIdx = idx ?? (s.rows.length - 1)
      return { ...s, rows: s.rows.filter((_, i) => i !== targetIdx) }
    },
    addColumn: (s) => {
      const key = 'col_' + (s.columns.length + 1)
      const label = String.fromCharCode(65 + s.columns.length)
      const col = { key, label, type: 'string' }
      return { columns: [...s.columns, col], rows: s.rows.map(r => ({ ...r, [key]: '' })) }
    },
    deleteColumn: (s, idx) => {
      if (s.columns.length <= 1) return s
      const targetIdx = idx ?? (s.columns.length - 1)
      const colKey = s.columns[targetIdx]?.key
      if (!colKey) return s
      const columns = s.columns.filter((_, i) => i !== targetIdx)
      const rows = s.rows.map(r => {
        const copy = { ...r }
        delete copy[colKey]
        return copy
      })
      return { columns, rows }
    },
  },
})

// ---------------------------------------------------------------------------
// Helper — resolve display value for a cell (evaluate formulas)
// ---------------------------------------------------------------------------

function getCellDisplayValue(columns, rows, colIdx, rowIdx) {
  const col = columns[colIdx]
  if (!col || rowIdx >= rows.length) return ''
  const raw = rows[rowIdx]?.[col.key]
  if (raw == null) return ''
  if (col.type !== 'formula') return String(raw)
  const formula = String(raw)
  if (!formula.startsWith('=')) return formula

  const getter = (cIdx, rIdx) => {
    const c = columns[cIdx]
    if (!c || rIdx >= rows.length) return 0
    const v = rows[rIdx]?.[c.key]
    if (v == null || v === '') return 0
    const n = Number(v)
    return isNaN(n) ? 0 : n
  }

  const result = evalFormula(formula.slice(1), getter)
  return isNaN(result) ? '#ERR' : String(result)
}

// ---------------------------------------------------------------------------
// VibeSpreadsheet component
// ---------------------------------------------------------------------------

export const VibeSpreadsheet = component('VibeSpreadsheet', {
  state: {
    selectedCell: null,
    editing: false,
    editValue: '',
    sortCol: -1,
    sortDir: 1,
    _columns: [],
    _rows: [],
  },

  update: {
    _sync: (s, { columns, rows }) => ({ ...s, _columns: columns || [], _rows: rows || [] }),
    selectCell: (s, row, col) => ({
      ...s, selectedCell: { row, col }, editing: false, editValue: '',
    }),
    startEdit: (s) => {
      if (!s.selectedCell) return s
      const col = s._columns[s.selectedCell.col]
      if (!col) return s
      const raw = s._rows[s.selectedCell.row]?.[col.key] ?? ''
      return { ...s, editing: true, editValue: String(raw) }
    },
    commitEdit: (s) => {
      if (!s.selectedCell || s.editValue.trim() === '') {
        return { ...s, editing: false, editValue: '' }
      }
      const col = s._columns[s.selectedCell.col]
      if (!col) return { ...s, editing: false, editValue: '' }

      const val = s.editValue
      const isFormula = val.startsWith('=')

      if (isFormula && col.type !== 'formula') {
        const newCols = s._columns.map((c, i) =>
          i === s.selectedCell.col ? { ...c, type: 'formula' } : c
        )
        spreadsheetStore.send('setData', { columns: newCols, rows: s._rows })
      }

      spreadsheetStore.send('updateCell', s.selectedCell.row, col.key, val)
      return { ...s, editing: false, editValue: '' }
    },
    cancelEdit: (s) => ({ ...s, editing: false, editValue: '' }),
    setEditValue: (s, val) => ({ ...s, editValue: val }),
    navigate: (s, dRow, dCol) => {
      const storeState = spreadsheetStore.select()
      const maxRow = storeState.rows.length - 1
      const maxCol = storeState.columns.length - 1
      if (maxRow < 0 || maxCol < 0) return s
      const cur = s.selectedCell || { row: 0, col: 0 }
      const row = Math.max(0, Math.min(maxRow, cur.row + dRow))
      const col = Math.max(0, Math.min(maxCol, cur.col + dCol))
      return { ...s, selectedCell: { row, col }, editing: false, editValue: '' }
    },
    sort: (s, colIdx) => {
      const dir = s.sortCol === colIdx ? -s.sortDir : 1
      const storeState = spreadsheetStore.select()
      const colKey = storeState.columns[colIdx]?.key
      if (!colKey) return { ...s, sortCol: colIdx, sortDir: dir }
      const sorted = [...storeState.rows].sort((a, b) => {
        const va = a[colKey] ?? ''
        const vb = b[colKey] ?? ''
        const na = Number(va), nb = Number(vb)
        const compare = isNaN(na) || isNaN(nb)
          ? String(va).localeCompare(String(vb))
          : na - nb
        return dir * compare
      })
      spreadsheetStore.send('setData', { columns: storeState.columns, rows: sorted })
      return { ...s, sortCol: colIdx, sortDir: dir }
    },
  },

  view(state) {
    const columns = state._columns || []
    const rows = state._rows || []
    const { selectedCell, editing, editValue, sortCol, sortDir } = state

    const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

    return /* html */ `
    <div class="vibe-spreadsheet" style="
      font-family:var(--vibe-font-sans, system-ui, sans-serif);
      font-size:var(--vibe-font-size-sm);
      color:var(--vibe-color-fg);
      background:var(--vibe-color-bg);
      border:1px solid var(--vibe-color-border);
      border-radius:var(--vibe-radius-md);
      overflow:hidden;
    ">
      <div class="vibe-spreadsheet-toolbar" style="
        display:flex; gap:0.375rem; padding:0.5rem 0.75rem;
        border-bottom:1px solid var(--vibe-color-border);
        background:var(--vibe-color-surface);
        align-items:center;
      ">
        <button class="vibe-spreadsheet-btn" data-spreadsheet-action="addRow" style="
          padding:0.25rem 0.625rem; font-size:var(--vibe-font-size-xs);
          border:1px solid var(--vibe-color-border);
          border-radius:var(--vibe-radius-sm);
          background:var(--vibe-color-bg);
          color:var(--vibe-color-fg);
          cursor:pointer;
        ">+ Row</button>
        <button class="vibe-spreadsheet-btn" data-spreadsheet-action="deleteRow" style="
          padding:0.25rem 0.625rem; font-size:var(--vibe-font-size-xs);
          border:1px solid var(--vibe-color-border);
          border-radius:var(--vibe-radius-sm);
          background:var(--vibe-color-bg);
          color:var(--vibe-color-fg);
          cursor:pointer;
        ">- Row</button>
        <button class="vibe-spreadsheet-btn" data-spreadsheet-action="addColumn" style="
          padding:0.25rem 0.625rem; font-size:var(--vibe-font-size-xs);
          border:1px solid var(--vibe-color-border);
          border-radius:var(--vibe-radius-sm);
          background:var(--vibe-color-bg);
          color:var(--vibe-color-fg);
          cursor:pointer;
        ">+ Col</button>
        <button class="vibe-spreadsheet-btn" data-spreadsheet-action="deleteColumn" style="
          padding:0.25rem 0.625rem; font-size:var(--vibe-font-size-xs);
          border:1px solid var(--vibe-color-border);
          border-radius:var(--vibe-radius-sm);
          background:var(--vibe-color-bg);
          color:var(--vibe-color-fg);
          cursor:pointer;
        ">- Col</button>
        <div style="flex:1;"></div>
        <span style="font-size:var(--vibe-font-size-xs);color:var(--vibe-color-muted);">
          ${rows.length} &times; ${columns.length}
        </span>
      </div>

      <div class="vibe-spreadsheet-table-wrap" style="overflow:auto;max-height:420px;">
        <table class="vibe-spreadsheet-table" style="
          width:100%; border-collapse:collapse; table-layout:auto;
        ">
          <thead>
            <tr>
              <th style="
                width:40px; min-width:40px;
                padding:0.375rem 0.5rem; text-align:center;
                font-weight:var(--vibe-font-weight-semibold);
                font-size:var(--vibe-font-size-xs);
                color:var(--vibe-color-mutedFg);
                background:var(--vibe-color-surface);
                border-bottom:2px solid var(--vibe-color-border);
                position:sticky; top:0; z-index:2;
              ">#</th>
              ${columns.map((col, ci) => {
                const sortIcon = sortCol === ci ? (sortDir === 1 ? ' ▲' : ' ▼') : ''
                return `<th data-col="${ci}" class="vibe-spreadsheet-header" style="
                  padding:0.375rem 0.75rem; text-align:left; white-space:nowrap;
                  font-weight:var(--vibe-font-weight-semibold);
                  font-size:var(--vibe-font-size-xs);
                  color:var(--vibe-color-mutedFg);
                  background:var(--vibe-color-surface);
                  border-bottom:2px solid var(--vibe-color-border);
                  cursor:pointer; user-select:none;
                  position:sticky; top:0; z-index:2;
                ">${esc(col.label)}${sortIcon}</th>`
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, ri) => `
              <tr data-row="${ri}" style="
                ${ri % 2 === 0 ? 'background:var(--vibe-color-bg);' : 'background:var(--vibe-color-surface);'}
              ">
                <td style="
                  padding:0.25rem 0.5rem; text-align:center;
                  font-size:var(--vibe-font-size-xs);
                  color:var(--vibe-color-muted);
                  border-bottom:1px solid var(--vibe-color-border);
                ">${ri + 1}</td>
                ${columns.map((col, ci) => {
                  const isSelected = selectedCell &&
                    selectedCell.row === ri && selectedCell.col === ci
                  const display = getCellDisplayValue(columns, rows, ci, ri)
                  const style = isSelected
                    ? `border:2px solid #3b82f6; background:#eff6ff;`
                    : `border-bottom:1px solid var(--vibe-color-border);`

                  if (editing && isSelected) {
                    return `<td data-col="${ci}" data-row="${ri}" style="
                      padding:0; ${style} min-width:80px;
                    ">
                      <input class="vibe-spreadsheet-input" data-up-prop="editValue:value"
                        value="${esc(editValue)}"
                        style="
                          width:100%; height:100%; border:none; outline:none;
                          padding:0.25rem 0.5rem; font-size:var(--vibe-font-size-sm);
                          font-family:inherit; background:transparent;
                          color:var(--vibe-color-fg); box-sizing:border-box;
                        "
                      />
                    </td>`
                  }

                  return `<td data-col="${ci}" data-row="${ri}" style="
                    padding:0.25rem 0.5rem; ${style} min-width:80px;
                    font-size:var(--vibe-font-size-sm);
                    cursor:cell; white-space:nowrap;
                    overflow:hidden; text-overflow:ellipsis; max-width:220px;
                  ">${esc(display)}</td>`
                }).join('')}
              </tr>
            `).join('')}
            ${rows.length === 0 ? `<tr><td colspan="${columns.length + 1}" style="
              padding:2rem; text-align:center; color:var(--vibe-color-muted);
            ">No data. Add a row to get started.</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    </div>`
  },

  mount(el, ctx) {
    // Initial sync from store
    const storeState = spreadsheetStore.select()
    ctx.send('_sync', { columns: storeState.columns, rows: storeState.rows })

    // Subscribe to store changes
    const unsub = spreadsheetStore.subscribe((s) => {
      ctx.send('_sync', { columns: s.columns, rows: s.rows })
    })

    // Cell click: select cell + header sort
    el.addEventListener('click', (e) => {
      const td = e.target.closest('[data-row][data-col]')
      if (td) ctx.send('selectCell', parseInt(td.dataset.row), parseInt(td.dataset.col))
      const th = e.target.closest('.vibe-spreadsheet-header')
      if (th && !isNaN(parseInt(th.dataset.col))) ctx.send('sort', parseInt(th.dataset.col))
    })

    // Double-click: start edit
    el.addEventListener('dblclick', (e) => {
      if (e.target.closest('[data-row][data-col]')) ctx.send('startEdit')
    })

    // Keyboard shortcuts
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); ctx.send('commitEdit'); ctx.send('navigate', 1, 0) }
      else if (e.key === 'Tab') { e.preventDefault(); ctx.send('commitEdit'); ctx.send('navigate', 0, e.shiftKey ? -1 : 1) }
      else if (e.key === 'Escape') { ctx.send('cancelEdit') }
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const sel = ctx.get().selectedCell
        if (sel) { ctx.send('startEdit'); setTimeout(() => ctx.send('setEditValue', e.key), 10) }
      }
    })

    // Toolbar buttons
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-spreadsheet-action]')
      if (!btn) return
      const action = btn.dataset.spreadsheetAction
      if (action === 'addRow') spreadsheetStore.send('addRow')
      else if (action === 'deleteRow') spreadsheetStore.send('deleteRow')
      else if (action === 'addColumn') spreadsheetStore.send('addColumn')
      else if (action === 'deleteColumn') spreadsheetStore.send('deleteColumn')
    })

    return () => { unsub() }
  },

    getData() {
    const s = spreadsheetStore.select()
    return { columns: s.columns, rows: s.rows }
  },
  setData(data) {
    spreadsheetStore.send('setData', data)
  },
  addRow() {
    spreadsheetStore.send('addRow')
  },
  deleteRow(idx) {
    if (idx != null) {
      spreadsheetStore.send('deleteRow', idx)
    } else {
      const s = spreadsheetStore.select()
      if (s.rows.length > 1) spreadsheetStore.send('deleteRow', s.rows.length - 1)
    }
  },
  addColumn() {
    spreadsheetStore.send('addColumn')
  },
  deleteColumn(idx) {
    if (idx != null) {
      spreadsheetStore.send('deleteColumn', idx)
    } else {
      const s = spreadsheetStore.select()
      if (s.columns.length > 1) spreadsheetStore.send('deleteColumn', s.columns.length - 1)
    }
  },
})

export default VibeSpreadsheet
