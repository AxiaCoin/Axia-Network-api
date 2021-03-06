"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  RpcCore: true,
  packageInfo: true
};
exports.RpcCore = void 0;
Object.defineProperty(exports, "packageInfo", {
  enumerable: true,
  get: function () {
    return _packageInfo.packageInfo;
  }
});

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseKey"));

var _rxjs = require("rxjs");

var _types = require("@axia-js/types");

var _util = require("@axia-js/util");

var _index = require("./util/index.cjs");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _index[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index[key];
    }
  });
});

var _packageInfo = require("./packageInfo.cjs");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const l = (0, _util.logger)('rpc-core');
const EMPTY_META = {
  fallback: undefined,
  modifier: {
    isOptional: true
  },
  type: {
    asMap: {
      linked: {
        isTrue: false
      }
    },
    isMap: false
  }
}; // utility method to create a nicely-formatted error

/** @internal */

function logErrorMessage(method, _ref, error) {
  let {
    params,
    type
  } = _ref;
  const inputs = params.map(_ref2 => {
    let {
      isOptional,
      name,
      type
    } = _ref2;
    return `${name}${isOptional ? '?' : ''}: ${type}`;
  }).join(', ');
  l.error(`${method}(${inputs}): ${type}:: ${error.message}`);
}

function isTreatAsHex(key) {
  // :code is problematic - it does not have the length attached, which is
  // unlike all other storage entries where it is indeed properly encoded
  return ['0x3a636f6465'].includes(key.toHex());
}
/**
 * @name Rpc
 * @summary The API may use a HTTP or WebSockets provider.
 * @description It allows for querying a AXIA Client Node.
 * WebSockets provider is recommended since HTTP provider only supports basic querying.
 *
 * ```mermaid
 * graph LR;
 *   A[Api] --> |WebSockets| B[WsProvider];
 *   B --> |endpoint| C[ws://127.0.0.1:9944]
 * ```
 *
 * @example
 * <BR>
 *
 * ```javascript
 * import Rpc from '@axia-js/rpc-core';
 * import { WsProvider } from '@axia-js/rpc-provider/ws';
 *
 * const provider = new WsProvider('ws://127.0.0.1:9944');
 * const rpc = new Rpc(provider);
 * ```
 */


var _instanceId = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("instanceId");

var _registryDefault = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("registryDefault");

var _getBlockRegistry = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("getBlockRegistry");

var _storageCache = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("storageCache");

class RpcCore {
  /**
   * @constructor
   * Default constructor for the Api Object
   * @param  {ProviderInterface} provider An API provider using HTTP or WebSocket
   */
  constructor(instanceId, registry, provider) {
    let userRpc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    Object.defineProperty(this, _instanceId, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _registryDefault, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _getBlockRegistry, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _storageCache, {
      writable: true,
      value: new Map()
    });
    this.mapping = new Map();
    this.provider = void 0;
    this.sections = [];
    // eslint-disable-next-line @typescript-eslint/unbound-method
    (0, _util.assert)(provider && (0, _util.isFunction)(provider.send), 'Expected Provider to API create');
    (0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId] = instanceId;
    (0, _classPrivateFieldLooseBase2.default)(this, _registryDefault)[_registryDefault] = registry;
    this.provider = provider;
    const sectionNames = Object.keys(_types.rpcDefinitions); // these are the base keys (i.e. part of jsonrpc)

    this.sections.push(...sectionNames); // decorate all interfaces, defined and user on this instance

    this.addUserInterfaces(userRpc);
  }
  /**
   * @description Returns the connected status of a provider
   */


  get isConnected() {
    return this.provider.isConnected;
  }
  /**
   * @description Manually connect from the attached provider
   */


  connect() {
    return this.provider.connect();
  }
  /**
   * @description Manually disconnect from the attached provider
   */


  disconnect() {
    return this.provider.disconnect();
  }
  /**
   * @description Sets a registry swap (typically from Api)
   */


