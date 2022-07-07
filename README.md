# Welcome to Remix Forms!

This repository contains the Remix Forms source code. We're just getting started and the APIs are unstable, so we appreciate your patience as we figure things out.

## Documentation

For documentation about Remix Forms, please visit [remix-forms.seasoned.cc](https://remix-forms.seasoned.cc).

Also, please [join Remix's community on Discord](https://rmx.as/discord). We'll be there to provide you support on Remix Forms.

## Development

1. Clone the repo

2. Configure the web app to use the local remix-forms

```
// apps/web/package.json
{
  ...
  "dependencies": {
    ...
    "remix-forms": "*",
    ...
  },
  ...
}
```

3. Install and run

```sh
$ cd remix-forms
$ npm i
$ npm run dev
```

This will run the website at http://localhost:3000.

Install Playwright browsers in order to run the tests.

```
npx playwright install
```
