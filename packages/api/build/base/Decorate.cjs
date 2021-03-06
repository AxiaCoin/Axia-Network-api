"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Decorate = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseKey"));

var _rxjs = require("rxjs");

var _apiDerive = require("@axia-js/api-derive");

var _rpcCore = require("@axia-js/rpc-core");

var _rpcProvider = require("@axia-js/rpc-provider");

var _types = require("@axia-js/types");

var _util = require("@axia-js/util");

var _index = require("../submittable/index.cjs");

var _augmentObject = require("../util/augmentObject.cjs");

var _decorate = require("../util/decorate.cjs");

var _validate = require("../util/validate.cjs");

var _Events = require("./Events.cjs");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// the max amount of keys/values that we will retrieve at once
const PAGE_SIZE_K = 1000; // limit aligned with the 1k on the node (trie lookups are heavy)

const PAGE_SIZE_V = 250; // limited since the data may be very large (e.g. misfiring elections)

const l = (0, _util.logger)('api/init');
let instanceCounter = 0;

var _instanceId = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("instanceId");

var _registry = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("registry");

class Decorate extends _Events.Events {
  // HACK Use BN import so decorateDerive works... yes, wtf.
  // latest extrinsic version

  /**
   * This is the one and only method concrete children classes need to implement.
   * It's a higher-order function, which takes one argument
   * `method: Method extends (...args: any[]) => Observable<any>`
   * (and one optional `options`), and should return the user facing method.
   * For example:
   * - For ApiRx, `decorateMethod` should just be identity, because the input
   * function is already an Observable
   * - For ApiPromise, `decorateMethod` should return a function that takes all
   * the parameters from `method`, adds an optional `callback` argument, and
   * returns a Promise.
   *
   * We could easily imagine other user-facing interfaces, which are simply
   * implemented by transforming the Observable to Stream/Iterator/Kefir/Bacon
   * via `decorateMethod`.
   */

  /**
   * @description Create an instance of the class
   *
   * @param options Options object to create API instance or a Provider instance
   *
   * @example
   * <BR>
   *
   * ```javascript
   * import Api from '@axia-js/api/promise';
   *
   * const api = new Api().isReady();
   *
   * api.rpc.subscribeNewHeads((header) => {
   *   console.log(`new block #${header.number.toNumber()}`);
   * });
   * ```
   */
  constructor(options, type, decorateMethod) {
    var _options$source;

    super();
    Object.defineProperty(this, _instanceId, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _registry, {
      writable: true,
      value: void 0
    });
    this.__phantom = new _util.BN(0);
    this._consts = {};
    this._derive = void 0;
    this._errors = {};
    this._events = {};
    this._extrinsics = void 0;
    this._extrinsicType = 4;
    this._genesisHash = void 0;
    this._isConnected = void 0;
    this._isReady = false;
    this._options = void 0;
    this._query = {};
    this._queryMulti = void 0;
    this._rpc = void 0;
    this._rpcCore = void 0;
    this._runtimeChain = void 0;
    this._runtimeMetadata = void 0;
    this._runtimeVersion = void 0;
    this._rx = {
      consts: {},
      query: {},
      tx: {}
    };
    this._type = void 0;
    this._decorateMethod = void 0;

    this._rxDecorateMethod = method => {
      return method;
    };

    (0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId] = `${++instanceCounter}`;
    (0, _classPrivateFieldLooseBase2.default)(this, _registry)[_registry] = ((_options$source = options.source) === null || _options$source === void 0 ? void 0 : _options$source.registry) || options.registry || new _types.TypeRegistry();
    this._rx.registry = (0, _classPrivateFieldLooseBase2.default)(this, _registry)[_registry];
    const thisProvider = options.source ? options.source._rpcCore.provider.clone() : options.provider || new _rpcProvider.WsProvider();
    this._decorateMethod = decorateMethod;
    this._options = options;
    this._type = type; // The RPC interface decorates the known interfaces on init

    this._rpcCore = new _rpcCore.RpcCore((0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId], (0, _classPrivateFieldLooseBase2.default)(this, _registry)[_registry], thisProvider, this._options.rpc);
    this._isConnected = new _rxjs.BehaviorSubject(this._rpcCore.provider.isConnected);
    this._rx.hasSubscriptions = this._rpcCore.provider.hasSubscriptions;
  }
  /**
   * @description Return the current used registry
   */


  get registry() {
    return (0, _classPrivateFieldLooseBase2.default)(this, _registry)[_registry];
  }
  /**
   * @description Creates an instance of a type as registered
   */


