"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Contract = void 0;

var _api = require("@axia-js/api");

var _index = require("../base/index.cjs");

// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
class Contract extends _index.Contract {
  constructor(api, abi, address) {
    super(api, abi, address, _api.decorateMethodPromise);
  }

}

exports.Contract = Contract;