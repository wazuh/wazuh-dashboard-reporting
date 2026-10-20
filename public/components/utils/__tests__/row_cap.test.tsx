/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// Wazuh: Added coverage for the saved search row cap callout.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@osd/i18n/react';
import { RowCapCallout, getMaxRows } from '../row_cap';
import { uiSettingsService } from '../settings_service';

jest.mock('../settings_service', () => ({
  uiSettingsService: {
    get: jest.fn(),
    getHttpClient: () => ({
      basePath: { prepend: (path: string) => `/base${path}` },
    }),
  },
}));

const setMaxRows = (value: number | string) =>
  (uiSettingsService.get as jest.Mock).mockReturnValue(value);

const renderCallout = (limit: number) =>
  render(
    <I18nProvider>
      <RowCapCallout limit={limit} />
    </I18nProvider>
  );

describe('RowCapCallout', () => {
  test('is hidden when the limit is within reports.csv.maxRows', () => {
    setMaxRows(20000);
    renderCallout(20000);
    expect(screen.queryByTestId('reportsRowCapCallout')).toBeNull();
  });

  test('shows the cap and links to the setting when the limit is above it', () => {
    setMaxRows(20000);
    renderCallout(1000000);
    expect(screen.getByTestId('reportsRowCapCallout')).toHaveTextContent(
      'This report will include up to 20,000 rows'
    );
    expect(
      screen.getByTestId('reportsRowCapCalloutAdvancedSettingsLink')
    ).toHaveAttribute(
      'href',
      '/base/app/management/opensearch-dashboards/settings/reports.csv.maxRows'
    );
  });

  test('falls back to 10000 when the setting is not registered', () => {
    // settings_service returns '' for a missing setting.
    setMaxRows('');
    expect(getMaxRows()).toBe(10000);
    renderCallout(15000);
    expect(screen.getByTestId('reportsRowCapCallout')).toHaveTextContent(
      'up to 10,000 rows'
    );
  });
});
