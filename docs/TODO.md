# TODO — Uploop Vibe Components

## v0.1.0 — Initial Scaffold ✅

- [x] Monorepo structure (pnpm workspaces)
- [x] `@uploop-vibe/vibe` package
  - [x] Design tokens (tokens.js)
  - [x] Theme system (theme.js)
  - [x] Motion presets (motion.js)
  - [x] Intent scales (scales.js)
  - [x] 20+ UI components
  - [x] Layout system (grid, page builder)
  - [x] Barrel exports (index.js)
- [x] `@uploop-vibe/vibe-ai` package
  - [x] Intent resolver (generator.js)
  - [x] Schema composer (composer.js)
  - [x] Page templates (templates.js)
- [x] Example demos (button, form, dashboard, ai)
- [x] Vite dev setup with aliases
- [x] Workspace resolution (link: to uploopjs)
- [x] Docs structure (AI_GUIDELINE, PLAN, TODO, ARCHITECTURE, HOWTO, progress)

## v0.1.1 — Docs & Polish 🟡

- [x] `docs/AI_GUIDELINE.md`
- [x] `docs/PLAN.md`
- [x] `docs/TODO.md`
- [x] `docs/ARCHITECTURE.md`
- [x] `docs/HOWTO.md`
- [x] `docs/progress/progress-v0.1.md`
- [x] `docs/design/design-vibe.md`
- [x] `docs/design/design-vibe-ai.md`
- [x] `docs/plan/Plan_vibe-v0.1.x.md`

## v0.2.0 — Component Tests & Polish

- [ ] Vitest config for vibe packages
- [ ] Button: mount test, configure test, variant rendering
- [ ] Card: slot rendering, header/body/footer
- [ ] Input: value binding, error state
- [ ] Modal: open/close, overlay click
- [ ] Table: column/row rendering, empty state
- [ ] Tabs: tab switching, variant rendering
- [ ] Toast: show/hide, auto-dismiss
- [ ] Inject base CSS at startup (hover/focus/active states)
- [ ] Icon sprite system
- [ ] Responsive breakpoint testing

## v0.3.0 — AI Integration

- [ ] `suggestComponent()` heuristic
- [ ] Intent validation (reject unknown types)
- [ ] Schema → form bidirectional binding
- [ ] Template parameterization
- [ ] Flow suggestion wiring

## v0.4.0 — Theming

- [ ] Dark mode toggle component
- [ ] System preference detection
- [ ] Theme CSS export
- [ ] Component-level theme overrides

## v0.5.0 — Production

- [ ] E2E tests (Playwright)
- [ ] Bundle analysis
- [ ] Tree-shaking audit
- [ ] npm publish workflow
- [ ] CDN bundle

## Stats

- **Packages:** 2
- **Components:** 20+
- **Source files:** 18
- **Examples:** 4
- **Tests:** 0 (pending v0.2.0)
