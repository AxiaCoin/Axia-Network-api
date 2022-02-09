"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContractSubmittableResult = exports.Contract = void 0;

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseKey"));

var _rxjs = require("rxjs");

var _api = require("@axia-js/api");

var _types = require("@axia-js/types");

var _util = require("@axia-js/util");

var _util2 = require("../util.cjs");

var _Base = require("./Base.cjs");

// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
// As per Rust, 5 * GAS_PER_SEC
const MAX_CALL_GAS = new _util.BN(5000000000000).isub(_util.BN_ONE);
const ERROR_NO_CALL = 'Your node does not expose the contracts.call RPC. This is most probably due to a runtime configuration.';
const l = (0, _util.logger)('Contract');

function createQuery(fn) {
  return function (origin, options) {
    for (var _len = arguments.length, params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      params[_key - 2] = arguments[_key];
    }

    return (0, _util2.isOptions)(options) ? fn(origin, options, params) : fn(origin, ...(0, _util2.extractOptions)(options, params));
  };
}

function createTx(fn) {
  return function (options) {
    for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      params[_key2 - 1] = arguments[_key2];
    }

    return (0, _util2.isOptions)(options) ? fn(options, params) : fn(...(0, _util2.extractOptions)(options, params));
  };
}

class ContractSubmittableResult extends _api.SubmittableResult {
  constructor(result, contractEvents) {
    super(result);
    this.contractEvents = void 0;
    this.contractEvents = contractEvents;
  }

}

exports.ContractSubmittableResult = ContractSubmittableResult;

var _query = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("query");

var _tx = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("tx");

var _getGas = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("getGas");

var _exec = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("exec");

var _read = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("read");

class Contract extends _Base.Base {
  /**
   * @description The on-chain address for this contract
   */
  constructor(api, abi, address, decorateMethod) {
    var _this;

    super(api, abi, decorateMethod);
    _this = this;
    this.address = void 0;
    Object.defineProperty(this, _query, {
      writable: true,
      value: {}
    });
    Object.defineProperty(this, _tx, {
      writable: true,
      value: {}
    });
    Object.defineProperty(this, _getGas, {
      writable: true,
      value: function (_gasLimit) {
        let isCall = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        const gasLimit = (0, _util.bnToBn)(_gasLimit);
        return gasLimit.lte(_util.BN_ZERO) ? isCall ? MAX_CALL_GAS : (_this.api.consts.system.blockWeights ? _this.api.consts.system.blockWeights.maxBlock : _this.api.consts.system.maximumBlockWeight).muln(64).div(_util.BN_HUNDRED) : gasLimit;
      }
    });
    Object.defineProperty(this, _exec, {
      writable: true,
      value: (messageOrId, _ref, params) => {
        let {
          gasLimit = _util.BN_ZERO,
          value = _util.BN_ZERO
        } = _ref;
        return this.api.tx.contracts.call(this.address, value, (0, _classPrivateFieldLooseBase2.default)(this, _getGas)[_getGas](gasLimit), this.abi.findMessage(messageOrId).toU8a(params)).withResultTransform(result => // ContractEmitted is the current generation, ContractExecution is the previous generation
        new ContractSubmittableResult(result, (0, _util2.applyOnEvent)(result, ['ContractEmitted', 'ContractExecution'], records => records.map(_ref2 => {
          let {
            event: {
              data: [, data]
            }
          } = _ref2;

          try {
            return this.abi.decodeEvent(data);
          } catch (error) {
            l.error(`Unable to decode contract event: ${error.message}`);
            return null;
          }
        }).filter(decoded => !!decoded))));
      }
    });
    Object.defineProperty(this, _read, {
      writable: true,
      value: (messageOrId, _ref3, params) => {
        let {
          gasLimit = _util.BN_ZERO,
          value = _util.BN_ZERO
        } = _ref3;
        (0, _util.assert)(this.hasRpcContractsCall, ERROR_NO_CALL);
        const message = this.abi.findMessage(messageOrId);
        return {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          send: this._decorateMethod(origin => this.api.rx.rpc.contracts.call({
            dest: this.address,
            gasLimit: (0, _classPrivateFieldLooseBase2.default)(this, _getGas)[_getGas](gasLimit, true),
            inputData: message.toU8a(params),
            origin,
            value
          }).pipe((0, _rxjs.map)(_ref4 => {
            let {
              debugMessage,
              gasConsumed,
              gasRequired,
              result
            } = _ref4;
            return {
              debugMessage,
              gasConsumed,
              gasRequired: gasRequired && !gasRequired.isZero() ? gasRequired : gasConsumed,
              output: result.isOk && message.returnType ? (0, _types.createTypeUnsafe)(this.registry, message.returnType.type, [result.asOk.data.toU8a(true)], {
                isPedantic: true
              }) : null,
              result
            };
          })))
        };
      }
    });
    this.address = this.registry.createType('AccountId', address);
    this.abi.messages.forEach(m => {
      if ((0, _util.isUndefined)((0, _classPrivateFieldLooseBase2.default)(this, _tx)[_tx][m.method])) {
        (0, _classPrivateFieldLooseBase2.default)(this, _tx)[_tx][m.method] = createTx((o, p) => (0, _classPrivateFieldLooseBase2.default)(this, _exec)[_exec](m, o, p));
      }

      if ((0, _util.isUndefined)((0, _classPrivateFieldLooseBase2.default)(this, _query)[_query][m.method])) {
        (0, _classPrivateFieldLooseBase2.default)(this, _query)[_query][m.method] = createQuery((f, o, p) => (0, _classPrivateFieldLooseBase2.default)(this, _read)[_read](m, o, p).send(f));
      }
    });
  }

  get hasRpcContractsCall() {
    var _this$api$rx$rpc$cont;

    return (0, _util.isFunction)((_this$api$rx$rpc$cont = this.api.rx.rpc.contracts) === null || _this$api$rx$rpc$cont === void 0 ? void 0 : _this$api$rx$rpc$cont.call);
  }

  get query() {
    (0, _util.assert)(this.hasRpcContractsCall, ERROR_NO_CALL);
    return (0, _classPrivateFieldLooseBase2.default)(this, _query)[_query];
  }

  get tx() {
    return (0, _classPrivateFieldLooseBase2.default)(this, _tx)[_tx];
  }

}

exports.Contract = Contract;