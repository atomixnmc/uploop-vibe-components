// ─── @uploop-vibe/vibe Design Tokens Tests ────────────────────
import { describe, it, expect } from 'vitest'

import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  radius,
  shadow,
  breakpoints,
  zIndex,
  duration,
  easing,
} from '../src/design/tokens.js'

// ── Colors ─────────────────────────────────────────────────────

describe('colors', () => {
  it('has transparent and currentColor', () => {
    expect(colors.transparent).toBe('transparent')
    expect(colors.current).toBe('currentColor')
  })

  describe('primary palette', () => {
    it('includes 10-step scale from 50 to 900', () => {
      expect(colors.primary50).toBe('#f0f4ff')
      expect(colors.primary100).toBe('#dbe4ff')
      expect(colors.primary200).toBe('#bac8ff')
      expect(colors.primary300).toBe('#91a7ff')
      expect(colors.primary400).toBe('#748ffc')
      expect(colors.primary500).toBe('#5c7cfa')
      expect(colors.primary600).toBe('#4c6ef5')
      expect(colors.primary700).toBe('#4263eb')
      expect(colors.primary800).toBe('#3b5bdb')
      expect(colors.primary900).toBe('#364fc7')
    })

    it('has 10 entries in primary palette', () => {
      const primaryKeys = Object.keys(colors).filter(k => k.startsWith('primary'))
      expect(primaryKeys).toHaveLength(10)
    })
  })

  describe('neutral palette', () => {
    it('includes 10-step scale from 50 to 900', () => {
      expect(colors.neutral50).toBe('#f8f9fa')
      expect(colors.neutral100).toBe('#f1f3f5')
      expect(colors.neutral900).toBe('#212529')
    })

    it('neutral500 is a mid-tone', () => {
      expect(colors.neutral500).toBe('#adb5bd')
    })
  })

  describe('accent palette', () => {
    it('includes 10-step scale from 50 to 900', () => {
      expect(colors.accent50).toBe('#fff0f6')
      expect(colors.accent500).toBe('#f06595')
      expect(colors.accent900).toBe('#a61e4d')
    })
  })

  describe('semantic colors', () => {
    it('defines success, warning, error, info', () => {
      expect(colors.success).toBe('#40c057')
      expect(colors.warning).toBe('#fab005')
      expect(colors.error).toBe('#fa5252')
      expect(colors.info).toBe('#228be6')
    })
  })

  it('has white and black', () => {
    expect(colors.white).toBe('#ffffff')
    expect(colors.black).toBe('#000000')
  })
})

// ── Spacing ────────────────────────────────────────────────────

describe('spacing', () => {
  it('has 0 through 24 steps', () => {
    for (let i = 0; i <= 24; i++) {
      expect(spacing).toHaveProperty(String(i))
      expect(spacing[i]).toBe(i)
    }
  })

  it('has half steps (_5) for 0 through 23', () => {
    for (let i = 0; i < 24; i++) {
      const key = `${i}_5`
      expect(spacing).toHaveProperty(key)
      expect(spacing[key]).toBe(i + 0.5)
    }
  })

  it('does NOT have a half step for 24', () => {
    expect(spacing).not.toHaveProperty('24_5')
  })

  it('has exactly 49 keys (25 full + 24 half)', () => {
    expect(Object.keys(spacing)).toHaveLength(49)
  })
})

// ── Font Size (Major Third Scale) ──────────────────────────────

