/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// WAZUH: file added to cover the report footer missing from the capture (issue #226)

import html2canvas from 'html2canvas';
import { BehaviorSubject } from 'rxjs';
import { generateReport } from '../generate_report';
import { overlaysService } from '../../utils/overlays_service';
import { uiSettingsService } from '../../utils/settings_service';

jest.mock('html2canvas', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('jspdf', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('tesseract.js', () => ({ createWorker: jest.fn() }));
jest.mock('uuid', () => ({ v1: () => 'test-uuid' }));
jest.mock('../../utils/overlays_service', () => ({
  overlaysService: { getOverlays: jest.fn() },
}));
jest.mock('../../utils/settings_service', () => ({
  uiSettingsService: {
    get: jest.fn(),
    getHttpClient: jest.fn(),
  },
}));

const HEADER_MARKER = 'UXA2-HEADER-MARKER';
const FOOTER_MARKER = 'UXA2-FOOTER-MARKER';

const buildReport = () => ({
  report_definition: {
    report_params: {
      report_name: 'test report',
      report_source: 'Dashboard',
      core_params: {
        report_format: 'png',
        header: HEADER_MARKER,
        footer: FOOTER_MARKER,
      },
    },
  },
});

/**
 * `html2canvas` is mocked, so it never calls `onclone`. Snapshot the state of the
 * document at the moment it is called, which is what a real capture rasterises.
 */
const captureCallState = () => {
  const state: {
    html?: string;
    height?: number;
    footerBottom?: number;
    footerPosition?: string;
  } = {};
  (html2canvas as jest.Mock).mockImplementation((_element, options) => {
    state.html = document.body.innerHTML;
    state.height = options.height;
    const footer = document.querySelector('#reportingFooter');
    const footerWrapper = footer?.closest<HTMLElement>('.reportWrapper');
    state.footerPosition = footerWrapper?.style.position;
    state.footerBottom = footer
      ? footer.getBoundingClientRect().bottom + window.scrollY
      : undefined;
    return Promise.resolve({
      width: 100,
      height: 100,
      toDataURL: () => 'data:image/png;base64,',
    });
  });
  return state;
};

describe('generateReport', () => {
  beforeEach(() => {
    // The PNG branch downloads through an anchor, which jsdom cannot navigate
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation();
    document.body.innerHTML = '<div id="dashboardViewport">content</div>';
    (uiSettingsService.getHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue(buildReport()),
    });
  });

  it.each([
    ['foreign object rendering enabled', true],
    ['foreign object rendering disabled', false],
  ])(
    'captures the header and the footer with %s',
    async (_name, useForeignObjectRendering) => {
      (uiSettingsService.get as jest.Mock).mockImplementation((key: string) =>
        key === 'reporting:useFOR' ? useForeignObjectRendering : false
      );
      const state = captureCallState();

      await generateReport('report-id', 0);

      expect(state.html).toContain(HEADER_MARKER);
      expect(state.html).toContain(FOOTER_MARKER);
      // The footer must fit inside the captured area, otherwise it is cropped out
      expect(state.height).toBeGreaterThanOrEqual(state.footerBottom!);
      /* `html2canvas` lays the clone out in a viewport as tall as the capture, which
       * inflates the `vh`/`%` sized ancestors of the footer and pushes it off the
       * bottom edge unless it is pinned out of the flow.
       */
      expect(state.footerPosition).toBe('absolute');
    }
  );

  it('removes the injected header, footer and styles once done', async () => {
    (uiSettingsService.get as jest.Mock).mockImplementation(
      (key: string) => key === 'reporting:useFOR'
    );
    captureCallState();

    await generateReport('report-id', 0);

    expect(document.querySelectorAll('.reportWrapper')).toHaveLength(0);
    expect(document.querySelectorAll('.reportInjectedStyles')).toHaveLength(0);
  });

  // WAZUH: issue wazuh-dashboard-plugins#9698
  describe('docked sidecar', () => {
    const mockSidecar = (config?: {
      dockedMode: string;
      isHidden?: boolean;
    }) => {
      const config$ = new BehaviorSubject(config);
      const sidecar = {
        getSidecarConfig$: () => config$,
        hide: jest.fn(() =>
          config$.next({ ...config$.value!, isHidden: true })
        ),
        show: jest.fn(() =>
          config$.next({ ...config$.value!, isHidden: false })
        ),
      };
      (overlaysService.getOverlays as jest.Mock).mockReturnValue({ sidecar });
      return { sidecar, config$ };
    };

    beforeEach(() => {
      (uiSettingsService.get as jest.Mock).mockReturnValue(false);
    });

    afterEach(() => {
      (overlaysService.getOverlays as jest.Mock).mockReset();
    });

    it('hides a visible sidecar during the capture and shows it afterwards', async () => {
      const { sidecar, config$ } = mockSidecar({ dockedMode: 'right' });
      let hiddenAtCapture: boolean | undefined;
      captureCallState();
      const capture = (html2canvas as jest.Mock).getMockImplementation()!;
      (html2canvas as jest.Mock).mockImplementation((...args) => {
        hiddenAtCapture = config$.value?.isHidden;
        return capture(...args);
      });

      await generateReport('report-id', 0);

      expect(hiddenAtCapture).toBe(true);
      expect(sidecar.hide).toHaveBeenCalledTimes(1);
      expect(sidecar.show).toHaveBeenCalledTimes(1);
      expect(config$.value?.isHidden).toBe(false);
    });

    it('shows the sidecar again when the capture fails', async () => {
      const { sidecar, config$ } = mockSidecar({ dockedMode: 'right' });
      (html2canvas as jest.Mock).mockRejectedValue(new Error('capture failed'));

      await expect(generateReport('report-id', 0)).rejects.toThrow(
        'capture failed'
      );

      expect(sidecar.show).toHaveBeenCalledTimes(1);
      expect(config$.value?.isHidden).toBe(false);
    });

    it('shows the sidecar again when the report cannot be loaded', async () => {
      const { sidecar } = mockSidecar({ dockedMode: 'right' });
      (uiSettingsService.getHttpClient as jest.Mock).mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('not found')),
      });

      await expect(generateReport('report-id', 0)).rejects.toThrow('not found');

      expect(sidecar.hide).toHaveBeenCalledTimes(1);
      expect(sidecar.show).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['no sidecar is open', undefined],
      [
        'the sidecar is already hidden',
        { dockedMode: 'right', isHidden: true },
      ],
    ])('leaves the sidecar alone when %s', async (_name, config) => {
      const { sidecar } = mockSidecar(config);
      captureCallState();

      await generateReport('report-id', 0);

      expect(sidecar.hide).not.toHaveBeenCalled();
      expect(sidecar.show).not.toHaveBeenCalled();
    });

    it('works when the overlays are not available', async () => {
      captureCallState();

      await expect(generateReport('report-id', 0)).resolves.toBe(true);
    });
  });
});
