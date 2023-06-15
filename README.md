# Welcome to Remix Forms!

This repository contains the Remix Forms source code. We're just getting started and the APIs are unstable, so we appreciate your patience as we figure things out.

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

This will run the website at http://localhost:3000.

## Testing

You need to have the Playwright executables in order to run the tests.

```sh
npx playwright install
```

Then you can run

```sh
npm run test
```