  setRegistrySwap(registrySwap) {
    (0, _classPrivateFieldLooseBase2.default)(this, _getBlockRegistry)[_getBlockRegistry] = (0, _util.memoize)(registrySwap, {
      getInstanceId: () => (0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId]
    });
  }

  addUserInterfaces(userRpc) {
    // add any extra user-defined sections
    this.sections.push(...Object.keys(userRpc).filter(key => !this.sections.includes(key))); // decorate the sections with base and user methods

    this.sections.forEach(sectionName => {
      var _ref3, _ref4;

      (_ref3 = this)[_ref4 = sectionName] || (_ref3[_ref4] = {});
      const section = this[sectionName];
      Object.entries(_objectSpread(_objectSpread({}, this._createInterface(sectionName, _types.rpcDefinitions[sectionName] || {})), this._createInterface(sectionName, userRpc[sectionName] || {}))).forEach(_ref5 => {
        let [key, value] = _ref5;
        section[key] || (section[key] = value);
      });
    });
  }

  _createInterface(section, methods) {
    return Object.entries(methods).filter(_ref6 => {
      let [method, {
        endpoint
      }] = _ref6;
      return !this.mapping.has(endpoint || `${section}_${method}`);
    }).reduce((exposed, _ref7) => {
      let [method, {
        endpoint
      }] = _ref7;
      const def = methods[method];
      const isSubscription = !!def.pubsub;
      const jsonrpc = endpoint || `${section}_${method}`;
      this.mapping.set(jsonrpc, _objectSpread(_objectSpread({}, def), {}, {
        isSubscription,
        jsonrpc,
        method,
        section
      }));
      exposed[method] = isSubscription ? this._createMethodSubscribe(section, method, def) : this._createMethodSend(section, method, def);
      return exposed;
    }, {});
  }

  _memomize(creator, def) {
    const memoized = (0, _util.memoize)(creator('scale'), {
      getInstanceId: () => (0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId]
    });
    memoized.json = creator('json');
    memoized.raw = creator('raw');
    memoized.meta = def;
    return memoized;
  }

  _createMethodSend(section, method, def) {
    const rpcName = def.endpoint || `${section}_${method}`;
    const hashIndex = def.params.findIndex(_ref8 => {
      let {
        isHistoric
      } = _ref8;
      return isHistoric;
    });
    let memoized = null; // execute the RPC call, doing a registry swap for historic as applicable

    const callWithRegistry = async (outputAs, values) => {
      const blockHash = hashIndex === -1 ? null : values[hashIndex];
      const {
        registry
      } = outputAs === 'scale' && blockHash && (0, _classPrivateFieldLooseBase2.default)(this, _getBlockRegistry)[_getBlockRegistry] ? await (0, _classPrivateFieldLooseBase2.default)(this, _getBlockRegistry)[_getBlockRegistry]((0, _util.u8aToU8a)(blockHash)) : {
        registry: (0, _classPrivateFieldLooseBase2.default)(this, _registryDefault)[_registryDefault]
      };

      const params = this._formatInputs(registry, null, def, values);

      const data = await this.provider.send(rpcName, params.map(param => param.toJSON()));
      return outputAs === 'scale' ? this._formatOutput(registry, blockHash, method, def, params, data) : registry.createType(outputAs === 'raw' ? 'Raw' : 'Json', data);
    };

    const creator = outputAs => function () {
      for (var _len = arguments.length, values = new Array(_len), _key = 0; _key < _len; _key++) {
        values[_key] = arguments[_key];
      }

      const isDelayed = outputAs === 'scale' && hashIndex !== -1 && !!values[hashIndex];
      return new _rxjs.Observable(observer => {
        callWithRegistry(outputAs, values).then(value => {
          observer.next(value);
          observer.complete();
        }).catch(error => {
          logErrorMessage(method, def, error);
          observer.error(error);
          observer.complete();
        });
        return () => {
          var _memoized;

          // delete old results from cache
          (_memoized = memoized) === null || _memoized === void 0 ? void 0 : _memoized.unmemoize(...values);
        };
      }).pipe((0, _rxjs.publishReplay)(1), // create a Replay(1)
      isDelayed ? (0, _index.refCountDelay)() // Unsubscribe after delay
      : (0, _rxjs.refCount)());
    };

    memoized = this._memomize(creator, def);
    return memoized;
  } // create a subscriptor, it subscribes once and resolves with the id as subscribe


