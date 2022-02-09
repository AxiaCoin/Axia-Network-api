"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BlueprintSubmittableResult = exports.Blueprint = void 0;

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseKey"));

var _api = require("@axia-js/api");

var _util = require("@axia-js/util");

var _util2 = require("../util.cjs");

var _Base = require("./Base.cjs");

var _Contract = require("./Contract.cjs");

var _util3 = require("./util.cjs");

// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
class BlueprintSubmittableResult extends _api.SubmittableResult {
  constructor(result, contract) {
    super(result);
    this.contract = void 0;
    this.contract = contract;
  }

}

exports.BlueprintSubmittableResult = BlueprintSubmittableResult;

var _tx = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("tx");

var _deploy = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("deploy");

class Blueprint extends _Base.Base {
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
      value: (constructorOrId, _ref, params) => {
        let {
          gasLimit = _util.BN_ZERO,
          salt,
          value = _util.BN_ZERO
        } = _ref;
        return this.api.tx.contracts.instantiate(value, gasLimit, this.codeHash, this.abi.findConstructor(constructorOrId).toU8a(params), (0, _util3.encodeSalt)(salt)).withResultTransform(result => new BlueprintSubmittableResult(result, (0, _util2.applyOnEvent)(result, ['Instantiated'], _ref2 => {
          let [record] = _ref2;
          return new _Contract.Contract(this.api, this.abi, record.event.data[1], this._decorateMethod);
        })));
      }
    });
    this.codeHash = this.registry.createType('Hash', codeHash);
    this.abi.constructors.forEach(c => {
      if ((0, _util.isUndefined)((0, _classPrivateFieldLooseBase2.default)(this, _tx)[_tx][c.method])) {
        (0, _classPrivateFieldLooseBase2.default)(this, _tx)[_tx][c.method] = (0, _util3.createBluePrintTx)((o, p) => (0, _classPrivateFieldLooseBase2.default)(this, _deploy)[_deploy](c, o, p));
      }
    });
  }

  get tx() {
    return (0, _classPrivateFieldLooseBase2.default)(this, _tx)[_tx];
  }

}

exports.Blueprint = Blueprint;