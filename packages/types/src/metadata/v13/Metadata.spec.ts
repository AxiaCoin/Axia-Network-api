// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axialunarData from '@axia-js/types-support/metadata/v13/axialunar-hex';
import axialunarJson from '@axia-js/types-support/metadata/v13/axialunar-json.json';
import axiaData from '@axia-js/types-support/metadata/v13/axia-hex';
import axiaJson from '@axia-js/types-support/metadata/v13/axia-json.json';
import axlibData from '@axia-js/types-support/metadata/v13/axlib-hex';
import axlibJson from '@axia-js/types-support/metadata/v13/axlib-json.json';

import { testMeta } from '../util/testUtil';

testMeta(13, {
  axialunar: {
    compare: axialunarJson as Record<string, unknown>,
    data: axialunarData,
    fails: [
      // RawSolution has 24 entries
      'SignedSubmissionOf'
    ]
  },
  axia: {
    compare: axiaJson as Record<string, unknown>,
    data: axiaData
  },
  axlib: {
    compare: axlibJson as Record<string, unknown>,
    data: axlibData
  }
});
