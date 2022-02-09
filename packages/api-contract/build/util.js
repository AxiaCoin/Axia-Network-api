// Copyright 2017-2021 @axia-js/rpc-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { isBigInt, isBn, isNumber, isString } from '@axia-js/util';
export function applyOnEvent(result, types, fn) {
  if (result.isInBlock || result.isFinalized) {
    const records = result.filterRecords('contracts', types);

    if (records.length) {
      return fn(records);
    }
  }

  return undefined;
}
export function isOptions(options) {
  return !(isBn(options) || isBigInt(options) || isNumber(options) || isString(options));
}
export function extractOptions(value, params) {
  const gasLimit = params.shift();
  return [{
    gasLimit,
    value
  }, params];
}