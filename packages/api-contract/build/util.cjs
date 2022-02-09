"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyOnEvent = applyOnEvent;
exports.extractOptions = extractOptions;
exports.isOptions = isOptions;

var _util = require("@axia-js/util");

// Copyright 2017-2021 @axia-js/rpc-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
function applyOnEvent(result, types, fn) {
  if (result.isInBlock || result.isFinalized) {
    const records = result.filterRecords('contracts', types);

    if (records.length) {
      return fn(records);
    }
  }

  return undefined;
}

function isOptions(options) {
  return !((0, _util.isBn)(options) || (0, _util.isBigInt)(options) || (0, _util.isNumber)(options) || (0, _util.isString)(options));
}

function extractOptions(value, params) {
  const gasLimit = params.shift();
  return [{
    gasLimit,
    value
  }, params];
}