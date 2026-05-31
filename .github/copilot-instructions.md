# GitHub Copilot Instructions — mITyGarden

These instructions apply to every AI-assisted interaction in this repository. Follow them consistently.

---

## 1. Spec-Kit Methodology

Every feature in this codebase is governed by a **spec file** under `specs/<id>-<feature-name>/spec.md`.

### Before writing any code

1. **Locate the spec** — find the relevant `specs/` directory for the feature being worked on.
2. **Read the spec in full** — understand all Acceptance Criteria (AC-xxx), Requirements (REQ-xxx), and Test IDs before writing a single line of code.
3. **If no spec exists** — stop and create one before implementing. Use the spec template below.
4. **Never implement behaviour that contradicts the spec** — if reality and the spec disagree, raise the conflict rather than silently overriding the spec.

### Spec file template

When creating a new spec (`specs/<id>-<feature>/spec.md`):

```markdown
# Feature Spec: <Feature Name>

## User Story

> As a <role>, I want to <goal>, so that <benefit>.

## Acceptance Criteria

### AC-001: <title>

- Given <context>
- When <action>
- Then <expected outcome>

## Requirements

- REQ-<TAG>-01: <MUST / SHOULD / MAY> …

## Test IDs (for E2E)

| Element | data-testid |
| ------- | ----------- |
| …       | …           |

## Success Metrics

- …
```

### Spec ID sequencing

Spec directories are named `<NNN>-<slug>` where `NNN` is zero-padded and sequential (e.g. `003-llm-suggestions`). Never reuse or skip IDs.

### Keeping specs up to date

- If you change behaviour that is covered by an existing AC or REQ, **update the spec** in the same commit/PR.
- If you add new acceptance criteria or requirements discovered during implementation, append them to the spec.
- Specs are the source of truth; code is the implementation of the spec.

---

## 2. Documentation Self-Maintenance

The `docs/` directory contains living documentation. **Keep it current automatically** — do not let code drift away from docs.

### Rules

| Situation                                   | Action required                                                    |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Adding a new package                        | Update `docs/architecture.md` — package table, dependency graph    |
| Adding a new Zustand store                  | Update `docs/architecture.md` — State Management table             |
| Adding a new LLM provider                   | Update `docs/llm-integration.md` — Supported Providers table       |
| Adding a new locale                         | Update `docs/i18n.md` — Supported Languages table and steps        |
| Adding a new monorepo command               | Update `docs/development.md` — Monorepo Commands section           |
| Changing an IPC channel name                | Update `docs/llm-integration.md` (or the relevant doc)             |
| Any public API surface change               | Update the relevant `docs/` file in the same commit                |
| Making a significant architectural decision | Create a new ADR in `docs/adr/` and add it to `docs/adr/README.md` |
| Introducing a new domain or technical term  | Add it to `docs/glossary.md`                                       |

### When to write an ADR

Create an ADR (`docs/adr/NNN-title.md`) whenever you:

- Choose a library or framework over concrete alternatives.
- Reverse or significantly modify a previous architectural decision.
- Accept a meaningful trade-off that future contributors need to understand.

ADRs are append-only. To reverse a decision, mark the old ADR **Superseded** and create a new one.

### Documentation style

- Use present tense ("The canvas uses…", not "The canvas will use…").
- Use tables for structured data (providers, locales, commands).
- Use code blocks with the correct language tag for all code examples.
- Do not duplicate information across docs — cross-link with relative Markdown links instead.
- Keep the `## Overview` section at the top of each doc short (≤ 5 sentences).
- All new domain or technical terms introduced in specs or code must be added to `docs/glossary.md`.

---

## 3. Project Architecture Constraints

Respect these constraints in every change:

### Monorepo layout

- Shared logic lives in `packages/` — never duplicate it in `apps/`.
- Apps in `apps/` import packages via `"workspace:*"` dependencies.
- Each package exports its public surface through `src/index.ts` only.

### State management

- All application state lives in Zustand vanilla stores in `packages/domain`.
- React components access stores via hooks in `packages/shared-ui` (`useProjectStore`, `useUiStore`) or `packages/canvas-engine` (`useCanvasStore`).
- Never put business logic inside React components — put it in store actions.

### Persistence

- All data access goes through the `Repository` interface in `packages/persistence`.
- Web uses `IndexedDBRepository`; Electron desktop uses `ElectronRepository` (IPC bridge).
- Never call `localStorage`, `fs`, or any storage API directly from a component.

### LLM / security

- LLM API keys are **main-process only** (Electron). Never expose them to the renderer.
- All LLM calls in the renderer go through `window.mityGardenDesktop.llm.complete()`.

### Canvas

- Canvas rendering uses `react-konva` (web/desktop) or a WebView wrapper (mobile).
- All element mutations go through `projectStore` actions — never mutate canvas state directly.
- Scale: 50 px per metre at 100% zoom.

### i18n

- Every user-visible string must use the i18n system (`packages/i18n`).
- Never hardcode English (or any other language) strings in components.
- Supported locales: `en`, `nl`, `fr`. Add translations to all three when adding new keys.

---

## 4. Testing Standards

### Unit tests

- Unit tests live alongside the package they test in `packages/<name>/tests/`.
- Use **Vitest** for unit tests.
- Test stores and business logic, not React rendering.

### E2E tests

- E2E tests live in `tests/e2e/` and use **Playwright** (Chromium).
- Every spec AC that can be automated must have a corresponding E2E test.
- Use `data-testid` attributes defined in the spec's Test IDs table — never select by CSS class or text.
- E2E tests must pass before merging any feature branch.

### Coverage expectations

- New store actions → unit test required.
- New wizard step or canvas interaction → E2E test required.
- Bug fixes → regression test required (unit or E2E, whichever is appropriate).

---

## 5. Code Style

- **TypeScript strict mode** — no `any`, no type assertions without a comment explaining why.
- **pnpm** — never use `npm` or `yarn` commands.
- **Turborepo** for orchestration — use `pnpm build`, `pnpm test`, `pnpm lint` from the workspace root.
- **ESLint + Prettier** — run `pnpm lint` and `pnpm format:check` before committing.
- Named exports only (no default exports from packages).
- Prefer functional React components with hooks.

---

## 6. Commit & PR Conventions

- Commit messages use Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.
- A PR that implements a spec feature should reference the spec: `feat(canvas): implement undo/redo — spec 002 AC-006`.
- Documentation updates (`docs:`) and spec updates may be bundled with the related feature commit.
- Never merge a feature without its corresponding spec and docs updates.
