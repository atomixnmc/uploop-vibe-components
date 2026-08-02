# @uploop-vibe/vibe

**100+ AI-first design components** for the Uploop HyperGraph framework.

Built on [UploopJS](https://github.com/iuploop/uploopjs) — every component is a typed graph node. AI agents can generate, inspect, and transform UIs via deterministic IFS loops.

## Install

```bash
pnpm add @uploop-vibe/vibe
```

## Quick Start

```js
import { Button, Card, Input, applyVibeTheme, vibeLight } from '@uploop-vibe/vibe'

applyVibeTheme(vibeLight)

const btn = Button.create({ label: 'Click Me', variant: 'solid' })
btn.mount(document.getElementById('app'))
```

## Component Categories

| Category | Count | Key Components |
|----------|-------|---------------|
| **Layout** | 12 | Container, Grid, Stack, Flex, Box, Center, AspectRatio, Wrap |
| **Navigation** | 12 | Nav, Dropdown, Tabs, Breadcrumb, Pagination, Stepper, CommandPalette |
| **Data Entry** | 18 | Input, Select, Switch, Slider, PinInput, ColorPicker, Combobox, Rating |
| **Data Display** | 16 | Card, Table, Badge, Avatar, Timeline, TreeView, Accordion, Carousel |
| **Feedback** | 14 | Alert, Toast, Progress, Skeleton, EmptyState, ErrorState, Spotlight |
| **Overlay** | 10 | Modal, Dialog, Drawer, Sheet, Popover, Tooltip, Lightbox |
| **Typography** | 10 | Heading, Text, Code, BlockCode, Kbd, Blockquote, Highlight |
| **Media** | 6 | Icon, Image, Video, Audio, Figure, AvatarGroup |
| **Utility** | 5 | Portal, Transition, FocusTrap, ClickOutside, LazyLoad |
| **DataViz** | 4 | Sparkline, Gauge, StatsCard, TrendIndicator |
| **Button** | 1 | 8 variants × 5 sizes × icon × loading × animation |

## Design System

```js
import {
  colors, spacing, fontSize, shadows, breakpoints, zIndex,
  vibeTheme, vibeLight, vibeDark, extendVibeTheme, applyVibeTheme,
  motionPresets, resolveMotionIntent, injectVibeAnimations,
} from '@uploop-vibe/vibe'
```

- **60+ design tokens** — colors, spacing, typography, shadows, radii, breakpoints
- **Theme engine** — light/dark modes, custom theme extension
- **Motion system** — 20+ animation presets with CSS keyframes
- **Scale resolvers** — size, variant, radius, shadow scales

## Component Pattern

Every component follows the same pattern:

```js
// Create + mount
const btn = Button.create({ label: 'Save', variant: 'solid', size: 'md' })
btn.mount(el)

// Dynamic update via loop
btn.loop.send('setLoading', true)
btn.loop.send('configure', { label: 'Saved!', variant: 'success' })

// Subscribe
btn.loop.subscribe(state => console.log(state))

// Inspect (AI-readable)
const manifest = btn.describe()
// → { type: 'Button', props: {...}, children: [], graph: {...} }
```

## AI Intent Integration

Components expose typed manifests. AI agents consume these via `@uploop-vibe/vibe-ai`:

```js
import { resolveComponentIntent } from '@uploop-vibe/vibe-ai'

const btn = resolveComponentIntent({
  type: 'button',
  props: { label: 'Save', variant: 'solid' },
})
```

## Layout

```js
import { Container, Grid, Stack, Flex, createPage } from '@uploop-vibe/vibe'

// Responsive grid
Grid.create({ cols: 3, gap: 'md', responsive: true })

// Page builder
createPage({
  type: 'dashboard',
  sections: {
    header: { component: 'comp:header' },
    sidebar: { component: 'comp:nav' },
    content: { component: 'comp:content' },
  },
})
```

## License

MIT
