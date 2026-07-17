# CLAUDE.md

Wazuh-owned AI context for **`wazuh-dashboard-reporting`**. Keep it short: this
file points to the source-of-truth docs instead of duplicating them. Read the
linked doc before doing non-trivial work.

## What this repo is

A **single OpenSearch Dashboards (OSD) plugin** — the Wazuh fork of
[`opensearch-project/dashboards-reporting`](https://github.com/opensearch-project/dashboards-reporting).
It provides the **Reporting** UI in the Wazuh dashboard (report definitions,
scheduled/on-demand reports, PDF/PNG/CSV generation, and notifications delivery).
It is _not_ the platform — the platform is the sibling repo `wazuh-dashboard` (an
OSD fork), into which this plugin is installed under its external `./plugins/`
directory (alongside the plugins from `wazuh-dashboard-plugins`).

- OSD id: `reportsDashboards` (`opensearch_dashboards.json`); config path
  `opensearch_reporting`; package name `reports-dashboards`.
- Versioning: OSD base in `package.json` → `opensearchDashboards.version` (e.g.
  `3.6.0`) and `opensearch_dashboards.json` → `opensearchDashboardsVersion`;
  Wazuh version in `VERSION.json` and `package.json` → `wazuh` (e.g. `5.0.0`,
  revision `04`).
- Node/Yarn: this plugin has **no own `.nvmrc`** — it uses the toolchain of the
  `wazuh-dashboard` checkout it lives in (Node `22.22.0`, Yarn v1). Its scripts
  reference the parent checkout (`../../scripts/*`, `../../node_modules/.bin/*`),
  so it is developed **from inside `wazuh-dashboard/plugins/`**, not standalone.
- Default branch `main`; work happens on version branches (`5.0.0`, `6.0.0`, …).

## Architecture — read this before importing anything

This is one self-contained plugin. Its code splits into layers that are bundled
**separately**:

- **`public/`** — runs in the **browser** (React, EUI/OUI, `core.http`). Uses
  DOM/`window`. Holds `components/`, `plugin.ts`, `application.tsx`,
  `plugin_nav.tsx`, `types.ts`.
- **`server/`** — runs in **Node.js** (Hapi routes under `/api/`, services,
  cluster clients). Uses `fs`, server context, secrets. Holds `routes/`,
  `backend/`, `clusters/`, `config/`, `model/`, `utils/`, `plugin.ts`.
- **`common/`** — **isomorphic** code shared by both: constants, helpers, types.
  No DOM, no Node-only APIs.

**Import rules (strict):**

1. `public/` must **never** import from `server/`, and `server/` must **never**
   import from `public/`. Putting Node code in a browser bundle (or vice-versa)
   breaks the build/runtime.
2. Both `public/` and `server/` may import from `common/`. Put anything shared in
   `common/`.
3. Cross-plugin access (e.g. to plugins from `wazuh-dashboard-plugins` or built-in
   OSD plugins) goes **layer-to-layer** (`public → other/public`,
   `server → other/server`) and only via a plugin's declared `setup()`/`start()`
   contracts + `requiredPlugins`/`optionalPlugins` in `opensearch_dashboards.json`
   — never reach into internal paths. This plugin requires `navigation`, `data`,
   `opensearchDashboardsUtils` and optionally `share`, `dataSource`,
   `dataSourceManagement`, `observabilityDashboards`.

### How `public/` and `server/` communicate

They do **not** import each other — they talk over HTTP: `server/routes/*`
register endpoints (`/api/...`, validated with `@osd/config-schema`) that delegate
to services / cluster clients; `public/` calls those routes via OSD `core.http`.

### Plugin lifecycle

`setup(core, deps)` (register routes, saved objects, UI app, services) →
`start(core, deps)` → `stop()`. Use `core.getStartServices()` in mount handlers
instead of storing `start` references as fields.

## Commands — run from inside the `wazuh-dashboard` checkout

This plugin's scripts expect to run at `wazuh-dashboard/plugins/<this-plugin>`
(they call `../../scripts/*` and `../../node_modules/.bin/*`). Bootstrap the
platform first, then run per-plugin scripts here:

```bash
# From the wazuh-dashboard root (installs deps + builds internal packages):
yarn osd bootstrap

# From this plugin's dir (wazuh-dashboard/plugins/<this-plugin>):
yarn lint                 # node ../../scripts/eslint (.eslintrc.js → @elastic/eslint-config-kibana)
yarn lint -- --fix        # autofix
yarn test                 # jest --config ./test/jest.config.js
yarn build                # plugin-helpers build → build/*.zip
yarn cypress:run          # Cypress E2E (also: cypress:open)
```

Note the test script is **`yarn test`** (not `yarn test:jest`). There is **no**
`format`, `lint:fix`, `typecheck`, or `knip` script here. Unlike the other forks,
this repo **does** ship its own `.prettierrc` (`es5` trailing commas, single
quotes, 80-col) and `.prettierignore` (skips `*.md`, `*.lock`); a `.lintstagedrc`
defines `prettier --write` on staged files. Prettier can be run directly with
`npx prettier <files> --write`. `tsconfig.json` extends `../../tsconfig.json`, so
typecheck manually from the parent checkout:
`../../node_modules/.bin/tsc --noEmit -p tsconfig.json`.

New `.js`/`.ts`/`.tsx` files must carry the OpenSearch **license header**
(enforced by `@osd/eslint/require-license-header` in `.eslintrc.js`).

### Running a local instance (Docker dev env)

This plugin has **no dev environment of its own**. The canonical way to bring up a
local Wazuh dashboard with this plugin — together with the other additional
single-plugin forks (`wazuh-dashboard-security-analytics`,
`wazuh-dashboard-notifications`, `wazuh-dashboard-alerting`) — is the Docker dev
env **owned by `wazuh-dashboard-plugins`** (`docker/osd-dev`). Mount this repo
into it with `-r`:

```bash
# from the sibling wazuh-dashboard-plugins checkout:
cd ../wazuh-dashboard-plugins/docker/osd-dev
./dev.sh up --base --server-local 0601 --indexer-local 0601 \
  -r wazuh-dashboard-reporting \
  -r wazuh-dashboard-notifications \
  -r wazuh-dashboard-alerting
```

- `--base` — build/run the `wazuh-dashboard` platform from source (auto-detected
  from the sibling checkout; or `--base /abs/path`).
- `--server-local <tag>` — Wazuh server-local image tag (here `0601`).
- `--indexer-local <tag>` — packaged indexer image tag.
- `-r <repo>` — mount an external plugin repo (repeatable). Shorthand resolves the
  repo by name under the sibling parent dir (the parent of this checkout); or use
  `-r name=/abs/path`. Point to the repository **ROOT**, not a subfolder.
  `--all-forks` auto-discovers and mounts all sibling forks.

Run `./dev.sh --help` for all flags. OSD comes up on `https://0.0.0.0:5601`
(admin:admin).

## Code conventions

Enforced by tooling — run the linter/formatter, don't hand-format:

- ESLint config is `.eslintrc.js` extending **`@elastic/eslint-config-kibana`**
  (+ EUI, react-hooks, jest, prettier). Every source file needs the OpenSearch
  license header.
- **Filenames follow the upstream OpenSearch convention** (PascalCase for
  components, e.g. `ReportDefinitions.tsx`; snake/camel elsewhere) — this differs
  from the kebab-case used in `wazuh-dashboard-plugins`. Match the surrounding
  upstream style when editing.
- TypeScript-first; single quotes; semicolons; Prettier from the local
  `.prettierrc` (`es5`, single quotes, 80-col).
- English everywhere (code, comments, commits, docs).

## Testing

- **Unit tests are colocated** as `*.test.ts` / `*.test.tsx`, typically inside
  `__tests__/` folders **next to** the code they cover (snapshots under
  `__snapshots__/`). Run the whole suite with `yarn test`; scope with a path
  (`yarn test <path>`). Refresh snapshots only when a change intends to
  (`../../node_modules/.bin/jest --config ./test/jest.config.js -u`). When you add
  a source file, add its test beside it.
- **Functional:** Cypress (`.cypress/`, `cypress.config.js`) via
  `yarn cypress:run` / `yarn cypress:open`.

## Git / PR workflow

Shared Wazuh Dashboard conventions:

- Branch names: `<type>/<issue#>-<kebab-desc>` (`fix/`, `enhancement/`, `feat/`,
  `bug/`, `change/`, `doc/`). PR base = the target **version branch**, not always
  `main` — confirm it.
- **Sign commits** (DCO `--signoff`). Imperative, capitalized subject.
- Open PRs as **Draft** (CI skips drafts); run lint + tests locally, then "Ready
  for review". Squash merge for single-purpose PRs.
- UI changes require a screenshot/video in the PR (the template is
  [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)).
- **Changelog:** maintain [`CHANGELOG.md`](CHANGELOG.md) by hand for user-facing
  changes; entries **link to the issue, not the PR**. No entry for
  `internal-devel-requests` issues or tooling/docs/test-only PRs.
- Issues arrive as URLs and may live in another repo. Issues from
  `internal-devel-requests` are internal: don't expose their link in the PR's
  `## Description` and add no CHANGELOG entry.

## Fork coexistence

Upstream is `opensearch-project/dashboards-reporting`. On upstream syncs, **Wazuh
content wins** and relevant upstream technical notes are folded into the sections
above. Keep this file Wazuh-owned.

## AI working rules

- Before proposing a PR: `yarn lint` + `yarn test` pass for the touched code.
- Never weaken auth/CSP/security; never commit secrets or credentials.
- Never force-push shared branches; never commit without DCO sign-off.
- Respect the `public`/`server`/`common` import rules above — when in doubt, put
  shared code in `common/`.

## Source-of-truth docs

- [`DEVELOPER_GUIDE.md`](DEVELOPER_GUIDE.md), [`README.md`](README.md),
  [`CONTRIBUTING.md`](CONTRIBUTING.md), [`RELEASING.md`](RELEASING.md),
  [`SECURITY.md`](SECURITY.md).
- Platform docs live in the sibling `wazuh-dashboard` repo
  (`DEVELOPER_GUIDE.md`, `src/core/CONVENTIONS.md`, `src/core/TESTING.md`).
