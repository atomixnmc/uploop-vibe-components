// @uploop-vibe/vibe-editor Spreadsheet — rebuilt with uploop patterns
//
// Architecture:
//   spreadsheetStore  — @uploop/store for cell data (single source of truth)
//   Spreadsheet       — top-level component: mounts store, toolbar, grid
//   SpreadsheetGrid   — renders the table, handles cell click/select
//   Each cell uses data-up-prop/data-up-event for declarative bindings
//
// All interactions go through the store. Components subscribe reactively.

import { component } from '@uploop/html'
import { store } from '@uploop/store'

// ── Column letter helpers ──────────────────────────────────

function indexToCol(i) { let s = ''; while (i >= 0) { s = String.fromCharCode(65 + (i % 26)) + s; i = Math.floor(i / 26) - 1; } return s }

// ── Formula evaluator (shunting-yard) ──────────────────────

function evalFormula(expr, getCell) {
  const tokens = expr.match(/([A-Z]+)(\d+)|[+\-*/()]|\d+(\.\d+)?|SUM|AVG|:/g) || []
  // Simple replacement: resolve cell refs + arithmetic
  let resolved = expr
  resolved = resolved.replace(/([A-Z]+)(\d+)/g, (_, col, row) => {
    const c = col.charCodeAt(0) - 65
    const r = parseInt(row) - 1
    return String(getCell(c, r))
  })
  resolved = resolved.replace(/SUM\(([^)]+)\)/g, (_, range) => sumRange(range, getCell))
  resolved = resolved.replace(/AVG\(([^)]+)\)/g, (_, range) => avgRange(range, getCell))
  try {
    const val = Function('"use strict"; return (' + resolved + ')')()
    return isNaN(val) ? '#ERR' : val
  } catch { return '#ERR' }
}

function sumRange(range, getCell) {
  const [from, to] = range.split(':')
  if (!to) return parseRange(from, getCell).reduce((a, b) => a + b, 0)
  const f = parseCell(from), t = parseCell(to)
  let sum = 0
  for (let r = f.row; r <= t.row; r++)
    for (let c = f.col; c <= t.col; c++)
      sum += getCell(c, r)
  return sum
}

function avgRange(range, getCell) {
  const vals = parseRange(range, getCell)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}

function parseRange(ref, getCell) {
  const m = ref.match(/^([A-Z]+)(\d+)$/)
  if (!m) return [0]
  const c = m[1].charCodeAt(0) - 65, r = parseInt(m[2]) - 1
  return [getCell(c, r)]
}

function parseCell(ref) {
  const m = ref.match(/^([A-Z]+)(\d+)$/)
  if (!m) return { col: 0, row: 0 }
  return { col: m[1].charCodeAt(0) - 65, row: parseInt(m[2]) - 1 }
}

// ── Store — single source of truth ─────────────────────────

export const spreadsheetStore = store({
  name: 'vibe-spreadsheet',
  state: {
    columns: [
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'qty', label: 'Qty', type: 'number' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'total', label: 'Total', type: 'formula' },
    ],
    rows: [
      { name: 'Widget A', qty: '10', price: '25', total: '=B1*C1' },
      { name: 'Widget B', qty: '5', price: '40', total: '=B2*C2' },
      { name: 'Widget C', qty: '20', price: '15', total: '=B3*C3' },
    ],
    selectedCell: null,     // { row, col }
    editingCell: null,      // { row, col } | null
    editValue: '',
    sortCol: -1,
    sortDir: 1,
  },

  update: {
    // Cell selection
    selectCell: (s, row, col) => ({
      ...s, selectedCell: { row, col }, editingCell: null, editValue: '',
    }),
    // Start editing
    startEdit: (s) => {
      if (!s.selectedCell) return s
      const { row, col } = s.selectedCell
      const key = s.columns[col]?.key
      const val = key ? (s.rows[row]?.[key] ?? '') : ''
      return { ...s, editingCell: { row, col }, editValue: String(val) }
    },
    // Commit edit
    commitEdit: (s) => {
      if (!s.editingCell || !s.editValue.trim()) return { ...s, editingCell: null, editValue: '' }
      const { row, col } = s.editingCell
      const key = s.columns[col]?.key
      if (!key) return { ...s, editingCell: null, editValue: '' }
      const rows = s.rows.map((r, i) => i === row ? { ...r, [key]: s.editValue } : r)
      return { ...s, rows, editingCell: null, editValue: '' }
    },
    cancelEdit: (s) => ({ ...s, editingCell: null, editValue: '' }),
    setEditValue: (s, val) => ({ ...s, editValue: val }),
    // Toolbar actions
    addRow: (s) => {
      const newRow = {}; s.columns.forEach(c => newRow[c.key] = '')
      return { ...s, rows: [...s.rows, newRow] }
    },
    deleteRow: (s) => {
      if (s.rows.length <= 1) return s
      return { ...s, rows: s.rows.slice(0, -1) }
    },
    addColumn: (s) => {
      const key = 'col_' + (s.columns.length + 1)
      const label = indexToCol(s.columns.length)
      return {
        ...s,
        columns: [...s.columns, { key, label, type: 'string' }],
        rows: s.rows.map(r => ({ ...r, [key]: '' })),
      }
    },
    deleteColumn: (s) => {
      if (s.columns.length <= 1) return s
      const last = s.columns[s.columns.length - 1]
      return {
        ...s,
        columns: s.columns.slice(0, -1),
        rows: s.rows.map(r => { const c = { ...r }; delete c[last.key]; return c }),
      }
    },
    // Sort
    sortByCol: (s, colIdx) => {
      const dir = s.sortCol === colIdx ? -s.sortDir : 1
      const key = s.columns[colIdx]?.key
      if (!key) return s
      const rows = [...s.rows].sort((a, b) => {
        const va = a[key] ?? '', vb = b[key] ?? ''
        const na = Number(va), nb = Number(vb)
        return dir * (isNaN(na) || isNaN(nb) ? String(va).localeCompare(String(vb)) : na - nb)
      })
      return { ...s, rows, sortCol: colIdx, sortDir: dir }
    },
  },
})

