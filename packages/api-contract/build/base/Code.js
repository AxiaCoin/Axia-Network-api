import _classPrivateFieldLooseBase from "@babel/runtime/helpers/esm/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/esm/classPrivateFieldLooseKey";
// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { SubmittableResult } from '@axia-js/api';
import { assert, BN_ZERO, compactAddLength, isUndefined, isWasm, u8aToU8a } from '@axia-js/util';
import { applyOnEvent } from "../util.js";
import { Base } from "./Base.js";
import { Blueprint } from "./Blueprint.js";
import { Contract } from "./Contract.js";
import { createBluePrintTx, encodeSalt } from "./util.js";
export class CodeSubmittableResult extends SubmittableResult {
  constructor(result, blueprint, contract) {
    super(result);
    this.blueprint = void 0;
    this.contract = void 0;
    this.blueprint = blueprint;
    this.contract = contract;
  }

}

var _tx = /*#__PURE__*/_classPrivateFieldLooseKey("tx");

var _instantiate = /*#__PURE__*/_classPrivateFieldLooseKey("instantiate");

export class Code extends Base {
  constructor(api, abi, wasm, decorateMethod) {
    super(api, abi, decorateMethod);
    this.code = void 0;
    Object.defineProperty(this, _tx, {
      writable: true,
      value: {}
    });
    Object.defineProperty(this, _instantiate, {
      writable: true,
      value: (constructorOrId, {
        gasLimit = BN_ZERO,
        salt,
        value = BN_ZERO
      }, params) => {
        return this.api.tx.contracts.instantiateWithCode(value, gasLimit, compactAddLength(this.code), this.abi.findConstructor(constructorOrId).toU8a(params), encodeSalt(salt)).withResultTransform(result => new CodeSubmittableResult(result, ...(applyOnEvent(result, ['CodeStored', 'Instantiated'], records => records.reduce(([blueprint, contract], {
          event
        }) => this.api.events.contracts.Instantiated.is(event) ? [blueprint, new Contract(this.api, this.abi, event.data[1], this._decorateMethod)] : this.api.events.contracts.CodeStored.is(event) ? [new Blueprint(this.api, this.abi, event.data[0], this._decorateMethod), contract] : [blueprint, contract], [])) || [])));
      }
    });
    this.code = isWasm(this.abi.project.source.wasm) ? this.abi.project.source.wasm : u8aToU8a(wasm);
    assert(isWasm(this.code), 'No WASM code provided');
    this.abi.constructors.forEach(c => {
      if (isUndefined(_classPrivateFieldLooseBase(this, _tx)[_tx][c.method])) {
        _classPrivateFieldLooseBase(this, _tx)[_tx][c.method] = createBluePrintTx((o, p) => _classPrivateFieldLooseBase(this, _instantiate)[_instantiate](c, o, p));
      }
    });
  }

  get tx() {
    return _classPrivateFieldLooseBase(this, _tx)[_tx];
  }

}