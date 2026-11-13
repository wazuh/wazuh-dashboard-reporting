/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { addSuccessOrFailureToast } from '../context_menu_helpers';

describe('addSuccessOrFailureToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div class="euiGlobalToastList"></div>';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps the success toast until it is dismissed', () => {
    addSuccessOrFailureToast('success');
    jest.advanceTimersByTime(60000);

    const toast = document.getElementById('reportSuccessToast');
    expect(toast).not.toBeNull();
    expect(toast.style.display).not.toBe('none');
  });

  it('shows a single success toast when reports are generated twice', () => {
    addSuccessOrFailureToast('success');
    addSuccessOrFailureToast('success');

    expect(document.querySelectorAll('#reportSuccessToast')).toHaveLength(1);
  });

  it('still hides the failure toast after 6 seconds', () => {
    addSuccessOrFailureToast('failure');
    jest.advanceTimersByTime(6000);

    expect(document.getElementById('reportFailureToast').style.display).toBe(
      'none'
    );
  });
});