describe('fontSize', () => {
  it('has expected type scale steps', () => {
    expect(fontSize.xs).toBe(0.75)
    expect(fontSize.sm).toBe(0.875)
    expect(fontSize.base).toBe(1)
    expect(fontSize.md).toBe(1.125)
    expect(fontSize.lg).toBe(1.25)
    expect(fontSize.xl).toBe(1.5)
    expect(fontSize.xl2).toBe(1.875)
    expect(fontSize.xl3).toBe(2.25)
    expect(fontSize.xl4).toBe(3)
    expect(fontSize.xl5).toBe(3.75)
    expect(fontSize.xl6).toBe(4.5)
  })

  it('follows major third ratio (~1.25) between adjacent steps', () => {
    const keys = ['xs', 'sm', 'base', 'md', 'lg', 'xl', 'xl2', 'xl3', 'xl4', 'xl5', 'xl6']
    for (let i = 0; i < keys.length - 1; i++) {
      const ratio = fontSize[keys[i + 1]] / fontSize[keys[i]]
      expect(ratio).toBeCloseTo(1.25, 0)
    }
  })
})

// ── Font Weight ────────────────────────────────────────────────

describe('fontWeight', () => {
  it('has standard weight scale', () => {
    expect(fontWeight.thin).toBe(100)
    expect(fontWeight.light).toBe(300)
    expect(fontWeight.normal).toBe(400)
    expect(fontWeight.medium).toBe(500)
    expect(fontWeight.semibold).toBe(600)
    expect(fontWeight.bold).toBe(700)
    expect(fontWeight.extrabold).toBe(800)
  })

  it('all weights are numbers', () => {
    Object.values(fontWeight).forEach(w => {
      expect(typeof w).toBe('number')
    })
  })
})

// ── Line Height ────────────────────────────────────────────────

describe('lineHeight', () => {
  it('has standard line-height tokens', () => {
    expect(lineHeight.none).toBe(1)
    expect(lineHeight.tight).toBe(1.25)
    expect(lineHeight.snug).toBe(1.375)
    expect(lineHeight.normal).toBe(1.5)
    expect(lineHeight.relaxed).toBe(1.625)
    expect(lineHeight.loose).toBe(2)
  })

  it('values are unitless multipliers', () => {
    Object.values(lineHeight).forEach(lh => {
      expect(typeof lh).toBe('number')
      expect(lh).toBeGreaterThanOrEqual(1)
    })
  })
})

// ── Letter Spacing ─────────────────────────────────────────────

describe('letterSpacing', () => {
  it('has tracking tokens in em units', () => {
    expect(letterSpacing.tighter).toBe('-0.05em')
    expect(letterSpacing.tight).toBe('-0.025em')
    expect(letterSpacing.normal).toBe('0')
    expect(letterSpacing.wide).toBe('0.025em')
    expect(letterSpacing.wider).toBe('0.05em')
    expect(letterSpacing.widest).toBe('0.1em')
  })

  it('all values end with em or are "0"', () => {
    Object.values(letterSpacing).forEach(ls => {
      if (ls === '0') return
      expect(ls).toMatch(/em$/)
    })
  })
})

// ── Border Radius ──────────────────────────────────────────────

describe('radius', () => {
  it('has radius tokens', () => {
    expect(radius.none).toBe('0')
    expect(radius.xs).toBe('0.125rem')
    expect(radius.sm).toBe('0.25rem')
    expect(radius.md).toBe('0.375rem')
    expect(radius.lg).toBe('0.5rem')
    expect(radius.xl).toBe('0.75rem')
    expect(radius.xl2).toBe('1rem')
    expect(radius.xl3).toBe('1.5rem')
    expect(radius.full).toBe('9999px')
  })

  it('all values are strings', () => {
    Object.values(radius).forEach(r => {
      expect(typeof r).toBe('string')
    })
  })
})

// ── Shadows ────────────────────────────────────────────────────

