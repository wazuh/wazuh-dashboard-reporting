/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createReport } from '../createReport';
import { createSavedSearchReport } from '../../utils/savedSearchReportHelper';
import { REPORT_TYPE } from '../../utils/constants';

jest.mock('../saveReport', () => ({
  saveReport: jest
    .fn()
    .mockResolvedValue({ reportInstance: { id: 'report-id' } }),
}));

jest.mock('../../utils/helpers', () => ({ getFileName: jest.fn() }));

jest.mock('../../utils/savedSearchReportHelper', () => ({
  createSavedSearchReport: jest
    .fn()
    .mockResolvedValue({ timeCreated: 0, dataUrl: '', fileName: 'r.csv' }),
}));

const buildReport = (limit: number) => ({
  report_definition: {
    report_params: {
      report_source: REPORT_TYPE.savedSearch,
      core_params: { limit },
    },
  },
});

const buildContext = (maxRows: number | undefined) => {
  const logger = { warn: jest.fn() };
  const context = {
    reporting_plugin: {
      logger,
      opensearchReportsClient: { asScoped: jest.fn() },
    },
    core: {
      opensearch: { legacy: { client: {} } },
      uiSettings: { client: { get: jest.fn().mockResolvedValue(maxRows) } },
    },
  };
  return { context, logger };
};

const config = { get: jest.fn(), osdConfig: { get: jest.fn() } };
const request = { query: {}, headers: {} };

const generate = (limit: number, maxRows: number | undefined) => {
  const { context, logger } = buildContext(maxRows);
  return createReport(
    request as any,
    context as any,
    buildReport(limit) as any,
    config as any
  ).then(() => logger);
};

const usedLimit = () =>
  (createSavedSearchReport as jest.Mock).mock.calls[0][0].report_definition
    .report_params.core_params.limit;

describe('createReport saved search row cap', () => {
  test('caps the limit at reports.csv.maxRows', async () => {
    const logger = await generate(1000000, 20000);
    expect(usedLimit()).toBe(20000);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  test('keeps a limit below the cap', async () => {
    const logger = await generate(500, 20000);
    expect(usedLimit()).toBe(500);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('falls back to 10000 when the setting is not registered', async () => {
    await generate(1000000, undefined);
    expect(usedLimit()).toBe(10000);
  });
});
