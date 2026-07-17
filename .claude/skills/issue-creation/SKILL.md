---
name: issue-creation
description: Create a well-formed GitHub issue in a Wazuh Dashboard repo — pick the right issue template, run an issue-first duplicate check, and produce a ready-to-file body with the template's default labels. Use when the user asks to create, open, file, or draft an issue.
---

# Create a Wazuh Dashboard issue

Pick the right issue template, check for duplicates first, then fill the
template verbatim and hand off a ready-to-file body.

## Workflow

Copy this checklist and track progress:

```
- [ ] 1. Classify intent → choose issue template (ask only if ambiguous)
- [ ] 2. Issue-first check: search existing issues for duplicates
- [ ] 3. Fill the chosen .github/ISSUE_TEMPLATE/*.md verbatim
- [ ] 4. Apply the real Wazuh label for the intent (`type/bug` / `type/enhancement` / `level/task`) + `untriaged`; ignore stale frontmatter labels
- [ ] 5. Emit the ready-to-file body + report (default stop; gh issue create only if asked)
```

### 1. Classify intent → choose template

Map the user's intent to a template. Ask the user only when genuinely
ambiguous between two rows.

| Intent | Template | Labels (from template frontmatter) |
|--------|----------|--------|
| Something is broken / not working as expected | [`bug_report.md`](../../../.github/ISSUE_TEMPLATE/bug_report.md) | `bug`, `untriaged` |
| New feature or enhancement request | [`feature_request.md`](../../../.github/ISSUE_TEMPLATE/feature_request.md) | `enhancement`, `untriaged` |
| Track/verify compatibility with a new OpenSearch version | [`compatibility_request.md`](../../../.github/ISSUE_TEMPLATE/compatibility_request.md) | `request/operational`, `level/task`, `type/maintenance` |
| Engineering task or improvement (not a bug, feature, or docs gap) | [`task_template.md`](../../../.github/ISSUE_TEMPLATE/task_template.md) | `level/task` |

### 2. Issue-first duplicate check

Before drafting, search for an existing issue covering the same problem:

```bash
gh issue list --search "<keywords>"
gh search issues "<keywords>" --repo wazuh/wazuh-dashboard-reporting
```

On a likely match, surface it to the user and ask whether to proceed with a
new issue or comment on the existing one instead.

### 3. Fill the template

Reference the chosen file under
[`.github/ISSUE_TEMPLATE`](../../../.github/ISSUE_TEMPLATE) — read it first and
fill it verbatim; do not inline template bodies in this skill.

> **repo-specific (wazuh-dashboard-reporting):** `bug_report.md` and
> `feature_request.md` declare the plain labels `bug` and `enhancement` in
> their frontmatter — stale, see step 4 for the real labels to apply.
> `level/task` and `compatibility_request.md`'s other labels
> (`request/operational`, `type/maintenance`) do exist as declared. This
> repo also auto-applies `untriaged` to every new issue
> on open, reopen, or transfer via
> [`.github/workflows/add-untriaged.yml`](../../../.github/workflows/add-untriaged.yml)
> — so `untriaged` will land even if you forget to name it explicitly.
> [`.github/ISSUE_TEMPLATE/config.yml`](../../../.github/ISSUE_TEMPLATE/config.yml)
> does not set `blank_issues_enabled`, so GitHub's default (blank issues
> allowed) applies; it only adds two `contact_links` (OpenSearch community
> support, and AWS/Amazon security-vulnerability reporting) shown as extra
> choices on the "new issue" picker alongside the templates above.

### 4. Labels

Several issue templates in this repo were inherited from the upstream
OpenSearch Dashboards fork and still declare stale labels in their
frontmatter (bare `bug`, `enhancement`) that don't exist as real labels here
— GitHub silently drops any label that doesn't exist instead of erroring, so
filing the template as-is can result in no type label at all. Standardize on
the real Wazuh label set instead of trusting the frontmatter verbatim:

| Intent | Real label to apply |
|--------|--------|
| Bug / defect | `type/bug` |
| Feature / enhancement | `type/enhancement` |
| Engineering task / chore | `level/task` |
| Every issue | `untriaged` — applied automatically on open/reopen/transfer by `.github/workflows/add-untriaged.yml`, no manual action needed |

Do not invent labels beyond this set, and do not invent an approval workflow.

### 5. Emit the ready-to-file body + report

**Default deliverable — stop here.** Output the filled issue body plus a short
report for the human to review:

```
Issue pre-flight
- Template: <file>
- Labels: <label list>
- Duplicate check: no matches found / possible match: <issue-url>
- Command to open it: gh issue create --template <file> --label "<labels>"
```

Only run `gh issue create` when the user explicitly asks you to open the
issue.
