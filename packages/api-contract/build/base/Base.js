// Copyright 2017-2021 @axia-js/api authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, isFunction } from '@axia-js/util';
import { Abi } from "../Abi.js";
export class Base {
  constructor(api, abi, decorateMethod) {
    this.abi = void 0;
    this.api = void 0;
    this.registry = void 0;
    this._decorateMethod = void 0;
    this.abi = abi instanceof Abi ? abi : new Abi(abi, api.registry.getChainProperties());
    this.api = api;
    this.registry = this.abi.registry;
    this._decorateMethod = decorateMethod;
    assert(!!(api && api.isConnected && api.tx && api.tx.contracts && Object.keys(api.tx.contracts).length), 'Your API has not been initialized correctly and it not decorated with the runtime interfaces for contracts as retrieved from the on-chain runtime');
    assert(isFunction(api.tx.contracts.instantiateWithCode), 'You need to connect to a chain with a runtime with a V3 contracts module. The runtime does not expose api.tx.contracts.instantiateWithCode');
  }

}