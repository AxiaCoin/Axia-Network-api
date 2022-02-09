// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @internal
 **/
export function toV13(registry, metadata) {
  return registry.createType('MetadataV13', metadata);
}