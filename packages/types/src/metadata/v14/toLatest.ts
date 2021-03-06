// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataLatest, MetadataV14 } from '../../interfaces/metadata';
import type { Registry } from '../../types';

/**
 * Convert the Metadata (which is an alias) to latest
 * @internal
 **/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function toLatest (registry: Registry, v14: MetadataV14, _metaVersion: number): MetadataLatest {
  return v14;
}
