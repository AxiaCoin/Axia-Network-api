"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.i256 = void 0;

var _Int = require("../codec/Int.cjs");

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name i256
 * @description
 * A 256-bit signed integer
 */
class i256 extends _Int.Int.with(256) {
  constructor() {
    super(...arguments);
    this.__IntType = 'i256';
  }

}

exports.i256 = i256;