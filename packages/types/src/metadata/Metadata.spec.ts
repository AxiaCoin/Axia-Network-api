// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axialunar from '@axia-js/types-support/metadata/static-axialunar';
import axia from '@axia-js/types-support/metadata/static-axia';
import axlib from '@axia-js/types-support/metadata/static-axlib';

import { TypeRegistry } from '../create';
import { Metadata } from './Metadata';

const allData: Record<string, string> = {
  axialunar,
  axia,
  axlib
};

describe.each(['axialunar', 'axia', 'axlib'])('%s metadata', (type): void => {
  const metadata = new Metadata(new TypeRegistry(), allData[type]);

  it('allows creation from hex', (): void => {
    expect(
      new Metadata(new TypeRegistry(), metadata.toHex()).toJSON()
    ).toEqual(metadata.toJSON());
  });

  it('has a sane toCallsOnly', (): void => {
    expect(
      metadata.asCallsOnly.toU8a().length > 65536
    ).toBe(true);
  });
});
