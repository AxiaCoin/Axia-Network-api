"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._eraPrefs = _eraPrefs;
exports._erasPrefs = _erasPrefs;
exports.eraPrefs = eraPrefs;
exports.erasPrefs = erasPrefs;

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
const CACHE_KEY = 'eraPrefs';

function mapPrefs(era, all) {
  const validators = {};
  all.forEach(_ref => {
    let [key, prefs] = _ref;
    validators[key.args[1].toString()] = prefs;
  });
  return {
    era,
    validators
  };
}

function _eraPrefs(instanceId, api) {
  return (0, _index.memo)(instanceId, (era, withActive) => {
    const cacheKey = `${CACHE_KEY}-${era.toString()}`;
    const cached = withActive ? undefined : _index.deriveCache.get(cacheKey);
    return cached ? (0, _rxjs.of)(cached) : api.query.staking.erasValidatorPrefs.entries(era).pipe((0, _rxjs.map)(prefs => {
      const value = mapPrefs(era, prefs);
      !withActive && _index.deriveCache.set(cacheKey, value);
      return value;
    }));
  });
}

function eraPrefs(instanceId, api) {
  return (0, _index.memo)(instanceId, era => api.derive.staking._eraPrefs(era, true));
}

function _erasPrefs(instanceId, api) {
  return (0, _index.memo)(instanceId, (eras, withActive) => eras.length ? (0, _rxjs.combineLatest)(eras.map(era => api.derive.staking._eraPrefs(era, withActive))) : (0, _rxjs.of)([]));
}

function erasPrefs(instanceId, api) {
  return (0, _index.memo)(instanceId, function () {
    let withActive = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    return api.derive.staking.erasHistoric(withActive).pipe((0, _rxjs.switchMap)(eras => api.derive.staking._erasPrefs(eras, withActive)));
  });
}