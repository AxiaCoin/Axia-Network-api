// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axlibData from '@axia-js/types-support/metadata/v12/axlib-hex';
import axlibJson from '@axia-js/types-support/metadata/v12/axlib-json.json';

import { testMeta } from '../util/testUtil';

testMeta(12, {
  axlib: {
    compare: axlibJson as Record<string, unknown>,
    data: axlibData
  }
});
