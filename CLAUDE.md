# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands should be run from the repository root:

- `npm run dev` - Start development server (parallel mode)
- `npm run build` - Build all packages
- `npm run lint` - Check code style with Biome (use `npm run lint-fix` to auto-fix)
- `npm run tsc` - Run TypeScript compiler
- `npm run test` - Run all tests (Vitest + Playwright)
- `npm run playwright:ci:install` - Install Playwright browser binaries

### Single Test Commands

- Run a single Playwright test: `npx playwright test path/to/test.spec.ts` (from apps/web directory)
- Run Vitest tests for remix-forms package: `npm run test` (from packages/remix-forms directory)

### Prerequisites

- Node.js >= 20.0.0 (development works best on Node 16 per README)
- Playwright browsers: `npm run playwright:ci:install`

## Repository Architecture

This is a monorepo managed with **npm workspaces** and **Turborepo**:

### Main Workspaces

- `packages/remix-forms/` - The core library package
  - Main exports: `SchemaForm`, `useField`, `formAction`, `performMutation`
  - Built with tsup, exports ESM/CJS with TypeScript declarations
  - Uses Vitest for unit testing
  - Key files: `src/schema-form.tsx`, `src/create-field.tsx`, `src/mutations.ts`

- `apps/web/` - Documentation website and example app
  - Built with React Router v7 (formerly Remix)
  - Uses Tailwind CSS for styling
  - Playwright tests for E2E testing
  - Contains comprehensive examples in `app/routes/examples/`

### Core Library Architecture

The remix-forms library is built around these key concepts:

1. **Schema-driven forms**: Uses Zod schemas to automatically generate form fields
2. **React Hook Form integration**: Leverages react-hook-form for form state management
3. **Server-side validation**: Integrates with React Router actions for full-stack form handling
4. **Type safety**: Fully typed with TypeScript, infers types from Zod schemas

Key components:
- `SchemaForm` - Main component that renders forms from Zod schemas
- `useField` - Hook for creating custom field components
- `formAction` - Server-side action helper
- `performMutation` - Client-side mutation helper

## Code Style & Conventions

- **Linting/Formatting**: Biome (2 spaces, single quotes, semicolons as needed)
- **Import style**: Explicit exports (`export { Foo }`, `export type { Bar }`)
- **TypeScript**: ES modules, full type safety
- **Components**: Use forwardRef for field components
- **Testing**: Focus on behavior, not implementation details or CSS classes

## Testing Guidelines

- Do not test implementation details such as HTML tags or CSS styles
- Do not use CSS modules, only Tailwind
- Test the exposed API inputs/outputs rather than internals
- Use descriptive test names and group with `describe` blocks
- For Playwright tests: prefer accessibility queries over CSS selectors
- Always run full test suite before commits: `npm run test`

## Important Notes

- The public API is defined in `packages/remix-forms/src/index.ts`
- All public exports must have TSDoc comments
- Follow existing commit message style (short, imperative, capitalized)
- Always run `npm run lint`, `npm run tsc`, and `npm run test` before submitting changes
- Web app runs on http://localhost:5173 in development
- Playwright tests expect the server running on port 3000 in test mode