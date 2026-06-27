// ─── @uploop-vibe/vibe Theme System ──────────────────────────
// Builds on @uploop/css theme() with vibe-specific defaults.
// Generates CSS custom properties from vibe design tokens.

import { theme as baseTheme, extendTheme, applyTheme } from '@uploop/css'
import {
  colors, spacing, fontSize, fontWeight, lineHeight,
  letterSpacing, radius, shadow, zIndex, duration, easing
} from './tokens.js'

/** Surface tokens per color scheme mode. */
const surfaceTokens = {
  light: {
    bg:       colors.white,
    fg:       colors.neutral900,
    surface:  colors.neutral50,
    surface2: colors.neutral100,
    border:   colors.neutral200,
    muted:    colors.neutral500,
    mutedFg:  colors.neutral400,
  },
  dark: {
    bg:       '#0f1117',
    fg:       '#e4e5e7',
    surface:  '#1a1b23',
    surface2: '#23242d',
    border:   '#2e3039',
    muted:    '#6b6e7b',
    mutedFg:  '#4a4d59',
  },
}

/**
 * Create a Vibe theme from optional overrides.
 *
 * @param {Object} [config]
 * @param {'light'|'dark'} [config.mode='light']
 * @param {Object} [config.colors]
 * @param {Object} [config.spacing]
 * @param {Object} [config.fontSize]
 * @param {Object} [config.radius]
 * @returns {Object} theme object with cssVars
 */
export function vibeTheme(config = {}) {
  const mode = config.mode || 'light'
  const s = surfaceTokens[mode]

  const t = baseTheme({
    name: config.name || 'vibe',
    mode,
    colors: { ...colors, ...config.colors },
    spacing: { ...spacing, ...config.spacing },
    fontSize: { ...fontSize, ...config.fontSize },
    surface: { ...s, ...config.surface },
  })

  // Inject vibe-specific CSS vars: typography, radius, shadows, motion
  const vibeVars = {
    // Typography
    '--vibe-font-sans': `'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif`,
    '--vibe-font-mono': `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`,
    '--vibe-font-weight-thin': String(fontWeight.thin),
    '--vibe-font-weight-light': String(fontWeight.light),
    '--vibe-font-weight-normal': String(fontWeight.normal),
    '--vibe-font-weight-medium': String(fontWeight.medium),
    '--vibe-font-weight-semibold': String(fontWeight.semibold),
    '--vibe-font-weight-bold': String(fontWeight.bold),
    '--vibe-font-weight-extrabold': String(fontWeight.extrabold),
    '--vibe-line-height-none': String(lineHeight.none),
    '--vibe-line-height-tight': String(lineHeight.tight),
    '--vibe-line-height-snug': String(lineHeight.snug),
    '--vibe-line-height-normal': String(lineHeight.normal),
    '--vibe-line-height-relaxed': String(lineHeight.relaxed),
    '--vibe-line-height-loose': String(lineHeight.loose),
    '--vibe-letter-spacing-tighter': letterSpacing.tighter,
    '--vibe-letter-spacing-tight': letterSpacing.tight,
    '--vibe-letter-spacing-normal': letterSpacing.normal,
    '--vibe-letter-spacing-wide': letterSpacing.wide,
    '--vibe-letter-spacing-wider': letterSpacing.wider,
    '--vibe-letter-spacing-widest': letterSpacing.widest,

    // Radius
    '--vibe-radius-none': radius.none,
    '--vibe-radius-xs': radius.xs,
    '--vibe-radius-sm': radius.sm,
    '--vibe-radius-md': radius.md,
    '--vibe-radius-lg': radius.lg,
    '--vibe-radius-xl': radius.xl,
    '--vibe-radius-xl2': radius.xl2,
    '--vibe-radius-xl3': radius.xl3,
    '--vibe-radius-full': radius.full,

    // Shadows
    '--vibe-shadow-none': shadow.none,
    '--vibe-shadow-xs': shadow.xs,
    '--vibe-shadow-sm': shadow.sm,
    '--vibe-shadow-md': shadow.md,
    '--vibe-shadow-lg': shadow.lg,
    '--vibe-shadow-xl': shadow.xl,
    '--vibe-shadow-xl2': shadow.xl2,
    '--vibe-shadow-inner': shadow.inner,

    // Z-Index
    '--vibe-z-hide': String(zIndex.hide),
    '--vibe-z-base': String(zIndex.base),
    '--vibe-z-docked': String(zIndex.docked),
    '--vibe-z-dropdown': String(zIndex.dropdown),
    '--vibe-z-sticky': String(zIndex.sticky),
    '--vibe-z-overlay': String(zIndex.overlay),
    '--vibe-z-modal': String(zIndex.modal),
    '--vibe-z-popover': String(zIndex.popover),
    '--vibe-z-toast': String(zIndex.toast),
    '--vibe-z-tooltip': String(zIndex.tooltip),

    // Motion
    '--vibe-duration-instant': duration.instant,
    '--vibe-duration-faster': duration.faster,
    '--vibe-duration-fast': duration.fast,
    '--vibe-duration-normal': duration.normal,
    '--vibe-duration-slow': duration.slow,
    '--vibe-duration-slower': duration.slower,
    '--vibe-easing-linear': easing.linear,
    '--vibe-easing-in': easing.in,
    '--vibe-easing-out': easing.out,
    '--vibe-easing-in-out': easing.inOut,
    '--vibe-easing-spring': easing.spring,
    '--vibe-easing-bounce': easing.bounce,
  }

  t.vibeVars = vibeVars
  t.cssVars = { ...t.cssVars, ...vibeVars }
  t.cssVarsString = cssVarsToString(t.cssVars)
  return t
}

/**
 * Extend an existing vibe theme.
 */
export function extendVibeTheme(base, overrides = {}) {
  return vibeTheme({
    name: overrides.name || base.name + '-extended',
    mode: overrides.mode || base.mode,
    colors: { ...base.colors, ...overrides.colors },
    spacing: { ...base.spacing, ...overrides.spacing },
    fontSize: { ...base.fontSize, ...overrides.fontSize },
    radius: { ...base.radius, ...overrides.radius },
    surface: { ...base.surface, ...overrides.surface },
  })
}

/**
 * Apply a vibe theme to the DOM.
 * @param {Object} t - theme from vibeTheme()
 * @param {HTMLElement} [root]
 */
export function applyVibeTheme(t, root) {
  applyTheme(t, root)
  // Also set the vibe-specific vars
  if (typeof document === 'undefined') return
  const el = root || document.documentElement
  el.setAttribute('data-vibe-theme', t.name)
  for (const [prop, value] of Object.entries(t.vibeVars || {})) {
    el.style.setProperty(prop, value)
  }
}

// ─── CSS Variable String Builder ────────────────────────────

function cssVarsToString(vars) {
  return Object.entries(vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ')
}

// ─── Pre-built Themes ───────────────────────────────────────

/** Default light theme. */
export const vibeLight = vibeTheme({ name: 'vibe-light', mode: 'light' })

/** Default dark theme. */
export const vibeDark = vibeTheme({ name: 'vibe-dark', mode: 'dark' })

// Re-export for convenience
export { extendTheme } from '@uploop/css'
