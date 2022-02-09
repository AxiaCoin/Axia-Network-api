// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import metadataStatic from '@axia-js/types-support/metadata/static-axlib';
import { compactAddLength, u8aToU8a } from '@axia-js/util';

import { TypeRegistry } from '../../../create';
import { Metadata } from '../../Metadata';
import { axlib } from './axlib';

const registry = new TypeRegistry();
const metadata = new Metadata(registry, metadataStatic);

registry.setMetadata(metadata);

// console.log(JSON.stringify(registry.lookup.types));

describe('axlib', (): void => {
  const code = axlib.code(registry);

  it('creates a well-known :code key', (): void => {
    expect(
      code()
    ).toEqual(
      compactAddLength(u8aToU8a(':code'))
    );
  });

  it('has the correct metadata', (): void => {
    expect(
      code.meta.type.isPlain
    ).toEqual(true);
  });
});
