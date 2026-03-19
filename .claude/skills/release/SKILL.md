---
name: release
description: Release a new version of the remix-forms npm package. Bump version, build, publish, and create a GitHub release. Use when the user mentions releasing, publishing, cutting a release, or shipping a new version.
metadata:
  internal: true
---

# Release

Automate the release workflow for the `remix-forms` npm package.

## Instructions

### 1. Determine the next version

Find the latest git tag:

```bash
git tag --list 'v*' --sort=-version:refname | head -1
```

Read the current version from `packages/remix-forms/package.json`.

Get the diff since the last release tag:

```bash
git log <last-tag>..HEAD --oneline
git diff <last-tag>..HEAD --stat
```

Determine the next version following semver:
- **patch** for bug fixes and dependency updates
- **minor** for new features that are backwards-compatible
- **major** for breaking changes

Bump the patch version unless the user specifies otherwise.

### 2. Bump version in packages/remix-forms/package.json

Edit `packages/remix-forms/package.json` to set the new version number.

### 3. Run pnpm install

```bash
pnpm install
```

This updates the lockfile with the new version.

### 4. Run checks

```bash
pnpm run lint-fix && pnpm run lint && pnpm run tsc && pnpm run test && pnpm run build
```

All must pass before proceeding.

### 5. Commit and push

Commit `packages/remix-forms/package.json` and `pnpm-lock.yaml` with message `v<new-version>`. Push to `main`.

### 6. Ask the user to publish

Tell the user to run:

```bash
cd packages/remix-forms && pnpm publish
```

**Do not run `pnpm publish` yourself** — it requires an OTP. Wait for the user to confirm they've published before continuing.

### 7. Create the GitHub release

Once the user confirms the publish, create a GitHub release.

Write release notes by analyzing the diff between the previous tag and `HEAD`. Follow the pattern from previous releases:

- For **major releases**: Include narrative sections describing breaking changes and new features, followed by a `## What's Changed` section with PR links and a `**Full Changelog**` compare link.
- For **minor/patch releases**: A `## What's Changed` section with bullet points linking to merged PRs, and a `**Full Changelog**` compare link.

List merged PRs between the two tags:

```bash
gh pr list --search "is:merged merged:>=<last-tag-date>" --json number,title,author --limit 100
```

Format each PR as:

```
* <title> by @<author> in https://github.com/seasonedcc/remix-forms/pull/<number>
```

End with:

```
**Full Changelog**: https://github.com/seasonedcc/remix-forms/compare/v<previous>...v<new>
```

Create the release:

```bash
gh release create v<new-version> --title "v<new-version>" --notes "<release-notes>"
```

Use a HEREDOC for the notes to preserve formatting.
