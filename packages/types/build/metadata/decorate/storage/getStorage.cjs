"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStorage = getStorage;

var _axlib = require("./axlib.cjs");

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** @internal */
function getStorage(registry) {
  return {
    axlib: Object.entries(_axlib.axlib).reduce((storage, _ref) => {
      let [key, fn] = _ref;
      storage[key] = fn(registry);
      return storage;
    }, {})
  };
}