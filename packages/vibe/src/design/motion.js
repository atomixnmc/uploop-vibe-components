// ─── @uploop-vibe/vibe Motion Presets ────────────────────────
// Ready-to-use animation and transition presets built on CSS variables.
// Designed for AI intent: "animate slide-in from right"

import { injectAnimations } from '@uploop/css'

// ── Keyframe Definitions ─────────────────────────────────────

const KEYFRAMES = {
  'vibe-fade-in': {
    from: { opacity: '0' },
    to:   { opacity: '1' },
  },
  'vibe-fade-out': {
    from: { opacity: '1' },
    to:   { opacity: '0' },
  },
  'vibe-slide-in-up': {
    from: { opacity: '0', transform: 'translateY(16px)' },
    to:   { opacity: '1', transform: 'translateY(0)' },
  },
  'vibe-slide-in-down': {
    from: { opacity: '0', transform: 'translateY(-16px)' },
    to:   { opacity: '1', transform: 'translateY(0)' },
  },
  'vibe-slide-in-left': {
    from: { opacity: '0', transform: 'translateX(-16px)' },
    to:   { opacity: '1', transform: 'translateX(0)' },
  },
  'vibe-slide-in-right': {
    from: { opacity: '0', transform: 'translateX(16px)' },
    to:   { opacity: '1', transform: 'translateX(0)' },
  },
  'vibe-scale-in': {
    from: { opacity: '0', transform: 'scale(0.95)' },
    to:   { opacity: '1', transform: 'scale(1)' },
  },
  'vibe-scale-out': {
    from: { opacity: '1', transform: 'scale(1)' },
    to:   { opacity: '0', transform: 'scale(0.95)' },
  },
  'vibe-spin': {
    from: { transform: 'rotate(0deg)' },
    to:   { transform: 'rotate(360deg)' },
  },
  'vibe-pulse': {
    '0%, 100%': { opacity: '1' },
    '50%':      { opacity: '0.5' },
  },
  'vibe-shimmer': {
    '0%':   { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
}

// ── Utility Class Presets ────────────────────────────────────

/**
 * Motion preset definitions — map an intent name to a CSS class.
 *
 * AI can use intent("animate: fade-in") and we map to `.vibe-animate-fade-in`.
 */
export const motionPresets = {
  'fade-in':            '.vibe-animate-fade-in',
  'fade-out':           '.vibe-animate-fade-out',
  'slide-in-up':        '.vibe-animate-slide-in-up',
  'slide-in-down':      '.vibe-animate-slide-in-down',
  'slide-in-left':      '.vibe-animate-slide-in-left',
  'slide-in-right':     '.vibe-animate-slide-in-right',
  'scale-in':           '.vibe-animate-scale-in',
  'scale-out':          '.vibe-animate-scale-out',
  'spin':               '.vibe-animate-spin',
  'pulse':              '.vibe-animate-pulse',
  'shimmer':            '.vibe-animate-shimmer',
}

/** Inverse map: CSS class → preset name */
export const motionClassToPreset = Object.fromEntries(
  Object.entries(motionPresets).map(([k, v]) => [v.replace('.', ''), k])
)

/**
 * Resolve an animation intent string to CSS classes.
 *
 * @param {string} intent - e.g. "fade-in", "slide-in-right", "scale-in"
 * @returns {{ class: string, preset: string } | null}
 */
export function resolveMotionIntent(intent) {
  const preset = motionPresets[intent]
  if (!preset) return null
  return { class: preset.replace('.', ''), preset: intent }
}

/**
 * Inject all Vibe animation keyframes + utility classes into the document.
 * Call once at app startup.
 *
 * @param {Document} [doc]
 */
export function injectVibeAnimations(doc) {
  if (typeof document === 'undefined') return

  // Inject keyframes
  injectAnimations(KEYFRAMES, 'vibe', doc)

  // Inject animation utility classes
  const d = doc || document
  if (d.getElementById('vibe-motion-styles')) return // already injected

  let css = ''
  for (const [name, preset] of Object.entries(motionPresets)) {
    const cls = preset.replace('.', '')
    css += `.${cls} {\n`
    css += `  animation-name: vibe-${name};\n`
    css += `  animation-duration: var(--vibe-duration-normal);\n`
    css += `  animation-timing-function: var(--vibe-easing-out);\n`
    css += `  animation-fill-mode: both;\n`
    css += `}\n`
  }

  // Duration modifiers
  const speeds = { faster: '--vibe-duration-faster', fast: '--vibe-duration-fast', normal: '--vibe-duration-normal', slow: '--vibe-duration-slow', slower: '--vibe-duration-slower' }
  for (const [speed, durationVar] of Object.entries(speeds)) {
    css += `.vibe-duration-${speed} {\n  animation-duration: var(${durationVar});\n}\n`
  }

  // Delay modifiers
  css += `.vibe-delay-100 { animation-delay: 100ms; }\n`
  css += `.vibe-delay-200 { animation-delay: 200ms; }\n`
  css += `.vibe-delay-300 { animation-delay: 300ms; }\n`
  css += `.vibe-delay-500 { animation-delay: 500ms; }\n`

  // Stagger children
  css += `.vibe-stagger > * {\n  opacity: 0;\n  animation: vibe-fade-in var(--vibe-duration-normal) var(--vibe-easing-out) both;\n}\n`
  for (let i = 1; i <= 10; i++) {
    css += `.vibe-stagger > *:nth-child(${i}) { animation-delay: ${i * 50}ms; }\n`
  }

  const style = d.createElement('style')
  style.id = 'vibe-motion-styles'
  style.textContent = css
  d.head.appendChild(style)
}

// Re-export animation injection from @uploop/css
export { injectAnimations, ANIMATIONS } from '@uploop/css'
