"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeSubmittableResult = exports.Code = void 0;

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseKey"));

var _api = require("@axia-js/api");

var _util = require("@axia-js/util");

var _util2 = require("../util.cjs");

var _Base = require("./Base.cjs");

var _Blueprint = require("./Blueprint.cjs");

var _Contract = require("./Contract.cjs");

var _util3 = require("./util.cjs");

// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
class CodeSubmittableResult extends _api.SubmittableResult {
  constructor(result, blueprint, contract) {
    super(result);
    this.blueprint = void 0;
    this.contract = void 0;
    this.blueprint = blueprint;
    this.contract = contract;
  }

}

exports.CodeSubmittableResult = CodeSubmittableResult;

var _tx = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("tx");

var _instantiate = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("instantiate");

class Code extends _Base.Base {
  constructor(api, abi, wasm, decorateMethod) {
    super(api, abi, decorateMethod);
    this.code = void 0;
    Object.defineProperty(this, _tx, {
      writable: true,
      value: {}
    });
    Object.defineProperty(this, _instantiate, {
      writable: true,
      value: (constructorOrId, _ref, params) => {
        let {
          gasLimit = _util.BN_ZERO,
          salt,
          value = _util.BN_ZERO
        } = _ref;
        return this.api.tx.contracts.instantiateWithCode(value, gasLimit, (0, _util.compactAddLength)(this.code), this.abi.findConstructor(constructorOrId).toU8a(params), (0, _util3.encodeSalt)(salt)).withResultTransform(result => new CodeSubmittableResult(result, ...((0, _util2.applyOnEvent)(result, ['CodeStored', 'Instantiated'], records => records.reduce((_ref2, _ref3) => {
          let [blueprint, contract] = _ref2;
          let {
            event
          } = _ref3;
          return this.api.events.contracts.Instantiated.is(event) ? [blueprint, new _Contract.Contract(this.api, this.abi, event.data[1], this._decorateMethod)] : this.api.events.contracts.CodeStored.is(event) ? [new _Blueprint.Blueprint(this.api, this.abi, event.data[0], this._decorateMethod), contract] : [blueprint, contract];
        }, [])) || [])));
      }
    });
    this.code = (0, _util.isWasm)(this.abi.project.source.wasm) ? this.abi.project.source.wasm : (0, _util.u8aToU8a)(wasm);
    (0, _util.assert)((0, _util.isWasm)(this.code), 'No WASM code provided');
    this.abi.constructors.forEach(c => {
      if ((0, _util.isUndefined)((0, _classPrivateFieldLooseBase2.default)(this, _tx)[_tx][c.method])) {
        (0, _classPrivateFieldLooseBase2.default)(this, _tx)[_tx][c.method] = (0, _util3.createBluePrintTx)((o, p) => (0, _classPrivateFieldLooseBase2.default)(this, _instantiate)[_instantiate](c, o, p));
      }
    });
  }

  get tx() {
    return (0, _classPrivateFieldLooseBase2.default)(this, _tx)[_tx];
  }

}

exports.Code = Code;