// Helper: get display value for a cell
function cellDisplay(columns, rows, ci, ri) {
  const col = columns[ci]
  if (!col || ri >= rows.length) return ''
  const raw = rows[ri]?.[col.key] ?? ''
  if (raw === '') return ''
  if (col.type !== 'formula') return String(raw)
  if (!String(raw).startsWith('=')) return String(raw)
  const getter = (cIdx, rIdx) => {
    const c = columns[cIdx]
    if (!c || rIdx >= rows.length) return 0
    const v = rows[rIdx]?.[c.key]
    if (v == null || v === '') return 0
    const n = Number(v)
    return isNaN(n) ? 0 : n
  }
  const result = evalFormula(String(raw).slice(1), getter)
  return String(result)
}

// ── Top-level Spreadsheet Component ────────────────────────

export const VibeSpreadsheet = component('VibeSpreadsheet', {
  state: { _ready: false },

  update: {
    _refresh: (s) => ({ ...s, _ready: true }),
  },

  view(state) {
    const s = spreadsheetStore.select()
    const { columns, rows, selectedCell, editingCell, editValue, sortCol, sortDir } = s

    // Current cell reference
    const selRef = selectedCell ? indexToCol(selectedCell.col) + (selectedCell.row + 1) : ''
    const selVal = selectedCell
      ? String(rows[selectedCell.row]?.[columns[selectedCell.col]?.key] ?? '')
      : ''

    // Escape helper
    const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')

    return `
    <div class="vibe-spreadsheet" style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;font-size:13px;color:#1a1a1a;background:#fff;border:1px solid #dadce0;border-radius:8px;overflow:hidden;">
      <!-- Toolbar -->
      <div style="display:flex;gap:4px;padding:6px 8px;border-bottom:1px solid #dadce0;background:#f8f9fa;align-items:center;">
        <button data-up-event="click:addRow" style="padding:4px 12px;font-size:12px;border:1px solid #dadce0;border-radius:4px;background:#fff;cursor:pointer;">+ Row</button>
        <button data-up-event="click:deleteRow" style="padding:4px 12px;font-size:12px;border:1px solid #dadce0;border-radius:4px;background:#fff;cursor:pointer;">- Row</button>
        <button data-up-event="click:addColumn" style="padding:4px 12px;font-size:12px;border:1px solid #dadce0;border-radius:4px;background:#fff;cursor:pointer;">+ Col</button>
        <button data-up-event="click:deleteColumn" style="padding:4px 12px;font-size:12px;border:1px solid #dadce0;border-radius:4px;background:#fff;cursor:pointer;">- Col</button>
        <span style="font-size:11px;color:#999;margin-left:8px;">${rows.length} x ${columns.length}</span>
      </div>

      <!-- Formula bar -->
      <div style="display:flex;align-items:center;gap:6px;padding:4px 8px;border-bottom:1px solid #dadce0;background:#fff;">
        <span style="font-size:11px;font-weight:600;color:#666;min-width:32px;text-align:center;">${selRef}</span>
        <span style="flex:1;font-size:13px;padding:2px 4px;min-height:22px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(editingCell ? editValue : selVal)}</span>
      </div>

      <!-- Grid -->
      <div style="overflow:auto;max-height:360px;">
        <table style="width:100%;border-collapse:collapse;table-layout:auto;">
          <thead><tr>
            <th style="width:44px;min-width:44px;padding:5px 6px;text-align:center;font-size:11px;font-weight:600;color:#666;background:#f8f9fa;border-right:1px solid #dadce0;border-bottom:1px solid #c0c0c0;position:sticky;top:0;z-index:3;"></th>
            ${columns.map((col, ci) => {
              const sIcon = sortCol === ci ? (sortDir === 1 ? ' \u25B2' : ' \u25BC') : ''
              return `<th data-up-event="click:sortByCol,${ci}" style="padding:5px 8px;text-align:left;font-size:11px;font-weight:600;color:#333;background:#f8f9fa;border-right:1px solid #dadce0;border-bottom:1px solid #c0c0c0;cursor:pointer;user-select:none;position:sticky;top:0;z-index:2;min-width:90px;">${esc(col.label)}<span style="font-size:9px;color:#aaa;">${sIcon}</span></th>`
            }).join('')}
          </tr></thead>
          <tbody>
            ${rows.map((row, ri) => `<tr>
              <td style="padding:4px 6px;text-align:center;font-size:11px;color:#999;background:#f8f9fa;border-right:1px solid #dadce0;border-bottom:1px solid #e8eaed;">${ri + 1}</td>
              ${columns.map((col, ci) => {
                const isSel = selectedCell && selectedCell.row === ri && selectedCell.col === ci
                const isEdit = editingCell && editingCell.row === ri && editingCell.col === ci
                const display = cellDisplay(columns, rows, ci, ri)
                const stripe = ri % 2 ? 'background:#fafafa;' : ''

                if (isEdit) {
                  return `<td style="padding:0;border-right:1px solid #e8eaed;border-bottom:1px solid #e8eaed;outline:2px solid #1a73e8;outline-offset:-1px;background:#e8f0fe;min-width:90px;">
                    <input data-up-prop="editValue:value" value="${esc(editValue)}"
                      data-up-event="keydown:commitOnEnter"
                      style="width:100%;border:none;outline:none;padding:4px 8px;font-size:13px;font-family:inherit;background:transparent;color:#1a1a1a;box-sizing:border-box;" />
                  </td>`
                }

                return `<td data-row="${ri}" data-col="${ci}"
                  style="padding:4px 8px;font-size:13px;cursor:cell;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;border-right:1px solid #e8eaed;border-bottom:1px solid #e8eaed;${isSel ? 'outline:2px solid #1a73e8;outline-offset:-1px;background:#e8f0fe;z-index:1;position:relative;' : ''}${stripe}">${esc(display)}</td>`
              }).join('')}
            </tr>`).join('')}
            ${rows.length === 0 ? `<tr><td colspan="${columns.length + 1}" style="padding:40px;text-align:center;color:#999;font-size:13px;">Click + Row to add data</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    </div>`
  },

  mount(el, ctx) {
    // Re-render on store change
    const unsub = spreadsheetStore.subscribe(() => ctx.send('_refresh'))

    // Click: select cell
    el.addEventListener('click', (e) => {
      const td = e.target.closest('[data-row][data-col]')
      if (td) {
        const row = parseInt(td.dataset.row), col = parseInt(td.dataset.col)
        spreadsheetStore.send('selectCell', row, col)
      }
    })

    // Double-click: start editing
    el.addEventListener('dblclick', (e) => {
      const td = e.target.closest('[data-row][data-col]')
      if (td) spreadsheetStore.send('startEdit')
    })

    // Keyboard handlers
    el.addEventListener('keydown', (e) => {
      const s = spreadsheetStore.select()
      if (e.key === 'Enter' && s.editingCell) {
        e.preventDefault()
        spreadsheetStore.send('commitEdit')
        const nextRow = Math.min(s.editingCell.row + 1, s.rows.length - 1)
        spreadsheetStore.send('selectCell', nextRow, s.editingCell.col)
      } else if (e.key === 'Escape' && s.editingCell) {
        spreadsheetStore.send('cancelEdit')
      } else if (e.key === 'Tab' && s.editingCell) {
        e.preventDefault()
        spreadsheetStore.send('commitEdit')
        const nextCol = s.editingCell.col + (e.shiftKey ? -1 : 1)
        if (nextCol >= 0 && nextCol < s.columns.length) {
          spreadsheetStore.send('selectCell', s.editingCell.row, nextCol)
          setTimeout(() => spreadsheetStore.send('startEdit'), 20)
        }
      }
    })

    return () => unsub()
  },
})

export default VibeSpreadsheet
