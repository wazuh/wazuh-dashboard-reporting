/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// WAZUH: gives the visual report access to the sidecar (issue wazuh-dashboard-plugins#9698)

import { OverlayStart } from '../../../../../src/core/public';

let overlays: OverlayStart | undefined;

export const overlaysService = {
  init: (overlayStart: OverlayStart) => {
    overlays = overlayStart;
  },
  getOverlays: () => overlays,
};
