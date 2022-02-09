// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StorageEntry } from '../../../primitive/types';
import type { Registry } from '../../../types';
import type { Storage } from '../types';

import { axlib } from './axlib';

/** @internal */
export function getStorage (registry: Registry): Storage {
  return {
    axlib: Object
      .entries(axlib)
      .reduce((storage: Record<string, StorageEntry>, [key, fn]): Record<string, StorageEntry> => {
        (storage as Record<string, unknown>)[key] = fn(registry);

        return storage;
      }, {})
  };
}
