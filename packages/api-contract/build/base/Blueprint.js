import _classPrivateFieldLooseBase from "@babel/runtime/helpers/esm/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/esm/classPrivateFieldLooseKey";
// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { SubmittableResult } from '@axia-js/api';
import { BN_ZERO, isUndefined } from '@axia-js/util';
import { applyOnEvent } from "../util.js";
import { Base } from "./Base.js";
import { Contract } from "./Contract.js";
import { createBluePrintTx, encodeSalt } from "./util.js";
export class BlueprintSubmittableResult extends SubmittableResult {
  constructor(result, contract) {
    super(result);
    this.contract = void 0;
    this.contract = contract;
  }

}

var _tx = /*#__PURE__*/_classPrivateFieldLooseKey("tx");

var _deploy = /*#__PURE__*/_classPrivateFieldLooseKey("deploy");

export class Blueprint extends Base {
  /**
   * @description The on-chain code hash for this blueprint
   */
  constructor(api, abi, codeHash, decorateMethod) {
    super(api, abi, decorateMethod);
    this.codeHash = void 0;
    Object.defineProperty(this, _tx, {
      writable: true,
      value: {}
    });
    Object.defineProperty(this, _deploy, {
      writable: true,
      value: (constructorOrId, {
        gasLimit = BN_ZERO,
        salt,
        value = BN_ZERO
      }, params) => {
        return this.api.tx.contracts.instantiate(value, gasLimit, this.codeHash, this.abi.findConstructor(constructorOrId).toU8a(params), encodeSalt(salt)).withResultTransform(result => new BlueprintSubmittableResult(result, applyOnEvent(result, ['Instantiated'], ([record]) => new Contract(this.api, this.abi, record.event.data[1], this._decorateMethod))));
      }
    });
    this.codeHash = this.registry.createType('Hash', codeHash);
    this.abi.constructors.forEach(c => {
      if (isUndefined(_classPrivateFieldLooseBase(this, _tx)[_tx][c.method])) {
        _classPrivateFieldLooseBase(this, _tx)[_tx][c.method] = createBluePrintTx((o, p) => _classPrivateFieldLooseBase(this, _deploy)[_deploy](c, o, p));
      }
    });
  }

  get tx() {
    return _classPrivateFieldLooseBase(this, _tx)[_tx];
  }

}