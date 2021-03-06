import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { combineLatest, map, switchMap } from 'rxjs';
import { BN, BN_ZERO } from '@axia-js/util';
import { memo } from "../util/index.js";
const QUERY_OPTS = {
  withDestination: true,
  withLedger: true,
  withNominations: true,
  withPrefs: true
};

function groupByEra(list) {
  return list.reduce((map, {
    era,
    value
  }) => {
    const key = era.toString();
    map[key] = (map[key] || BN_ZERO).add(value.unwrap());
    return map;
  }, {});
}

function calculateUnlocking(api, stakingLedger, sessionInfo) {
  const results = Object.entries(groupByEra(((stakingLedger === null || stakingLedger === void 0 ? void 0 : stakingLedger.unlocking) || []).filter(({
    era
  }) => era.unwrap().gt(sessionInfo.activeEra)))).map(([eraString, value]) => ({
    remainingEras: new BN(eraString).isub(sessionInfo.activeEra),
    value: api.registry.createType('Balance', value)
  }));
  return results.length ? results : undefined;
}

function redeemableSum(api, stakingLedger, sessionInfo) {
  return api.registry.createType('Balance', ((stakingLedger === null || stakingLedger === void 0 ? void 0 : stakingLedger.unlocking) || []).reduce((total, {
    era,
    value
  }) => {
    return sessionInfo.activeEra.gte(era.unwrap()) ? total.iadd(value.unwrap()) : total;
  }, new BN(0)));
}

function parseResult(api, sessionInfo, keys, query) {
  return _objectSpread(_objectSpread(_objectSpread({}, keys), query), {}, {
    redeemable: redeemableSum(api, query.stakingLedger, sessionInfo),
    unlocking: calculateUnlocking(api, query.stakingLedger, sessionInfo)
  });
}
/**
 * @description From a list of stashes, fill in all the relevant staking details
 */


export function accounts(instanceId, api) {
  return memo(instanceId, accountIds => api.derive.session.info().pipe(switchMap(sessionInfo => combineLatest([api.derive.staking.keysMulti(accountIds), api.derive.staking.queryMulti(accountIds, QUERY_OPTS)]).pipe(map(([keys, queries]) => queries.map((query, index) => parseResult(api, sessionInfo, keys[index], query)))))));
}
/**
 * @description From a stash, retrieve the controllerId and fill in all the relevant staking details
 */

export function account(instanceId, api) {
  return memo(instanceId, accountId => api.derive.staking.accounts([accountId]).pipe(map(([first]) => first)));
}