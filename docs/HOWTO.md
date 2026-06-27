# HOWTO — Uploop Vibe Components

Developer guide for using Vibe components and the AI intent API.

---

## Quick Start

```js
import { vibeLight, applyVibeTheme, injectVibeAnimations } from '@uploop-vibe/vibe'
import { Button, Card, Input } from '@uploop-vibe/vibe'

// 1. Apply theme
applyVibeTheme(vibeLight)

// 2. Inject animations
injectVibeAnimations()

// 3. Mount components
Button.create({ label: 'Click Me', variant: 'solid' }).mount(document.getElementById('app'))
```

## Components

### Button

```js
import { Button } from '@uploop-vibe/vibe'

const btn = Button.create({
  label: 'Save',
  variant: 'solid',     // solid|outline|ghost|subtle|danger|success|warning|neutral
  size: 'md',           // xs|sm|md|lg|xl
  disabled: false,
  loading: false,
  icon: '💾',
  iconRight: '→',
  fullWidth: false,
  animate: 'scale-in',  // fade-in|slide-in-up|scale-in|spin|pulse|...
})

btn.mount(document.getElementById('container'))

// Update dynamically
btn.loop.send('setLoading', true)
btn.loop.send('setLabel', 'Saving...')
```

### Card

```js
import { Card, CardHeader, CardBody, CardFooter } from '@uploop-vibe/vibe'

const card = Card.create({
  padding: 'md',      // none|sm|md|lg|xl
  shadow: 'sm',       // none|xs|sm|md|lg|xl|xl2
  radius: 'lg',
  bordered: true,
  hoverable: false,
})

card.mount(el)
// Slots: <slot> content goes inside
```

### Input

```js
import { Input, Textarea, Select, Checkbox } from '@uploop-vibe/vibe'

const input = Input.create({
  type: 'email',
  label: 'Email',
  placeholder: 'you@example.com',
  value: '',
  error: '',           // Set for validation errors
  hint: 'We\'ll never share your email',
  required: true,
})

input.loop.send('setError', 'Invalid email')
```

### Modal

```js
import { Modal, Dialog } from '@uploop-vibe/vibe'

const modal = Modal.create({
  title: 'Confirm Action',
  size: 'md',          // sm|md|lg|xl|full
  closeOnOverlay: true,
  closeOnEsc: true,
})

modal.loop.send('open', { title: 'Hello' })
modal.loop.send('close')
```

### Table

```js
import { Table } from '@uploop-vibe/vibe'

const table = Table.create({
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ],
  rows: [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
  ],
  striped: true,
  hoverable: true,
  compact: false,
})
```

## Layout

### Page Builder

```js
import { createPage } from '@uploop-vibe/vibe'

const page = createPage({
  type: 'dashboard',   // dashboard|form|list|detail|landing|settings|wizard
  name: 'MyDashboard',
  sections: {
    header: { component: 'comp:header', props: { title: 'Dashboard' } },
    sidebar: { component: 'comp:nav' },
    content: { component: 'comp:content' },
  },
})
```

### Grid & Stack

```js
import { Container, Grid, Stack, Flex, Spacer, Divider } from '@uploop-vibe/vibe'

// Responsive grid
Grid.create({ cols: 3, gap: 'md', responsive: true })

// Vertical stack
Stack.create({ direction: 'vertical', gap: 'md', align: 'stretch' })

// Horizontal flex row
Flex.create({ gap: 'md', align: 'center', justify: 'between' })
```

## AI Intent API

### Generate from intent

```js
import { generateComponent, resolveComponentIntent } from '@uploop-vibe/vibe-ai'

// Describe what you want
const btn = generateComponent({
  name: 'MyButton',
  type: 'button',
  props: { label: 'Save', variant: 'solid', size: 'lg' },
  style: { animate: 'fade-in' },
})

btn.mount(document.getElementById('app'))
```

### Compose from schema

```js
import { composeEntityPage } from '@uploop-vibe/vibe-ai'
import { object, string, number } from '@uploop/schema'

const userSchema = object({
  name: string(),
  email: string(),
  age: number(),
})

const { page, entityComp, flow } = composeEntityPage({
  schema: userSchema,
  mode: 'form',
  layout: 'form',
})

page.mount(document.getElementById('app'))
```

### Materialize templates

```js
import { materializeTemplate, listTemplates } from '@uploop-vibe/vibe-ai'

console.log(listTemplates())
// → ['signupForm', 'loginForm', 'settings', 'dashboard', ...]

const signup = materializeTemplate('signupForm', {
  name: 'CustomSignup',
})

signup.mount(document.getElementById('app'))
```

## Theme Customization

```js
import { vibeTheme, extendVibeTheme, applyVibeTheme } from '@uploop-vibe/vibe'

// Create custom theme
const myTheme = vibeTheme({
  name: 'my-brand',
  mode: 'light',
  colors: {
    primary600: '#ff6b6b',
    primary700: '#ee5a5a',
  },
})

applyVibeTheme(myTheme)

// Dark mode
import { vibeDark } from '@uploop-vibe/vibe'
applyVibeTheme(vibeDark)
```

## Animation

```js
import { resolveMotionIntent, injectVibeAnimations } from '@uploop-vibe/vibe'

injectVibeAnimations()

const anim = resolveMotionIntent('slide-in-right')
// → { class: 'vibe-animate-slide-in-right', preset: 'slide-in-right' }

// Add class to any element:
// <div class="vibe-animate-slide-in-right vibe-duration-slow vibe-delay-200">
//   Animated content
// </div>
```

## Component Patterns

### Configure + Mount

```js
const btn = Button.create({ label: 'Click', variant: 'solid' })
btn.mount(el)

// Update state
btn.loop.send('configure', { label: 'Clicked!', variant: 'success' })
```

### Subscribe to changes

```js
const btn = Button.create({ label: 'Track Me' })
btn.loop.subscribe((state) => {
  console.log('Button state:', state)
})
```

### Accessibility

All components render semantic HTML:
- Buttons use `<button>`, not `<div>`
- Inputs use native `<input>`, `<select>`, `<textarea>`
- Modals use focus trap (pending)
- Icons have `aria-hidden` (pending)
