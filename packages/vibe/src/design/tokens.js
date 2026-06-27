// ─── @uploop-vibe/vibe Design Tokens ─────────────────────────
// Pure data — the atomic design DNA for the Vibe system.
// Extends @uploop/css tokens with AI-first semantic scales.

import { breakpoints as baseBreakpoints } from '@uploop/css'

// ── Color Palette ────────────────────────────────────────────

/** Vibe semantic color palette — warm, accessible, modern. */
export const colors = {
  transparent: 'transparent',
  current: 'currentColor',

  // Primary family
  primary50:  '#f0f4ff',
  primary100: '#dbe4ff',
  primary200: '#bac8ff',
  primary300: '#91a7ff',
  primary400: '#748ffc',
  primary500: '#5c7cfa',
  primary600: '#4c6ef5',
  primary700: '#4263eb',
  primary800: '#3b5bdb',
  primary900: '#364fc7',

  // Neutral family
  neutral50:  '#f8f9fa',
  neutral100: '#f1f3f5',
  neutral200: '#e9ecef',
  neutral300: '#dee2e6',
  neutral400: '#ced4da',
  neutral500: '#adb5bd',
  neutral600: '#868e96',
  neutral700: '#495057',
  neutral800: '#343a40',
  neutral900: '#212529',

  // Semantic
  success:  '#40c057',
  warning:  '#fab005',
  error:    '#fa5252',
  info:     '#228be6',

  // Accent
  accent50:  '#fff0f6',
  accent100: '#ffdeeb',
  accent200: '#fcc2d7',
  accent300: '#faa2c1',
  accent400: '#f783ac',
  accent500: '#f06595',
  accent600: '#e64980',
  accent700: '#d6336c',
  accent800: '#c2255c',
  accent900: '#a61e4d',

  white: '#ffffff',
  black: '#000000',
}

// ── Spacing Scale ────────────────────────────────────────────

/** Vibe spacing — fluid 4px grid, rem-based. */
export const spacing = {}
for (let i = 0; i <= 24; i++) {
  spacing[i] = i
  if (i < 24) spacing[`${i}_5`] = i + 0.5
}

// ── Type Scale ───────────────────────────────────────────────

/** Vibe type scale — major third (1.25) ratio. */
export const fontSize = {
  xs:   0.75,   // 12px
  sm:   0.875,  // 14px
  base: 1,      // 16px
  md:   1.125,  // 18px
  lg:   1.25,   // 20px
  xl:   1.5,    // 24px
  xl2:  1.875,  // 30px
  xl3:  2.25,   // 36px
  xl4:  3,      // 48px
  xl5:  3.75,   // 60px
  xl6:  4.5,    // 72px
}

export const fontWeight = {
  thin:       100,
  light:      300,
  normal:     400,
  medium:     500,
  semibold:   600,
  bold:       700,
  extrabold:  800,
}

export const lineHeight = {
  none:    1,
  tight:   1.25,
  snug:    1.375,
  normal:  1.5,
  relaxed: 1.625,
  loose:   2,
}

export const letterSpacing = {
  tighter: '-0.05em',
  tight:   '-0.025em',
  normal:  '0',
  wide:    '0.025em',
  wider:   '0.05em',
  widest:  '0.1em',
}

// ── Border Radius ────────────────────────────────────────────

export const radius = {
  none:   '0',
  xs:     '0.125rem',
  sm:     '0.25rem',
  md:     '0.375rem',
  lg:     '0.5rem',
  xl:     '0.75rem',
  xl2:    '1rem',
  xl3:    '1.5rem',
  full:   '9999px',
}

// ── Shadows ──────────────────────────────────────────────────

export const shadow = {
  none: 'none',
  xs:   '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm:   '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md:   '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg:   '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl:   '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl2:  '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner:'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
}

// ── Breakpoints ──────────────────────────────────────────────

export const breakpoints = { ...baseBreakpoints }

// ── Z-Index Scale ────────────────────────────────────────────

export const zIndex = {
  hide:    -1,
  auto:    'auto',
  base:    0,
  docked:  10,
  dropdown:1000,
  sticky:  1100,
  banner:  1200,
  overlay: 1300,
  modal:   1400,
  popover: 1500,
  toast:   1600,
  tooltip: 1700,
}

// ── Duration Tokens ──────────────────────────────────────────

export const duration = {
  instant: '0ms',
  faster:  '75ms',
  fast:    '150ms',
  normal:  '250ms',
  slow:    '350ms',
  slower:  '500ms',
}

// ── Easing Curves ────────────────────────────────────────────

export const easing = {
  linear:      'linear',
  in:          'cubic-bezier(0.4, 0, 1, 1)',
  out:         'cubic-bezier(0, 0, 0.2, 1)',
  inOut:       'cubic-bezier(0.4, 0, 0.2, 1)',
  spring:      'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce:      'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
}
