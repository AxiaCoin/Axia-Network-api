"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.i8 = void 0;

var _Int = require("../codec/Int.cjs");

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name i8
 * @description
 * An 8-bit signed integer
 */
class i8 extends _Int.Int.with(8) {
  constructor() {
    super(...arguments);
    this.__IntType = 'i8';
  }

}

exports.i8 = i8;