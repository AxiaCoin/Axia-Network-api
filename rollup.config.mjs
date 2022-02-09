// Copyright 2017-2021 @axia-js/api authors & contributors
// SPDX-License-Identifier: Apache-2.0

import path from 'path';

import { createBundle } from '@axia-js/dev/config/rollup.js';

const pkgs = [
  '@axia-js/api',
  '@axia-js/api-contract',
  '@axia-js/types'
];

const external = [
  ...pkgs,
  '@axia-js/keyring',
  '@axia-js/util',
  '@axia-js/util-crypto'
];

const entries = ['api-derive', 'rpc-core', 'rpc-provider', 'types-known'].reduce((all, p) => ({
  ...all,
  [`@axia-js/${p}`]: path.resolve(process.cwd(), `packages/${p}/build/bundle.js`)
}), {
  // re-exported in @axia-js/util-crypto, map directly
  '@axia-js/networks': '@axia-js/util-crypto'
});

const overrides = {};

export default pkgs.map((pkg) => {
  const override = (overrides[pkg] || {});

  return createBundle({
    external,
    pkg,
    ...override,
    entries: {
      ...entries,
      ...(override.entries || {})
    }
  });
});
