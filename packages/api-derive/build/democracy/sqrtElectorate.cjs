"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sqrtElectorate = sqrtElectorate;

var _rxjs = require("rxjs");

var _util = require("@axia-js/util");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function sqrtElectorate(instanceId, api) {
  return (0, _index.memo)(instanceId, () => api.query.balances.totalIssuance().pipe((0, _rxjs.map)(totalIssuance => (0, _util.bnSqrt)(totalIssuance))));
}