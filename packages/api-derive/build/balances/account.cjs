"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.account = account;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _rxjs = require("rxjs");

var _util = require("@axia-js/util");

var _index = require("../util/index.cjs");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function zeroBalance(api) {
  return api.registry.createType('Balance');
}

function getBalance(api, _ref) {
  let [freeBalance, reservedBalance, frozenFee, frozenMisc] = _ref;
  const votingBalance = api.registry.createType('Balance', freeBalance.toBn());
  return {
    freeBalance,
    frozenFee,
    frozenMisc,
    reservedBalance,
    votingBalance
  };
}

function calcBalances(api, _ref2) {
  let [accountId, [accountNonce, [primary, ...additional]]] = _ref2;
  return _objectSpread({
    accountId,
    accountNonce,
    additional: additional.map(b => getBalance(api, b))
  }, getBalance(api, primary));
} // old


function queryBalancesFree(api, accountId) {
  return api.queryMulti([[api.query.balances.freeBalance, accountId], [api.query.balances.reservedBalance, accountId], [api.query.system.accountNonce, accountId]]).pipe((0, _rxjs.map)(_ref3 => {
    let [freeBalance, reservedBalance, accountNonce] = _ref3;
    return [accountNonce, [[freeBalance, reservedBalance, zeroBalance(api), zeroBalance(api)]]];
  }));
}

function queryNonceOnly(api, accountId) {
  const fill = nonce => [nonce, [[zeroBalance(api), zeroBalance(api), zeroBalance(api), zeroBalance(api)]]];

  return (0, _util.isFunction)(api.query.system.account) ? api.query.system.account(accountId).pipe((0, _rxjs.map)(_ref4 => {
    let {
      nonce
    } = _ref4;
    return fill(nonce);
  })) : (0, _util.isFunction)(api.query.system.accountNonce) ? api.query.system.accountNonce(accountId).pipe((0, _rxjs.map)(nonce => fill(nonce))) : (0, _rxjs.of)(fill(api.registry.createType('Index')));
}

function queryBalancesAccount(api, accountId) {
  let modules = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['balances'];
  const balances = modules.map(m => {
    var _m, _api$query$m;

    return ((_m = api.derive[m]) === null || _m === void 0 ? void 0 : _m.customAccount) || ((_api$query$m = api.query[m]) === null || _api$query$m === void 0 ? void 0 : _api$query$m.account);
  }).filter(q => (0, _util.isFunction)(q)).map(q => [q, accountId]);

  const extract = (nonce, data) => [nonce, data.map(_ref5 => {
    let {
      feeFrozen,
      free,
      miscFrozen,
      reserved
    } = _ref5;
    return [free, reserved, feeFrozen, miscFrozen];
  })]; // NOTE this is for the first case where we do have instances specified


  return balances.length ? (0, _util.isFunction)(api.query.system.account) ? api.queryMulti([[api.query.system.account, accountId], ...balances]).pipe((0, _rxjs.map)(_ref6 => {
    let [{
      nonce
    }, ...balances] = _ref6;
    return extract(nonce, balances);
  })) : api.queryMulti([[api.query.system.accountNonce, accountId], ...balances]).pipe((0, _rxjs.map)(_ref7 => {
    let [nonce, ...balances] = _ref7;
    return extract(nonce, balances);
  })) : queryNonceOnly(api, accountId);
}

function querySystemAccount(api, accountId) {
  // AccountInfo is current, support old, eg. Edgeware
  return api.query.system.account(accountId).pipe((0, _rxjs.map)(infoOrTuple => {
    const data = infoOrTuple.nonce ? infoOrTuple.data : infoOrTuple[1];
    const nonce = infoOrTuple.nonce || infoOrTuple[0];

    if (!data || data.isEmpty) {
      return [nonce, [[zeroBalance(api), zeroBalance(api), zeroBalance(api), zeroBalance(api)]]];
    }

    const {
      feeFrozen,
      free,
      miscFrozen,
      reserved
    } = data;
    return [nonce, [[free, reserved, feeFrozen, miscFrozen]]];
  }));
}
/**
 * @name account
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


function account(instanceId, api) {
  const balanceInstances = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), 'balances');
  return (0, _index.memo)(instanceId, address => api.derive.accounts.accountId(address).pipe((0, _rxjs.switchMap)(accountId => {
    var _api$query$system, _api$query$balances, _api$query$balances2;

    return accountId ? (0, _rxjs.combineLatest)([(0, _rxjs.of)(accountId), balanceInstances ? queryBalancesAccount(api, accountId, balanceInstances) : (0, _util.isFunction)((_api$query$system = api.query.system) === null || _api$query$system === void 0 ? void 0 : _api$query$system.account) ? querySystemAccount(api, accountId) : (0, _util.isFunction)((_api$query$balances = api.query.balances) === null || _api$query$balances === void 0 ? void 0 : _api$query$balances.account) ? queryBalancesAccount(api, accountId) : (0, _util.isFunction)((_api$query$balances2 = api.query.balances) === null || _api$query$balances2 === void 0 ? void 0 : _api$query$balances2.freeBalance) ? queryBalancesFree(api, accountId) : queryNonceOnly(api, accountId)]) : (0, _rxjs.of)([api.registry.createType('AccountId'), [api.registry.createType('Index'), [[zeroBalance(api), zeroBalance(api), zeroBalance(api), zeroBalance(api)]]]]);
  }), (0, _rxjs.map)(result => calcBalances(api, result))));
}