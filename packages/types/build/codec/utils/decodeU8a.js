// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { u8aToHex } from '@axia-js/util';
/**
 * Given an u8a, and an array of Type constructors, decode the u8a against the
 * types, and return an array of decoded values.
 *
 * @param u8a - The u8a to decode.
 * @param result - The result array (will be returned with values pushed)
 * @param types - The array of Constructor to decode the U8a against.
 */

export function decodeU8a(registry, u8a, _types, _keys) {
  const result = [];
  const [types, keys] = Array.isArray(_types) ? [_types, _keys || []] : [Object.values(_types), Object.keys(_types)];
  let offset = 0;

  for (let i = 0; i < types.length; i++) {
    const Type = types[i];

    try {
      const value = new Type(registry, u8a.subarray(offset));
      result.push(value);
      offset += value.encodedLength;
    } catch (error) {
      let rawType;

      try {
        rawType = new Type(registry).toRawType();
      } catch {
        rawType = '';
      }

      throw new Error(`decodeU8a: failed at ${u8aToHex(u8a.subarray(offset).slice(0, 8))}… on ${keys[i] ? `${keys[i]}` : ''}${rawType ? `: ${rawType}` : ''}:: ${error.message}`);
    }
  }

  return result;
}