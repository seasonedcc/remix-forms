# Welcome to Remix Forms

This repository contains the Remix Forms source code. Please create issues as you encounter them. We appreciate the contribution!

## Documentation

For documentation about Remix Forms, please visit [remix-forms.seasoned.cc](https://remix-forms.seasoned.cc).

## Development

1. Clone the repo

2. Install and run

```sh
$ cd remix-forms
$ npm i
$ npm run dev
```

Note: we had issues running the turborepo `dev` command on Node 18. We recommend using Node 16 for development.

This will run the website at http://localhost:5173.

### Repository structure

This is a monorepo managed with **npm workspaces** and **Turborepo**. The two
main workspaces are:

- `apps/web` – the website and example app.
- `packages/remix-forms` – the Remix Forms library.

Workspace scripts are executed from the repo root using `npm run <script>`. The
most common ones are `build`, `dev`, `lint`, `tsc` and `test`.

Run `npm run lint` to check code style with **Biome** (use `npm run lint-fix`
to automatically fix issues) and `npm run tsc` to run the TypeScript compiler.

## Testing

You need to have the Playwright executables in order to run the tests. Install
them with `npx playwright install` (or `npm run playwright:ci:install`).

Then you can run

```sh
npm run test
```
