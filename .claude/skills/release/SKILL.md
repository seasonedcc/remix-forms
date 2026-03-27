---
name: release
description: Release a new version of the remix-forms npm package. Bump version, build, publish, and create a GitHub release. Use when the user mentions releasing, publishing, cutting a release, or shipping a new version.
metadata:
  internal: true
---

# Release

Automate the release workflow for the `remix-forms` npm package.

## Instructions

### 0. Verify on main branch

Before doing anything else, confirm the working tree is on `main` and up to date:

```bash
git branch --show-current
```

If not on `main`, switch and pull:

```bash
git checkout main && git pull
```

**Never start a release from a feature branch.** Version bumps, commits, and tags must land on `main`.

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

Do not just list PRs. Study the actual changes to understand what they mean for users:

1. **Check dependency changes first** — diff `packages/remix-forms/package.json` for new/removed/changed `peerDependencies` and `dependencies`. Peer dependency bumps are the highest-impact breaking changes because they gate who can install the package at all (e.g., raising the React peer dep from `>=16.8` to `>=18` blocks every user on React 17 or below). Flag these immediately.
2. **Check the public API diff** — look at changes to `packages/remix-forms/src/index.ts` for added/removed exports.
3. **Filter to package-relevant changes** — use `git log <last-tag>..HEAD --oneline -- packages/remix-forms/` to identify commits that actually affect the published package (vs website-only changes).
4. **List merged PRs** between the two tags:

```bash
gh pr list --search "is:merged merged:>=<last-tag-date>" --json number,title,author --limit 100
```

5. **Read every PR's description** — PR bodies contain author-written summaries, migration instructions, and context that titles and diffs alone don't provide. Read each one:

```bash
gh pr view <number> --json body,title --jq '.title + "\n---\n" + .body'
```

Run these in parallel (all PR reads in a single message) for efficiency.

6. **Read the changed source code** when a PR description is missing or unclear — don't assume what a change does from the title alone.

#### Write release notes

Use the following structure. Include only the sections that apply:

- `## Breaking Changes` — narrative subsections explaining each breaking change, what it replaces, and what users need to do. Order by impact: **dependency requirement changes first** (peer dep bumps affect every user at install time), then behavioral or API changes. Include code examples showing before/after when helpful.
- `## New Features` — bullet points with **bold title**, PR number in parens, and a one-line description drawn from the PR body.
- `## Bug Fixes` — bullet points with PR number and linked issue closes (e.g. "Closes #123").
- `## What's Changed` — full PR list with author links, formatted as:

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
