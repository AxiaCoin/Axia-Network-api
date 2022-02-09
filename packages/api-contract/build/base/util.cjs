"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EMPTY_SALT = void 0;
exports.createBluePrintTx = createBluePrintTx;
exports.createBluePrintWithId = createBluePrintWithId;
exports.encodeSalt = encodeSalt;

var _types = require("@axia-js/types");

var _util = require("@axia-js/util");

var _utilCrypto = require("@axia-js/util-crypto");

var _util2 = require("../util.cjs");

// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
const EMPTY_SALT = new Uint8Array();
exports.EMPTY_SALT = EMPTY_SALT;

function createBluePrintTx(fn) {
  return function (options) {
    for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }

    return (0, _util2.isOptions)(options) ? fn(options, params) : fn(...(0, _util2.extractOptions)(options, params));
  };
}

function createBluePrintWithId(fn) {
  return function (constructorOrId, options) {
    for (var _len2 = arguments.length, params = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      params[_key2 - 2] = arguments[_key2];
    }

    return (0, _util2.isOptions)(options) ? fn(constructorOrId, options, params) : fn(constructorOrId, ...(0, _util2.extractOptions)(options, params));
  };
}

function encodeSalt() {
  let salt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _utilCrypto.randomAsU8a)();
  return salt instanceof _types.Bytes ? salt : salt && salt.length ? (0, _util.compactAddLength)((0, _util.u8aToU8a)(salt)) : EMPTY_SALT;
}