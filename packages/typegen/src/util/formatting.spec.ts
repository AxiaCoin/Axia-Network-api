// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TypeRegistry } from '@axia-js/types';

import { formatType } from './formatting';

describe('formatType', (): void => {
  const registry = new TypeRegistry();

  it('handles nested Tuples', (): void => {
    expect(
      formatType(registry, {}, '(AccountId, (Balance, u32), u64)', {
        codecTypes: {},
        definitions: {},
        extrinsicTypes: {},
        genericTypes: {},
        ignoredTypes: [],
        localTypes: {},
        metadataTypes: {},
        primitiveTypes: {},
        typeToModule: {},
        typesTypes: {}
      })
    ).toEqual('ITuple<[AccountId, ITuple<[Balance, u32]>, u64]>');
  });
});
