"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Code = void 0;

var _api = require("@axia-js/api");

var _index = require("../base/index.cjs");

// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
class Code extends _index.Code {
  constructor(api, abi, wasm) {
    super(api, abi, wasm, _api.decorateMethodPromise);
  }

}

exports.Code = Code;