# Versioning tools

## repository_bumper.sh

This script automates the process of updating the version and stage in the Wazuh Security Dashboards plugin repository, using only shell commands.

### Usage

```bash
./repository_bumper.sh --version VERSION --stage STAGE [--tag] [--set-as-main] [--help]
```

#### Parameters

- `--version VERSION`
  Specifies the new version (e.g., `4.6.0`).
  Required if `--tag` is not used.

- `--stage STAGE`
  Specifies the stage (e.g., `alpha0`, `beta1`, `rc2`, etc.).
  Required if `--tag` is not used.

- `--tag`
  Generate a tag version format.

- `--set-as-main`
  Enables main branch mode: version values are updated while branch references pointing to `main` are preserved.

- `--help`
  Shows help and exits.

#### Examples

```bash
./repository_bumper.sh --version 4.6.0 --stage alpha0
./repository_bumper.sh --version 4.6.0 --stage beta1
./repository_bumper.sh --version 5.1.0 --stage alpha1 --set-as-main
./repository_bumper.sh --tag --stage alpha1
./repository_bumper.sh --tag
```

### What does the script do?

1. **Validates input parameters** and shows error messages if they are incorrect.
2. **Reads the current version and stage** from `VERSION.json` and the revision from `package.json`.
3. **Compares the new version with the current one**:
   - If the version changes (major, minor, or patch), it resets the revision to `00`.
   - If the version is the same, it increments the revision.
4. **Updates the files**:
   - `VERSION.json`: Changes the `version` and `stage` fields.
   - `package.json`: Changes the `version` and `revision` fields inside the `wazuh` object.
   - `.github/workflows/5_builderpackage_reporting_plugin.yml`: Updates the default value of the `reference` input.
   - `docker/imposter/wazuh-config.yml`: Updates the specFile URL with the new version.
   - `docker/imposter/api-info/api_info.json`: Updates the API version information.
5. **Handles branch reference replacements**:
  - If `--set-as-main` is used, branch references to `main` are preserved.
  - Otherwise, `main` references in supported workflows are replaced with the target version.
6. **Logs all actions** to a log file in the `tools` directory.

### Notes

- The script must be run from anywhere inside the git repository.
- You need write permissions for the files to be modified.
- The script uses `sed` to modify files, so the file format must be consistent.

### Affected files

- `VERSION.json`
- `package.json`
- `CHANGELOG.md`
- `.github/workflows/5_builderpackage_reporting_plugin.yml` (only when not using `--set-as-main`)
- `.github/workflows/5_builderprecompiled_base-dev-environment.yml` (only when not using `--set-as-main`)
- `.github/workflows/6_builderpackage_reporting_plugin.yml` (only when not using `--set-as-main`)
- `.github/workflows/6_builderprecompiled_base-dev-environment.yml` (only when not using `--set-as-main`)
- `.github/workflows/dashboards-reports-test-and-build-workflow.yml` (only when not using `--set-as-main`)
- `.github/workflows/lint.yml` (only when not using `--set-as-main`)
- `docker/imposter/wazuh-config.yml`
- `docker/imposter/api-info/api_info.json`

### Log

Each execution generates a log file in the `tools` directory with details of the operation.

