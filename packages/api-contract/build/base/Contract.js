import _classPrivateFieldLooseBase from "@babel/runtime/helpers/esm/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/esm/classPrivateFieldLooseKey";
// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { map } from 'rxjs';
import { SubmittableResult } from '@axia-js/api';
import { createTypeUnsafe } from '@axia-js/types';
import { assert, BN, BN_HUNDRED, BN_ONE, BN_ZERO, bnToBn, isFunction, isUndefined, logger } from '@axia-js/util';
import { applyOnEvent, extractOptions, isOptions } from "../util.js";
import { Base } from "./Base.js"; // As per Rust, 5 * GAS_PER_SEC

const MAX_CALL_GAS = new BN(5000000000000).isub(BN_ONE);
const ERROR_NO_CALL = 'Your node does not expose the contracts.call RPC. This is most probably due to a runtime configuration.';
const l = logger('Contract');

function createQuery(fn) {
  return (origin, options, ...params) => isOptions(options) ? fn(origin, options, params) : fn(origin, ...extractOptions(options, params));
}

function createTx(fn) {
  return (options, ...params) => isOptions(options) ? fn(options, params) : fn(...extractOptions(options, params));
}

export class ContractSubmittableResult extends SubmittableResult {
  constructor(result, contractEvents) {
    super(result);
    this.contractEvents = void 0;
    this.contractEvents = contractEvents;
  }

}

var _query = /*#__PURE__*/_classPrivateFieldLooseKey("query");

var _tx = /*#__PURE__*/_classPrivateFieldLooseKey("tx");

var _getGas = /*#__PURE__*/_classPrivateFieldLooseKey("getGas");

var _exec = /*#__PURE__*/_classPrivateFieldLooseKey("exec");

var _read = /*#__PURE__*/_classPrivateFieldLooseKey("read");

export class Contract extends Base {
  /**
   * @description The on-chain address for this contract
   */
  constructor(api, abi, address, decorateMethod) {
    super(api, abi, decorateMethod);
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
      value: (_gasLimit, isCall = false) => {
        const gasLimit = bnToBn(_gasLimit);
        return gasLimit.lte(BN_ZERO) ? isCall ? MAX_CALL_GAS : (this.api.consts.system.blockWeights ? this.api.consts.system.blockWeights.maxBlock : this.api.consts.system.maximumBlockWeight).muln(64).div(BN_HUNDRED) : gasLimit;
      }
    });
    Object.defineProperty(this, _exec, {
      writable: true,
      value: (messageOrId, {
        gasLimit = BN_ZERO,
        value = BN_ZERO
      }, params) => {
        return this.api.tx.contracts.call(this.address, value, _classPrivateFieldLooseBase(this, _getGas)[_getGas](gasLimit), this.abi.findMessage(messageOrId).toU8a(params)).withResultTransform(result => // ContractEmitted is the current generation, ContractExecution is the previous generation
        new ContractSubmittableResult(result, applyOnEvent(result, ['ContractEmitted', 'ContractExecution'], records => records.map(({
          event: {
            data: [, data]
          }
        }) => {
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
      value: (messageOrId, {
        gasLimit = BN_ZERO,
        value = BN_ZERO
      }, params) => {
        assert(this.hasRpcContractsCall, ERROR_NO_CALL);
        const message = this.abi.findMessage(messageOrId);
        return {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          send: this._decorateMethod(origin => this.api.rx.rpc.contracts.call({
            dest: this.address,
            gasLimit: _classPrivateFieldLooseBase(this, _getGas)[_getGas](gasLimit, true),
            inputData: message.toU8a(params),
            origin,
            value
          }).pipe(map(({
            debugMessage,
            gasConsumed,
            gasRequired,
            result
          }) => ({
            debugMessage,
            gasConsumed,
            gasRequired: gasRequired && !gasRequired.isZero() ? gasRequired : gasConsumed,
            output: result.isOk && message.returnType ? createTypeUnsafe(this.registry, message.returnType.type, [result.asOk.data.toU8a(true)], {
              isPedantic: true
            }) : null,
            result
          }))))
        };
      }
    });
    this.address = this.registry.createType('AccountId', address);
    this.abi.messages.forEach(m => {
      if (isUndefined(_classPrivateFieldLooseBase(this, _tx)[_tx][m.method])) {
        _classPrivateFieldLooseBase(this, _tx)[_tx][m.method] = createTx((o, p) => _classPrivateFieldLooseBase(this, _exec)[_exec](m, o, p));
      }

      if (isUndefined(_classPrivateFieldLooseBase(this, _query)[_query][m.method])) {
        _classPrivateFieldLooseBase(this, _query)[_query][m.method] = createQuery((f, o, p) => _classPrivateFieldLooseBase(this, _read)[_read](m, o, p).send(f));
      }
    });
  }

  get hasRpcContractsCall() {
    var _this$api$rx$rpc$cont;

    return isFunction((_this$api$rx$rpc$cont = this.api.rx.rpc.contracts) === null || _this$api$rx$rpc$cont === void 0 ? void 0 : _this$api$rx$rpc$cont.call);
  }

  get query() {
    assert(this.hasRpcContractsCall, ERROR_NO_CALL);
    return _classPrivateFieldLooseBase(this, _query)[_query];
  }

  get tx() {
    return _classPrivateFieldLooseBase(this, _tx)[_tx];
  }

}