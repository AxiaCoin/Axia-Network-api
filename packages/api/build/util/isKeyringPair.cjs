"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isKeyringPair = isKeyringPair;

var _util = require("@axia-js/util");

// Copyright 2017-2021 @axia-js/api authors & contributors
// SPDX-License-Identifier: Apache-2.0
function isKeyringPair(account) {
  return (0, _util.isFunction)(account.sign);
}