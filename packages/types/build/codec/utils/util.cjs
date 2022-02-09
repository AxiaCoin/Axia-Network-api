"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasEq = hasEq;

var _util = require("@axia-js/util");

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
function hasEq(o) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (0, _util.isFunction)(o.eq);
}