  createType(type) {
    for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }

    return (0, _classPrivateFieldLooseBase2.default)(this, _registry)[_registry].createType(type, ...params);
  }
  /**
   * @description Register additional user-defined of chain-specific types in the type registry
   */


  registerTypes(types) {
    types && (0, _classPrivateFieldLooseBase2.default)(this, _registry)[_registry].register(types);
  }
  /**
   * @returns `true` if the API operates with subscriptions
   */


  get hasSubscriptions() {
    return this._rpcCore.provider.hasSubscriptions;
  }
  /**
   * @returns `true` if the API decorate multi-key queries
   */


  get supportMulti() {
    return this._rpcCore.provider.hasSubscriptions || !!this._rpcCore.state.queryStorageAt;
  }

  _createDecorated(registry, fromEmpty, blockHash, decoratedApi) {
    if (!decoratedApi) {
      decoratedApi = {
        consts: {},
        errors: {},
        events: {},
        query: {}
      };
    }

    if (!registry.decoratedMeta) {
      registry.decoratedMeta = (0, _types.expandMetadata)(registry.registry, registry.metadata);
    } // adjust the versioned registry


    (0, _augmentObject.augmentObject)('consts', registry.decoratedMeta.consts, decoratedApi.consts, fromEmpty);
    (0, _augmentObject.augmentObject)('errors', registry.decoratedMeta.errors, decoratedApi.errors, fromEmpty);
    (0, _augmentObject.augmentObject)('events', registry.decoratedMeta.events, decoratedApi.events, fromEmpty);
    const storage = blockHash ? this._decorateStorageAt(registry.decoratedMeta, this._decorateMethod, blockHash) : this._decorateStorage(registry.decoratedMeta, this._decorateMethod);
    (0, _augmentObject.augmentObject)('query', storage, decoratedApi.query, fromEmpty);
    return {
      decoratedApi,
      decoratedMeta: registry.decoratedMeta
    };
  }

  _injectMetadata(registry, fromEmpty) {
    // clear the decoration, we are redoing it here
    if (fromEmpty || !registry.decoratedApi) {
      registry.decoratedApi = {
        consts: {},
        errors: {},
        events: {},
        query: {}
      };
    }

    const {
      decoratedApi,
      decoratedMeta
    } = this._createDecorated(registry, fromEmpty, null, registry.decoratedApi);

    this._consts = decoratedApi.consts;
    this._errors = decoratedApi.errors;
    this._events = decoratedApi.events;
    this._query = decoratedApi.query;

    if (fromEmpty || !this._extrinsics) {
      this._extrinsics = this._decorateExtrinsics(decoratedMeta, this._decorateMethod);
      this._rx.tx = this._decorateExtrinsics(decoratedMeta, this._rxDecorateMethod);
    } else {
      (0, _augmentObject.augmentObject)('tx', this._decorateExtrinsics(decoratedMeta, this._decorateMethod), this._extrinsics, false);
      (0, _augmentObject.augmentObject)(null, this._decorateExtrinsics(decoratedMeta, this._rxDecorateMethod), this._rx.tx, false);
    } // rx


    (0, _augmentObject.augmentObject)(null, this._decorateStorage(decoratedMeta, this._rxDecorateMethod), this._rx.query, fromEmpty);
    (0, _augmentObject.augmentObject)(null, decoratedMeta.consts, this._rx.consts, fromEmpty);
  }
  /**
   * @deprecated
   * backwards compatible endpoint for metadata injection, may be removed in the future (However, it is still useful for testing injection)
   */


  injectMetadata(metadata, fromEmpty, registry) {
    this._injectMetadata({
      metadata,
      registry: registry || (0, _classPrivateFieldLooseBase2.default)(this, _registry)[_registry],
      specName: (0, _classPrivateFieldLooseBase2.default)(this, _registry)[_registry].createType('Text'),
      specVersion: _util.BN_ZERO
    }, fromEmpty);
  }

  _decorateFunctionMeta(input, output) {
    output.meta = input.meta;
    output.method = input.method;
    output.section = input.section;
    output.toJSON = input.toJSON;

    if (input.callIndex) {
      output.callIndex = input.callIndex;
    }

    return output;
  } // Filter all RPC methods based on the results of the rpc_methods call. We do this in the following
  // manner to cater for both old and new:
  //   - when the number of entries are 0, only remove the ones with isOptional (account & contracts)
  //   - when non-zero, remove anything that is not in the array (we don't do this)


  _filterRpc(methods, additional) {
    // add any specific user-base RPCs
    if (Object.keys(additional).length !== 0) {
      this._rpcCore.addUserInterfaces(additional); // re-decorate, only adding any new additional interfaces


      this._decorateRpc(this._rpcCore, this._decorateMethod, this._rpc);

      this._decorateRpc(this._rpcCore, this._rxDecorateMethod, this._rx.rpc);
    }

    this._filterRpcMethods(methods);
  }

  _filterRpcMethods(exposed) {
    const hasResults = exposed.length !== 0;
    const allKnown = [...this._rpcCore.mapping.entries()];
    const allKeys = allKnown.reduce((allKeys, _ref) => {
      let [, {
        alias,
        endpoint,
        method,
        pubsub,
        section
      }] = _ref;
      allKeys.push(`${section}_${method}`);

      if (pubsub) {
        allKeys.push(`${section}_${pubsub[1]}`);
        allKeys.push(`${section}_${pubsub[2]}`);
      }

      if (alias) {
        allKeys.push(...alias);
      }

      if (endpoint) {
        allKeys.push(endpoint);
      }

      return allKeys;
    }, []);
    const unknown = exposed.filter(k => !allKeys.includes(k));
    const deletion = allKnown.filter(_ref2 => {
      let [k] = _ref2;
      return hasResults && !exposed.includes(k) && k !== 'rpc_methods';
    });

    if (unknown.length) {
      l.warn(`RPC methods not decorated: ${unknown.join(', ')}`);
    } // loop through all entries we have (populated in decorate) and filter as required
    // only remove when we have results and method missing, or with no results if optional


    deletion.forEach(_ref3 => {
      let [, {
        method,
        section
      }] = _ref3;
      delete this._rpc[section][method];
      delete this._rx.rpc[section][method];
    });
  }

  _decorateRpc(rpc, decorateMethod) {
    let input = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return rpc.sections.reduce((out, _sectionName) => {
      const sectionName = _sectionName;

      if (!out[sectionName]) {
        // out and section here are horrors to get right from a typing perspective :(
        out[sectionName] = Object.entries(rpc[sectionName]).reduce((section, _ref4) => {
          let [methodName, method] = _ref4;

          //  skip subscriptions where we have a non-subscribe interface
          if (this.hasSubscriptions || !(methodName.startsWith('subscribe') || methodName.startsWith('unsubscribe'))) {
            section[methodName] = decorateMethod(method, {
              methodName
            }); // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access

            section[methodName].json = decorateMethod(method.json, {
              methodName
            }); // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access

            section[methodName].raw = decorateMethod(method.raw, {
              methodName
            }); // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access

            section[methodName].meta = method.meta;
          }

          return section;
        }, {});
      }

      return out;
    }, input);
  } // only be called if supportMulti is true


  _decorateMulti(decorateMethod) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return decorateMethod(calls => (this.hasSubscriptions ? this._rpcCore.state.subscribeStorage : this._rpcCore.state.queryStorageAt)(calls.map(arg => Array.isArray(arg) ? arg[0].creator.meta.type.asMap.hashers.length === 1 ? [arg[0].creator, arg.slice(1)] : [arg[0].creator, ...arg.slice(1)] : [arg.creator])));
  }

  _decorateExtrinsics(_ref5, decorateMethod) {
    let {
      tx
    } = _ref5;
    const creator = (0, _index.createSubmittable)(this._type, this._rx, decorateMethod);
    return Object.entries(tx).reduce((out, _ref6) => {
      let [name, section] = _ref6;
      out[name] = Object.entries(section).reduce((out, _ref7) => {
        let [name, method] = _ref7;
        out[name] = this._decorateExtrinsicEntry(method, creator);
        return out;
      }, {});
      return out;
    }, creator);
  }

  _decorateExtrinsicEntry(method, creator) {
    const decorated = function () {
      return creator(method(...arguments));
    }; // pass through the `.is`


    decorated.is = other => method.is(other); // eslint-disable-next-line @typescript-eslint/no-unsafe-return


    return this._decorateFunctionMeta(method, decorated);
  }

  _decorateStorage(_ref8, decorateMethod) {
    let {
      query
    } = _ref8;
    return Object.entries(query).reduce((out, _ref9) => {
      let [name, section] = _ref9;
      out[name] = Object.entries(section).reduce((out, _ref10) => {
        let [name, method] = _ref10;
        out[name] = this._decorateStorageEntry(method, decorateMethod);
        return out;
      }, {});
      return out;
    }, {});
  }

  _decorateStorageAt(_ref11, decorateMethod, blockHash) {
    let {
      query
    } = _ref11;
    return Object.entries(query).reduce((out, _ref12) => {
      let [name, section] = _ref12;
      out[name] = Object.entries(section).reduce((out, _ref13) => {
        let [name, method] = _ref13;
        out[name] = this._decorateStorageEntryAt(method, decorateMethod, blockHash);
        return out;
      }, {});
      return out;
    }, {});
  }

  _decorateStorageEntry(creator, decorateMethod) {
    var _this = this;

    // get the storage arguments, with DoubleMap as an array entry, otherwise spread
    const getArgs = args => (0, _validate.extractStorageArgs)((0, _classPrivateFieldLooseBase2.default)(this, _registry)[_registry], creator, args); // Disable this where it occurs for each field we are decorating

    /* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */


    const decorated = this._decorateStorageCall(creator, decorateMethod);

    decorated.creator = creator;
    decorated.at = decorateMethod(function (hash) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      return _this._rpcCore.state.getStorage(getArgs(args), hash);
    });
    decorated.hash = decorateMethod(function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return _this._rpcCore.state.getStorageHash(getArgs(args));
    });

    decorated.is = key => key.section === creator.section && key.method === creator.method;

    decorated.key = function () {
      return (0, _util.u8aToHex)((0, _util.compactStripLength)(creator(...arguments))[1]);
    };

    decorated.keyPrefix = function () {
      return (0, _util.u8aToHex)(creator.keyPrefix(...arguments));
    };

    decorated.range = decorateMethod(function (range) {
      for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }

      return _this._decorateStorageRange(decorated, args, range);
    });
    decorated.size = decorateMethod(function () {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return _this._rpcCore.state.getStorageSize(getArgs(args));
    });
    decorated.sizeAt = decorateMethod(function (hash) {
      for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
        args[_key6 - 1] = arguments[_key6];
      }

      return _this._rpcCore.state.getStorageSize(getArgs(args), hash);
    }); // .keys() & .entries() only available on map types

    if (creator.iterKey && creator.meta.type.isMap) {
      decorated.entries = decorateMethod((0, _rpcCore.memo)((0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId], function () {
        for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
          args[_key7] = arguments[_key7];
        }

        return _this._retrieveMapEntries(creator, null, args);
      }));
      decorated.entriesAt = decorateMethod((0, _rpcCore.memo)((0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId], function (hash) {
        for (var _len8 = arguments.length, args = new Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
          args[_key8 - 1] = arguments[_key8];
        }

        return _this._retrieveMapEntries(creator, hash, args);
      }));
      decorated.entriesPaged = decorateMethod((0, _rpcCore.memo)((0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId], opts => this._retrieveMapEntriesPaged(creator, opts)));
      decorated.keys = decorateMethod((0, _rpcCore.memo)((0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId], function () {
        for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
          args[_key9] = arguments[_key9];
        }

        return _this._retrieveMapKeys(creator, null, args);
      }));
      decorated.keysAt = decorateMethod((0, _rpcCore.memo)((0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId], function (hash) {
        for (var _len10 = arguments.length, args = new Array(_len10 > 1 ? _len10 - 1 : 0), _key10 = 1; _key10 < _len10; _key10++) {
          args[_key10 - 1] = arguments[_key10];
        }

        return _this._retrieveMapKeys(creator, hash, args);
      }));
      decorated.keysPaged = decorateMethod((0, _rpcCore.memo)((0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId], opts => this._retrieveMapKeysPaged(creator, opts)));
    }

    if (this.supportMulti && creator.meta.type.isMap) {
      // When using double map storage function, user need to pass double map key as an array
      decorated.multi = decorateMethod(args => creator.meta.type.asMap.hashers.length === 1 ? this._retrieveMulti(args.map(a => [creator, [a]])) : this._retrieveMulti(args.map(a => [creator, a])));
    }
    /* eslint-enable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */


    return this._decorateFunctionMeta(creator, decorated);
  }

  _decorateStorageEntryAt(creator, decorateMethod, blockHash) {
    var _this2 = this;

    // get the storage arguments, with DoubleMap as an array entry, otherwise spread
    const getArgs = args => (0, _validate.extractStorageArgs)((0, _classPrivateFieldLooseBase2.default)(this, _registry)[_registry], creator, args); // Disable this where it occurs for each field we are decorating

    /* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */


    const decorated = decorateMethod(function () {
      for (var _len11 = arguments.length, args = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        args[_key11] = arguments[_key11];
      }

      return _this2._rpcCore.state.getStorage(getArgs(args), blockHash);
    });
    decorated.creator = creator;
    decorated.hash = decorateMethod(function () {
      for (var _len12 = arguments.length, args = new Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
        args[_key12] = arguments[_key12];
      }

      return _this2._rpcCore.state.getStorageHash(getArgs(args), blockHash);
    });

    decorated.is = key => key.section === creator.section && key.method === creator.method;

    decorated.key = function () {
      for (var _len13 = arguments.length, args = new Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
        args[_key13] = arguments[_key13];
      }

      return (0, _util.u8aToHex)((0, _util.compactStripLength)(creator(creator.meta.type.isPlain ? undefined : args))[1]);
    };

    decorated.keyPrefix = function () {
      return (0, _util.u8aToHex)(creator.keyPrefix(...arguments));
    };

    decorated.size = decorateMethod(function () {
      for (var _len14 = arguments.length, args = new Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
        args[_key14] = arguments[_key14];
      }

      return _this2._rpcCore.state.getStorageSize(getArgs(args), blockHash);
    }); // FIXME NMap support
    // .keys() & .entries() only available on map types

    if (creator.iterKey && creator.meta.type.isMap) {
      decorated.entries = decorateMethod((0, _rpcCore.memo)((0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId], function () {
        for (var _len15 = arguments.length, args = new Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
          args[_key15] = arguments[_key15];
        }

        return _this2._retrieveMapEntries(creator, blockHash, args);
      }));
      decorated.keys = decorateMethod((0, _rpcCore.memo)((0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId], function () {
        for (var _len16 = arguments.length, args = new Array(_len16), _key16 = 0; _key16 < _len16; _key16++) {
          args[_key16] = arguments[_key16];
        }

        return _this2._retrieveMapKeys(creator, blockHash, args);
      }));
    }
    /* eslint-enable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */


    return this._decorateFunctionMeta(creator, decorated);
  } // Decorate the base storage call. In the case or rxjs or promise-without-callback (await)
  // we make a subscription, alternatively we push this through a single-shot query


  _decorateStorageCall(creator, decorateMethod) {
    var _this3 = this;

    return decorateMethod(function () {
      for (var _len17 = arguments.length, args = new Array(_len17), _key17 = 0; _key17 < _len17; _key17++) {
        args[_key17] = arguments[_key17];
      }

      return _this3.hasSubscriptions ? _this3._rpcCore.state.subscribeStorage([(0, _validate.extractStorageArgs)((0, _classPrivateFieldLooseBase2.default)(_this3, _registry)[_registry], creator, args)]).pipe((0, _rxjs.map)(_ref14 => {
        let [data] = _ref14;
        return data;
      }) // extract first/only result from list
      ) : _this3._rpcCore.state.getStorage((0, _validate.extractStorageArgs)((0, _classPrivateFieldLooseBase2.default)(_this3, _registry)[_registry], creator, args));
    }, {
      methodName: creator.method,
      overrideNoSub: function () {
        for (var _len18 = arguments.length, args = new Array(_len18), _key18 = 0; _key18 < _len18; _key18++) {
          args[_key18] = arguments[_key18];
        }

        return _this3._rpcCore.state.getStorage((0, _validate.extractStorageArgs)((0, _classPrivateFieldLooseBase2.default)(_this3, _registry)[_registry], creator, args));
      }
    });
  }

  _decorateStorageRange(decorated, args, range) {
    const outputType = (0, _types.unwrapStorageType)((0, _classPrivateFieldLooseBase2.default)(this, _registry)[_registry], decorated.creator.meta.type, decorated.creator.meta.modifier.isOptional);
    return this._rpcCore.state.queryStorage([decorated.key(...args)], ...range).pipe((0, _rxjs.map)(result => result.map(_ref15 => {
      let [blockHash, [value]] = _ref15;
      return [blockHash, this.createType(outputType, value.isSome ? value.unwrap().toHex() : undefined)];
    })));
  } // retrieve a set of values for a specific set of keys - here we chunk the keys into PAGE_SIZE sizes


  _retrieveMulti(keys) {
    if (!keys.length) {
      return (0, _rxjs.of)([]);
    }

    const queryCall = this.hasSubscriptions ? this._rpcCore.state.subscribeStorage : this._rpcCore.state.queryStorageAt;
    return (0, _rxjs.combineLatest)((0, _util.arrayChunk)(keys, PAGE_SIZE_V).map(keys => queryCall(keys))).pipe((0, _rxjs.map)(_util.arrayFlatten));
  }

  _retrieveMapKeys(_ref16, at, args) {
    let {
      iterKey,
      meta,
      method,
      section
    } = _ref16;
    (0, _util.assert)(iterKey && meta.type.isMap, 'keys can only be retrieved on maps');
    const headKey = iterKey(...args).toHex();
    const startSubject = new _rxjs.BehaviorSubject(headKey);
    const queryCall = at ? startKey => this._rpcCore.state.getKeysPaged(headKey, PAGE_SIZE_K, startKey, at) : startKey => this._rpcCore.state.getKeysPaged(headKey, PAGE_SIZE_K, startKey);
    return startSubject.pipe((0, _rxjs.switchMap)(queryCall), (0, _rxjs.map)(keys => keys.map(key => key.setMeta(meta, section, method))), (0, _rxjs.tap)(keys => {
      setTimeout(() => {
        keys.length === PAGE_SIZE_K ? startSubject.next(keys[PAGE_SIZE_K - 1].toHex()) : startSubject.complete();
      }, 0);
    }), (0, _rxjs.toArray)(), // toArray since we want to startSubject to be completed
    (0, _rxjs.map)(_util.arrayFlatten));
  }

  _retrieveMapKeysPaged(_ref17, opts) {
    let {
      iterKey,
      meta,
      method,
      section
    } = _ref17;
    (0, _util.assert)(iterKey && meta.type.isMap, 'keys can only be retrieved on maps');
    const headKey = iterKey(...opts.args).toHex();
    return this._rpcCore.state.getKeysPaged(headKey, opts.pageSize, opts.startKey || headKey).pipe((0, _rxjs.map)(keys => keys.map(key => key.setMeta(meta, section, method))));
  }

  _retrieveMapEntries(entry, at, args) {
    const query = at ? keyset => this._rpcCore.state.queryStorageAt(keyset, at) : keyset => this._rpcCore.state.queryStorageAt(keyset);
    return this._retrieveMapKeys(entry, at, args).pipe((0, _rxjs.switchMap)(keys => keys.length ? (0, _rxjs.combineLatest)((0, _util.arrayChunk)(keys, PAGE_SIZE_V).map(query)).pipe((0, _rxjs.map)(valsArr => (0, _util.arrayFlatten)(valsArr).map((value, index) => [keys[index], value]))) : (0, _rxjs.of)([])));
  }

  _retrieveMapEntriesPaged(entry, opts) {
    return this._retrieveMapKeysPaged(entry, opts).pipe((0, _rxjs.switchMap)(keys => keys.length ? this._rpcCore.state.queryStorageAt(keys).pipe((0, _rxjs.map)(valsArr => valsArr.map((value, index) => [keys[index], value]))) : (0, _rxjs.of)([])));
  }

  _decorateDeriveRx(decorateMethod) {
    var _this$_runtimeVersion, _this$_options$typesB, _this$_options$typesB2, _this$_options$typesB3;

    const specName = (_this$_runtimeVersion = this._runtimeVersion) === null || _this$_runtimeVersion === void 0 ? void 0 : _this$_runtimeVersion.specName.toString();

    const derives = _objectSpread(_objectSpread({}, this._options.derives), ((_this$_options$typesB = this._options.typesBundle) === null || _this$_options$typesB === void 0 ? void 0 : (_this$_options$typesB2 = _this$_options$typesB.spec) === null || _this$_options$typesB2 === void 0 ? void 0 : (_this$_options$typesB3 = _this$_options$typesB2[specName !== null && specName !== void 0 ? specName : '']) === null || _this$_options$typesB3 === void 0 ? void 0 : _this$_options$typesB3.derives) || {}); // Pull in derive from api-derive


    const derive = (0, _apiDerive.decorateDerive)((0, _classPrivateFieldLooseBase2.default)(this, _instanceId)[_instanceId], this._rx, derives);
    return (0, _decorate.decorateSections)(derive, decorateMethod);
  }

  _decorateDerive(decorateMethod) {
    return (0, _decorate.decorateSections)(this._rx.derive, decorateMethod);
  }
  /**
   * Put the `this.onCall` function of ApiRx here, because it is needed by
   * `api._rx`.
   */


}

exports.Decorate = Decorate;