/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// Wazuh: Warn when a saved search record limit is above reports.csv.maxRows,
// the row cap the server applies. The setting is registered by wazuh-core.
import React from 'react';
import { EuiCallOut, EuiLink, EuiSpacer } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { uiSettingsService } from './settings_service';

export const REPORTS_CSV_MAX_ROWS_SETTING = 'reports.csv.maxRows';
// Same fallback as the server (DEFAULT_MAX_SIZE).
export const DEFAULT_MAX_ROWS = 10000;

export const getMaxRows = (): number =>
  Number(uiSettingsService.get(REPORTS_CSV_MAX_ROWS_SETTING)) ||
  DEFAULT_MAX_ROWS;

export const RowCapCallout = ({ limit }: { limit: number | string }) => {
  const maxRows = getMaxRows();
  if (!(Number(limit) > maxRows)) {
    return null;
  }
  const advancedSettingsUrl = uiSettingsService
    .getHttpClient()
    ?.basePath.prepend(
      `/app/management/opensearch-dashboards/settings/${REPORTS_CSV_MAX_ROWS_SETTING}`
    );

  return (
    <>
      <EuiCallOut
        data-test-subj="reportsRowCapCallout"
        color="warning"
        iconType="alert"
        size="s"
        title={
          <FormattedMessage
            id="opensearch.reports.rowCapCallout.title"
            defaultMessage="This report will include up to {maxRows} rows"
            values={{ maxRows: maxRows.toLocaleString() }}
          />
        }
      >
        <p>
          <FormattedMessage
            id="opensearch.reports.rowCapCallout.description"
            defaultMessage="Large reports can slow down or crash the dashboard, so reports are limited by {settingName} in {advancedSettingsLink}."
            values={{
              settingName: <strong>{REPORTS_CSV_MAX_ROWS_SETTING}</strong>,
              advancedSettingsLink: (
                <EuiLink
                  data-test-subj="reportsRowCapCalloutAdvancedSettingsLink"
                  href={advancedSettingsUrl}
                  target="_blank"
                >
                  <FormattedMessage
                    id="opensearch.reports.rowCapCallout.advancedSettingsLinkText"
                    defaultMessage="Dashboard Management > Advanced settings"
                  />
                </EuiLink>
              ),
            }}
          />
        </p>
      </EuiCallOut>
      <EuiSpacer size="xs" />
    </>
  );
};
