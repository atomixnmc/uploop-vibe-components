// ─── @uploop-vibe/vibe Design System — Public API ─────────────

// Tokens
export {
  colors, spacing, fontSize, fontWeight, lineHeight,
  letterSpacing, radius, shadow, breakpoints, zIndex,
  duration, easing
} from './tokens.js'

// Theme
export {
  vibeTheme, extendVibeTheme, applyVibeTheme,
  vibeLight, vibeDark, extendTheme
} from './theme.js'

// Motion
export {
  motionPresets, motionClassToPreset,
  resolveMotionIntent, injectVibeAnimations,
  injectAnimations, ANIMATIONS
} from './motion.js'

// Scales
export {
  sizeScale, variantScale, radiusScale, shadowScale,
  resolveSize, resolveVariant
} from './scales.js'
