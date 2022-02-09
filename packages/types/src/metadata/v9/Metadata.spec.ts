// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axlibData from '@axia-js/types-support/metadata/v9/axlib-hex';
import axlibJson from '@axia-js/types-support/metadata/v9/axlib-json.json';

import { testMeta } from '../util/testUtil';

testMeta(9, {
  axlib: {
    compare: axlibJson as Record<string, unknown>,
    data: axlibData
  }
}, false);
