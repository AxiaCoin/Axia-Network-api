"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mockApi = void 0;

var _types = require("@axia-js/types");

// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
const registry = new _types.TypeRegistry();
const mockApi = {
  isConnected: true,
  registry,
  tx: {
    contracts: {
      instantiateWithCode: () => {
        throw new Error('mock');
      }
    }
  }
};
exports.mockApi = mockApi;