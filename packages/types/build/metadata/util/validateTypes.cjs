"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateTypes = validateTypes;

var _util = require("@axia-js/util");

var _extractTypes = require("./extractTypes.cjs");

var _flattenUniq = require("./flattenUniq.cjs");

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
const l = (0, _util.logger)('metadata');
/** @internal */

function validateTypes(registry, throwError, types) {
  const missing = (0, _flattenUniq.flattenUniq)((0, _extractTypes.extractTypes)(types)).filter(type => !registry.hasType(type)).sort();

  if (missing.length !== 0) {
    const message = `Unknown types found, no types for ${missing.join(', ')}`;

    if (throwError) {
      throw new Error(message);
    } else {
      l.warn(message);
    }
  }

  return types;
}