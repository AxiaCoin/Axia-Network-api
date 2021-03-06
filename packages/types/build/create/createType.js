// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, isHex, isU8a, u8aEq, u8aToHex, u8aToU8a } from '@axia-js/util';
import { Option } from "../codec/Option.js";
import { createClass } from "./createClass.js"; // With isPedantic, actually check that the encoding matches that supplied. This
// is much slower, but verifies that we have the correct types defined

function checkInstance(created, matcher) {
  const u8a = created.toU8a();
  const rawType = created.toRawType();
  const isOk = // full match, all ok
  u8aEq(u8a, matcher) || // on a length-prefixed type, just check the actual length
  ['Bytes', 'Text', 'Type'].includes(rawType) && matcher.length === created.length || // when the created is empty and matcher is also empty, let it slide...
  created.isEmpty && matcher.every(v => !v);
  assert(isOk, () => `${rawType}:: Decoded input doesn't match input, received ${u8aToHex(matcher, 512)} (${matcher.length} bytes), created ${u8aToHex(u8a, 512)} (${u8a.length} bytes)`);
}

function checkPedantic(created, [value], isPedantic = false) {
  if (isPedantic) {
    if (isU8a(value)) {
      checkInstance(created, value);
    } else if (isHex(value)) {
      checkInstance(created, u8aToU8a(value));
    }
  }
} // Initializes a type with a value. This also checks for fallbacks and in the cases
// where isPedantic is specified (storage decoding), also check the format/structure


function initType(registry, Type, params = [], {
  blockHash,
  isOptional,
  isPedantic
} = {}) {
  const created = new (isOptional ? Option.with(Type) : Type)(registry, ...params);
  checkPedantic(created, params, isPedantic);

  if (blockHash) {
    created.createdAtHash = createType(registry, 'Hash', blockHash);
  } // eslint-disable-next-line @typescript-eslint/no-unsafe-return


  return created;
} // An unsafe version of the `createType` below. It's unsafe because the `type`
// argument here can be any string, which, when it cannot parse, will yield a
// runtime error.


export function createTypeUnsafe(registry, type, params = [], options = {}) {
  let Clazz = null;
  let firstError = null;

  try {
    Clazz = createClass(registry, type);
    return initType(registry, Clazz, params, options);
  } catch (error) {
    firstError = new Error(`createType(${type}):: ${error.message}`);
  }

  if (Clazz && Clazz.__fallbackType) {
    try {
      Clazz = createClass(registry, Clazz.__fallbackType);
      return initType(registry, Clazz, params, options);
    } catch {// swallow, we will throw the first error again
    }
  }

  throw firstError;
}
/**
 * Create an instance of a `type` with a given `params`.
 * @param type - A recognizable string representing the type to create an
 * instance from
 * @param params - The value to instantiate the type with
 */

export function createType(registry, type, ...params) {
  return createTypeUnsafe(registry, type, params);
}