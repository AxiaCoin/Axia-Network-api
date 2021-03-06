import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { combineLatest, map, of, switchMap } from 'rxjs';
import { BN, bnMax, isFunction } from '@axia-js/util';
import { memo } from "../util/index.js";
const VESTING_ID = '0x76657374696e6720';

function calcLocked(api, bestNumber, locks) {
  let lockedBalance = api.registry.createType('Balance');
  let lockedBreakdown = [];
  let vestingLocked = api.registry.createType('Balance');
  let allLocked = false;

  if (Array.isArray(locks)) {
    // only get the locks that are valid until passed the current block
    lockedBreakdown = locks.filter(({
      until
    }) => !until || bestNumber && until.gt(bestNumber));
    allLocked = lockedBreakdown.some(({
      amount
    }) => amount && amount.isMax());
    vestingLocked = api.registry.createType('Balance', lockedBreakdown.filter(({
      id
    }) => id.eq(VESTING_ID)).reduce((result, {
      amount
    }) => result.iadd(amount), new BN(0))); // get the maximum of the locks according to https://github.com/axia-tech/axlib/blob/master/srml/balances/src/lib.rs#L699

    const notAll = lockedBreakdown.filter(({
      amount
    }) => amount && !amount.isMax());

    if (notAll.length) {
      lockedBalance = api.registry.createType('Balance', bnMax(...notAll.map(({
        amount
      }) => amount)));
    }
  }

  return {
    allLocked,
    lockedBalance,
    lockedBreakdown,
    vestingLocked
  };
}

function calcShared(api, bestNumber, data, locks) {
  const {
    allLocked,
    lockedBalance,
    lockedBreakdown,
    vestingLocked
  } = calcLocked(api, bestNumber, locks);
  return _objectSpread(_objectSpread({}, data), {}, {
    availableBalance: api.registry.createType('Balance', allLocked ? 0 : bnMax(new BN(0), data.freeBalance.sub(lockedBalance))),
    lockedBalance,
    lockedBreakdown,
    vestingLocked
  });
}

function calcBalances(api, [data, bestNumber, [vesting, allLocks]]) {
  const shared = calcShared(api, bestNumber, data, allLocks[0]); // Calculate the vesting balances,
  //  - offset = balance locked at startingBlock
  //  - perBlock is the unlock amount

  const emptyVest = api.registry.createType('VestingInfo');
  const {
    locked: vestingTotal,
    perBlock,
    startingBlock
  } = vesting || emptyVest;
  const isStarted = bestNumber.gt(startingBlock);
  const vestedNow = isStarted ? perBlock.mul(bestNumber.sub(startingBlock)) : new BN(0);
  const vestedBalance = vestedNow.gt(vestingTotal) ? vestingTotal : api.registry.createType('Balance', vestedNow);
  const isVesting = isStarted && !shared.vestingLocked.isZero();
  return _objectSpread(_objectSpread({}, shared), {}, {
    accountId: data.accountId,
    accountNonce: data.accountNonce,
    additional: allLocks.filter((_, index) => index !== 0).map((l, index) => calcShared(api, bestNumber, data.additional[index], l)),
    isVesting,
    vestedBalance,
    vestedClaimable: api.registry.createType('Balance', isVesting ? shared.vestingLocked.sub(vestingTotal.sub(vestedBalance)) : 0),
    vestingEndBlock: api.registry.createType('BlockNumber', isVesting ? vestingTotal.div(perBlock).add(startingBlock) : 0),
    vestingPerBlock: perBlock,
    vestingTotal
  });
} // old


function queryOld(api, accountId) {
  return api.queryMulti([[api.query.balances.locks, accountId], [api.query.balances.vesting, accountId]]).pipe(map(([locks, optVesting]) => {
    let vestingNew = null;

    if (optVesting.isSome) {
      const {
        offset: locked,
        perBlock,
        startingBlock
      } = optVesting.unwrap();
      vestingNew = api.registry.createType('VestingInfo', {
        locked,
        perBlock,
        startingBlock
      });
    }

    return [vestingNew, [locks]];
  }));
}

const isNonNullable = nullable => !!nullable; // current (balances, vesting)


function queryCurrent(api, accountId, balanceInstances = ['balances']) {
  var _api$query$vesting;

  const calls = balanceInstances.map(m => {
    var _m, _api$query;

    return ((_m = api.derive[m]) === null || _m === void 0 ? void 0 : _m.customLocks) || ((_api$query = api.query[m]) === null || _api$query === void 0 ? void 0 : _api$query.locks);
  });
  const lockEmpty = calls.map(c => !c);
  const queries = calls.filter(isNonNullable).map(c => [c, accountId]);
  return ((_api$query$vesting = api.query.vesting) !== null && _api$query$vesting !== void 0 && _api$query$vesting.vesting ? api.queryMulti([[api.query.vesting.vesting, accountId], ...queries]) // TODO We need to check module instances here as well, not only the balances module
  : queries.length ? api.queryMulti(queries).pipe(map(r => [api.registry.createType('Option<VestingInfo>'), ...r])) : of([api.registry.createType('Option<VestingInfo>')])).pipe(map(([opt, ...locks]) => {
    let offset = -1;
    return [opt.unwrapOr(null), lockEmpty.map(e => e ? api.registry.createType('Vec<BalanceLock>') : locks[++offset])];
  }));
}
/**
 * @name all
 * @param {( AccountIndex | AccountId | Address | string )} address - An accounts Id in different formats.
 * @returns An object containing the results of various balance queries
 * @example
 * <BR>
 *
 * ```javascript
 * const ALICE = 'F7Hs';
 *
 * api.derive.balances.all(ALICE, ({ accountId, lockedBalance }) => {
 *   console.log(`The account ${accountId} has a locked balance ${lockedBalance} units.`);
 * });
 * ```
 */


export function all(instanceId, api) {
  const balanceInstances = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), 'balances');
  return memo(instanceId, address => api.derive.balances.account(address).pipe(switchMap(account => {
    var _api$query$system, _api$query$balances;

    return !account.accountId.isEmpty ? combineLatest([of(account), api.derive.chain.bestNumber(), isFunction((_api$query$system = api.query.system) === null || _api$query$system === void 0 ? void 0 : _api$query$system.account) || isFunction((_api$query$balances = api.query.balances) === null || _api$query$balances === void 0 ? void 0 : _api$query$balances.account) ? queryCurrent(api, account.accountId, balanceInstances) : queryOld(api, account.accountId)]) : of([account, api.registry.createType('BlockNumber'), [null, []]]);
  }), map(result => calcBalances(api, result))));
}