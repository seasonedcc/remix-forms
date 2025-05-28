# Contributor Guidelines

This repository contains a monorepo managed with npm workspaces and Turborepo. The two main workspaces are
`apps/` and `packages/`.

## Development Setup
1. Install dependencies with `npm i`.
2. Start the dev server with `npm run dev`. The dev command runs Turborepo
   tasks in parallel. Development works best on Node 16 (see README).
3. Playwright is required for tests. Install the browser binaries with
   `npx playwright install` or `npm run playwright:ci:install`.

## Common Scripts
The root `package.json` defines the main scripts:
- **`npm run build`** – Runs `turbo run build` across workspaces.
- **`npm run dev`** – Runs `turbo run dev --parallel`.
- **`npm run lint`** – Runs Biome to lint/format the codebase.
- **`npm run tsc`** – Runs the TypeScript compiler in all packages.
- **`npm run test`** – Runs Vitest/Playwright tests via Turborepo.

These scripts should be executed from the repository root.

## Code Style
- Formatting and linting are handled by **Biome**. Important settings are
  two‑space indentation, single quotes, trailing commas (`es5`) and
  semicolons only where necessary.
- Import order and unused code rules are enforced. If a rule must be
  bypassed, use `// biome-ignore` comments as seen in the existing source.
- Source code is written in TypeScript using ES modules.
- Export types and values explicitly (e.g. `export { Foo }` and
  `export type { Bar }`).
- Prefer static imports. Use dynamic `import()` only when strictly necessary
  and document why it's required.

## Testing
- Run `npm run test` to execute the test suite.
- Always run the tests before committing changes.
- Focus tests on application behavior and accessibility. Avoid checking Tailwind classes, CSS, or which specific HTML tag is rendered. Prefer queries based on roles or other a11y attributes.
- Do your best to test the exposed API, its inputs and outputs rather than implementation details.

## Public API
The public API for the `remix-forms` package is defined by
`packages/remix-forms/src/index.ts`. Whenever you modify this file or the
modules it re-exports:

- Ensure every exported value or type has a TSDoc comment in its source file.
- Follow the existing style seen in the codebase: multi-line `/** ... */`
  blocks with a short description, `@param`/`@returns` tags and `@example`
  sections when relevant.
- Keep `src/index.ts` in sync with the actual exports so consumers see an
  up‑to‑date public API.

## Commit Messages
Commits typically use a short, imperative description starting with a
capital letter (e.g. `Fix useFetcher example`). Follow this style when
adding commits.

## Before Sending a Pull Request
Run the following commands and make a best effort to ensure they succeed:

```bash
npm run lint-fix
npm run lint
npm run tsc
npm run test
```

Tests may take a while because Playwright launches browsers. If they fail
due to missing executables, run `npm run playwright:ci:install` first.

## Fixing Bugs
When addressing a bug, follow a test-driven development approach:
1. **Red** – Write a test that reproduces the issue and fails.
2. **Green** – Implement the minimal fix so the new test passes.
3. **Refactor** – Clean up the solution while keeping all tests green.

## Definition of Done

- A task is not done unless `npm run lint`, `npm run tsc`, and `npm run test` are all passing.
- A task is not done if it has new behavior without tests to ensure the new behavior.
