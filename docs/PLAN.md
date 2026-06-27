# PLAN — Uploop Vibe Components

> Current: **v0.1.0** — Initial scaffold

---

## v0.1.0 — Vibe Core ✅

Initial scaffold of the Vibe design system and AI bridge.

- [x] Project structure (pnpm monorepo, `@uploop-vibe/*` namespace)
- [x] `@uploop-vibe/vibe` package scaffold
- [x] Design tokens (colors, spacing, type, shadows, radius, z-index, motion)
- [x] Theme system (vibeTheme, light/dark, CSS custom properties)
- [x] 11 animation presets + injection
- [x] Intent-mapped scales (size, variant, radius, shadow)
- [x] 20+ UI components (Button, Card, Input, Modal, Table, etc.)
- [x] Layout system (Container, Grid, Stack, Flex, Spacer, Divider)
- [x] Page builder with 7 layout types
- [x] `@uploop-vibe/vibe-ai` package scaffold
- [x] Intent resolver (`resolveComponentIntent`, `generateComponent`)
- [x] Schema composer (`composeEntityPage`, `composeDashboard`, `composeListPage`)
- [x] 8 pre-built page templates
- [x] 4 example demos + Vite dev setup
- [x] Workspace resolution (`link:` protocol to uploopjs)
- [x] Docs structure (AI_GUIDELINE, ARCHITECTURE, HOWTO, PLAN, TODO, design, progress)

## v0.2.0 — Component Polish (Next)

- [ ] All components tested with vitest
- [ ] Hover/focus/active CSS utility classes injected at startup
- [ ] `Icon` sprite system (register SVG icons)
- [ ] `Toast` auto-dismiss timer wired to effect
- [ ] `Modal` escape key handling
- [ ] `Tabs` content panels (tab → content mapping)
- [ ] `Dropdown` close-on-click-outside
- [ ] `Tooltip` show-on-hover
- [ ] Responsive variants for all components
- [ ] Accessibility (aria attributes, focus management)

## v0.3.0 — AI Enhancements

- [ ] `intent()` integration: describe page → generate fully
- [ ] Schema auto-detection: infer component type from data shape
- [ ] `suggestComponent()` — AI recommends components for a given intent
- [ ] Template parameters (customize templates with props)
- [ ] `composeForm()` — form with validation from schema constraints
- [ ] Flow suggestion integration (`suggestFlow` wired to page generation)

## v0.4.0 — Theming & Customization

- [ ] Theme editor / preview
- [ ] Custom component variants (user-defined variantScale entries)
- [ ] Design token export (CSS file generation)
- [ ] Dark mode toggle + system preference detection
- [ ] Component-level theme overrides

## v0.5.0 — Production Readiness

- [ ] Bundle size optimization
- [ ] Tree-shaking verification
- [ ] CDN bundle
- [ ] SSR compatibility (all components work with `renderToString`)
- [ ] E2E tests (Playwright)
- [ ] Full test suite (unit + integration + E2E)
- [ ] npm publish

---

## Future

- **v0.6.0**: Form builder (drag-drop component composition)
- **v0.7.0**: Real-time collaboration components (cursors, presence)
- **v0.8.0**: Data visualization (charts, graphs via canvas)
- **v0.9.0**: Mobile-native components (gesture, bottom sheet, swipe)
