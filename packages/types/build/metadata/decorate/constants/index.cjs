"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decorateConstants = decorateConstants;

var _util = require("@axia-js/util");

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decorateConstants(registry, _ref, _metaVersion) {
  let {
    pallets
  } = _ref;
  return pallets.reduce((result, _ref2) => {
    let {
      constants,
      name
    } = _ref2;

    if (constants.isEmpty) {
      return result;
    } // For access, we change the index names, i.e. Democracy.EnactmentPeriod -> democracy.enactmentPeriod


    result[(0, _util.stringCamelCase)(name)] = constants.reduce((newModule, meta) => {
      const codec = registry.createTypeUnsafe(registry.createLookupType(meta.type), [(0, _util.hexToU8a)(meta.value.toHex())]);
      codec.meta = meta;
      newModule[(0, _util.stringCamelCase)(meta.name)] = codec;
      return newModule;
    }, {});
    return result;
  }, {});
}