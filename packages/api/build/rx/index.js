import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _classPrivateFieldLooseBase from "@babel/runtime/helpers/esm/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/esm/classPrivateFieldLooseKey";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/api authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { from } from 'rxjs';
import { ApiBase } from "../base/index.js";
export function decorateMethod(method) {
  return method;
}
/**
 * # @axia-js/api/rx
 *
 *  ## Overview
 *
 * @name ApiRx
 *
 * @description
 * ApiRx is a powerful RxJS Observable wrapper around the RPC and interfaces on the AXIA network. As a full Observable API, all interface calls return RxJS Observables, including the static `.create(...)`. In the same fashion and subscription-based methods return long-running Observables that update with the latest values.
 *
 * The API is well suited to real-time applications where the latest state is needed, unlocking the subscription-based features of AXIA (and Axlib) clients. Some familiarity with RxJS is a requirement to use the API, however just understanding `.subscribe` and `.pipe` on Observables will unlock full-scale use thereof.
 *
 * @see [[ApiPromise]]
 *
 * ## Usage
 *
 * Making rpc calls -
 * <BR>
 *
 * ```javascript
 * import ApiRx from '@axia-js/api/rx';
 *
 * // initialize via Promise & static create
 * const api = await ApiRx.create().toPromise();
 *
 * // make a call to retrieve the current network head
 * api.rpc.chain.subscribeNewHeads().subscribe((header) => {
 *   console.log(`Chain is at #${header.number}`);
 * });
 * ```
 * <BR>
 *
 * Subscribing to chain state -
 * <BR>
 *
 * ```javascript
 * import { combineLatest, pairwise, switchMap } from 'rxjs';
 * import { ApiRx, WsProvider } from '@axia-js/api';
 *
 *
 * // initialize a provider with a specific endpoint
 * const provider = new WsProvider('wss://example.com:9944')
 *
 * // initialize via isReady & new with specific provider
 * new ApiRx({ provider })
 *   .isReady
 *   .pipe(
 *     switchMap((api) =>
 *       combineLatest([
 *         api.query.timestamp.blockPeriod(),
 *         api.query.timestamp.now().pipe(pairwise())
 *       ])
 *     )
 *   )
 *   .subscribe(([blockPeriod, timestamp]) => {
 *      const elapsed = timestamp[1].toNumber() - timestamp[0].toNumber();
 *      console.log(`timestamp ${timestamp[1]} \nelapsed ${elapsed} \n(${blockPeriod}s target)`);
 *   });
 * ```
 * <BR>
 *
 * Submitting a transaction -
 * <BR>
 *
 * ```javascript
 * import { first, switchMap } from 'rxjs';
 * import ApiRx from '@axia-js/api/rx';
 *
 * // import the test keyring (already has dev keys for Alice, Bob, Charlie, Eve & Ferdie)
 * import testingPairs from '@axia-js/keyring/testingPairs';
 * const keyring = testingPairs();
 *
 * // get api via Promise
 * const api = await ApiRx.create().toPromise();
 *
 * // retrieve nonce for the account
 * api.query.system
 *   .account(keyring.alice.address)
 *   .pipe(
 *      first(),
 *      // pipe nonce into transfer
 *      switchMap(([nonce]) =>
 *        api.tx.balances
 *          // create transfer
 *          .transfer(keyring.bob.address, 12345)
 *          // sign the transaction
 *          .sign(keyring.alice, { nonce })
 *          // send the transaction
 *          .send()
 *      )
 *   )
 *   // subscribe to overall result
 *   .subscribe(({ status }) => {
 *     if (status.isInBlock) {
 *       console.log('Completed at block hash', status.asFinalized.toHex());
 *     }
 *   });
 * ```
 */

var _isReadyRx = /*#__PURE__*/_classPrivateFieldLooseKey("isReadyRx");

export class ApiRx extends ApiBase {
  /**
   * @description Creates an ApiRx instance using the supplied provider. Returns an Observable containing the actual Api instance.
   * @param options options that is passed to the class constructor. Can be either [[ApiOptions]] or [[WsProvider]]
   * @example
   * <BR>
   *
   * ```javascript
   * import { switchMap } from 'rxjs';
   * import Api from '@axia-js/api/rx';
   *
   * Api.create()
   *   .pipe(
   *     switchMap((api) =>
   *       api.rpc.chain.subscribeNewHeads()
   *   ))
   *   .subscribe((header) => {
   *     console.log(`new block #${header.number.toNumber()}`);
   *   });
   * ```
   */
  static create(options) {
    return new ApiRx(options).isReady;
  }
  /**
   * @description Create an instance of the ApiRx class
   * @param options Options to create an instance. Can be either [[ApiOptions]] or [[WsProvider]]
   * @example
   * <BR>
   *
   * ```javascript
   * import { switchMap } from 'rxjs';
   * import Api from '@axia-js/api/rx';
   *
   * new Api().isReady
   *   .pipe(
   *     switchMap((api) =>
   *       api.rpc.chain.subscribeNewHeads()
   *   ))
   *   .subscribe((header) => {
   *     console.log(`new block #${header.number.toNumber()}`);
   *   });
   * ```
   */


  constructor(options) {
    super(options, 'rxjs', decorateMethod);
    Object.defineProperty(this, _isReadyRx, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldLooseBase(this, _isReadyRx)[_isReadyRx] = from( // You can create an observable from an event, however my mind groks this form better
    new Promise(resolve => {
      super.on('ready', () => resolve(this));
    }));
  }
  /**
   * @description Observable that returns the first time we are connected and loaded
   */


  get isReady() {
    return _classPrivateFieldLooseBase(this, _isReadyRx)[_isReadyRx];
  }
  /**
   * @description Returns a clone of this ApiRx instance (new underlying provider connection)
   */


  clone() {
    return new ApiRx(_objectSpread(_objectSpread({}, this._options), {}, {
      source: this
    }));
  }

}