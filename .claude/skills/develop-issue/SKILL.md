---
name: develop-issue
description: Implement a GitHub issue end-to-end in a Wazuh Dashboard repo — plan, code following repo conventions, add colocated tests, validate with check-standards, add the CHANGELOG entry, and deliver a filled PR-template body (leaving Evidence/screenshot to the developer) WITHOUT opening the PR. Use when the user provides an issue to develop, implement, or work on.
---

# Develop an issue (issue → code → tests → delivery)

Entry point for feature/bug work. Takes an issue, produces the change plus a
ready-to-paste PR delivery, and hands off to the developer for the screenshot and
the final PR creation. Chains the `check-standards` and `create-pr` skills.

## Workflow

Copy this checklist and track progress:

```
- [ ] 1. Plan from the issue (goal, acceptance criteria, affected layer)
- [ ] 2. Implement, focused on the issue, respecting conventions
- [ ] 3. Add/update colocated tests and run them
- [ ] 4. Validate with check-standards; fix failures
- [ ] 5. Add the CHANGELOG entry
- [ ] 6. Deliver via create-pr (prepare mode) — do NOT open the PR
```

### 1. Plan

Issues are normally shared as a **URL** and may live in a different repo. Read it
first and classify the source:

```bash
gh issue view <issue-url>
```

- **Internal** — URL contains `internal-devel-request` (e.g.
  `wazuh/internal-devel-requests`): the issue link is **not** exposed in the PR
  ("Issues Resolved" stays empty) and there is **no CHANGELOG entry**.
- **Public** — any other repo (e.g. `wazuh/wazuh-dashboard-reporting`): link it in
  the PR and add a CHANGELOG entry pointing to the issue.

Restate the issue's goal and acceptance criteria in your own words. Identify the
affected **layer(s)** — `public` (browser/React), `server` (Node/routes/services),
`common` (shared). Ask the user only if genuinely blocked; otherwise proceed with
reasonable defaults.

### 2. Implement

Keep the change scoped to the issue. Respect the architecture and conventions in
[`CLAUDE.md`](../../../CLAUDE.md):

- Never import `server/` from `public/` or vice versa; put shared code in
  `common/`. Cross-plugin: `public → other/public`, `server → other/server`,
  preferably via `setup()`/`start()` contracts.
- This is a fork of `opensearch-project/dashboards-reporting`: match the
  **upstream filename convention** (PascalCase for components, e.g.
  `ReportDefinitions.tsx`), TypeScript, English everywhere. New `.js`/`.ts`/`.tsx`
  files need the OpenSearch **license header** (enforced by ESLint). On upstream
  syncs, Wazuh content wins.

### 3. Tests (colocated)

Add or update unit tests as `*.test.ts` / `*.test.tsx`, typically inside
`__tests__/` folders **next to** the changed source (snapshots under
`__snapshots__/`). New functionality must include testing.

> **repo-specific (wazuh-dashboard-reporting):** this plugin's scripts run from
> **inside the `wazuh-dashboard` checkout** at `plugins/<this-plugin>` (they
> reference `../../node_modules/.bin/jest`). Bootstrap the platform once
> (`yarn osd bootstrap` from the `wazuh-dashboard` root), then run **`yarn test`**
> here (not `yarn test:jest`); refresh snapshots with
> `../../node_modules/.bin/jest --config ./test/jest.config.js -u`.

### 4. Validate

Run the **check-standards** skill (prettier + eslint + typecheck + tests over the
diff). Fix everything it reports before delivering.

### 5. CHANGELOG

For **public** issues, add an entry under the upcoming version in
[`CHANGELOG.md`](../../../CHANGELOG.md) (`Added` / `Changed` / `Fixed` /
`Removed`), with the link pointing to the **issue** (not the PR). Skip the entry
for **internal-devel-requests** issues, and for tooling/docs/test-only changes
(use the `no changelog` label on the PR).

### 6. Deliver (do NOT open the PR)

Invoke **create-pr** in its default prepare-and-hand-off mode. Output:

- The filled PR-template body, with the **`### Description`** completed, the
  **`### Check List`** boxes that genuinely apply checked, and
  **`### Issues Resolved` left empty** for internal-devel-requests issues (or
  `closes #<n>` / issue URL for public ones), plus a screenshot/video reminder for
  any UI change.
- The pre-flight report (branch, suggested base, DCO status, check-standards
  result, CHANGELOG status, and the `gh pr create` command to run when ready).

End by reminding the developer to sign commits with `--signoff` and to add the
screenshot before opening the PR.
