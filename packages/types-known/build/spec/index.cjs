"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _centrifugeChain = _interopRequireDefault(require("./centrifuge-chain.cjs"));

var _axialunar = _interopRequireDefault(require("./axialunar.cjs"));

var _node = _interopRequireDefault(require("./node.cjs"));

var _nodeTemplate = _interopRequireDefault(require("./node-template.cjs"));

var _axia = _interopRequireDefault(require("./axia.cjs"));

var _betanet = _interopRequireDefault(require("./betanet.cjs"));

var _shell = _interopRequireDefault(require("./shell.cjs"));

var _statemint = _interopRequireDefault(require("./statemint.cjs"));

var _alphanet = _interopRequireDefault(require("./alphanet.cjs"));

// Copyright 2017-2021 @axia-js/types-known authors & contributors
// SPDX-License-Identifier: Apache-2.0
// Type overrides for specific spec types & versions as given in runtimeVersion
const typesSpec = {
  'centrifuge-chain': _centrifugeChain.default,
  axialunar: _axialunar.default,
  node: _node.default,
  'node-template': _nodeTemplate.default,
  axia: _axia.default,
  betanet: _betanet.default,
  shell: _shell.default,
  statemine: _statemint.default,
  statemint: _statemint.default,
  alphanet: _alphanet.default,
  westmint: _statemint.default
};
var _default = typesSpec;
exports.default = _default;