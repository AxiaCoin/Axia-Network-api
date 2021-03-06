"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._stakerSlashes = _stakerSlashes;
exports.stakerSlashes = stakerSlashes;

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function _stakerSlashes(instanceId, api) {
  return (0, _index.memo)(instanceId, (accountId, eras, withActive) => {
    const stakerId = api.registry.createType('AccountId', accountId).toString();
    return api.derive.staking._erasSlashes(eras, withActive).pipe((0, _rxjs.map)(slashes => slashes.map(_ref => {
      let {
        era,
        nominators,
        validators
      } = _ref;
      return {
        era,
        total: nominators[stakerId] || validators[stakerId] || api.registry.createType('Balance')
      };
    })));
  });
}

function stakerSlashes(instanceId, api) {
  return (0, _index.memo)(instanceId, function (accountId) {
    let withActive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return api.derive.staking.erasHistoric(withActive).pipe((0, _rxjs.switchMap)(eras => api.derive.staking._stakerSlashes(accountId, eras, withActive)));
  });
}