  _createSubscriber(_ref9, errorHandler) {
    let {
      paramsJson,
      subName,
      subType,
      update
    } = _ref9;
    return new Promise((resolve, reject) => {
      this.provider.subscribe(subType, subName, paramsJson, update).then(resolve).catch(error => {
        errorHandler(error);
        reject(error);
      });
    });
  }

  _createMethodSubscribe(section, method, def) {
    var _this = this;

    const [updateType, subMethod, unsubMethod] = def.pubsub;
    const subName = `${section}_${subMethod}`;
    const unsubName = `${section}_${unsubMethod}`;
    const subType = `${section}_${updateType}`;
    let memoized = null;

    const creator = outputAs => function () {
      for (var _len2 = arguments.length, values = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        values[_key2] = arguments[_key2];
      }

      return new _rxjs.Observable(observer => {
        // Have at least an empty promise, as used in the unsubscribe
        let subscriptionPromise = Promise.resolve(null);

        const registry = (0, _classPrivateFieldLooseBase2.default)(_this, _registryDefault)[_registryDefault];

        const errorHandler = error => {
          logErrorMessage(method, def, error);
          observer.error(error);
        };

        try {
          const params = _this._formatInputs(registry, null, def, values);

          const paramsJson = params.map(param => param.toJSON());

          const update = (error, result) => {
            if (error) {
              logErrorMessage(method, def, error);
              return;
            }

            try {
              observer.next(outputAs === 'scale' ? _this._formatOutput(registry, null, method, def, params, result) : registry.createType(outputAs === 'raw' ? 'Raw' : 'Json', result));
            } catch (error) {
              observer.error(error);
            }
          };

          subscriptionPromise = _this._createSubscriber({
            paramsJson,
            subName,
            subType,
            update
          }, errorHandler);
        } catch (error) {
          errorHandler(error);
        } // Teardown logic


        return () => {
          var _memoized2;

          // Delete from cache, so old results don't hang around
          (_memoized2 = memoized) === null || _memoized2 === void 0 ? void 0 : _memoized2.unmemoize(...values); // Unsubscribe from provider

          subscriptionPromise.then(subscriptionId => (0, _util.isNull)(subscriptionId) ? Promise.resolve(false) : _this.provider.unsubscribe(subType, unsubName, subscriptionId)).catch(error => logErrorMessage(method, def, error));
        };
      }).pipe((0, _index.drr)());
    };

    memoized = this._memomize(creator, def);
    return memoized;
  }

  _formatInputs(registry, blockHash, def, inputs) {
    const reqArgCount = def.params.filter(_ref10 => {
      let {
        isOptional
      } = _ref10;
      return !isOptional;
    }).length;
    const optText = reqArgCount === def.params.length ? '' : ` (${def.params.length - reqArgCount} optional)`;
    (0, _util.assert)(inputs.length >= reqArgCount && inputs.length <= def.params.length, () => `Expected ${def.params.length} parameters${optText}, ${inputs.length} found instead`);
    return inputs.map((input, index) => registry.createTypeUnsafe(def.params[index].type, [input], {
      blockHash
    }));
  }

