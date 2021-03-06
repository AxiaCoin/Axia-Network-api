// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { hexToU8a, stringCamelCase } from '@axia-js/util';
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export function decorateConstants(registry, {
  pallets
}, _metaVersion) {
  return pallets.reduce((result, {
    constants,
    name
  }) => {
    if (constants.isEmpty) {
      return result;
    } // For access, we change the index names, i.e. Democracy.EnactmentPeriod -> democracy.enactmentPeriod


    result[stringCamelCase(name)] = constants.reduce((newModule, meta) => {
      const codec = registry.createTypeUnsafe(registry.createLookupType(meta.type), [hexToU8a(meta.value.toHex())]);
      codec.meta = meta;
      newModule[stringCamelCase(meta.name)] = codec;
      return newModule;
    }, {});
    return result;
  }, {});
}