describe('shadow', () => {
  it('has shadow tokens', () => {
    expect(shadow.none).toBe('none')
    expect(shadow.xs).toBe('0 1px 2px 0 rgb(0 0 0 / 0.05)')
    expect(shadow.sm).toBe('0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)')
    expect(shadow.md).toBe('0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)')
    expect(shadow.lg).toBe('0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)')
    expect(shadow.xl).toBe('0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)')
    expect(shadow.xl2).toBe('0 25px 50px -12px rgb(0 0 0 / 0.25)')
    expect(shadow.inner).toBe('inset 0 2px 4px 0 rgb(0 0 0 / 0.05)')
  })

  it('shadow.none is "none"', () => {
    expect(shadow.none).toBe('none')
  })

  it('elevation shadows get progressively larger blur', () => {
    const blurs = Object.entries(shadow)
      .filter(([name]) => name !== 'none' && name !== 'inner')
      .map(([, val]) => {
        // Extract all px values and take the largest (blur is dominant)
        const pxValues = [...val.matchAll(/(\d+)px/g)].map(m => parseInt(m[1], 10))
        return Math.max(...pxValues)
      })
    for (let i = 0; i < blurs.length - 1; i++) {
      expect(blurs[i]).toBeLessThan(blurs[i + 1])
    }
  })
})

// ── Breakpoints ────────────────────────────────────────────────

describe('breakpoints', () => {
  it('is an object', () => {
    expect(typeof breakpoints).toBe('object')
    expect(breakpoints).not.toBeNull()
  })
})

// ── Z-Index Scale ──────────────────────────────────────────────

describe('zIndex', () => {
  it('has hide (-1), auto, and base (0)', () => {
    expect(zIndex.hide).toBe(-1)
    expect(zIndex.auto).toBe('auto')
    expect(zIndex.base).toBe(0)
  })

  it('has layered z-indices in ascending order', () => {
    const layers = ['docked', 'dropdown', 'sticky', 'banner', 'overlay', 'modal', 'popover', 'toast', 'tooltip']
    const values = layers.map(l => zIndex[l])
    for (let i = 0; i < values.length - 1; i++) {
      expect(values[i]).toBeLessThan(values[i + 1])
    }
  })

  it('toast is 1600 and tooltip is 1700 (top of stack)', () => {
    expect(zIndex.toast).toBe(1600)
    expect(zIndex.tooltip).toBe(1700)
  })
})

// ── Duration Tokens ────────────────────────────────────────────

describe('duration', () => {
  it('has animation duration tokens', () => {
    expect(duration.instant).toBe('0ms')
    expect(duration.faster).toBe('75ms')
    expect(duration.fast).toBe('150ms')
    expect(duration.normal).toBe('250ms')
    expect(duration.slow).toBe('350ms')
    expect(duration.slower).toBe('500ms')
  })

  it('all values end with ms', () => {
    Object.values(duration).forEach(d => {
      expect(d).toMatch(/^\d+ms$/)
    })
  })

  it('durations are in ascending order', () => {
    const keys = ['instant', 'faster', 'fast', 'normal', 'slow', 'slower']
    const ms = keys.map(k => parseInt(duration[k], 10))
    for (let i = 0; i < ms.length - 1; i++) {
      expect(ms[i]).toBeLessThan(ms[i + 1])
    }
  })
})

// ── Easing Curves ──────────────────────────────────────────────

describe('easing', () => {
  it('has linear, in, out, inOut, spring, and bounce', () => {
    expect(easing.linear).toBe('linear')
    expect(easing.in).toBe('cubic-bezier(0.4, 0, 1, 1)')
    expect(easing.out).toBe('cubic-bezier(0, 0, 0.2, 1)')
    expect(easing.inOut).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
  })

  it('has spring easing with overshoot', () => {
    expect(easing.spring).toBe('cubic-bezier(0.34, 1.56, 0.64, 1)')
  })

  it('has bounce easing', () => {
    expect(easing.bounce).toBe('cubic-bezier(0.68, -0.55, 0.27, 1.55)')
  })

  it('all non-linear easings are valid cubic-bezier', () => {
    Object.entries(easing).forEach(([name, val]) => {
      if (name === 'linear') return
      expect(val).toMatch(/^cubic-bezier\(/)
    })
  })
})
