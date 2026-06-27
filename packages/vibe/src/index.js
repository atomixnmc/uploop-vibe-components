// ─── @uploop-vibe/vibe — Public API ──────────────────────────
// AI-first design components and design framework for Uploop.

// ── Design System ────────────────────────────────────────────

export {
  // Tokens
  colors, spacing, fontSize, fontWeight, lineHeight,
  letterSpacing, radius, shadow, breakpoints, zIndex,
  duration, easing,
  // Theme
  vibeTheme, extendVibeTheme, applyVibeTheme,
  vibeLight, vibeDark, extendTheme,
  // Motion
  motionPresets, motionClassToPreset,
  resolveMotionIntent, injectVibeAnimations,
  injectAnimations, ANIMATIONS,
  // Scales
  sizeScale, variantScale, radiusScale, shadowScale,
  resolveSize, resolveVariant,
} from './design/index.js'

// ── Components ───────────────────────────────────────────────

export {
  Button,
  Card, CardHeader, CardBody, CardFooter,
  Input, Textarea, Select, Checkbox,
  Badge, Avatar,
  Toast, Modal, Dialog, Tooltip,
  Tabs,
  Skeleton, Progress, Icon,
  Dropdown, Nav, Table,
  componentRegistry,
  getComponent,
  listComponents,
} from './components/index.js'

// ── Layout ───────────────────────────────────────────────────

export {
  Container, Grid, Stack, Flex, Spacer, Divider,
  pageLayouts, createPage,
} from './layout/index.js'
