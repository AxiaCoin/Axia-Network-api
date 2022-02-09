// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import metadataStatic from '@axia-js/types-support/metadata/static-axlib';
import { compactAddLength, u8aToU8a } from '@axia-js/util';

import { TypeRegistry } from '../../../create';
import { Metadata } from '../../Metadata';
import { getStorage } from './getStorage';

const registry = new TypeRegistry();
const metadata = new Metadata(registry, metadataStatic);

registry.setMetadata(metadata);

describe('getSorage', (): void => {
  const storage = getStorage(registry);

  it('should return well known keys', (): void => {
    expect(typeof storage.axlib).toBe('object');

    expect(storage.axlib.code()).toEqual(compactAddLength(u8aToU8a(':code')));

    expect(storage.axlib.changesTrieConfig).toBeTruthy();
    expect(storage.axlib.childStorageKeyPrefix).toBeTruthy();
    expect(storage.axlib.extrinsicIndex).toBeTruthy();
    expect(storage.axlib.heapPages).toBeTruthy();
  });
});
