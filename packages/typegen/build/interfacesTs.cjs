"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = main;

var _index = require("./generate/index.cjs");

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
function main() {
  (0, _index.generateDefaultLookup)();
  (0, _index.generateDefaultInterface)();
  (0, _index.generateDefaultConsts)();
  (0, _index.generateDefaultErrors)();
  (0, _index.generateDefaultEvents)();
  (0, _index.generateDefaultQuery)();
  (0, _index.generateDefaultTx)();
  (0, _index.generateDefaultRpc)();
  (0, _index.generateDefaultTsDef)();
}