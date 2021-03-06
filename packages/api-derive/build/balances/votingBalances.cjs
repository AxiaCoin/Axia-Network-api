"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.votingBalances = votingBalances;

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function votingBalances(instanceId, api) {
  return (0, _index.memo)(instanceId, addresses => !addresses || !addresses.length ? (0, _rxjs.of)([]) : (0, _rxjs.combineLatest)(addresses.map(accountId => api.derive.balances.account(accountId))));
}