  _formatOutput(registry, blockHash, method, rpc, params, result) {
    if (rpc.type === 'StorageData') {
      const key = params[0];
      return this._formatStorageData(registry, blockHash, key, result);
    } else if (rpc.type === 'StorageChangeSet') {
      const keys = params[0];
      return keys ? this._formatStorageSet(registry, result.block, keys, result.changes) : registry.createType('StorageChangeSet', result);
    } else if (rpc.type === 'Vec<StorageChangeSet>') {
      const mapped = result.map(_ref11 => {
        let {
          block,
          changes
        } = _ref11;
        return [registry.createType('Hash', block), this._formatStorageSet(registry, block, params[0], changes)];
      }); // we only query at a specific block, not a range - flatten

      return method === 'queryStorageAt' ? mapped[0][1] : mapped;
    }

    return registry.createTypeUnsafe(rpc.type, [result], {
      blockHash
    });
  }

  _formatStorageData(registry, blockHash, key, value) {
    const isEmpty = (0, _util.isNull)(value); // we convert to Uint8Array since it maps to the raw encoding, all
    // data will be correctly encoded (incl. numbers, excl. :code)

    const input = isEmpty ? null : isTreatAsHex(key) ? value : (0, _util.u8aToU8a)(value);
    return this._newType(registry, blockHash, key, input, isEmpty);
  }

  _formatStorageSet(registry, blockHash, keys, changes) {
    // For StorageChangeSet, the changes has the [key, value] mappings
    const withCache = keys.length !== 1; // multiple return values (via state.storage subscription), decode the values
    // one at a time, all based on the query types. Three values can be returned -
    //   - Codec - There is a valid value, non-empty
    //   - null - The storage key is empty

    return keys.reduce((results, key, index) => {
      results.push(this._formatStorageSetEntry(registry, blockHash, key, changes, withCache, index));
      return results;
    }, []);
  }

  _formatStorageSetEntry(registry, blockHash, key, changes, witCache, entryIndex) {
    const hexKey = key.toHex();
    const found = changes.find(_ref12 => {
      let [key] = _ref12;
      return key === hexKey;
    }); // if we don't find the value, this is our fallback
    //   - in the case of an array of values, fill the hole from the cache
    //   - if a single result value, don't fill - it is not an update hole
    //   - fallback to an empty option in all cases

    const value = (0, _util.isUndefined)(found) ? witCache && (0, _classPrivateFieldLooseBase2.default)(this, _storageCache)[_storageCache].get(hexKey) || null : found[1];
    const isEmpty = (0, _util.isNull)(value);
    const input = isEmpty || isTreatAsHex(key) ? value : (0, _util.u8aToU8a)(value); // store the retrieved result - the only issue with this cache is that there is no
    // clearing of it, so very long running processes (not just a couple of hours, longer)
    // will increase memory beyond what is allowed.

    (0, _classPrivateFieldLooseBase2.default)(this, _storageCache)[_storageCache].set(hexKey, value);

    return this._newType(registry, blockHash, key, input, isEmpty, entryIndex);
  }

  _newType(registry, blockHash, key, input, isEmpty) {
    let entryIndex = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : -1;
    // single return value (via state.getStorage), decode the value based on the
    // outputType that we have specified. Fallback to Raw on nothing
    const type = key.outputType || 'Raw';
    const meta = key.meta || EMPTY_META;
    const entryNum = entryIndex === -1 ? '' : ` entry ${entryIndex}:`;

    try {
      return registry.createTypeUnsafe(type, [isEmpty ? meta.fallback ? (0, _util.hexToU8a)(meta.fallback.toHex()) : undefined : meta.modifier.isOptional ? registry.createTypeUnsafe(type, [input], {
        blockHash,
        isPedantic: true
      }) : input], {
        blockHash,
        isOptional: meta.modifier.isOptional,
        isPedantic: !meta.modifier.isOptional
      });
    } catch (error) {
      throw new Error(`Unable to decode storage ${key.section || 'unknown'}.${key.method || 'unknown'}:${entryNum}: ${error.message}`);
    }
  }

}

exports.RpcCore = RpcCore;