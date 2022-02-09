"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Blueprint = void 0;

var _api = require("@axia-js/api");

var _index = require("../base/index.cjs");

// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
class Blueprint extends _index.Blueprint {
  constructor(api, abi, codeHash) {
    super(api, abi, codeHash, _api.decorateMethodRx);
  }

}

exports.Blueprint = Blueprint;