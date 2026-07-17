---
name: issue-creation
description: Create a well-formed GitHub issue in a Wazuh Dashboard repo — pick the right issue template, run an issue-first duplicate check, and produce a ready-to-file body with the template's default labels. Use when the user asks to create, open, file, or draft an issue.
---

# Create a Wazuh Dashboard issue

Pick the right issue template, check for duplicates first, then fill the
template verbatim and hand off a ready-to-file body.

> **repo-specific:** this skill is written for `wazuh/wazuh-dashboard-reporting`
> — the template table, label list, and `--repo` values below all target this
> repo. Reusing it elsewhere means re-reading that repo's real
> `.github/ISSUE_TEMPLATE/*` and label set and updating every `--repo` flag and
> the table in step 1 accordingly — do not assume they carry over.

## Workflow

Copy this checklist and track progress:

```
- [ ] 1. Classify intent → choose issue template (ask only if ambiguous)
- [ ] 2. Issue-first check: search existing issues for duplicates
- [ ] 3. Fill the chosen .github/ISSUE_TEMPLATE/*.md verbatim
- [ ] 4. Keep the template's default labels; add a triage label only if named
- [ ] 5. Emit the ready-to-file body + report (default stop; gh issue create only if asked)
```

### 1. Classify intent → choose template

| Intent | Template | Labels (from template frontmatter) |
|--------|----------|--------|
| Something is broken / not working as expected | [`bug_report.md`](../../../.github/ISSUE_TEMPLATE/bug_report.md) | `bug`, `untriaged` |
| New feature or enhancement request | [`feature_request.md`](../../../.github/ISSUE_TEMPLATE/feature_request.md) | `enhancement`, `untriaged` |
| Track/verify compatibility with a new OpenSearch version | [`compatibility_request.md`](../../../.github/ISSUE_TEMPLATE/compatibility_request.md) | `request/operational`, `level/task`, `type/maintenance` |

Ask the user only if the intent doesn't clearly map to one of these three.

> **Label mismatch (verified, not fixed by this skill):** `bug_report.md` and
> `feature_request.md` declare the plain labels `bug` and `enhancement` in their
> frontmatter, but `gh label list --repo wazuh/wazuh-dashboard-reporting` shows
> this repo's real label set uses `type/bug` and `type/enhancement` instead —
> there is no bare `bug` or `enhancement` label here. `untriaged` and the three
> `compatibility_request.md` labels (`request/operational`, `level/task`,
> `type/maintenance`) do exist. Don't invent a fix for the template files; just
> don't pass the non-existent `bug`/`enhancement` labels to `gh issue create
> --label` (it errors on unknown labels) — file through the web UI template
> (which silently drops them) or use the real `type/bug` / `type/enhancement`
> equivalents if the human wants the label actually applied.

### 2. Issue-first duplicate check

```bash
gh issue list --search "<keywords>" --repo wazuh/wazuh-dashboard-reporting
gh search issues "<keywords>" --repo wazuh/wazuh-dashboard-reporting
```

Also check recently closed issues (`gh issue list --search "<keywords>" --state closed --repo wazuh/wazuh-dashboard-reporting`).
If a likely duplicate exists, surface it and ask before filing a new one.

### 3. Fill the template

Read the chosen file under
[`.github/ISSUE_TEMPLATE/`](../../../.github/ISSUE_TEMPLATE/) first, then fill
it **verbatim** — keep every heading/prompt exactly as written, just replace the
placeholder text with real content. Do not inline a paraphrased copy here; the
template file is the source of truth.

### 4. Labels — keep template defaults, no invented labels/workflow

Use only the labels declared in the chosen template's frontmatter (see the
table above and the mismatch note). Do not invent new labels or a labeling
workflow. This repo auto-applies `untriaged` to every new issue on open,
reopen, or transfer via
[`.github/workflows/add-untriaged.yml`](../../../.github/workflows/add-untriaged.yml)
— so `untriaged` will land even if you forget to name it explicitly.

[`.github/ISSUE_TEMPLATE/config.yml`](../../../.github/ISSUE_TEMPLATE/config.yml)
does not set `blank_issues_enabled`, so GitHub's default (blank issues allowed)
applies; it only adds two `contact_links` (OpenSearch community support, and
AWS/Amazon security-vulnerability reporting) that are shown as extra choices on
the "new issue" picker alongside the three templates above.

### 5. Emit ready-to-file body + report, gh issue create only if asked

Default deliverable: the filled template body plus a short report —

```
Issue pre-flight
- Template: <bug_report.md / feature_request.md / compatibility_request.md>
- Labels: <template defaults> (+ untriaged, auto-applied on open) — see the
  label-mismatch note in step 1 before passing bug/enhancement to --label
- Duplicate check: none found / possible duplicate → <issue url>
- Command to file it: gh issue create --repo wazuh/wazuh-dashboard-reporting \
    --title "<title>" --body-file <tmp-file> --label <label1> --label <label2>
```

Only run `gh issue create` when the user explicitly asks you to file it.
