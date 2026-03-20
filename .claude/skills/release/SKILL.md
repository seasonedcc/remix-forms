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
- **prerelease** (e.g. `5.0.0-alpha.4`) when the user asks for an alpha/beta/rc release — increment the prerelease suffix

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

For **stable** releases, tell the user to run:

```bash
cd packages/remix-forms && pnpm publish
```

For **prerelease** versions (alpha/beta/rc), tell the user to run:

```bash
cd packages/remix-forms && pnpm publish --tag alpha
```

The `--tag alpha` flag prevents npm from marking the prerelease as `latest`.

**Do not run `pnpm publish` yourself** — it requires an OTP. Wait for the user to confirm they've published before continuing.

### 7. Create the GitHub release

Once the user confirms the publish, write release notes by thoroughly analyzing the changes.

#### Analyze changes in depth

Do not just list PRs. Study the actual code changes to understand what they mean for users:

1. **Check the public API diff** — look at changes to `packages/remix-forms/src/index.ts` for added/removed exports.
2. **Check dependency changes** — diff `packages/remix-forms/package.json` for new/removed/changed peer dependencies and dependencies.
3. **Filter to package-relevant changes** — use `git log <last-tag>..HEAD --oneline -- packages/remix-forms/` to identify commits that actually affect the published package (vs website-only changes).
4. **Read the changed source code** — don't assume what a change does from the PR title alone. Read the actual diffs to understand user-facing impact. For example, an internal dependency upgrade may introduce stricter behavior, but if the package catches and handles it internally, it's not a user-facing breaking change.

#### Write release notes

Structure depends on the nature of the changes:

- **Releases with breaking changes**: Start with a `## Breaking Changes` section containing narrative subsections that explain each breaking change, what it replaces, and what users need to do. Follow with a `## What's Changed` section listing PRs.
- **Minor/patch releases**: A `## What's Changed` section with bullet points linking to merged PRs.

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

#### Create the release

For **stable** releases:

```bash
gh release create v<new-version> --title "v<new-version>" --notes "<release-notes>"
```

For **prerelease** versions:

```bash
gh release create v<new-version> --title "v<new-version>" --prerelease --notes "<release-notes>"
```

Use a HEREDOC for the notes to preserve formatting.
