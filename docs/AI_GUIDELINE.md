# AI Guideline — Uploop Vibe Components

Rules for AI agents and human contributors. Read before writing any code.

---

## 0. Same uploopjs SDLC

Every change follows the same cycle as uploopjs. No shortcuts.

### Plan
- Check `docs/PLAN.md` — which version/phase is active?
- Check `docs/TODO.md` — what's the highest-priority incomplete item?
- If the task changes scope, update PLAN.md or TODO.md first
- Major designs go in `docs/plan/Plan_vibe-<topic>-v<version>.md`

### Design
- New package? Follow existing conventions (`packages/<name>/src/index.js` + `package.json`)
- Uses `@uploop/*` packages via `link:` protocol → `../../../uploopjs/packages/<name>`
- All components use `component()` from `@uploop/html` — no custom component factories
- Intent-driven APIs: `intent` → `resolveComponentIntent()` → real Uploop component
- Design tokens live in `packages/vibe/src/design/tokens.js`

### Implement
- Follow code style (§6)
- JavaScript ESM — no CommonJS `require()`, no IIFEs, no global state
- Functional style — `component()` closures, not classes
- AI-first: every intent function returns a plain object, `describe()` for introspection
- Add JSDoc types for public API
- Components follow the `component(name, config)` pattern with `state`, `update`, `view`

### Test
- **Unit**: every new module → `packages/<name>/test/`
- Tests run with vitest: `npx vitest run`
- All tests must pass before push — no regressions
- Test file naming: `<feature>.test.js`

### Document
- Update the doc that matches your change (see §7)
- Update `docs/progress/progress-v<major>.<minor>.md` with completed/in-progress items
- Update `docs/TODO.md` status when a feature moves to Done
- Update `docs/PLAN.md` when a phase completes

### Commit
- Use Conventional Commits format (see §1)
- Commit message subject ≤50 chars, imperative mood
- Body only when *why* isn't obvious. Wrap at 72 chars.

---

## 1. Git Conventions

### Commits

- **Format**: [Conventional Commits](https://www.conventionalcommits.org/)
  ```
  type(scope): short description
  ```
- **Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`
- **Scope**: `vibe`, `vibe-ai`, `docs`, `examples`
- **Subject**: ≤50 chars, imperative mood, no period at end

Examples:
```
feat(vibe): add Button component with size/variant/loading states
feat(vibe-ai): add generateComponent() intent resolver
fix(vibe): componentRegistry uses import before export for local bindings
docs: add progress tracking and plan for v0.1
```

---

## 2. Code Review Requirements

- [ ] All Vite imports resolve (no `ERR_MODULE_NOT_FOUND`)
- [ ] `pnpm dev` starts without errors
- [ ] New components follow the `state/update/view` pattern
- [ ] Intent functions return plain objects (JSON-safe)
- [ ] New code has JSDoc types on public exports
- [ ] Relevant docs updated (see §7)
- [ ] Commit messages follow Conventional Commits

---

## 3. Testing

### Minimum bar

- New components: mount test + state render test
- New intent resolvers: resolve test with known + unknown types
- New composers: smoke test (generate page, verify structure)

### Running tests

```bash
pnpm test
```

---

## 4. Versioning & Progress

### Versioning

Current version: **v0.1.0** — initial scaffold.

- **MAJOR** (x.0.0): breaking API changes
- **MINOR** (0.x.0): new packages, new major features
- **PATCH** (0.0.x): bug fixes, doc updates, refactors

### Progress tracking

| File | Purpose |
|------|---------|
| `docs/progress/progress-v0.1.md` | v0.1 phase tracking |
| `docs/plan/Plan_vibe-v0.1.x.md` | v0.1 plan |

---

## 5. AI Agent Rules

### Do not assume
- Verify paths, imports, and exports exist before using them
- Read the file before editing it — never guess its contents
- When uncertain, search the codebase first

### Code changes
- Root-cause fixes, not surface patches
- Match existing style — ESM, closures, `component()` pattern
- `import` + `export` pattern for components (not just `export {} from`)

---

## 6. Code Style

### JavaScript
- ESM only: `import`/`export`, no `require()`
- Functional style: closures over classes
- `component()` from `@uploop/html` — `state`, `update`, `view` pattern
- JSDoc types for public API
- Single quotes, no semicolons

### Package structure
```
packages/<name>/
├── src/
│   ├── index.js          # Public API barrel export
│   ├── <module>.js       # One concern per file
│   └── ...
├── test/
└── package.json
```

### Component rules
- Every component uses `component(name, { state, update, view })`
- State is a plain object
- Update handlers are pure: `(state, payload) => newState`
- View returns HTML strings
- Intent-driven: configurable via `configure` handler

---

## 7. Documentation Conventions

| Change | Doc to update |
|--------|--------------|
| New component | `docs/design/design-vibe.md` |
| New AI feature | `docs/design/design-vibe-ai.md` |
| New package | `docs/design/design-<name>.md` + `README.md` |
| Architecture change | `docs/ARCHITECTURE.md` |
| Bug fix | `docs/TODO.md` or progress file |
| v0.x plan | `docs/plan/Plan_vibe-v<version>.md` |

### Doc files reference

| File | Purpose |
|------|---------|
| `docs/ARCHITECTURE.md` | Full architecture — packages, layers, intent pipeline |
| `docs/HOWTO.md` | Developer guide — how to use components, intent API |
| `docs/PLAN.md` | Development plan — phases, tasks |
| `docs/TODO.md` | Living task list — phases, checkboxes, status |
| `docs/design/design-vibe.md` | Vibe package design doc |
| `docs/design/design-vibe-ai.md` | Vibe AI package design doc |
| `docs/progress/progress-v0.1.md` | v0.1 progress tracking |
| `docs/plan/Plan_vibe-v0.1.x.md` | v0.1 plan |
| `README.md` | Project overview, quick start |
