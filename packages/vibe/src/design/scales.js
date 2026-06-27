// ─── @uploop-vibe/vibe Design Scales ─────────────────────────
// Semantic sizing scales for AI-driven layout: "size: md", "gap: lg"

/**
 * Component size scale — maps intent to dimensions.
 * Intent: { size: 'sm'|'md'|'lg'|'xl' }
 */
export const sizeScale = {
  xs: { h: '1.5rem', px: '0.5rem', text: 'xs', icon: '0.75rem' },
  sm: { h: '2rem',   px: '0.75rem', text: 'sm', icon: '0.875rem' },
  md: { h: '2.5rem', px: '1rem', text: 'base', icon: '1rem' },
  lg: { h: '3rem',   px: '1.25rem', text: 'lg', icon: '1.25rem' },
  xl: { h: '3.5rem', px: '1.5rem', text: 'xl', icon: '1.5rem' },
}

/** Variant scale — maps intent to visual style. */
export const variantScale = {
  solid:    { bg: 'primary600', fg: 'white', border: 'primary600', hover: 'primary700' },
  outline:  { bg: 'transparent', fg: 'primary600', border: 'primary400', hover: 'primary50' },
  ghost:    { bg: 'transparent', fg: 'primary600', border: 'transparent', hover: 'primary50' },
  subtle:   { bg: 'primary50', fg: 'primary700', border: 'transparent', hover: 'primary100' },
  danger:   { bg: 'error', fg: 'white', border: 'error', hover: '#e03131' },
  success:  { bg: 'success', fg: 'white', border: 'success', hover: '#2f9e44' },
  warning:  { bg: 'warning', fg: 'neutral900', border: 'warning', hover: '#f08c00' },
  neutral:  { bg: 'neutral100', fg: 'neutral800', border: 'neutral300', hover: 'neutral200' },
}

/** Radius intent scale. */
export const radiusScale = {
  none: 'var(--vibe-radius-none)',
  xs:   'var(--vibe-radius-xs)',
  sm:   'var(--vibe-radius-sm)',
  md:   'var(--vibe-radius-md)',
  lg:   'var(--vibe-radius-lg)',
  xl:   'var(--vibe-radius-xl)',
  full: 'var(--vibe-radius-full)',
}

/** Shadow intent scale. */
export const shadowScale = {
  none:  'var(--vibe-shadow-none)',
  xs:    'var(--vibe-shadow-xs)',
  sm:    'var(--vibe-shadow-sm)',
  md:    'var(--vibe-shadow-md)',
  lg:    'var(--vibe-shadow-lg)',
  xl:    'var(--vibe-shadow-xl)',
  xl2:   'var(--vibe-shadow-xl2)',
}

/**
 * Resolve a size intent to computed CSS values.
 *
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size
 * @returns {{ h: string, px: string, text: string, icon: string }}
 */
export function resolveSize(size = 'md') {
  return sizeScale[size] || sizeScale.md
}

/**
 * Resolve a variant intent to color tokens.
 *
 * @param {'solid'|'outline'|'ghost'|'subtle'|'danger'|'success'|'warning'|'neutral'} variant
 * @returns {{ bg: string, fg: string, border: string, hover: string }}
 */
export function resolveVariant(variant = 'solid') {
  return variantScale[variant] || variantScale.solid
}
