import { describe, it, expect } from 'vitest'
import { auditManifest, quickScore } from '../src/auditor.js'

// ─── Empty Manifest ────────────────────────────────────────────

describe('auditManifest', () => {
  describe('empty manifest', () => {
    it('returns a score around 100 with no issues', () => {
      const result = auditManifest({})

      expect(result.score).toBe(100)
      expect(result.grade).toBe('A')
      expect(result.issues).toEqual([])
      expect(result.suggestions).toEqual([])
    })

    it('returns score 100 for manifest with empty nodes/edges arrays', () => {
      const result = auditManifest({ nodes: [], edges: [] })

      expect(result.score).toBe(100)
    })
  })

  // ─── Async Node Without Loading State ─────────────────────

  describe('async node without loading state', () => {
    it('returns issues when async update nodes exist but no loading state', () => {
      const manifest = {
        nodes: [
          { id: 'fetchUsers', type: 'data', component: 'fetch' },
          { id: 'userTable', type: 'view', component: 'Table' },
          { id: 'loadUsers', type: 'update', component: 'trigger', async: true },
        ],
        edges: [],
      }

      const result = auditManifest(manifest)

      expect(result.issues.length).toBeGreaterThan(0)
      const loadingIssue = result.issues.find(
        (i) => i.warning.code === 'missing_loading_state',
      )
      expect(loadingIssue).toBeDefined()
      expect(loadingIssue.warning.severity).toBe('high')
    })

    it('returns issues when async and no error state exists', () => {
      const manifest = {
        nodes: [
          { id: 'fetchData', type: 'data', component: 'fetch' },
          { id: 'myTable', type: 'view', component: 'Table' },
          { id: 'loadData', type: 'update', component: 'trigger', async: true },
        ],
        edges: [],
      }

      const result = auditManifest(manifest)

      const errorIssue = result.issues.find(
        (i) => i.warning.code === 'missing_error_state',
      )
      expect(errorIssue).toBeDefined()
    })

    it('has no issues when async and both loading+error states exist', () => {
      const manifest = {
        nodes: [
          { id: 'fetchData', type: 'data', component: 'fetch' },
          { id: 'myTable', type: 'view', component: 'Table' },
          { id: 'loadData', type: 'update', component: 'trigger', async: true },
          { id: 'loading', type: 'view', component: 'Skeleton' },
          { id: 'error', type: 'view', component: 'ErrorState' },
        ],
        edges: [],
      }

      const result = auditManifest(manifest)

      // Should have no missing_loading_state or missing_error_state issues
      const asyncIssues = result.issues.filter(
        (i) =>
          i.warning.code === 'missing_loading_state' ||
          i.warning.code === 'missing_error_state',
      )
      expect(asyncIssues.length).toBe(0)
    })
  })

  // ─── quickScore ────────────────────────────────────────────

  describe('quickScore', () => {
    it('returns a number between 0 and 100', () => {
      const score = quickScore({})
      expect(typeof score).toBe('number')
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('returns 100 for empty manifest', () => {
      expect(quickScore({})).toBe(100)
    })

    it('returns lower score for problematic manifest', () => {
      const manifest = {
        nodes: [
          { id: 'fetchData', type: 'data', component: 'fetch' },
          { id: 't1', type: 'view', component: 'Table' },
          { id: 'loadData', type: 'update', component: 'trigger', async: true },
        ],
        edges: [],
      }

      const score = quickScore(manifest)
      expect(score).toBeLessThan(100)
    })
  })

  // ─── Table Without Pagination ──────────────────────────────

  describe('table without pagination', () => {
    it('suggests pagination when a table exists but no Pagination component', () => {
      const manifest = {
        nodes: [
          { id: 'dataTable', type: 'view', component: 'Table', path: 'sections.content' },
        ],
        edges: [],
      }

      const result = auditManifest(manifest)

      const paginationSuggestion = result.suggestions.find(
        (s) => s.warning.code === 'performance_warning' &&
               s.warning.message.includes('pagination'),
      )
      expect(paginationSuggestion).toBeDefined()
    })

    it('does not suggest pagination when Pagination component exists', () => {
      const manifest = {
        nodes: [
          { id: 'dataTable', type: 'view', component: 'Table', path: 'sections.content' },
          { id: 'pager', type: 'view', component: 'Pagination' },
        ],
        edges: [],
      }

      const result = auditManifest(manifest)

      const paginationSuggestion = result.suggestions.find(
        (s) => s.warning.code === 'performance_warning' &&
               s.warning.message.includes('pagination'),
      )
      expect(paginationSuggestion).toBeUndefined()
    })
  })

  // ─── Image Without Alt Text ────────────────────────────────

  describe('image/accessibility checks', () => {
    it('suggests alt text when image has no alt prop', () => {
      const manifest = {
        nodes: [
          { id: 'heroImage', type: 'view', component: 'Image', path: 'sections.hero', props: { src: 'hero.png' } },
        ],
        edges: [],
      }

      const result = auditManifest(manifest)

      const a11ySuggestion = result.suggestions.find(
        (s) => s.warning.code === 'accessibility_gap' &&
               s.warning.message.includes('alt'),
      )
      expect(a11ySuggestion).toBeDefined()
    })

    it('does not suggest alt text when image has alt prop', () => {
      const manifest = {
        nodes: [
          { id: 'heroImage', type: 'view', component: 'Image', path: 'sections.hero', props: { src: 'hero.png', alt: 'Hero banner' } },
        ],
        edges: [],
      }

      const result = auditManifest(manifest)

      const a11ySuggestion = result.suggestions.find(
        (s) => s.warning.code === 'accessibility_gap' &&
               s.warning.message.includes('alt'),
      )
      expect(a11ySuggestion).toBeUndefined()
    })

    it('checks Figure component for alt text too', () => {
      const manifest = {
        nodes: [
          { id: 'diagram', type: 'view', component: 'Figure', path: 'sections.diagram', props: { src: 'diagram.png' } },
        ],
        edges: [],
      }

      const result = auditManifest(manifest)

      const a11ySuggestion = result.suggestions.find(
        (s) => s.warning.code === 'accessibility_gap' &&
               s.warning.message.includes('alt'),
      )
      expect(a11ySuggestion).toBeDefined()
    })
  })

  // ─── Icon Button Without Label ─────────────────────────────

  describe('icon button accessibility', () => {
    it('suggests ariaLabel for icon-only buttons', () => {
      const manifest = {
        nodes: [
          { id: 'iconBtn', type: 'view', component: 'Button', path: 'sections.toolbar', props: { icon: 'trash' } },
        ],
        edges: [],
      }

      const result = auditManifest(manifest)

      const a11ySuggestion = result.suggestions.find(
        (s) => s.warning.code === 'accessibility_gap' &&
               s.warning.message.includes('ariaLabel'),
      )
      expect(a11ySuggestion).toBeDefined()
    })
  })

  // ─── SearchInput Without Debounce ──────────────────────────

  describe('search input performance', () => {
    it('suggests debounce for SearchInput without it', () => {
      const manifest = {
        nodes: [
          { id: 'search', type: 'view', component: 'SearchInput', path: 'sections.search' },
        ],
        edges: [],
      }

      const result = auditManifest(manifest)

      const perfSuggestion = result.suggestions.find(
        (s) => s.warning.code === 'performance_warning' &&
               s.warning.message.includes('debounce'),
      )
      expect(perfSuggestion).toBeDefined()
    })
  })

  // ─── Grade Thresholds ──────────────────────────────────────

  describe('grade thresholds', () => {
    it('returns A for score >= 90', () => {
      expect(auditManifest({}).grade).toBe('A')
    })

    it('returns F for very low scores', () => {
      const manifest = {
        nodes: [
          { id: 'fetch', type: 'data', component: 'fetch' },
          { id: 't1', type: 'view', component: 'Table', path: 's1' },
          { id: 't2', type: 'view', component: 'Table', path: 's2' },
          { id: 't3', type: 'view', component: 'Table', path: 's3' },
          { id: 't4', type: 'view', component: 'Table', path: 's4' },
          { id: 't5', type: 'view', component: 'Table', path: 's5' },
          { id: 'si1', type: 'view', component: 'SearchInput', path: 's6' },
          { id: 'si2', type: 'view', component: 'SearchInput', path: 's7' },
          { id: 'img1', type: 'view', component: 'Image', path: 's8', props: {} },
          { id: 'img2', type: 'view', component: 'Image', path: 's9', props: {} },
          { id: 'btn1', type: 'view', component: 'Button', path: 's10', props: { icon: 'x' } },
          { id: 'btn2', type: 'view', component: 'Button', path: 's11', props: { icon: 'y' } },
          { id: 'dv1', type: 'view', component: 'Sparkline', path: 's12' },
          { id: 'dv2', type: 'view', component: 'Gauge', path: 's13' },
          { id: 'dv3', type: 'view', component: 'Stat', path: 's14' },
          { id: 'update', type: 'update', component: 'trigger', async: true },
        ],
        edges: [],
      }

      const result = auditManifest(manifest)
      expect(result.grade).toBe('F')
    })
  })

  // ─── Display Components Without Data Source ────────────────

  describe('orphan display components', () => {
    it('warns about display components with no data source', () => {
      const manifest = {
        nodes: [
          { id: 'orphanStat', type: 'view', component: 'Stat', path: 'sections.stats' },
        ],
        edges: [],
      }

      const result = auditManifest(manifest)

      const orphanSuggestion = result.suggestions.find(
        (s) => s.warning.code === 'performance_warning' &&
               s.warning.message.includes('no visible data source'),
      )
      expect(orphanSuggestion).toBeDefined()
    })
  })
})
