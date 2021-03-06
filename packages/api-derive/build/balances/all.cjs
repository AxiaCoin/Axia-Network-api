"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.all = all;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _rxjs = require("rxjs");

var _util = require("@axia-js/util");

var _index = require("../util/index.cjs");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const VESTING_ID = '0x76657374696e6720';

function calcLocked(api, bestNumber, locks) {
  let lockedBalance = api.registry.createType('Balance');
  let lockedBreakdown = [];
  let vestingLocked = api.registry.createType('Balance');
  let allLocked = false;

  if (Array.isArray(locks)) {
    // only get the locks that are valid until passed the current block
    lockedBreakdown = locks.filter(_ref => {
      let {
        until
      } = _ref;
      return !until || bestNumber && until.gt(bestNumber);
    });
    allLocked = lockedBreakdown.some(_ref2 => {
      let {
        amount
      } = _ref2;
      return amount && amount.isMax();
    });
    vestingLocked = api.registry.createType('Balance', lockedBreakdown.filter(_ref3 => {
      let {
        id
      } = _ref3;
      return id.eq(VESTING_ID);
    }).reduce((result, _ref4) => {
      let {
        amount
      } = _ref4;
      return result.iadd(amount);
    }, new _util.BN(0))); // get the maximum of the locks according to https://github.com/axia-tech/axlib/blob/master/srml/balances/src/lib.rs#L699

    const notAll = lockedBreakdown.filter(_ref5 => {
      let {
        amount
      } = _ref5;
      return amount && !amount.isMax();
    });

    if (notAll.length) {
      lockedBalance = api.registry.createType('Balance', (0, _util.bnMax)(...notAll.map(_ref6 => {
        let {
          amount
        } = _ref6;
        return amount;
      })));
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
    availableBalance: api.registry.createType('Balance', allLocked ? 0 : (0, _util.bnMax)(new _util.BN(0), data.freeBalance.sub(lockedBalance))),
    lockedBalance,
    lockedBreakdown,
    vestingLocked
  });
}

function calcBalances(api, _ref7) {
  let [data, bestNumber, [vesting, allLocks]] = _ref7;
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
  const vestedNow = isStarted ? perBlock.mul(bestNumber.sub(startingBlock)) : new _util.BN(0);
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
  return api.queryMulti([[api.query.balances.locks, accountId], [api.query.balances.vesting, accountId]]).pipe((0, _rxjs.map)(_ref8 => {
    let [locks, optVesting] = _ref8;
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


function queryCurrent(api, accountId) {
  var _api$query$vesting;

  let balanceInstances = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['balances'];
  const calls = balanceInstances.map(m => {
    var _m, _api$query;

    return ((_m = api.derive[m]) === null || _m === void 0 ? void 0 : _m.customLocks) || ((_api$query = api.query[m]) === null || _api$query === void 0 ? void 0 : _api$query.locks);
  });
  const lockEmpty = calls.map(c => !c);
  const queries = calls.filter(isNonNullable).map(c => [c, accountId]);
  return ((_api$query$vesting = api.query.vesting) !== null && _api$query$vesting !== void 0 && _api$query$vesting.vesting ? api.queryMulti([[api.query.vesting.vesting, accountId], ...queries]) // TODO We need to check module instances here as well, not only the balances module
  : queries.length ? api.queryMulti(queries).pipe((0, _rxjs.map)(r => [api.registry.createType('Option<VestingInfo>'), ...r])) : (0, _rxjs.of)([api.registry.createType('Option<VestingInfo>')])).pipe((0, _rxjs.map)(_ref9 => {
    let [opt, ...locks] = _ref9;
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


function all(instanceId, api) {
  const balanceInstances = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), 'balances');
  return (0, _index.memo)(instanceId, address => api.derive.balances.account(address).pipe((0, _rxjs.switchMap)(account => {
    var _api$query$system, _api$query$balances;

    return !account.accountId.isEmpty ? (0, _rxjs.combineLatest)([(0, _rxjs.of)(account), api.derive.chain.bestNumber(), (0, _util.isFunction)((_api$query$system = api.query.system) === null || _api$query$system === void 0 ? void 0 : _api$query$system.account) || (0, _util.isFunction)((_api$query$balances = api.query.balances) === null || _api$query$balances === void 0 ? void 0 : _api$query$balances.account) ? queryCurrent(api, account.accountId, balanceInstances) : queryOld(api, account.accountId)]) : (0, _rxjs.of)([account, api.registry.createType('BlockNumber'), [null, []]]);
  }), (0, _rxjs.map)(result => calcBalances(api, result))));
}