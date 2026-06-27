# Plan: Uploop Vibe Components v0.1.x

> **Date:** 2026-06-26
> **Status:** ✅ Complete
> **Target:** Initial scaffold — design system, 20+ components, AI intent bridge, examples, docs

---

## Goals

1. Create a design system that extends `@uploop/css` with vibe-specific tokens, theme, motion, and scales
2. Build 20+ production-grade UI components on `@uploop/html`'s `component()` HyperGraph architecture
3. Build an AI bridge layer that converts intent descriptions to real components
4. Match uploopjs project structure and conventions exactly
5. Provide working examples and comprehensive docs

## Deliverables

### `@uploop-vibe/vibe` package
- [x] 60+ design tokens (colors, spacing, typography, shadows, radius, z-index, motion)
- [x] Theme engine (light/dark, CSS custom properties, extensible)
- [x] 11 animation presets with utility classes and modifiers
- [x] Intent-mapped scales (size, variant, radius, shadow)
- [x] 20+ UI components with `state/update/view` pattern
- [x] Layout system (grid, stack, container, page builder)
- [x] Component registry for AI resolution

### `@uploop-vibe/vibe-ai` package
- [x] Intent resolver — maps `{ type, props, style }` → real component
- [x] Schema composer — `@uploop/schema` entity → full CRUD page
- [x] Template library — 8 pre-built pages, materializable with overrides
- [x] AI introspection — `describeComponentIntent()`, `listTemplates()`

### Examples
- [x] Button demo (variants, sizes, icons, states)
- [x] Form demo (inputs, validation, submit)
- [x] Dashboard demo (stats, table, progress)
- [x] AI intent demo (explorer, schema → page, templates, tokens)

### Documentation
- [x] AI_GUIDELINE.md (project rules)
- [x] ARCHITECTURE.md (full architecture)
- [x] HOWTO.md (developer guide)
- [x] PLAN.md / TODO.md (project tracking)
- [x] design/design-vibe.md + design-vibe-ai.md
- [x] progress/progress-v0.1.md

## Technical Decisions

| Decision | Why |
|----------|-----|
| `link:` not `workspace:*` for uploopjs | Separate monorepo, no workspace merge conflicts |
| Vite aliases for all `@uploop/*` imports | Vite can't resolve workspace names natively |
| Inline styles + `var(--vibe-*)` | Theme-swappable at runtime, no CSS build step |
| `component()` from `@uploop/html` | CSP-safe, HyperGraph-native, no JSX |
| `import` + `export` pattern | `componentRegistry` object references need local bindings |
| `configure` handler on every component | Intent-driven: update all props in one call |
| 7 page layout types | Covers dashboard, form, list, detail, landing, settings, wizard |

## Non-Goals (for v0.1)

- Test suite (deferred to v0.2)
- E2E tests (deferred to v0.5)
- SSR/hydration support (deferred to v0.5)
- npm publish (deferred to v0.5)
- Mobile-specific components (deferred to v0.9)

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Uploopjs API changes break vibe | Pin to current uploopjs version; add tests in v0.2 |
| `link:` protocol fragile on different machines | Document relative path assumption; add setup script |
| Inline styles hard to override | CSS vars at `:root` level allow global overrides |
| AI intent resolver misses edge cases | `describeComponentIntent()` for introspection; fallback returns null |
