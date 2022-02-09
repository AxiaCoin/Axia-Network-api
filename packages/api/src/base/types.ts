// Copyright 2017-2021 @axia-js/api authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Metadata } from '@axia-js/types/metadata';
import type { DecoratedMeta } from '@axia-js/types/metadata/decorate/types';
import type { Text } from '@axia-js/types/primitive';
import type { Registry } from '@axia-js/types/types';
import type { BN } from '@axia-js/util';
import type { ApiDecoration, ApiTypes } from '../types';

export interface VersionedRegistry<ApiType extends ApiTypes> {
  decoratedApi?: ApiDecoration<ApiType>;
  decoratedMeta?: DecoratedMeta;
  isDefault?: boolean;
  lastBlockHash?: Uint8Array | null;
  metadata: Metadata;
  registry: Registry;
  specName: Text;
  specVersion: BN;
}
