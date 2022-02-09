"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flattenUniq = flattenUniq;

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** @internal */
function flattenUniq(list) {
  let start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return [...new Set(list.reduce((result, entry) => {
    if (Array.isArray(entry)) {
      return flattenUniq(entry, result);
    }

    result.push(entry);
    return result;
  }, start))];
}