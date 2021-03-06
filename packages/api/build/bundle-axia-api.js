const axiaApi = (function (exports, keyring, util, types, utilCrypto) {
  'use strict';

  const global = window;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _classPrivateFieldBase(receiver, privateKey) {
    if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
      throw new TypeError("attempted to use private field on non-instance");
    }

    return receiver;
  }

  var id = 0;
  function _classPrivateFieldKey(name) {
    return "__private_" + id++ + "_" + name;
  }

  // Copyright 2017-2021 @axia-js/x-global authors & contributors
  const xglobal = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : undefined;

  // Copyright 2017-2021 @axia-js/x-fetch authors & contributors
  const fetch = xglobal.fetch;

  function formatErrorData(data) {
    if (util.isUndefined(data)) {
      return '';
    }

    const formatted = `: ${util.isString(data) ? data.replace(/Error\("/g, '').replace(/\("/g, '(').replace(/"\)/g, ')').replace(/\(/g, ', ').replace(/\)/g, '') : util.stringify(data)}`; // We need some sort of cut-off here since these can be very large and
    // very nested, pick a number and trim the result display to it

    return formatted.length <= 256 ? formatted : `${formatted.substr(0, 255)}…`;
  }
  /** @internal */


  var _id = /*#__PURE__*/_classPrivateFieldKey("id");

  class RpcCoder {
    constructor() {
      Object.defineProperty(this, _id, {
        writable: true,
        value: 0
      });
    }

    decodeResponse(response) {
      util.assert(response, 'Empty response object received');
      util.assert(response.jsonrpc === '2.0', 'Invalid jsonrpc field in decoded object');
      const isSubscription = !util.isUndefined(response.params) && !util.isUndefined(response.method);
      util.assert(util.isNumber(response.id) || isSubscription && (util.isNumber(response.params.subscription) || util.isString(response.params.subscription)), 'Invalid id field in decoded object');

      this._checkError(response.error);

      util.assert(!util.isUndefined(response.result) || isSubscription, 'No result found in JsonRpc response');

      if (isSubscription) {
        this._checkError(response.params.error);

        return response.params.result;
      }

      return response.result;
    }

    encodeJson(method, params) {
      return util.stringify(this.encodeObject(method, params));
    }

    encodeObject(method, params) {
      return {
        id: ++_classPrivateFieldBase(this, _id)[_id],
        jsonrpc: '2.0',
        method,
        params
      };
    }

    getId() {
      return _classPrivateFieldBase(this, _id)[_id];
    }

    _checkError(error) {
      if (error) {
        const {
          code,
          data,
          message
        } = error;
        throw new Error(`${code}: ${message}${formatErrorData(data)}`);
      }
    }

  }

  // Copyright 2017-2021 @axia-js/rpc-provider authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  const HTTP_URL = 'http://127.0.0.1:9933';
  const WS_URL = 'ws://127.0.0.1:9944';
  const defaults = {
    HTTP_URL,
    WS_URL
  };

  function ownKeys$v(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$v(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$v(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$v(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  const ERROR_SUBSCRIBE = 'HTTP Provider does not have subscriptions, use WebSockets instead';
  const l$7 = util.logger('api-http');
  /**
   * # @axia-js/rpc-provider
   *
   * @name HttpProvider
   *
   * @description The HTTP Provider allows sending requests using HTTP to a HTTP RPC server TCP port. It does not support subscriptions so you won't be able to listen to events such as new blocks or balance changes. It is usually preferable using the [[WsProvider]].
   *
   * @example
   * <BR>
   *
   * ```javascript
   * import Api from '@axia-js/api/promise';
   * import { HttpProvider } from '@axia-js/rpc-provider';
   *
   * const provider = new HttpProvider('http://127.0.0.1:9933');
   * const api = new Api(provider);
   * ```
   *
   * @see [[WsProvider]]
   */

  var _coder$1 = /*#__PURE__*/_classPrivateFieldKey("coder");

  var _endpoint = /*#__PURE__*/_classPrivateFieldKey("endpoint");

  var _headers$1 = /*#__PURE__*/_classPrivateFieldKey("headers");

  class HttpProvider {
    /**
     * @param {string} endpoint The endpoint url starting with http://
     */
    constructor(endpoint = defaults.HTTP_URL, headers = {}) {
      Object.defineProperty(this, _coder$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _endpoint, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _headers$1, {
        writable: true,
        value: void 0
      });
      util.assert(/^(https|http):\/\//.test(endpoint), () => `Endpoint should start with 'http://', received '${endpoint}'`);
      _classPrivateFieldBase(this, _coder$1)[_coder$1] = new RpcCoder();
      _classPrivateFieldBase(this, _endpoint)[_endpoint] = endpoint;
      _classPrivateFieldBase(this, _headers$1)[_headers$1] = headers;
    }
    /**
     * @summary `true` when this provider supports subscriptions
     */


    get hasSubscriptions() {
      return false;
    }
    /**
     * @description Returns a clone of the object
     */


    clone() {
      return new HttpProvider(_classPrivateFieldBase(this, _endpoint)[_endpoint], _classPrivateFieldBase(this, _headers$1)[_headers$1]);
    }
    /**
     * @description Manually connect from the connection
     */


    async connect() {// noop
    }
    /**
     * @description Manually disconnect from the connection
     */


    async disconnect() {// noop
    }
    /**
     * @summary Whether the node is connected or not.
     * @return {boolean} true if connected
     */


    get isConnected() {
      return true;
    }
    /**
     * @summary Events are not supported with the HttpProvider, see [[WsProvider]].
     * @description HTTP Provider does not have 'on' emitters. WebSockets should be used instead.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars


    on(type, sub) {
      l$7.error('HTTP Provider does not have \'on\' emitters, use WebSockets instead');
      return () => {// noop
      };
    }
    /**
     * @summary Send HTTP POST Request with Body to configured HTTP Endpoint.
     */


    async send(method, params) {
      const body = _classPrivateFieldBase(this, _coder$1)[_coder$1].encodeJson(method, params);

      const response = await fetch(_classPrivateFieldBase(this, _endpoint)[_endpoint], {
        body,
        headers: _objectSpread$v({
          Accept: 'application/json',
          'Content-Length': `${body.length}`,
          'Content-Type': 'application/json'
        }, _classPrivateFieldBase(this, _headers$1)[_headers$1]),
        method: 'POST'
      });
      util.assert(response.ok, () => `[${response.status}]: ${response.statusText}`); // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

      const result = await response.json();
      return _classPrivateFieldBase(this, _coder$1)[_coder$1].decodeResponse(result);
    }
    /**
     * @summary Subscriptions are not supported with the HttpProvider, see [[WsProvider]].
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/require-await


    async subscribe(types, method, params, cb) {
      l$7.error(ERROR_SUBSCRIBE);
      throw new Error(ERROR_SUBSCRIBE);
    }
    /**
     * @summary Subscriptions are not supported with the HttpProvider, see [[WsProvider]].
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/require-await


    async unsubscribe(type, method, id) {
      l$7.error(ERROR_SUBSCRIBE);
      throw new Error(ERROR_SUBSCRIBE);
    }

  }

  var eventemitter3 = {exports: {}};

  (function (module) {

  var has = Object.prototype.hasOwnProperty
    , prefix = '~';

  /**
   * Constructor to create a storage for our `EE` objects.
   * An `Events` instance is a plain object whose properties are event names.
   *
   * @constructor
   * @private
   */
  function Events() {}

  //
  // We try to not inherit from `Object.prototype`. In some engines creating an
  // instance in this way is faster than calling `Object.create(null)` directly.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // character to make sure that the built-in object properties are not
  // overridden or used as an attack vector.
  //
  if (Object.create) {
    Events.prototype = Object.create(null);

    //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //
    if (!new Events().__proto__) prefix = false;
  }

  /**
   * Representation of a single event listener.
   *
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
   * @constructor
   * @private
   */
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }

  /**
   * Add a listener for a given event.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} once Specify if the listener is a one-time listener.
   * @returns {EventEmitter}
   * @private
   */
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function');
    }

    var listener = new EE(fn, context || emitter, once)
      , evt = prefix ? prefix + event : event;

    if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
    else emitter._events[evt] = [emitter._events[evt], listener];

    return emitter;
  }

  /**
   * Clear event by name.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} evt The Event name.
   * @private
   */
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) emitter._events = new Events();
    else delete emitter._events[evt];
  }

  /**
   * Minimal `EventEmitter` interface that is molded against the Node.js
   * `EventEmitter` interface.
   *
   * @constructor
   * @public
   */
  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @public
   */
  EventEmitter.prototype.eventNames = function eventNames() {
    var names = []
      , events
      , name;

    if (this._eventsCount === 0) return names;

    for (name in (events = this._events)) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
  };

  /**
   * Return the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Array} The registered listeners.
   * @public
   */
  EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event
      , handlers = this._events[evt];

    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn];

    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }

    return ee;
  };

  /**
   * Return the number of listeners listening to a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Number} The number of listeners.
   * @public
   */
  EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event
      , listeners = this._events[evt];

    if (!listeners) return 0;
    if (listeners.fn) return 1;
    return listeners.length;
  };

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   * @public
   */
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return false;

    var listeners = this._events[evt]
      , len = arguments.length
      , args
      , i;

    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

      switch (len) {
        case 1: return listeners.fn.call(listeners.context), true;
        case 2: return listeners.fn.call(listeners.context, a1), true;
        case 3: return listeners.fn.call(listeners.context, a1, a2), true;
        case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }

      for (i = 1, args = new Array(len -1); i < len; i++) {
        args[i - 1] = arguments[i];
      }

      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length
        , j;

      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

        switch (len) {
          case 1: listeners[i].fn.call(listeners[i].context); break;
          case 2: listeners[i].fn.call(listeners[i].context, a1); break;
          case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
          case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
          default:
            if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
              args[j - 1] = arguments[j];
            }

            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }

    return true;
  };

  /**
   * Add a listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };

  /**
   * Add a one-time listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };

  /**
   * Remove the listeners of a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn Only remove the listeners that match this function.
   * @param {*} context Only remove the listeners that have this context.
   * @param {Boolean} once Only remove one-time listeners.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
      if (
        listeners.fn === fn &&
        (!once || listeners.once) &&
        (!context || listeners.context === context)
      ) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (
          listeners[i].fn !== fn ||
          (once && !listeners[i].once) ||
          (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }

      //
      // Reset the array, or remove it completely if we have no more listeners.
      //
      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
      else clearEvent(this, evt);
    }

    return this;
  };

  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param {(String|Symbol)} [event] The event name.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;

    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt]) clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }

    return this;
  };

  //
  // Alias methods names because people roll like that.
  //
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  //
  // Expose the prefix.
  //
  EventEmitter.prefixed = prefix;

  //
  // Allow `EventEmitter` to be imported as module namespace.
  //
  EventEmitter.EventEmitter = EventEmitter;

  //
  // Expose the module.
  //
  {
    module.exports = EventEmitter;
  }
  }(eventemitter3));

  const EventEmitter = eventemitter3.exports;

  // Copyright 2017-2021 @axia-js/x-ws authors & contributors
  const WebSocket = xglobal.WebSocket;

  // Copyright 2017-2021 @axia-js/rpc-provider authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  // from https://stackoverflow.com/questions/19304157/getting-the-reason-why-websockets-closed-with-close-code-1006
  const known = {
    1000: 'Normal Closure',
    1001: 'Going Away',
    1002: 'Protocol Error',
    1003: 'Unsupported Data',
    1004: '(For future)',
    1005: 'No Status Received',
    1006: 'Abnormal Closure',
    1007: 'Invalid frame payload data',
    1008: 'Policy Violation',
    1009: 'Message too big',
    1010: 'Missing Extension',
    1011: 'Internal Error',
    1012: 'Service Restart',
    1013: 'Try Again Later',
    1014: 'Bad Gateway',
    1015: 'TLS Handshake'
  };

  function getUnmapped(code) {
    if (code <= 1999) {
      return '(For WebSocket standard)';
    } else if (code <= 2999) {
      return '(For WebSocket extensions)';
    } else if (code <= 3999) {
      return '(For libraries and frameworks)';
    } else if (code <= 4999) {
      return '(For applications)';
    }
  }

  function getWSErrorString(code) {
    if (code >= 0 && code <= 999) {
      return '(Unused)';
    }

    return known[code] || getUnmapped(code) || '(Unknown)';
  }

  function ownKeys$u(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$u(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$u(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$u(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  const ALIASES = {
    chain_finalisedHead: 'chain_finalizedHead',
    chain_subscribeFinalisedHeads: 'chain_subscribeFinalizedHeads',
    chain_unsubscribeFinalisedHeads: 'chain_unsubscribeFinalizedHeads'
  };
  const RETRY_DELAY = 2500;
  const l$6 = util.logger('api-ws');

  function eraseRecord(record, cb) {
    Object.keys(record).forEach(key => {
      if (cb) {
        cb(record[key]);
      }

      delete record[key];
    });
  }
  /**
   * # @axia-js/rpc-provider/ws
   *
   * @name WsProvider
   *
   * @description The WebSocket Provider allows sending requests using WebSocket to a WebSocket RPC server TCP port. Unlike the [[HttpProvider]], it does support subscriptions and allows listening to events such as new blocks or balance changes.
   *
   * @example
   * <BR>
   *
   * ```javascript
   * import Api from '@axia-js/api/promise';
   * import { WsProvider } from '@axia-js/rpc-provider/ws';
   *
   * const provider = new WsProvider('ws://127.0.0.1:9944');
   * const api = new Api(provider);
   * ```
   *
   * @see [[HttpProvider]]
   */


  var _coder = /*#__PURE__*/_classPrivateFieldKey("coder");

  var _endpoints = /*#__PURE__*/_classPrivateFieldKey("endpoints");

  var _headers = /*#__PURE__*/_classPrivateFieldKey("headers");

  var _eventemitter$1 = /*#__PURE__*/_classPrivateFieldKey("eventemitter");

  var _handlers = /*#__PURE__*/_classPrivateFieldKey("handlers");

  var _isReadyPromise$1 = /*#__PURE__*/_classPrivateFieldKey("isReadyPromise");

  var _waitingForId = /*#__PURE__*/_classPrivateFieldKey("waitingForId");

  var _autoConnectMs = /*#__PURE__*/_classPrivateFieldKey("autoConnectMs");

  var _endpointIndex = /*#__PURE__*/_classPrivateFieldKey("endpointIndex");

  var _isConnected = /*#__PURE__*/_classPrivateFieldKey("isConnected");

  var _subscriptions$1 = /*#__PURE__*/_classPrivateFieldKey("subscriptions");

  var _websocket = /*#__PURE__*/_classPrivateFieldKey("websocket");

  var _emit = /*#__PURE__*/_classPrivateFieldKey("emit");

  var _onSocketClose = /*#__PURE__*/_classPrivateFieldKey("onSocketClose");

  var _onSocketError = /*#__PURE__*/_classPrivateFieldKey("onSocketError");

  var _onSocketMessage = /*#__PURE__*/_classPrivateFieldKey("onSocketMessage");

  var _onSocketMessageResult = /*#__PURE__*/_classPrivateFieldKey("onSocketMessageResult");

  var _onSocketMessageSubscribe = /*#__PURE__*/_classPrivateFieldKey("onSocketMessageSubscribe");

  var _onSocketOpen = /*#__PURE__*/_classPrivateFieldKey("onSocketOpen");

  var _resubscribe = /*#__PURE__*/_classPrivateFieldKey("resubscribe");

  class WsProvider {
    /**
     * @param {string | string[]}  endpoint    The endpoint url. Usually `ws://ip:9944` or `wss://ip:9944`, may provide an array of endpoint strings.
     * @param {boolean} autoConnect Whether to connect automatically or not.
     */
    constructor(endpoint = defaults.WS_URL, autoConnectMs = RETRY_DELAY, headers = {}) {
      Object.defineProperty(this, _coder, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _endpoints, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _headers, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _eventemitter$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _handlers, {
        writable: true,
        value: {}
      });
      Object.defineProperty(this, _isReadyPromise$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _waitingForId, {
        writable: true,
        value: {}
      });
      Object.defineProperty(this, _autoConnectMs, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _endpointIndex, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isConnected, {
        writable: true,
        value: false
      });
      Object.defineProperty(this, _subscriptions$1, {
        writable: true,
        value: {}
      });
      Object.defineProperty(this, _websocket, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _emit, {
        writable: true,
        value: (type, ...args) => {
          _classPrivateFieldBase(this, _eventemitter$1)[_eventemitter$1].emit(type, ...args);
        }
      });
      Object.defineProperty(this, _onSocketClose, {
        writable: true,
        value: event => {
          const error = new Error(`disconnected from ${_classPrivateFieldBase(this, _endpoints)[_endpoints][_classPrivateFieldBase(this, _endpointIndex)[_endpointIndex]]}: ${event.code}:: ${event.reason || getWSErrorString(event.code)}`);

          if (_classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs] > 0) {
            l$6.error(error.message);
          }

          _classPrivateFieldBase(this, _isConnected)[_isConnected] = false;

          if (_classPrivateFieldBase(this, _websocket)[_websocket]) {
            _classPrivateFieldBase(this, _websocket)[_websocket].onclose = null;
            _classPrivateFieldBase(this, _websocket)[_websocket].onerror = null;
            _classPrivateFieldBase(this, _websocket)[_websocket].onmessage = null;
            _classPrivateFieldBase(this, _websocket)[_websocket].onopen = null;
            _classPrivateFieldBase(this, _websocket)[_websocket] = null;
          }

          _classPrivateFieldBase(this, _emit)[_emit]('disconnected'); // reject all hanging requests


          eraseRecord(_classPrivateFieldBase(this, _handlers)[_handlers], h => h.callback(error, undefined));
          eraseRecord(_classPrivateFieldBase(this, _waitingForId)[_waitingForId]);

          if (_classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs] > 0) {
            setTimeout(() => {
              this.connectWithRetry().catch(() => {// does not throw
              });
            }, _classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs]);
          }
        }
      });
      Object.defineProperty(this, _onSocketError, {
        writable: true,
        value: error => {
          l$6.debug(() => ['socket error', error]);

          _classPrivateFieldBase(this, _emit)[_emit]('error', error);
        }
      });
      Object.defineProperty(this, _onSocketMessage, {
        writable: true,
        value: message => {
          l$6.debug(() => ['received', message.data]);
          const response = JSON.parse(message.data);
          return util.isUndefined(response.method) ? _classPrivateFieldBase(this, _onSocketMessageResult)[_onSocketMessageResult](response) : _classPrivateFieldBase(this, _onSocketMessageSubscribe)[_onSocketMessageSubscribe](response);
        }
      });
      Object.defineProperty(this, _onSocketMessageResult, {
        writable: true,
        value: response => {
          const handler = _classPrivateFieldBase(this, _handlers)[_handlers][response.id];

          if (!handler) {
            l$6.debug(() => `Unable to find handler for id=${response.id}`);
            return;
          }

          try {
            const {
              method,
              params,
              subscription
            } = handler;

            const result = _classPrivateFieldBase(this, _coder)[_coder].decodeResponse(response); // first send the result - in case of subs, we may have an update
            // immediately if we have some queued results already


            handler.callback(null, result);

            if (subscription) {
              const subId = `${subscription.type}::${result}`;
              _classPrivateFieldBase(this, _subscriptions$1)[_subscriptions$1][subId] = _objectSpread$u(_objectSpread$u({}, subscription), {}, {
                method,
                params
              }); // if we have a result waiting for this subscription already

              if (_classPrivateFieldBase(this, _waitingForId)[_waitingForId][subId]) {
                _classPrivateFieldBase(this, _onSocketMessageSubscribe)[_onSocketMessageSubscribe](_classPrivateFieldBase(this, _waitingForId)[_waitingForId][subId]);
              }
            }
          } catch (error) {
            handler.callback(error, undefined);
          }

          delete _classPrivateFieldBase(this, _handlers)[_handlers][response.id];
        }
      });
      Object.defineProperty(this, _onSocketMessageSubscribe, {
        writable: true,
        value: response => {
          const method = ALIASES[response.method] || response.method || 'invalid';
          const subId = `${method}::${response.params.subscription}`;

          const handler = _classPrivateFieldBase(this, _subscriptions$1)[_subscriptions$1][subId];

          if (!handler) {
            // store the JSON, we could have out-of-order subid coming in
            _classPrivateFieldBase(this, _waitingForId)[_waitingForId][subId] = response;
            l$6.debug(() => `Unable to find handler for subscription=${subId}`);
            return;
          } // housekeeping


          delete _classPrivateFieldBase(this, _waitingForId)[_waitingForId][subId];

          try {
            const result = _classPrivateFieldBase(this, _coder)[_coder].decodeResponse(response);

            handler.callback(null, result);
          } catch (error) {
            handler.callback(error, undefined);
          }
        }
      });
      Object.defineProperty(this, _onSocketOpen, {
        writable: true,
        value: () => {
          util.assert(!util.isNull(_classPrivateFieldBase(this, _websocket)[_websocket]), 'WebSocket cannot be null in onOpen');
          l$6.debug(() => ['connected to', _classPrivateFieldBase(this, _endpoints)[_endpoints][_classPrivateFieldBase(this, _endpointIndex)[_endpointIndex]]]);
          _classPrivateFieldBase(this, _isConnected)[_isConnected] = true;

          _classPrivateFieldBase(this, _emit)[_emit]('connected');

          _classPrivateFieldBase(this, _resubscribe)[_resubscribe]();

          return true;
        }
      });
      Object.defineProperty(this, _resubscribe, {
        writable: true,
        value: () => {
          const subscriptions = _classPrivateFieldBase(this, _subscriptions$1)[_subscriptions$1];

          _classPrivateFieldBase(this, _subscriptions$1)[_subscriptions$1] = {};
          Promise.all(Object.keys(subscriptions).map(async id => {
            const {
              callback,
              method,
              params,
              type
            } = subscriptions[id]; // only re-create subscriptions which are not in author (only area where
            // transactions are created, i.e. submissions such as 'author_submitAndWatchExtrinsic'
            // are not included (and will not be re-broadcast)

            if (type.startsWith('author_')) {
              return;
            }

            try {
              await this.subscribe(type, method, params, callback);
            } catch (error) {
              l$6.error(error);
            }
          })).catch(l$6.error);
        }
      });
      const endpoints = Array.isArray(endpoint) ? endpoint : [endpoint];
      util.assert(endpoints.length !== 0, 'WsProvider requires at least one Endpoint');
      endpoints.forEach(endpoint => {
        util.assert(/^(wss|ws):\/\//.test(endpoint), () => `Endpoint should start with 'ws://', received '${endpoint}'`);
      });
      _classPrivateFieldBase(this, _eventemitter$1)[_eventemitter$1] = new EventEmitter();
      _classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs] = autoConnectMs || 0;
      _classPrivateFieldBase(this, _coder)[_coder] = new RpcCoder();
      _classPrivateFieldBase(this, _endpointIndex)[_endpointIndex] = -1;
      _classPrivateFieldBase(this, _endpoints)[_endpoints] = endpoints;
      _classPrivateFieldBase(this, _headers)[_headers] = headers;
      _classPrivateFieldBase(this, _websocket)[_websocket] = null;

      if (autoConnectMs > 0) {
        this.connectWithRetry().catch(() => {// does not throw
        });
      }

      _classPrivateFieldBase(this, _isReadyPromise$1)[_isReadyPromise$1] = new Promise(resolve => {
        _classPrivateFieldBase(this, _eventemitter$1)[_eventemitter$1].once('connected', () => {
          resolve(this);
        });
      });
    }
    /**
     * @summary `true` when this provider supports subscriptions
     */


    get hasSubscriptions() {
      return true;
    }
    /**
     * @summary Whether the node is connected or not.
     * @return {boolean} true if connected
     */


    get isConnected() {
      return _classPrivateFieldBase(this, _isConnected)[_isConnected];
    }
    /**
     * @description Promise that resolves the first time we are connected and loaded
     */


    get isReady() {
      return _classPrivateFieldBase(this, _isReadyPromise$1)[_isReadyPromise$1];
    }
    /**
     * @description Returns a clone of the object
     */


    clone() {
      return new WsProvider(_classPrivateFieldBase(this, _endpoints)[_endpoints]);
    }
    /**
     * @summary Manually connect
     * @description The [[WsProvider]] connects automatically by default, however if you decided otherwise, you may
     * connect manually using this method.
     */
    // eslint-disable-next-line @typescript-eslint/require-await


    async connect() {
      try {
        _classPrivateFieldBase(this, _endpointIndex)[_endpointIndex] = (_classPrivateFieldBase(this, _endpointIndex)[_endpointIndex] + 1) % _classPrivateFieldBase(this, _endpoints)[_endpoints].length;
        _classPrivateFieldBase(this, _websocket)[_websocket] = typeof xglobal.WebSocket !== 'undefined' && util.isChildClass(xglobal.WebSocket, WebSocket) ? new WebSocket(_classPrivateFieldBase(this, _endpoints)[_endpoints][_classPrivateFieldBase(this, _endpointIndex)[_endpointIndex]]) // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - WS may be an instance of w3cwebsocket, which supports headers
        : new WebSocket(_classPrivateFieldBase(this, _endpoints)[_endpoints][_classPrivateFieldBase(this, _endpointIndex)[_endpointIndex]], undefined, undefined, _classPrivateFieldBase(this, _headers)[_headers], undefined, {
          // default: true
          fragmentOutgoingMessages: true,
          // default: 16K (bump, the Node has issues with too many fragments, e.g. on setCode)
          fragmentationThreshold: 256 * 1024,
          // default: 8MB (however AXIA api.query.staking.erasStakers.entries(356) is over that)
          maxReceivedMessageSize: 16 * 1024 * 1024
        });
        _classPrivateFieldBase(this, _websocket)[_websocket].onclose = _classPrivateFieldBase(this, _onSocketClose)[_onSocketClose];
        _classPrivateFieldBase(this, _websocket)[_websocket].onerror = _classPrivateFieldBase(this, _onSocketError)[_onSocketError];
        _classPrivateFieldBase(this, _websocket)[_websocket].onmessage = _classPrivateFieldBase(this, _onSocketMessage)[_onSocketMessage];
        _classPrivateFieldBase(this, _websocket)[_websocket].onopen = _classPrivateFieldBase(this, _onSocketOpen)[_onSocketOpen];
      } catch (error) {
        l$6.error(error);

        _classPrivateFieldBase(this, _emit)[_emit]('error', error);

        throw error;
      }
    }
    /**
     * @description Connect, never throwing an error, but rather forcing a retry
     */


    async connectWithRetry() {
      if (_classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs] > 0) {
        try {
          await this.connect();
        } catch (error) {
          setTimeout(() => {
            this.connectWithRetry().catch(() => {// does not throw
            });
          }, _classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs]);
        }
      }
    }
    /**
     * @description Manually disconnect from the connection, clearing auto-connect logic
     */
    // eslint-disable-next-line @typescript-eslint/require-await


    async disconnect() {
      // switch off autoConnect, we are in manual mode now
      _classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs] = 0;

      try {
        if (_classPrivateFieldBase(this, _websocket)[_websocket]) {
          // 1000 - Normal closure; the connection successfully completed
          _classPrivateFieldBase(this, _websocket)[_websocket].close(1000);
        }
      } catch (error) {
        l$6.error(error);

        _classPrivateFieldBase(this, _emit)[_emit]('error', error);

        throw error;
      }
    }
    /**
     * @summary Listens on events after having subscribed using the [[subscribe]] function.
     * @param  {ProviderInterfaceEmitted} type Event
     * @param  {ProviderInterfaceEmitCb}  sub  Callback
     * @return unsubscribe function
     */


    on(type, sub) {
      _classPrivateFieldBase(this, _eventemitter$1)[_eventemitter$1].on(type, sub);

      return () => {
        _classPrivateFieldBase(this, _eventemitter$1)[_eventemitter$1].removeListener(type, sub);
      };
    }
    /**
     * @summary Send JSON data using WebSockets to configured HTTP Endpoint or queue.
     * @param method The RPC methods to execute
     * @param params Encoded parameters as applicable for the method
     * @param subscription Subscription details (internally used)
     */


    send(method, params, subscription) {
      return new Promise((resolve, reject) => {
        try {
          util.assert(this.isConnected && !util.isNull(_classPrivateFieldBase(this, _websocket)[_websocket]), 'WebSocket is not connected');

          const json = _classPrivateFieldBase(this, _coder)[_coder].encodeJson(method, params);

          const id = _classPrivateFieldBase(this, _coder)[_coder].getId();

          const callback = (error, result) => {
            error ? reject(error) : resolve(result);
          };

          l$6.debug(() => ['calling', method, json]);
          _classPrivateFieldBase(this, _handlers)[_handlers][id] = {
            callback,
            method,
            params,
            subscription
          };

          _classPrivateFieldBase(this, _websocket)[_websocket].send(json);
        } catch (error) {
          reject(error);
        }
      });
    }
    /**
     * @name subscribe
     * @summary Allows subscribing to a specific event.
     *
     * @example
     * <BR>
     *
     * ```javascript
     * const provider = new WsProvider('ws://127.0.0.1:9944');
     * const rpc = new Rpc(provider);
     *
     * rpc.state.subscribeStorage([[storage.system.account, <Address>]], (_, values) => {
     *   console.log(values)
     * }).then((subscriptionId) => {
     *   console.log('balance changes subscription id: ', subscriptionId)
     * })
     * ```
     */


    subscribe(type, method, params, callback) {
      return this.send(method, params, {
        callback,
        type
      });
    }
    /**
     * @summary Allows unsubscribing to subscriptions made with [[subscribe]].
     */


    async unsubscribe(type, method, id) {
      const subscription = `${type}::${id}`; // FIXME This now could happen with re-subscriptions. The issue is that with a re-sub
      // the assigned id now does not match what the API user originally received. It has
      // a slight complication in solving - since we cannot rely on the send id, but rather
      // need to find the actual subscription id to map it

      if (util.isUndefined(_classPrivateFieldBase(this, _subscriptions$1)[_subscriptions$1][subscription])) {
        l$6.debug(() => `Unable to find active subscription=${subscription}`);
        return false;
      }

      delete _classPrivateFieldBase(this, _subscriptions$1)[_subscriptions$1][subscription];

      try {
        return this.isConnected && !util.isNull(_classPrivateFieldBase(this, _websocket)[_websocket]) ? this.send(method, [id]) : true;
      } catch (error) {
        return false;
      }
    }

  }

  // Copyright 2017-2021 @axia-js/api authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  // Auto-generated by @axia-js/dev, do not edit
  const packageInfo = {
    name: '@axia-js/api',
    version: '0.1.0'
  };

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  function __generator(thisArg, body) {
      var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function (v) { return step([n, v]); }; }
      function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];
              switch (op[0]) {
                  case 0: case 1: t = op; break;
                  case 4: _.label++; return { value: op[1], done: false };
                  case 5: _.label++; y = op[1]; op = [0]; continue;
                  case 7: op = _.ops.pop(); _.trys.pop(); continue;
                  default:
                      if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                      if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                      if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                      if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                      if (t[2]) _.ops.pop();
                      _.trys.pop(); continue;
              }
              op = body.call(thisArg, _);
          } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
          if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
  }

  function __values(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m) return m.call(o);
      if (o && typeof o.length === "number") return {
          next: function () {
              if (o && i >= o.length) o = void 0;
              return { value: o && o[i++], done: !o };
          }
      };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }

  function __read(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      }
      catch (error) { e = { error: error }; }
      finally {
          try {
              if (r && !r.done && (m = i["return"])) m.call(i);
          }
          finally { if (e) throw e.error; }
      }
      return ar;
  }

  function __spreadArray(to, from) {
      for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
          to[j] = from[i];
      return to;
  }

  function __await(v) {
      return this instanceof __await ? (this.v = v, this) : new __await(v);
  }

  function __asyncGenerator(thisArg, _arguments, generator) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var g = generator.apply(thisArg, _arguments || []), i, q = [];
      return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
      function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
      function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
      function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
      function fulfill(value) { resume("next", value); }
      function reject(value) { resume("throw", value); }
      function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
  }

  function __asyncValues(o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
      function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
      function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
  }

  function isFunction(value) {
      return typeof value === 'function';
  }

  function createErrorClass(createImpl) {
      var _super = function (instance) {
          Error.call(instance);
          instance.stack = new Error().stack;
      };
      var ctorFunc = createImpl(_super);
      ctorFunc.prototype = Object.create(Error.prototype);
      ctorFunc.prototype.constructor = ctorFunc;
      return ctorFunc;
  }

  var UnsubscriptionError = createErrorClass(function (_super) {
      return function UnsubscriptionErrorImpl(errors) {
          _super(this);
          this.message = errors
              ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
              : '';
          this.name = 'UnsubscriptionError';
          this.errors = errors;
      };
  });

  function arrRemove(arr, item) {
      if (arr) {
          var index = arr.indexOf(item);
          0 <= index && arr.splice(index, 1);
      }
  }

  var Subscription = (function () {
      function Subscription(initialTeardown) {
          this.initialTeardown = initialTeardown;
          this.closed = false;
          this._parentage = null;
          this._teardowns = null;
      }
      Subscription.prototype.unsubscribe = function () {
          var e_1, _a, e_2, _b;
          var errors;
          if (!this.closed) {
              this.closed = true;
              var _parentage = this._parentage;
              if (_parentage) {
                  this._parentage = null;
                  if (Array.isArray(_parentage)) {
                      try {
                          for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                              var parent_1 = _parentage_1_1.value;
                              parent_1.remove(this);
                          }
                      }
                      catch (e_1_1) { e_1 = { error: e_1_1 }; }
                      finally {
                          try {
                              if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                          }
                          finally { if (e_1) throw e_1.error; }
                      }
                  }
                  else {
                      _parentage.remove(this);
                  }
              }
              var initialTeardown = this.initialTeardown;
              if (isFunction(initialTeardown)) {
                  try {
                      initialTeardown();
                  }
                  catch (e) {
                      errors = e instanceof UnsubscriptionError ? e.errors : [e];
                  }
              }
              var _teardowns = this._teardowns;
              if (_teardowns) {
                  this._teardowns = null;
                  try {
                      for (var _teardowns_1 = __values(_teardowns), _teardowns_1_1 = _teardowns_1.next(); !_teardowns_1_1.done; _teardowns_1_1 = _teardowns_1.next()) {
                          var teardown_1 = _teardowns_1_1.value;
                          try {
                              execTeardown(teardown_1);
                          }
                          catch (err) {
                              errors = errors !== null && errors !== void 0 ? errors : [];
                              if (err instanceof UnsubscriptionError) {
                                  errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                              }
                              else {
                                  errors.push(err);
                              }
                          }
                      }
                  }
                  catch (e_2_1) { e_2 = { error: e_2_1 }; }
                  finally {
                      try {
                          if (_teardowns_1_1 && !_teardowns_1_1.done && (_b = _teardowns_1.return)) _b.call(_teardowns_1);
                      }
                      finally { if (e_2) throw e_2.error; }
                  }
              }
              if (errors) {
                  throw new UnsubscriptionError(errors);
              }
          }
      };
      Subscription.prototype.add = function (teardown) {
          var _a;
          if (teardown && teardown !== this) {
              if (this.closed) {
                  execTeardown(teardown);
              }
              else {
                  if (teardown instanceof Subscription) {
                      if (teardown.closed || teardown._hasParent(this)) {
                          return;
                      }
                      teardown._addParent(this);
                  }
                  (this._teardowns = (_a = this._teardowns) !== null && _a !== void 0 ? _a : []).push(teardown);
              }
          }
      };
      Subscription.prototype._hasParent = function (parent) {
          var _parentage = this._parentage;
          return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
      };
      Subscription.prototype._addParent = function (parent) {
          var _parentage = this._parentage;
          this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
      };
      Subscription.prototype._removeParent = function (parent) {
          var _parentage = this._parentage;
          if (_parentage === parent) {
              this._parentage = null;
          }
          else if (Array.isArray(_parentage)) {
              arrRemove(_parentage, parent);
          }
      };
      Subscription.prototype.remove = function (teardown) {
          var _teardowns = this._teardowns;
          _teardowns && arrRemove(_teardowns, teardown);
          if (teardown instanceof Subscription) {
              teardown._removeParent(this);
          }
      };
      Subscription.EMPTY = (function () {
          var empty = new Subscription();
          empty.closed = true;
          return empty;
      })();
      return Subscription;
  }());
  var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
  function isSubscription(value) {
      return (value instanceof Subscription ||
          (value && 'closed' in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe)));
  }
  function execTeardown(teardown) {
      if (isFunction(teardown)) {
          teardown();
      }
      else {
          teardown.unsubscribe();
      }
  }

  var config = {
      onUnhandledError: null,
      onStoppedNotification: null,
      Promise: undefined,
      useDeprecatedSynchronousErrorHandling: false,
      useDeprecatedNextContext: false,
  };

  var timeoutProvider = {
      setTimeout: function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          var delegate = timeoutProvider.delegate;
          return ((delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) || setTimeout).apply(void 0, __spreadArray([], __read(args)));
      },
      clearTimeout: function (handle) {
          var delegate = timeoutProvider.delegate;
          return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
      },
      delegate: undefined,
  };

  function reportUnhandledError(err) {
      timeoutProvider.setTimeout(function () {
          var onUnhandledError = config.onUnhandledError;
          if (onUnhandledError) {
              onUnhandledError(err);
          }
          else {
              throw err;
          }
      });
  }

  function noop() { }

  var COMPLETE_NOTIFICATION = (function () { return createNotification('C', undefined, undefined); })();
  function errorNotification(error) {
      return createNotification('E', undefined, error);
  }
  function nextNotification(value) {
      return createNotification('N', value, undefined);
  }
  function createNotification(kind, value, error) {
      return {
          kind: kind,
          value: value,
          error: error,
      };
  }

  var context = null;
  function errorContext(cb) {
      {
          cb();
      }
  }
  function captureError(err) {
      if (config.useDeprecatedSynchronousErrorHandling && context) {
          context.errorThrown = true;
          context.error = err;
      }
  }

  var Subscriber = (function (_super) {
      __extends(Subscriber, _super);
      function Subscriber(destination) {
          var _this = _super.call(this) || this;
          _this.isStopped = false;
          if (destination) {
              _this.destination = destination;
              if (isSubscription(destination)) {
                  destination.add(_this);
              }
          }
          else {
              _this.destination = EMPTY_OBSERVER;
          }
          return _this;
      }
      Subscriber.create = function (next, error, complete) {
          return new SafeSubscriber(next, error, complete);
      };
      Subscriber.prototype.next = function (value) {
          if (this.isStopped) {
              handleStoppedNotification(nextNotification(value), this);
          }
          else {
              this._next(value);
          }
      };
      Subscriber.prototype.error = function (err) {
          if (this.isStopped) {
              handleStoppedNotification(errorNotification(err), this);
          }
          else {
              this.isStopped = true;
              this._error(err);
          }
      };
      Subscriber.prototype.complete = function () {
          if (this.isStopped) {
              handleStoppedNotification(COMPLETE_NOTIFICATION, this);
          }
          else {
              this.isStopped = true;
              this._complete();
          }
      };
      Subscriber.prototype.unsubscribe = function () {
          if (!this.closed) {
              this.isStopped = true;
              _super.prototype.unsubscribe.call(this);
              this.destination = null;
          }
      };
      Subscriber.prototype._next = function (value) {
          this.destination.next(value);
      };
      Subscriber.prototype._error = function (err) {
          try {
              this.destination.error(err);
          }
          finally {
              this.unsubscribe();
          }
      };
      Subscriber.prototype._complete = function () {
          try {
              this.destination.complete();
          }
          finally {
              this.unsubscribe();
          }
      };
      return Subscriber;
  }(Subscription));
  var SafeSubscriber = (function (_super) {
      __extends(SafeSubscriber, _super);
      function SafeSubscriber(observerOrNext, error, complete) {
          var _this = _super.call(this) || this;
          var next;
          if (isFunction(observerOrNext)) {
              next = observerOrNext;
          }
          else if (observerOrNext) {
              (next = observerOrNext.next, error = observerOrNext.error, complete = observerOrNext.complete);
              var context_1;
              if (_this && config.useDeprecatedNextContext) {
                  context_1 = Object.create(observerOrNext);
                  context_1.unsubscribe = function () { return _this.unsubscribe(); };
              }
              else {
                  context_1 = observerOrNext;
              }
              next = next === null || next === void 0 ? void 0 : next.bind(context_1);
              error = error === null || error === void 0 ? void 0 : error.bind(context_1);
              complete = complete === null || complete === void 0 ? void 0 : complete.bind(context_1);
          }
          _this.destination = {
              next: next ? wrapForErrorHandling(next) : noop,
              error: wrapForErrorHandling(error !== null && error !== void 0 ? error : defaultErrorHandler),
              complete: complete ? wrapForErrorHandling(complete) : noop,
          };
          return _this;
      }
      return SafeSubscriber;
  }(Subscriber));
  function wrapForErrorHandling(handler, instance) {
      return function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          try {
              handler.apply(void 0, __spreadArray([], __read(args)));
          }
          catch (err) {
              if (config.useDeprecatedSynchronousErrorHandling) {
                  captureError(err);
              }
              else {
                  reportUnhandledError(err);
              }
          }
      };
  }
  function defaultErrorHandler(err) {
      throw err;
  }
  function handleStoppedNotification(notification, subscriber) {
      var onStoppedNotification = config.onStoppedNotification;
      onStoppedNotification && timeoutProvider.setTimeout(function () { return onStoppedNotification(notification, subscriber); });
  }
  var EMPTY_OBSERVER = {
      closed: true,
      next: noop,
      error: defaultErrorHandler,
      complete: noop,
  };

  var observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();

  function identity$2(x) {
      return x;
  }

  function pipeFromArray(fns) {
      if (fns.length === 0) {
          return identity$2;
      }
      if (fns.length === 1) {
          return fns[0];
      }
      return function piped(input) {
          return fns.reduce(function (prev, fn) { return fn(prev); }, input);
      };
  }

  var Observable = (function () {
      function Observable(subscribe) {
          if (subscribe) {
              this._subscribe = subscribe;
          }
      }
      Observable.prototype.lift = function (operator) {
          var observable = new Observable();
          observable.source = this;
          observable.operator = operator;
          return observable;
      };
      Observable.prototype.subscribe = function (observerOrNext, error, complete) {
          var _this = this;
          var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
          errorContext(function () {
              var _a = _this, operator = _a.operator, source = _a.source;
              subscriber.add(operator
                  ?
                      operator.call(subscriber, source)
                  : source
                      ?
                          _this._subscribe(subscriber)
                      :
                          _this._trySubscribe(subscriber));
          });
          return subscriber;
      };
      Observable.prototype._trySubscribe = function (sink) {
          try {
              return this._subscribe(sink);
          }
          catch (err) {
              sink.error(err);
          }
      };
      Observable.prototype.forEach = function (next, promiseCtor) {
          var _this = this;
          promiseCtor = getPromiseCtor(promiseCtor);
          return new promiseCtor(function (resolve, reject) {
              var subscription;
              subscription = _this.subscribe(function (value) {
                  try {
                      next(value);
                  }
                  catch (err) {
                      reject(err);
                      subscription === null || subscription === void 0 ? void 0 : subscription.unsubscribe();
                  }
              }, reject, resolve);
          });
      };
      Observable.prototype._subscribe = function (subscriber) {
          var _a;
          return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
      };
      Observable.prototype[observable] = function () {
          return this;
      };
      Observable.prototype.pipe = function () {
          var operations = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              operations[_i] = arguments[_i];
          }
          return pipeFromArray(operations)(this);
      };
      Observable.prototype.toPromise = function (promiseCtor) {
          var _this = this;
          promiseCtor = getPromiseCtor(promiseCtor);
          return new promiseCtor(function (resolve, reject) {
              var value;
              _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
          });
      };
      Observable.create = function (subscribe) {
          return new Observable(subscribe);
      };
      return Observable;
  }());
  function getPromiseCtor(promiseCtor) {
      var _a;
      return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
  }
  function isObserver(value) {
      return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
  }
  function isSubscriber(value) {
      return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
  }

  function hasLift(source) {
      return isFunction(source === null || source === void 0 ? void 0 : source.lift);
  }
  function operate(init) {
      return function (source) {
          if (hasLift(source)) {
              return source.lift(function (liftedSource) {
                  try {
                      return init(liftedSource, this);
                  }
                  catch (err) {
                      this.error(err);
                  }
              });
          }
          throw new TypeError('Unable to lift unknown Observable type');
      };
  }

  var OperatorSubscriber = (function (_super) {
      __extends(OperatorSubscriber, _super);
      function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
          var _this = _super.call(this, destination) || this;
          _this.onFinalize = onFinalize;
          _this._next = onNext
              ? function (value) {
                  try {
                      onNext(value);
                  }
                  catch (err) {
                      destination.error(err);
                  }
              }
              : _super.prototype._next;
          _this._error = onError
              ? function (err) {
                  try {
                      onError(err);
                  }
                  catch (err) {
                      destination.error(err);
                  }
                  finally {
                      this.unsubscribe();
                  }
              }
              : _super.prototype._error;
          _this._complete = onComplete
              ? function () {
                  try {
                      onComplete();
                  }
                  catch (err) {
                      destination.error(err);
                  }
                  finally {
                      this.unsubscribe();
                  }
              }
              : _super.prototype._complete;
          return _this;
      }
      OperatorSubscriber.prototype.unsubscribe = function () {
          var _a;
          var closed = this.closed;
          _super.prototype.unsubscribe.call(this);
          !closed && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
      };
      return OperatorSubscriber;
  }(Subscriber));

  function refCount() {
      return operate(function (source, subscriber) {
          var connection = null;
          source._refCount++;
          var refCounter = new OperatorSubscriber(subscriber, undefined, undefined, undefined, function () {
              if (!source || source._refCount <= 0 || 0 < --source._refCount) {
                  connection = null;
                  return;
              }
              var sharedConnection = source._connection;
              var conn = connection;
              connection = null;
              if (sharedConnection && (!conn || sharedConnection === conn)) {
                  sharedConnection.unsubscribe();
              }
              subscriber.unsubscribe();
          });
          source.subscribe(refCounter);
          if (!refCounter.closed) {
              connection = source.connect();
          }
      });
  }

  var ConnectableObservable = (function (_super) {
      __extends(ConnectableObservable, _super);
      function ConnectableObservable(source, subjectFactory) {
          var _this = _super.call(this) || this;
          _this.source = source;
          _this.subjectFactory = subjectFactory;
          _this._subject = null;
          _this._refCount = 0;
          _this._connection = null;
          if (hasLift(source)) {
              _this.lift = source.lift;
          }
          return _this;
      }
      ConnectableObservable.prototype._subscribe = function (subscriber) {
          return this.getSubject().subscribe(subscriber);
      };
      ConnectableObservable.prototype.getSubject = function () {
          var subject = this._subject;
          if (!subject || subject.isStopped) {
              this._subject = this.subjectFactory();
          }
          return this._subject;
      };
      ConnectableObservable.prototype._teardown = function () {
          this._refCount = 0;
          var _connection = this._connection;
          this._subject = this._connection = null;
          _connection === null || _connection === void 0 ? void 0 : _connection.unsubscribe();
      };
      ConnectableObservable.prototype.connect = function () {
          var _this = this;
          var connection = this._connection;
          if (!connection) {
              connection = this._connection = new Subscription();
              var subject_1 = this.getSubject();
              connection.add(this.source.subscribe(new OperatorSubscriber(subject_1, undefined, function () {
                  _this._teardown();
                  subject_1.complete();
              }, function (err) {
                  _this._teardown();
                  subject_1.error(err);
              }, function () { return _this._teardown(); })));
              if (connection.closed) {
                  this._connection = null;
                  connection = Subscription.EMPTY;
              }
          }
          return connection;
      };
      ConnectableObservable.prototype.refCount = function () {
          return refCount()(this);
      };
      return ConnectableObservable;
  }(Observable));

  var ObjectUnsubscribedError = createErrorClass(function (_super) {
      return function ObjectUnsubscribedErrorImpl() {
          _super(this);
          this.name = 'ObjectUnsubscribedError';
          this.message = 'object unsubscribed';
      };
  });

  var Subject = (function (_super) {
      __extends(Subject, _super);
      function Subject() {
          var _this = _super.call(this) || this;
          _this.closed = false;
          _this.observers = [];
          _this.isStopped = false;
          _this.hasError = false;
          _this.thrownError = null;
          return _this;
      }
      Subject.prototype.lift = function (operator) {
          var subject = new AnonymousSubject(this, this);
          subject.operator = operator;
          return subject;
      };
      Subject.prototype._throwIfClosed = function () {
          if (this.closed) {
              throw new ObjectUnsubscribedError();
          }
      };
      Subject.prototype.next = function (value) {
          var _this = this;
          errorContext(function () {
              var e_1, _a;
              _this._throwIfClosed();
              if (!_this.isStopped) {
                  var copy = _this.observers.slice();
                  try {
                      for (var copy_1 = __values(copy), copy_1_1 = copy_1.next(); !copy_1_1.done; copy_1_1 = copy_1.next()) {
                          var observer = copy_1_1.value;
                          observer.next(value);
                      }
                  }
                  catch (e_1_1) { e_1 = { error: e_1_1 }; }
                  finally {
                      try {
                          if (copy_1_1 && !copy_1_1.done && (_a = copy_1.return)) _a.call(copy_1);
                      }
                      finally { if (e_1) throw e_1.error; }
                  }
              }
          });
      };
      Subject.prototype.error = function (err) {
          var _this = this;
          errorContext(function () {
              _this._throwIfClosed();
              if (!_this.isStopped) {
                  _this.hasError = _this.isStopped = true;
                  _this.thrownError = err;
                  var observers = _this.observers;
                  while (observers.length) {
                      observers.shift().error(err);
                  }
              }
          });
      };
      Subject.prototype.complete = function () {
          var _this = this;
          errorContext(function () {
              _this._throwIfClosed();
              if (!_this.isStopped) {
                  _this.isStopped = true;
                  var observers = _this.observers;
                  while (observers.length) {
                      observers.shift().complete();
                  }
              }
          });
      };
      Subject.prototype.unsubscribe = function () {
          this.isStopped = this.closed = true;
          this.observers = null;
      };
      Object.defineProperty(Subject.prototype, "observed", {
          get: function () {
              var _a;
              return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
          },
          enumerable: false,
          configurable: true
      });
      Subject.prototype._trySubscribe = function (subscriber) {
          this._throwIfClosed();
          return _super.prototype._trySubscribe.call(this, subscriber);
      };
      Subject.prototype._subscribe = function (subscriber) {
          this._throwIfClosed();
          this._checkFinalizedStatuses(subscriber);
          return this._innerSubscribe(subscriber);
      };
      Subject.prototype._innerSubscribe = function (subscriber) {
          var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
          return hasError || isStopped
              ? EMPTY_SUBSCRIPTION
              : (observers.push(subscriber), new Subscription(function () { return arrRemove(observers, subscriber); }));
      };
      Subject.prototype._checkFinalizedStatuses = function (subscriber) {
          var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
          if (hasError) {
              subscriber.error(thrownError);
          }
          else if (isStopped) {
              subscriber.complete();
          }
      };
      Subject.prototype.asObservable = function () {
          var observable = new Observable();
          observable.source = this;
          return observable;
      };
      Subject.create = function (destination, source) {
          return new AnonymousSubject(destination, source);
      };
      return Subject;
  }(Observable));
  var AnonymousSubject = (function (_super) {
      __extends(AnonymousSubject, _super);
      function AnonymousSubject(destination, source) {
          var _this = _super.call(this) || this;
          _this.destination = destination;
          _this.source = source;
          return _this;
      }
      AnonymousSubject.prototype.next = function (value) {
          var _a, _b;
          (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
      };
      AnonymousSubject.prototype.error = function (err) {
          var _a, _b;
          (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
      };
      AnonymousSubject.prototype.complete = function () {
          var _a, _b;
          (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
      };
      AnonymousSubject.prototype._subscribe = function (subscriber) {
          var _a, _b;
          return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
      };
      return AnonymousSubject;
  }(Subject));

  var BehaviorSubject = (function (_super) {
      __extends(BehaviorSubject, _super);
      function BehaviorSubject(_value) {
          var _this = _super.call(this) || this;
          _this._value = _value;
          return _this;
      }
      Object.defineProperty(BehaviorSubject.prototype, "value", {
          get: function () {
              return this.getValue();
          },
          enumerable: false,
          configurable: true
      });
      BehaviorSubject.prototype._subscribe = function (subscriber) {
          var subscription = _super.prototype._subscribe.call(this, subscriber);
          !subscription.closed && subscriber.next(this._value);
          return subscription;
      };
      BehaviorSubject.prototype.getValue = function () {
          var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, _value = _a._value;
          if (hasError) {
              throw thrownError;
          }
          this._throwIfClosed();
          return _value;
      };
      BehaviorSubject.prototype.next = function (value) {
          _super.prototype.next.call(this, (this._value = value));
      };
      return BehaviorSubject;
  }(Subject));

  var dateTimestampProvider = {
      now: function () {
          return (dateTimestampProvider.delegate || Date).now();
      },
      delegate: undefined,
  };

  var ReplaySubject = (function (_super) {
      __extends(ReplaySubject, _super);
      function ReplaySubject(_bufferSize, _windowTime, _timestampProvider) {
          if (_bufferSize === void 0) { _bufferSize = Infinity; }
          if (_windowTime === void 0) { _windowTime = Infinity; }
          if (_timestampProvider === void 0) { _timestampProvider = dateTimestampProvider; }
          var _this = _super.call(this) || this;
          _this._bufferSize = _bufferSize;
          _this._windowTime = _windowTime;
          _this._timestampProvider = _timestampProvider;
          _this._buffer = [];
          _this._infiniteTimeWindow = true;
          _this._infiniteTimeWindow = _windowTime === Infinity;
          _this._bufferSize = Math.max(1, _bufferSize);
          _this._windowTime = Math.max(1, _windowTime);
          return _this;
      }
      ReplaySubject.prototype.next = function (value) {
          var _a = this, isStopped = _a.isStopped, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow, _timestampProvider = _a._timestampProvider, _windowTime = _a._windowTime;
          if (!isStopped) {
              _buffer.push(value);
              !_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
          }
          this._trimBuffer();
          _super.prototype.next.call(this, value);
      };
      ReplaySubject.prototype._subscribe = function (subscriber) {
          this._throwIfClosed();
          this._trimBuffer();
          var subscription = this._innerSubscribe(subscriber);
          var _a = this, _infiniteTimeWindow = _a._infiniteTimeWindow, _buffer = _a._buffer;
          var copy = _buffer.slice();
          for (var i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) {
              subscriber.next(copy[i]);
          }
          this._checkFinalizedStatuses(subscriber);
          return subscription;
      };
      ReplaySubject.prototype._trimBuffer = function () {
          var _a = this, _bufferSize = _a._bufferSize, _timestampProvider = _a._timestampProvider, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow;
          var adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
          _bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
          if (!_infiniteTimeWindow) {
              var now = _timestampProvider.now();
              var last = 0;
              for (var i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) {
                  last = i;
              }
              last && _buffer.splice(0, last + 1);
          }
      };
      return ReplaySubject;
  }(Subject));

  var Action = (function (_super) {
      __extends(Action, _super);
      function Action(scheduler, work) {
          return _super.call(this) || this;
      }
      Action.prototype.schedule = function (state, delay) {
          return this;
      };
      return Action;
  }(Subscription));

  var intervalProvider = {
      setInterval: function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          var delegate = intervalProvider.delegate;
          return ((delegate === null || delegate === void 0 ? void 0 : delegate.setInterval) || setInterval).apply(void 0, __spreadArray([], __read(args)));
      },
      clearInterval: function (handle) {
          var delegate = intervalProvider.delegate;
          return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearInterval) || clearInterval)(handle);
      },
      delegate: undefined,
  };

  var AsyncAction = (function (_super) {
      __extends(AsyncAction, _super);
      function AsyncAction(scheduler, work) {
          var _this = _super.call(this, scheduler, work) || this;
          _this.scheduler = scheduler;
          _this.work = work;
          _this.pending = false;
          return _this;
      }
      AsyncAction.prototype.schedule = function (state, delay) {
          if (delay === void 0) { delay = 0; }
          if (this.closed) {
              return this;
          }
          this.state = state;
          var id = this.id;
          var scheduler = this.scheduler;
          if (id != null) {
              this.id = this.recycleAsyncId(scheduler, id, delay);
          }
          this.pending = true;
          this.delay = delay;
          this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
          return this;
      };
      AsyncAction.prototype.requestAsyncId = function (scheduler, _id, delay) {
          if (delay === void 0) { delay = 0; }
          return intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
      };
      AsyncAction.prototype.recycleAsyncId = function (_scheduler, id, delay) {
          if (delay === void 0) { delay = 0; }
          if (delay != null && this.delay === delay && this.pending === false) {
              return id;
          }
          intervalProvider.clearInterval(id);
          return undefined;
      };
      AsyncAction.prototype.execute = function (state, delay) {
          if (this.closed) {
              return new Error('executing a cancelled action');
          }
          this.pending = false;
          var error = this._execute(state, delay);
          if (error) {
              return error;
          }
          else if (this.pending === false && this.id != null) {
              this.id = this.recycleAsyncId(this.scheduler, this.id, null);
          }
      };
      AsyncAction.prototype._execute = function (state, _delay) {
          var errored = false;
          var errorValue;
          try {
              this.work(state);
          }
          catch (e) {
              errored = true;
              errorValue = e ? e : new Error('Scheduled action threw falsy error');
          }
          if (errored) {
              this.unsubscribe();
              return errorValue;
          }
      };
      AsyncAction.prototype.unsubscribe = function () {
          if (!this.closed) {
              var _a = this, id = _a.id, scheduler = _a.scheduler;
              var actions = scheduler.actions;
              this.work = this.state = this.scheduler = null;
              this.pending = false;
              arrRemove(actions, this);
              if (id != null) {
                  this.id = this.recycleAsyncId(scheduler, id, null);
              }
              this.delay = null;
              _super.prototype.unsubscribe.call(this);
          }
      };
      return AsyncAction;
  }(Action));

  var nextHandle = 1;
  var resolved;
  var activeHandles = {};
  function findAndClearHandle(handle) {
      if (handle in activeHandles) {
          delete activeHandles[handle];
          return true;
      }
      return false;
  }
  var Immediate = {
      setImmediate: function (cb) {
          var handle = nextHandle++;
          activeHandles[handle] = true;
          if (!resolved) {
              resolved = Promise.resolve();
          }
          resolved.then(function () { return findAndClearHandle(handle) && cb(); });
          return handle;
      },
      clearImmediate: function (handle) {
          findAndClearHandle(handle);
      },
  };

  var setImmediate = Immediate.setImmediate, clearImmediate = Immediate.clearImmediate;
  var immediateProvider = {
      setImmediate: function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          var delegate = immediateProvider.delegate;
          return ((delegate === null || delegate === void 0 ? void 0 : delegate.setImmediate) || setImmediate).apply(void 0, __spreadArray([], __read(args)));
      },
      clearImmediate: function (handle) {
          var delegate = immediateProvider.delegate;
          return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearImmediate) || clearImmediate)(handle);
      },
      delegate: undefined,
  };

  var AsapAction = (function (_super) {
      __extends(AsapAction, _super);
      function AsapAction(scheduler, work) {
          var _this = _super.call(this, scheduler, work) || this;
          _this.scheduler = scheduler;
          _this.work = work;
          return _this;
      }
      AsapAction.prototype.requestAsyncId = function (scheduler, id, delay) {
          if (delay === void 0) { delay = 0; }
          if (delay !== null && delay > 0) {
              return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
          }
          scheduler.actions.push(this);
          return scheduler._scheduled || (scheduler._scheduled = immediateProvider.setImmediate(scheduler.flush.bind(scheduler, undefined)));
      };
      AsapAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
          if (delay === void 0) { delay = 0; }
          if ((delay != null && delay > 0) || (delay == null && this.delay > 0)) {
              return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
          }
          if (scheduler.actions.length === 0) {
              immediateProvider.clearImmediate(id);
              scheduler._scheduled = undefined;
          }
          return undefined;
      };
      return AsapAction;
  }(AsyncAction));

  var Scheduler = (function () {
      function Scheduler(schedulerActionCtor, now) {
          if (now === void 0) { now = Scheduler.now; }
          this.schedulerActionCtor = schedulerActionCtor;
          this.now = now;
      }
      Scheduler.prototype.schedule = function (work, delay, state) {
          if (delay === void 0) { delay = 0; }
          return new this.schedulerActionCtor(this, work).schedule(state, delay);
      };
      Scheduler.now = dateTimestampProvider.now;
      return Scheduler;
  }());

  var AsyncScheduler = (function (_super) {
      __extends(AsyncScheduler, _super);
      function AsyncScheduler(SchedulerAction, now) {
          if (now === void 0) { now = Scheduler.now; }
          var _this = _super.call(this, SchedulerAction, now) || this;
          _this.actions = [];
          _this._active = false;
          _this._scheduled = undefined;
          return _this;
      }
      AsyncScheduler.prototype.flush = function (action) {
          var actions = this.actions;
          if (this._active) {
              actions.push(action);
              return;
          }
          var error;
          this._active = true;
          do {
              if ((error = action.execute(action.state, action.delay))) {
                  break;
              }
          } while ((action = actions.shift()));
          this._active = false;
          if (error) {
              while ((action = actions.shift())) {
                  action.unsubscribe();
              }
              throw error;
          }
      };
      return AsyncScheduler;
  }(Scheduler));

  var AsapScheduler = (function (_super) {
      __extends(AsapScheduler, _super);
      function AsapScheduler() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      AsapScheduler.prototype.flush = function (action) {
          this._active = true;
          this._scheduled = undefined;
          var actions = this.actions;
          var error;
          var index = -1;
          action = action || actions.shift();
          var count = actions.length;
          do {
              if ((error = action.execute(action.state, action.delay))) {
                  break;
              }
          } while (++index < count && (action = actions.shift()));
          this._active = false;
          if (error) {
              while (++index < count && (action = actions.shift())) {
                  action.unsubscribe();
              }
              throw error;
          }
      };
      return AsapScheduler;
  }(AsyncScheduler));

  var asapScheduler = new AsapScheduler(AsapAction);

  var EMPTY = new Observable(function (subscriber) { return subscriber.complete(); });

  function isScheduler(value) {
      return value && isFunction(value.schedule);
  }

  function last(arr) {
      return arr[arr.length - 1];
  }
  function popResultSelector(args) {
      return isFunction(last(args)) ? args.pop() : undefined;
  }
  function popScheduler(args) {
      return isScheduler(last(args)) ? args.pop() : undefined;
  }

  var isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });

  function isPromise(value) {
      return isFunction(value === null || value === void 0 ? void 0 : value.then);
  }

  function isInteropObservable(input) {
      return isFunction(input[observable]);
  }

  function isAsyncIterable(obj) {
      return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
  }

  function createInvalidObservableTypeError(input) {
      return new TypeError("You provided " + (input !== null && typeof input === 'object' ? 'an invalid object' : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
  }

  function getSymbolIterator() {
      if (typeof Symbol !== 'function' || !Symbol.iterator) {
          return '@@iterator';
      }
      return Symbol.iterator;
  }
  var iterator = getSymbolIterator();

  function isIterable(input) {
      return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
  }

  function readableStreamLikeToAsyncGenerator(readableStream) {
      return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
          var reader, _a, value, done;
          return __generator(this, function (_b) {
              switch (_b.label) {
                  case 0:
                      reader = readableStream.getReader();
                      _b.label = 1;
                  case 1:
                      _b.trys.push([1, , 9, 10]);
                      _b.label = 2;
                  case 2:
                      return [4, __await(reader.read())];
                  case 3:
                      _a = _b.sent(), value = _a.value, done = _a.done;
                      if (!done) return [3, 5];
                      return [4, __await(void 0)];
                  case 4: return [2, _b.sent()];
                  case 5: return [4, __await(value)];
                  case 6: return [4, _b.sent()];
                  case 7:
                      _b.sent();
                      return [3, 2];
                  case 8: return [3, 10];
                  case 9:
                      reader.releaseLock();
                      return [7];
                  case 10: return [2];
              }
          });
      });
  }
  function isReadableStreamLike(obj) {
      return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
  }

  function innerFrom(input) {
      if (input instanceof Observable) {
          return input;
      }
      if (input != null) {
          if (isInteropObservable(input)) {
              return fromInteropObservable(input);
          }
          if (isArrayLike(input)) {
              return fromArrayLike(input);
          }
          if (isPromise(input)) {
              return fromPromise(input);
          }
          if (isAsyncIterable(input)) {
              return fromAsyncIterable(input);
          }
          if (isIterable(input)) {
              return fromIterable(input);
          }
          if (isReadableStreamLike(input)) {
              return fromReadableStreamLike(input);
          }
      }
      throw createInvalidObservableTypeError(input);
  }
  function fromInteropObservable(obj) {
      return new Observable(function (subscriber) {
          var obs = obj[observable]();
          if (isFunction(obs.subscribe)) {
              return obs.subscribe(subscriber);
          }
          throw new TypeError('Provided object does not correctly implement Symbol.observable');
      });
  }
  function fromArrayLike(array) {
      return new Observable(function (subscriber) {
          for (var i = 0; i < array.length && !subscriber.closed; i++) {
              subscriber.next(array[i]);
          }
          subscriber.complete();
      });
  }
  function fromPromise(promise) {
      return new Observable(function (subscriber) {
          promise
              .then(function (value) {
              if (!subscriber.closed) {
                  subscriber.next(value);
                  subscriber.complete();
              }
          }, function (err) { return subscriber.error(err); })
              .then(null, reportUnhandledError);
      });
  }
  function fromIterable(iterable) {
      return new Observable(function (subscriber) {
          var e_1, _a;
          try {
              for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
                  var value = iterable_1_1.value;
                  subscriber.next(value);
                  if (subscriber.closed) {
                      return;
                  }
              }
          }
          catch (e_1_1) { e_1 = { error: e_1_1 }; }
          finally {
              try {
                  if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
              }
              finally { if (e_1) throw e_1.error; }
          }
          subscriber.complete();
      });
  }
  function fromAsyncIterable(asyncIterable) {
      return new Observable(function (subscriber) {
          process(asyncIterable, subscriber).catch(function (err) { return subscriber.error(err); });
      });
  }
  function fromReadableStreamLike(readableStream) {
      return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
  }
  function process(asyncIterable, subscriber) {
      var asyncIterable_1, asyncIterable_1_1;
      var e_2, _a;
      return __awaiter(this, void 0, void 0, function () {
          var value, e_2_1;
          return __generator(this, function (_b) {
              switch (_b.label) {
                  case 0:
                      _b.trys.push([0, 5, 6, 11]);
                      asyncIterable_1 = __asyncValues(asyncIterable);
                      _b.label = 1;
                  case 1: return [4, asyncIterable_1.next()];
                  case 2:
                      if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
                      value = asyncIterable_1_1.value;
                      subscriber.next(value);
                      if (subscriber.closed) {
                          return [2];
                      }
                      _b.label = 3;
                  case 3: return [3, 1];
                  case 4: return [3, 11];
                  case 5:
                      e_2_1 = _b.sent();
                      e_2 = { error: e_2_1 };
                      return [3, 11];
                  case 6:
                      _b.trys.push([6, , 9, 10]);
                      if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
                      return [4, _a.call(asyncIterable_1)];
                  case 7:
                      _b.sent();
                      _b.label = 8;
                  case 8: return [3, 10];
                  case 9:
                      if (e_2) throw e_2.error;
                      return [7];
                  case 10: return [7];
                  case 11:
                      subscriber.complete();
                      return [2];
              }
          });
      });
  }

  function executeSchedule(parentSubscription, scheduler, work, delay, repeat) {
      if (delay === void 0) { delay = 0; }
      if (repeat === void 0) { repeat = false; }
      var scheduleSubscription = scheduler.schedule(function () {
          work();
          if (repeat) {
              parentSubscription.add(this.schedule(null, delay));
          }
          else {
              this.unsubscribe();
          }
      }, delay);
      parentSubscription.add(scheduleSubscription);
      if (!repeat) {
          return scheduleSubscription;
      }
  }

  function observeOn(scheduler, delay) {
      if (delay === void 0) { delay = 0; }
      return operate(function (source, subscriber) {
          source.subscribe(new OperatorSubscriber(subscriber, function (value) { return executeSchedule(subscriber, scheduler, function () { return subscriber.next(value); }, delay); }, function () { return executeSchedule(subscriber, scheduler, function () { return subscriber.complete(); }, delay); }, function (err) { return executeSchedule(subscriber, scheduler, function () { return subscriber.error(err); }, delay); }));
      });
  }

  function subscribeOn(scheduler, delay) {
      if (delay === void 0) { delay = 0; }
      return operate(function (source, subscriber) {
          subscriber.add(scheduler.schedule(function () { return source.subscribe(subscriber); }, delay));
      });
  }

  function scheduleObservable(input, scheduler) {
      return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
  }

  function schedulePromise(input, scheduler) {
      return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
  }

  function scheduleArray(input, scheduler) {
      return new Observable(function (subscriber) {
          var i = 0;
          return scheduler.schedule(function () {
              if (i === input.length) {
                  subscriber.complete();
              }
              else {
                  subscriber.next(input[i++]);
                  if (!subscriber.closed) {
                      this.schedule();
                  }
              }
          });
      });
  }

  function scheduleIterable(input, scheduler) {
      return new Observable(function (subscriber) {
          var iterator$1;
          executeSchedule(subscriber, scheduler, function () {
              iterator$1 = input[iterator]();
              executeSchedule(subscriber, scheduler, function () {
                  var _a;
                  var value;
                  var done;
                  try {
                      (_a = iterator$1.next(), value = _a.value, done = _a.done);
                  }
                  catch (err) {
                      subscriber.error(err);
                      return;
                  }
                  if (done) {
                      subscriber.complete();
                  }
                  else {
                      subscriber.next(value);
                  }
              }, 0, true);
          });
          return function () { return isFunction(iterator$1 === null || iterator$1 === void 0 ? void 0 : iterator$1.return) && iterator$1.return(); };
      });
  }

  function scheduleAsyncIterable(input, scheduler) {
      if (!input) {
          throw new Error('Iterable cannot be null');
      }
      return new Observable(function (subscriber) {
          executeSchedule(subscriber, scheduler, function () {
              var iterator = input[Symbol.asyncIterator]();
              executeSchedule(subscriber, scheduler, function () {
                  iterator.next().then(function (result) {
                      if (result.done) {
                          subscriber.complete();
                      }
                      else {
                          subscriber.next(result.value);
                      }
                  });
              }, 0, true);
          });
      });
  }

  function scheduleReadableStreamLike(input, scheduler) {
      return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
  }

  function scheduled(input, scheduler) {
      if (input != null) {
          if (isInteropObservable(input)) {
              return scheduleObservable(input, scheduler);
          }
          if (isArrayLike(input)) {
              return scheduleArray(input, scheduler);
          }
          if (isPromise(input)) {
              return schedulePromise(input, scheduler);
          }
          if (isAsyncIterable(input)) {
              return scheduleAsyncIterable(input, scheduler);
          }
          if (isIterable(input)) {
              return scheduleIterable(input, scheduler);
          }
          if (isReadableStreamLike(input)) {
              return scheduleReadableStreamLike(input, scheduler);
          }
      }
      throw createInvalidObservableTypeError(input);
  }

  function from(input, scheduler) {
      return scheduler ? scheduled(input, scheduler) : innerFrom(input);
  }

  function of() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      var scheduler = popScheduler(args);
      return from(args, scheduler);
  }

  var EmptyError = createErrorClass(function (_super) { return function EmptyErrorImpl() {
      _super(this);
      this.name = 'EmptyError';
      this.message = 'no elements in sequence';
  }; });

  function firstValueFrom(source, config) {
      var hasConfig = typeof config === 'object';
      return new Promise(function (resolve, reject) {
          var subscriber = new SafeSubscriber({
              next: function (value) {
                  resolve(value);
                  subscriber.unsubscribe();
              },
              error: reject,
              complete: function () {
                  if (hasConfig) {
                      resolve(config.defaultValue);
                  }
                  else {
                      reject(new EmptyError());
                  }
              },
          });
          source.subscribe(subscriber);
      });
  }

  function map(project, thisArg) {
      return operate(function (source, subscriber) {
          var index = 0;
          source.subscribe(new OperatorSubscriber(subscriber, function (value) {
              subscriber.next(project.call(thisArg, value, index++));
          }));
      });
  }

  var isArray$1 = Array.isArray;
  function callOrApply(fn, args) {
      return isArray$1(args) ? fn.apply(void 0, __spreadArray([], __read(args))) : fn(args);
  }
  function mapOneOrManyArgs(fn) {
      return map(function (args) { return callOrApply(fn, args); });
  }

  var isArray = Array.isArray;
  var getPrototypeOf = Object.getPrototypeOf, objectProto = Object.prototype, getKeys = Object.keys;
  function argsArgArrayOrObject(args) {
      if (args.length === 1) {
          var first_1 = args[0];
          if (isArray(first_1)) {
              return { args: first_1, keys: null };
          }
          if (isPOJO(first_1)) {
              var keys = getKeys(first_1);
              return {
                  args: keys.map(function (key) { return first_1[key]; }),
                  keys: keys,
              };
          }
      }
      return { args: args, keys: null };
  }
  function isPOJO(obj) {
      return obj && typeof obj === 'object' && getPrototypeOf(obj) === objectProto;
  }

  function createObject(keys, values) {
      return keys.reduce(function (result, key, i) { return ((result[key] = values[i]), result); }, {});
  }

  function combineLatest() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      var scheduler = popScheduler(args);
      var resultSelector = popResultSelector(args);
      var _a = argsArgArrayOrObject(args), observables = _a.args, keys = _a.keys;
      if (observables.length === 0) {
          return from([], scheduler);
      }
      var result = new Observable(combineLatestInit(observables, scheduler, keys
          ?
              function (values) { return createObject(keys, values); }
          :
              identity$2));
      return resultSelector ? result.pipe(mapOneOrManyArgs(resultSelector)) : result;
  }
  function combineLatestInit(observables, scheduler, valueTransform) {
      if (valueTransform === void 0) { valueTransform = identity$2; }
      return function (subscriber) {
          maybeSchedule(scheduler, function () {
              var length = observables.length;
              var values = new Array(length);
              var active = length;
              var remainingFirstValues = length;
              var _loop_1 = function (i) {
                  maybeSchedule(scheduler, function () {
                      var source = from(observables[i], scheduler);
                      var hasFirstValue = false;
                      source.subscribe(new OperatorSubscriber(subscriber, function (value) {
                          values[i] = value;
                          if (!hasFirstValue) {
                              hasFirstValue = true;
                              remainingFirstValues--;
                          }
                          if (!remainingFirstValues) {
                              subscriber.next(valueTransform(values.slice()));
                          }
                      }, function () {
                          if (!--active) {
                              subscriber.complete();
                          }
                      }));
                  }, subscriber);
              };
              for (var i = 0; i < length; i++) {
                  _loop_1(i);
              }
          }, subscriber);
      };
  }
  function maybeSchedule(scheduler, execute, subscription) {
      if (scheduler) {
          executeSchedule(subscription, scheduler, execute);
      }
      else {
          execute();
      }
  }

  function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalTeardown) {
      var buffer = [];
      var active = 0;
      var index = 0;
      var isComplete = false;
      var checkComplete = function () {
          if (isComplete && !buffer.length && !active) {
              subscriber.complete();
          }
      };
      var outerNext = function (value) { return (active < concurrent ? doInnerSub(value) : buffer.push(value)); };
      var doInnerSub = function (value) {
          expand && subscriber.next(value);
          active++;
          var innerComplete = false;
          innerFrom(project(value, index++)).subscribe(new OperatorSubscriber(subscriber, function (innerValue) {
              onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
              if (expand) {
                  outerNext(innerValue);
              }
              else {
                  subscriber.next(innerValue);
              }
          }, function () {
              innerComplete = true;
          }, undefined, function () {
              if (innerComplete) {
                  try {
                      active--;
                      var _loop_1 = function () {
                          var bufferedValue = buffer.shift();
                          if (innerSubScheduler) {
                              executeSchedule(subscriber, innerSubScheduler, function () { return doInnerSub(bufferedValue); });
                          }
                          else {
                              doInnerSub(bufferedValue);
                          }
                      };
                      while (buffer.length && active < concurrent) {
                          _loop_1();
                      }
                      checkComplete();
                  }
                  catch (err) {
                      subscriber.error(err);
                  }
              }
          }));
      };
      source.subscribe(new OperatorSubscriber(subscriber, outerNext, function () {
          isComplete = true;
          checkComplete();
      }));
      return function () {
          additionalTeardown === null || additionalTeardown === void 0 ? void 0 : additionalTeardown();
      };
  }

  function mergeMap(project, resultSelector, concurrent) {
      if (concurrent === void 0) { concurrent = Infinity; }
      if (isFunction(resultSelector)) {
          return mergeMap(function (a, i) { return map(function (b, ii) { return resultSelector(a, b, i, ii); })(innerFrom(project(a, i))); }, concurrent);
      }
      else if (typeof resultSelector === 'number') {
          concurrent = resultSelector;
      }
      return operate(function (source, subscriber) { return mergeInternals(source, subscriber, project, concurrent); });
  }

  function mergeAll(concurrent) {
      if (concurrent === void 0) { concurrent = Infinity; }
      return mergeMap(identity$2, concurrent);
  }

  function concatAll() {
      return mergeAll(1);
  }

  function concat() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      return concatAll()(from(args, popScheduler(args)));
  }

  function filter(predicate, thisArg) {
      return operate(function (source, subscriber) {
          var index = 0;
          source.subscribe(new OperatorSubscriber(subscriber, function (value) { return predicate.call(thisArg, value, index++) && subscriber.next(value); }));
      });
  }

  function catchError(selector) {
      return operate(function (source, subscriber) {
          var innerSub = null;
          var syncUnsub = false;
          var handledResult;
          innerSub = source.subscribe(new OperatorSubscriber(subscriber, undefined, undefined, function (err) {
              handledResult = innerFrom(selector(err, catchError(selector)(source)));
              if (innerSub) {
                  innerSub.unsubscribe();
                  innerSub = null;
                  handledResult.subscribe(subscriber);
              }
              else {
                  syncUnsub = true;
              }
          }));
          if (syncUnsub) {
              innerSub.unsubscribe();
              innerSub = null;
              handledResult.subscribe(subscriber);
          }
      });
  }

  function scanInternals(accumulator, seed, hasSeed, emitOnNext, emitBeforeComplete) {
      return function (source, subscriber) {
          var hasState = hasSeed;
          var state = seed;
          var index = 0;
          source.subscribe(new OperatorSubscriber(subscriber, function (value) {
              var i = index++;
              state = hasState
                  ?
                      accumulator(state, value, i)
                  :
                      ((hasState = true), value);
              emitOnNext && subscriber.next(state);
          }, emitBeforeComplete &&
              (function () {
                  hasState && subscriber.next(state);
                  subscriber.complete();
              })));
      };
  }

  function reduce(accumulator, seed) {
      return operate(scanInternals(accumulator, seed, arguments.length >= 2, false, true));
  }

  var arrReducer = function (arr, value) { return (arr.push(value), arr); };
  function toArray() {
      return operate(function (source, subscriber) {
          reduce(arrReducer, [])(source).subscribe(subscriber);
      });
  }

  function fromSubscribable(subscribable) {
      return new Observable(function (subscriber) { return subscribable.subscribe(subscriber); });
  }

  var DEFAULT_CONFIG = {
      connector: function () { return new Subject(); },
  };
  function connect(selector, config) {
      if (config === void 0) { config = DEFAULT_CONFIG; }
      var connector = config.connector;
      return operate(function (source, subscriber) {
          var subject = connector();
          from(selector(fromSubscribable(subject))).subscribe(subscriber);
          subscriber.add(source.subscribe(subject));
      });
  }

  function defaultIfEmpty(defaultValue) {
      return operate(function (source, subscriber) {
          var hasValue = false;
          source.subscribe(new OperatorSubscriber(subscriber, function (value) {
              hasValue = true;
              subscriber.next(value);
          }, function () {
              if (!hasValue) {
                  subscriber.next(defaultValue);
              }
              subscriber.complete();
          }));
      });
  }

  function take(count) {
      return count <= 0
          ?
              function () { return EMPTY; }
          : operate(function (source, subscriber) {
              var seen = 0;
              source.subscribe(new OperatorSubscriber(subscriber, function (value) {
                  if (++seen <= count) {
                      subscriber.next(value);
                      if (count <= seen) {
                          subscriber.complete();
                      }
                  }
              }));
          });
  }

  function mapTo(value) {
      return map(function () { return value; });
  }

  function distinctUntilChanged(comparator, keySelector) {
      if (keySelector === void 0) { keySelector = identity$2; }
      comparator = comparator !== null && comparator !== void 0 ? comparator : defaultCompare;
      return operate(function (source, subscriber) {
          var previousKey;
          var first = true;
          source.subscribe(new OperatorSubscriber(subscriber, function (value) {
              var currentKey = keySelector(value);
              if (first || !comparator(previousKey, currentKey)) {
                  first = false;
                  previousKey = currentKey;
                  subscriber.next(value);
              }
          }));
      });
  }
  function defaultCompare(a, b) {
      return a === b;
  }

  function throwIfEmpty(errorFactory) {
      if (errorFactory === void 0) { errorFactory = defaultErrorFactory; }
      return operate(function (source, subscriber) {
          var hasValue = false;
          source.subscribe(new OperatorSubscriber(subscriber, function (value) {
              hasValue = true;
              subscriber.next(value);
          }, function () { return (hasValue ? subscriber.complete() : subscriber.error(errorFactory())); }));
      });
  }
  function defaultErrorFactory() {
      return new EmptyError();
  }

  function first(predicate, defaultValue) {
      var hasDefaultValue = arguments.length >= 2;
      return function (source) {
          return source.pipe(predicate ? filter(function (v, i) { return predicate(v, i, source); }) : identity$2, take(1), hasDefaultValue ? defaultIfEmpty(defaultValue) : throwIfEmpty(function () { return new EmptyError(); }));
      };
  }

  function multicast(subjectOrSubjectFactory, selector) {
      var subjectFactory = isFunction(subjectOrSubjectFactory) ? subjectOrSubjectFactory : function () { return subjectOrSubjectFactory; };
      if (isFunction(selector)) {
          return connect(selector, {
              connector: subjectFactory,
          });
      }
      return function (source) { return new ConnectableObservable(source, subjectFactory); };
  }

  function publishReplay(bufferSize, windowTime, selectorOrScheduler, timestampProvider) {
      if (selectorOrScheduler && !isFunction(selectorOrScheduler)) {
          timestampProvider = selectorOrScheduler;
      }
      var selector = isFunction(selectorOrScheduler) ? selectorOrScheduler : undefined;
      return function (source) { return multicast(new ReplaySubject(bufferSize, windowTime, timestampProvider), selector)(source); };
  }

  function startWith() {
      var values = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          values[_i] = arguments[_i];
      }
      var scheduler = popScheduler(values);
      return operate(function (source, subscriber) {
          (scheduler ? concat(values, source, scheduler) : concat(values, source)).subscribe(subscriber);
      });
  }

  function switchMap(project, resultSelector) {
      return operate(function (source, subscriber) {
          var innerSubscriber = null;
          var index = 0;
          var isComplete = false;
          var checkComplete = function () { return isComplete && !innerSubscriber && subscriber.complete(); };
          source.subscribe(new OperatorSubscriber(subscriber, function (value) {
              innerSubscriber === null || innerSubscriber === void 0 ? void 0 : innerSubscriber.unsubscribe();
              var innerIndex = 0;
              var outerIndex = index++;
              innerFrom(project(value, outerIndex)).subscribe((innerSubscriber = new OperatorSubscriber(subscriber, function (innerValue) { return subscriber.next(resultSelector ? resultSelector(value, innerValue, outerIndex, innerIndex++) : innerValue); }, function () {
                  innerSubscriber = null;
                  checkComplete();
              })));
          }, function () {
              isComplete = true;
              checkComplete();
          }));
      });
  }

  function tap(observerOrNext, error, complete) {
      var tapObserver = isFunction(observerOrNext) || error || complete
          ?
              { next: observerOrNext, error: error, complete: complete }
          : observerOrNext;
      return tapObserver
          ? operate(function (source, subscriber) {
              var _a;
              (_a = tapObserver.subscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
              var isUnsub = true;
              source.subscribe(new OperatorSubscriber(subscriber, function (value) {
                  var _a;
                  (_a = tapObserver.next) === null || _a === void 0 ? void 0 : _a.call(tapObserver, value);
                  subscriber.next(value);
              }, function () {
                  var _a;
                  isUnsub = false;
                  (_a = tapObserver.complete) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                  subscriber.complete();
              }, function (err) {
                  var _a;
                  isUnsub = false;
                  (_a = tapObserver.error) === null || _a === void 0 ? void 0 : _a.call(tapObserver, err);
                  subscriber.error(err);
              }, function () {
                  var _a, _b;
                  if (isUnsub) {
                      (_a = tapObserver.unsubscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                  }
                  (_b = tapObserver.finalize) === null || _b === void 0 ? void 0 : _b.call(tapObserver);
              }));
          })
          :
              identity$2;
  }

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  // Type overrides based on specific nodes
  const typesChain = {};
  const typesChain$1 = typesChain;

  function ownKeys$t(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$t(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$t(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$t(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0

  /* eslint-disable sort-keys */
  const sharedTypes$4 = {
    // Anchor
    AnchorData: {
      anchoredBlock: 'u64',
      docRoot: 'H256',
      id: 'H256'
    },
    PreCommitData: {
      expirationBlock: 'u64',
      identity: 'H256',
      signingRoot: 'H256'
    },
    // Fees
    Fee: {
      key: 'Hash',
      price: 'Balance'
    },
    // MultiAccount
    MultiAccountData: {
      deposit: 'Balance',
      depositor: 'AccountId',
      signatories: 'Vec<AccountId>',
      threshold: 'u16'
    },
    // Bridge
    ChainId: 'u8',
    DepositNonce: 'u64',
    ResourceId: '[u8; 32]',
    'chainbridge::ChainId': 'u8',
    // NFT
    RegistryId: 'H160',
    TokenId: 'U256',
    AssetId: {
      registryId: 'RegistryId',
      tokenId: 'TokenId'
    },
    AssetInfo: {
      metadata: 'Bytes'
    },
    MintInfo: {
      anchorId: 'Hash',
      proofs: 'Vec<ProofMint>',
      staticHashes: '[Hash; 3]'
    },
    Proof: {
      leafHash: 'H256',
      sortedHashes: 'H256'
    },
    ProofMint: {
      hashes: 'Vec<Hash>',
      property: 'Bytes',
      salt: '[u8; 32]',
      value: 'Bytes'
    },
    RegistryInfo: {
      fields: 'Vec<Bytes>',
      ownerCanBurn: 'bool'
    },
    ProxyType: {
      _enum: ['Any', 'NonTransfer', 'Governance', 'Staking', 'NonProxy']
    }
  };

  const standaloneTypes = _objectSpread$t(_objectSpread$t({}, sharedTypes$4), {}, {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'LookupSource',
    LookupSource: 'IndicesLookupSource',
    Multiplier: 'Fixed64',
    RefCount: 'RefCountTo259'
  });

  const versioned$8 = [{
    minmax: [240, 243],
    types: _objectSpread$t(_objectSpread$t({}, standaloneTypes), {}, {
      ProxyType: {
        _enum: ['Any', 'NonTransfer', 'Governance', 'Staking', 'Vesting']
      }
    })
  }, {
    minmax: [244, 999],
    types: _objectSpread$t({}, standaloneTypes)
  }, {
    minmax: [1000, undefined],
    types: _objectSpread$t({}, sharedTypes$4)
  }];
  const centrifugeChain = versioned$8;

  function ownKeys$s(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$s(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$s(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$s(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0

  /* eslint-disable sort-keys */
  const sharedTypes$3 = {
    CompactAssignments: 'CompactAssignmentsWith24',
    RawSolution: 'RawSolutionWith24',
    Keys: 'SessionKeys6',
    ProxyType: {
      _enum: ['Any', 'NonTransfer', 'Governance', 'Staking', 'IdentityJudgement', 'CancelProxy', 'Auction']
    }
  };
  const addrIndicesTypes = {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'LookupSource',
    CompactAssignments: 'CompactAssignmentsWith16',
    RawSolution: 'RawSolutionWith16',
    Keys: 'SessionKeys5',
    LookupSource: 'IndicesLookupSource',
    ValidatorPrefs: 'ValidatorPrefsWithCommission'
  };
  const addrAccountIdTypes$2 = {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'AccountId',
    CompactAssignments: 'CompactAssignmentsWith16',
    RawSolution: 'RawSolutionWith16',
    Keys: 'SessionKeys5',
    LookupSource: 'AccountId',
    ValidatorPrefs: 'ValidatorPrefsWithCommission'
  };
  const versioned$7 = [{
    // 1020 is first CC3
    minmax: [1019, 1031],
    types: _objectSpread$s(_objectSpread$s({}, addrIndicesTypes), {}, {
      BalanceLock: 'BalanceLockTo212',
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchError: 'DispatchErrorTo198',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      IdentityInfo: 'IdentityInfoTo198',
      Keys: 'SessionKeys5',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      ReferendumInfo: 'ReferendumInfoTo239',
      SlashingSpans: 'SlashingSpansTo204',
      StakingLedger: 'StakingLedgerTo223',
      Votes: 'VotesTo230',
      Weight: 'u32'
    })
  }, {
    minmax: [1032, 1042],
    types: _objectSpread$s(_objectSpread$s({}, addrIndicesTypes), {}, {
      BalanceLock: 'BalanceLockTo212',
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      Keys: 'SessionKeys5',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      ReferendumInfo: 'ReferendumInfoTo239',
      SlashingSpans: 'SlashingSpansTo204',
      StakingLedger: 'StakingLedgerTo223',
      Votes: 'VotesTo230',
      Weight: 'u32'
    })
  }, {
    // actual at 1045 (1043-1044 is dev)
    minmax: [1043, 1045],
    types: _objectSpread$s(_objectSpread$s({}, addrIndicesTypes), {}, {
      BalanceLock: 'BalanceLockTo212',
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      Keys: 'SessionKeys5',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      ReferendumInfo: 'ReferendumInfoTo239',
      StakingLedger: 'StakingLedgerTo223',
      Votes: 'VotesTo230',
      Weight: 'u32'
    })
  }, {
    minmax: [1046, 1054],
    types: _objectSpread$s(_objectSpread$s(_objectSpread$s({}, sharedTypes$3), addrAccountIdTypes$2), {}, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      ReferendumInfo: 'ReferendumInfoTo239',
      StakingLedger: 'StakingLedgerTo240',
      Weight: 'u32'
    })
  }, {
    minmax: [1055, 1056],
    types: _objectSpread$s(_objectSpread$s(_objectSpread$s({}, sharedTypes$3), addrAccountIdTypes$2), {}, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      StakingLedger: 'StakingLedgerTo240',
      Weight: 'u32'
    })
  }, {
    minmax: [1057, 1061],
    types: _objectSpread$s(_objectSpread$s(_objectSpread$s({}, sharedTypes$3), addrAccountIdTypes$2), {}, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [1062, 2012],
    types: _objectSpread$s(_objectSpread$s(_objectSpread$s({}, sharedTypes$3), addrAccountIdTypes$2), {}, {
      CompactAssignments: 'CompactAssignmentsTo257',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [2013, 2022],
    types: _objectSpread$s(_objectSpread$s(_objectSpread$s({}, sharedTypes$3), addrAccountIdTypes$2), {}, {
      CompactAssignments: 'CompactAssignmentsTo257',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [2023, 2024],
    types: _objectSpread$s(_objectSpread$s(_objectSpread$s({}, sharedTypes$3), addrAccountIdTypes$2), {}, {
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [2025, 2027],
    types: _objectSpread$s(_objectSpread$s({}, sharedTypes$3), addrAccountIdTypes$2)
  }, {
    minmax: [2028, 2029],
    types: _objectSpread$s(_objectSpread$s({}, sharedTypes$3), {}, {
      AccountInfo: 'AccountInfoWithDualRefCount',
      CompactAssignments: 'CompactAssignmentsWith16',
      RawSolution: 'RawSolutionWith16'
    })
  }, {
    minmax: [2030, 9000],
    types: _objectSpread$s(_objectSpread$s({}, sharedTypes$3), {}, {
      CompactAssignments: 'CompactAssignmentsWith16',
      RawSolution: 'RawSolutionWith16'
    })
  }, {
    minmax: [9010, undefined],
    types: _objectSpread$s(_objectSpread$s({}, sharedTypes$3), {}, {
      AssetInstance: 'AssetInstanceV0',
      MultiAsset: 'MultiAssetV0',
      MultiLocation: 'MultiLocationV0',
      Response: 'ResponseV0',
      Xcm: 'XcmV0',
      XcmOrder: 'XcmOrderV0'
    })
  }];
  const axialunar$1 = versioned$7;

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0

  /* eslint-disable sort-keys */
  const versioned$6 = [{
    minmax: [0, undefined],
    types: {// nothing, API tracks master
    }
  }];
  const node = versioned$6;

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0

  /* eslint-disable sort-keys */
  const versioned$5 = [{
    minmax: [0, undefined],
    types: {// nothing, API tracks master
    }
  }];
  const nodeTemplate = versioned$5;

  function ownKeys$r(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$r(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$r(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$r(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0

  /* eslint-disable sort-keys */
  const sharedTypes$2 = {
    CompactAssignments: 'CompactAssignmentsWith16',
    RawSolution: 'RawSolutionWith16',
    Keys: 'SessionKeys6',
    ProxyType: {
      _enum: {
        Any: 0,
        NonTransfer: 1,
        Governance: 2,
        Staking: 3,
        UnusedSudoBalances: 4,
        IdentityJudgement: 5,
        CancelProxy: 6
      }
    }
  };
  const addrAccountIdTypes$1 = {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'AccountId',
    Keys: 'SessionKeys5',
    LookupSource: 'AccountId',
    ValidatorPrefs: 'ValidatorPrefsWithCommission'
  }; // these are override types for AXIA

  const versioned$4 = [{
    minmax: [0, 12],
    types: _objectSpread$r(_objectSpread$r(_objectSpread$r({}, sharedTypes$2), addrAccountIdTypes$1), {}, {
      CompactAssignments: 'CompactAssignmentsTo257',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [13, 22],
    types: _objectSpread$r(_objectSpread$r(_objectSpread$r({}, sharedTypes$2), addrAccountIdTypes$1), {}, {
      CompactAssignments: 'CompactAssignmentsTo257',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [23, 24],
    types: _objectSpread$r(_objectSpread$r(_objectSpread$r({}, sharedTypes$2), addrAccountIdTypes$1), {}, {
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [25, 27],
    types: _objectSpread$r(_objectSpread$r({}, sharedTypes$2), addrAccountIdTypes$1)
  }, {
    minmax: [28, 29],
    types: _objectSpread$r(_objectSpread$r({}, sharedTypes$2), {}, {
      AccountInfo: 'AccountInfoWithDualRefCount'
    })
  }, {
    minmax: [30, undefined],
    types: _objectSpread$r({}, sharedTypes$2)
  }];
  const axia$1 = versioned$4;

  function ownKeys$q(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$q(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$q(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$q(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0

  /* eslint-disable sort-keys */
  // structs need to be in order

  /* eslint-disable sort-keys */
  const sharedTypes$1 = {
    FullIdentification: '()',
    // No staking, only session (as per config)
    Keys: 'SessionKeys7B'
  };
  const versioned$3 = [{
    minmax: [0, 200],
    types: _objectSpread$q(_objectSpread$q({}, sharedTypes$1), {}, {
      AccountInfo: 'AccountInfoWithDualRefCount',
      Address: 'AccountId',
      LookupSource: 'AccountId'
    })
  }, {
    minmax: [201, 214],
    types: _objectSpread$q(_objectSpread$q({}, sharedTypes$1), {}, {
      AccountInfo: 'AccountInfoWithDualRefCount'
    })
  }, {
    minmax: [215, 228],
    types: _objectSpread$q(_objectSpread$q({}, sharedTypes$1), {}, {
      Keys: 'SessionKeys6'
    })
  }, {
    minmax: [229, undefined],
    types: _objectSpread$q(_objectSpread$q({}, sharedTypes$1), {}, {
      AssetInstance: 'AssetInstanceV0',
      MultiAsset: 'MultiAssetV0',
      MultiLocation: 'MultiLocationV0',
      Response: 'ResponseV0',
      Xcm: 'XcmV0',
      XcmOrder: 'XcmOrderV0'
    })
  }];
  const betanet = versioned$3;

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0

  /* eslint-disable sort-keys */
  const versioned$2 = [{
    minmax: [0, undefined],
    types: {// nothing, limited runtime
    }
  }];
  const shell = versioned$2;

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0

  /* eslint-disable sort-keys */
  // these are override types for Statemine, Statemint, Westmint
  const versioned$1 = [{
    minmax: [0, undefined],
    types: {
      TAssetBalance: 'u128',
      ProxyType: {
        _enum: ['Any', 'NonTransfer', 'CancelProxy', 'Assets', 'AssetOwner', 'AssetManager', 'Staking']
      },
      AssetInstance: 'AssetInstanceV0',
      MultiAsset: 'MultiAssetV0',
      MultiLocation: 'MultiLocationV0',
      Response: 'ResponseV0',
      Xcm: 'XcmV0',
      XcmOrder: 'XcmOrderV0'
    }
  }];
  const statemint = versioned$1;

  function ownKeys$p(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$p(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$p(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$p(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0

  /* eslint-disable sort-keys */
  const sharedTypes = {
    // 16 validators
    CompactAssignments: 'CompactAssignmentsWith16',
    RawSolution: 'RawSolutionWith16',
    // general
    Keys: 'SessionKeys6',
    ProxyType: {
      _enum: ['Any', 'NonTransfer', 'Staking', 'SudoBalances', 'IdentityJudgement', 'CancelProxy']
    }
  };
  const addrAccountIdTypes = {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'AccountId',
    CompactAssignments: 'CompactAssignmentsWith16',
    LookupSource: 'AccountId',
    Keys: 'SessionKeys5',
    RawSolution: 'RawSolutionWith16',
    ValidatorPrefs: 'ValidatorPrefsWithCommission'
  };
  const versioned = [{
    minmax: [1, 2],
    types: _objectSpread$p(_objectSpread$p(_objectSpread$p({}, sharedTypes), addrAccountIdTypes), {}, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      Weight: 'u32'
    })
  }, {
    minmax: [3, 22],
    types: _objectSpread$p(_objectSpread$p(_objectSpread$p({}, sharedTypes), addrAccountIdTypes), {}, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [23, 42],
    types: _objectSpread$p(_objectSpread$p(_objectSpread$p({}, sharedTypes), addrAccountIdTypes), {}, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [43, 44],
    types: _objectSpread$p(_objectSpread$p(_objectSpread$p({}, sharedTypes), addrAccountIdTypes), {}, {
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [45, 47],
    types: _objectSpread$p(_objectSpread$p({}, sharedTypes), addrAccountIdTypes)
  }, {
    minmax: [48, 49],
    types: _objectSpread$p(_objectSpread$p({}, sharedTypes), {}, {
      AccountInfo: 'AccountInfoWithDualRefCount'
    })
  }, {
    minmax: [50, undefined],
    types: _objectSpread$p(_objectSpread$p({}, sharedTypes), {}, {
      AssetInstance: 'AssetInstanceV0',
      MultiAsset: 'MultiAssetV0',
      MultiLocation: 'MultiLocationV0',
      Response: 'ResponseV0',
      Xcm: 'XcmV0',
      XcmOrder: 'XcmOrderV0'
    })
  }];
  const alphanet$1 = versioned;

  // Copyright 2017-2021 @axia-js/types-known authors & contributors

  const typesSpec = {
    'centrifuge-chain': centrifugeChain,
    axialunar: axialunar$1,
    node,
    'node-template': nodeTemplate,
    axia: axia$1,
    betanet,
    shell,
    statemine: statemint,
    statemint,
    alphanet: alphanet$1,
    westmint: statemint
  };
  const typesSpec$1 = typesSpec;

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  const upgrades$4 = [[0, 1020], [26669, 1021], [38245, 1022], [54248, 1023], [59659, 1024], [67651, 1025], [82191, 1027], [83238, 1028], [101503, 1029], [203466, 1030], [295787, 1031], [461692, 1032], [504329, 1033], [569327, 1038], [587687, 1039], [653183, 1040], [693488, 1042], [901442, 1045], [1375086, 1050], [1445458, 1051], [1472960, 1052], [1475648, 1053], [1491596, 1054], [1574408, 1055], [2064961, 1058], [2201991, 1062], [2671528, 2005], [2704202, 2007], [2728002, 2008], [2832534, 2011], [2962294, 2012], [3240000, 2013], [3274408, 2015], [3323565, 2019], [3534175, 2022], [3860281, 2023], [4143129, 2024], [4401242, 2025], [4841367, 2026], [5961600, 2027], [6137912, 2028], [6561855, 2029], [7100891, 2030], [7468792, 9010], [7668600, 9030], [7812476, 9040], [8010981, 9050], [8073833, 9070], [8555825, 9080], [8945245, 9090]];
  const axialunar = upgrades$4;

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  const upgrades$3 = [[0, 0], [29231, 1], [188836, 5], [199405, 6], [214264, 7], [244358, 8], [303079, 9], [314201, 10], [342400, 11], [443963, 12], [528470, 13], [687751, 14], [746085, 15], [787923, 16], [799302, 17], [1205128, 18], [1603423, 23], [1733218, 24], [2005673, 25], [2436698, 26], [3613564, 27], [3899547, 28], [4345767, 29], [4876134, 30], [5661442, 9050], [6321619, 9080], [6713249, 9090]];
  const axia = upgrades$3;

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  const upgrades$2 = [[214356, 4], [392764, 7], [409740, 8], [809976, 20], [877581, 24], [879238, 25], [889472, 26], [902937, 27], [932751, 28], [991142, 29], [1030162, 31], [1119657, 32], [1199282, 33], [1342534, 34], [1392263, 35], [1431703, 36], [1433369, 37], [1490972, 41], [2087397, 43], [2316688, 44], [2549864, 45], [3925782, 46], [3925843, 47], [4207800, 48], [4627944, 49], [5124076, 50], [5478664, 900], [5482450, 9000], [5584305, 9010], [5784566, 9030], [5879822, 9031], [5896856, 9032], [5897316, 9033], [6117927, 9050], [6210274, 9070], [6379314, 9080], [6979141, 9090]];
  const alphanet = upgrades$2;

  // Copyright 2017-2021 @axia-js/types-known authors & contributors
  const allKnown = {
    axialunar,
    axia,
    alphanet
  }; // testnets are not available in the networks map

  const NET_EXTRA = {
    alphanet: {
      genesisHash: ['0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e']
    }
  };
  /** @internal */

  function checkOrder(network, versions) {
    const ooo = versions.filter((curr, index) => {
      const prev = versions[index - 1];
      return index === 0 ? false : curr[0] <= prev[0] || curr[1] <= prev[1];
    });
    util.assert(!ooo.length, () => `${network}: Mismatched upgrade ordering: ${util.stringify(ooo)}`);
    return versions;
  }
  /** @internal */


  function mapRaw([network, versions]) {
    const chain = utilCrypto.selectableNetworks.find(n => n.network === network) || NET_EXTRA[network];
    util.assert(chain, () => `Unable to find info for chain ${network}`);
    return {
      genesisHash: util.hexToU8a(chain.genesisHash[0]),
      network,
      versions: checkOrder(network, versions).map(([blockNumber, specVersion]) => ({
        blockNumber: new util.BN(blockNumber),
        specVersion: new util.BN(specVersion)
      }))
    };
  } // Type overrides for specific spec types & versions as given in runtimeVersion


  const upgrades = Object.entries(allKnown).map(mapRaw);
  const upgrades$1 = upgrades;

  function ownKeys$o(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$o(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$o(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$o(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  /** @internal */

  function filterVersions(versions = [], specVersion) {
    return versions.filter(({
      minmax: [min, max]
    }) => (util.isUndefined(min) || util.isNull(min) || specVersion >= min) && (util.isUndefined(max) || util.isNull(max) || specVersion <= max)).reduce((result, {
      types
    }) => _objectSpread$o(_objectSpread$o({}, result), types), {});
  }
  /**
   * @description Based on the chain and runtimeVersion, get the applicable signed extensions (ready for registration)
   */

  function getSpecExtensions({
    knownTypes
  }, chainName, specName) {
    var _knownTypes$typesBund, _knownTypes$typesBund2, _knownTypes$typesBund3, _knownTypes$typesBund4, _knownTypes$typesBund5, _knownTypes$typesBund6;

    const _chainName = chainName.toString();

    const _specName = specName.toString();

    return _objectSpread$o(_objectSpread$o({}, ((_knownTypes$typesBund = knownTypes.typesBundle) === null || _knownTypes$typesBund === void 0 ? void 0 : (_knownTypes$typesBund2 = _knownTypes$typesBund.spec) === null || _knownTypes$typesBund2 === void 0 ? void 0 : (_knownTypes$typesBund3 = _knownTypes$typesBund2[_specName]) === null || _knownTypes$typesBund3 === void 0 ? void 0 : _knownTypes$typesBund3.signedExtensions) || {}), ((_knownTypes$typesBund4 = knownTypes.typesBundle) === null || _knownTypes$typesBund4 === void 0 ? void 0 : (_knownTypes$typesBund5 = _knownTypes$typesBund4.chain) === null || _knownTypes$typesBund5 === void 0 ? void 0 : (_knownTypes$typesBund6 = _knownTypes$typesBund5[_chainName]) === null || _knownTypes$typesBund6 === void 0 ? void 0 : _knownTypes$typesBund6.signedExtensions) || {});
  }
  /**
   * @description Based on the chain and runtimeVersion, get the applicable types (ready for registration)
   */

  function getSpecTypes({
    knownTypes
  }, chainName, specName, specVersion) {
    var _knownTypes$typesBund7, _knownTypes$typesBund8, _knownTypes$typesBund9, _knownTypes$typesBund10, _knownTypes$typesBund11, _knownTypes$typesBund12, _knownTypes$typesSpec, _knownTypes$typesChai;

    const _chainName = chainName.toString();

    const _specName = specName.toString();

    const _specVersion = util.bnToBn(specVersion).toNumber(); // The order here is always, based on -
    //   - spec then chain
    //   - typesBundle takes higher precedence
    //   - types is the final catch-all override


    return _objectSpread$o(_objectSpread$o(_objectSpread$o(_objectSpread$o(_objectSpread$o(_objectSpread$o(_objectSpread$o({}, filterVersions(typesSpec$1[_specName], _specVersion)), filterVersions(typesChain$1[_chainName], _specVersion)), filterVersions((_knownTypes$typesBund7 = knownTypes.typesBundle) === null || _knownTypes$typesBund7 === void 0 ? void 0 : (_knownTypes$typesBund8 = _knownTypes$typesBund7.spec) === null || _knownTypes$typesBund8 === void 0 ? void 0 : (_knownTypes$typesBund9 = _knownTypes$typesBund8[_specName]) === null || _knownTypes$typesBund9 === void 0 ? void 0 : _knownTypes$typesBund9.types, _specVersion)), filterVersions((_knownTypes$typesBund10 = knownTypes.typesBundle) === null || _knownTypes$typesBund10 === void 0 ? void 0 : (_knownTypes$typesBund11 = _knownTypes$typesBund10.chain) === null || _knownTypes$typesBund11 === void 0 ? void 0 : (_knownTypes$typesBund12 = _knownTypes$typesBund11[_chainName]) === null || _knownTypes$typesBund12 === void 0 ? void 0 : _knownTypes$typesBund12.types, _specVersion)), ((_knownTypes$typesSpec = knownTypes.typesSpec) === null || _knownTypes$typesSpec === void 0 ? void 0 : _knownTypes$typesSpec[_specName]) || {}), ((_knownTypes$typesChai = knownTypes.typesChain) === null || _knownTypes$typesChai === void 0 ? void 0 : _knownTypes$typesChai[_chainName]) || {}), knownTypes.types || {});
  }
  function getSpecHasher({
    knownTypes
  }, chainName, specName) {
    var _knownTypes$typesBund13, _knownTypes$typesBund14, _knownTypes$typesBund15, _knownTypes$typesBund16, _knownTypes$typesBund17, _knownTypes$typesBund18;

    const _chainName = chainName.toString();

    const _specName = specName.toString();

    return knownTypes.hasher || ((_knownTypes$typesBund13 = knownTypes.typesBundle) === null || _knownTypes$typesBund13 === void 0 ? void 0 : (_knownTypes$typesBund14 = _knownTypes$typesBund13.chain) === null || _knownTypes$typesBund14 === void 0 ? void 0 : (_knownTypes$typesBund15 = _knownTypes$typesBund14[_chainName]) === null || _knownTypes$typesBund15 === void 0 ? void 0 : _knownTypes$typesBund15.hasher) || ((_knownTypes$typesBund16 = knownTypes.typesBundle) === null || _knownTypes$typesBund16 === void 0 ? void 0 : (_knownTypes$typesBund17 = _knownTypes$typesBund16.spec) === null || _knownTypes$typesBund17 === void 0 ? void 0 : (_knownTypes$typesBund18 = _knownTypes$typesBund17[_specName]) === null || _knownTypes$typesBund18 === void 0 ? void 0 : _knownTypes$typesBund18.hasher) || null;
  }
  /**
   * @description Based on the chain and runtimeVersion, get the applicable rpc definitions (ready for registration)
   */

  function getSpecRpc({
    knownTypes
  }, chainName, specName) {
    var _knownTypes$typesBund19, _knownTypes$typesBund20, _knownTypes$typesBund21, _knownTypes$typesBund22, _knownTypes$typesBund23, _knownTypes$typesBund24;

    const _chainName = chainName.toString();

    const _specName = specName.toString();

    return _objectSpread$o(_objectSpread$o({}, ((_knownTypes$typesBund19 = knownTypes.typesBundle) === null || _knownTypes$typesBund19 === void 0 ? void 0 : (_knownTypes$typesBund20 = _knownTypes$typesBund19.spec) === null || _knownTypes$typesBund20 === void 0 ? void 0 : (_knownTypes$typesBund21 = _knownTypes$typesBund20[_specName]) === null || _knownTypes$typesBund21 === void 0 ? void 0 : _knownTypes$typesBund21.rpc) || {}), ((_knownTypes$typesBund22 = knownTypes.typesBundle) === null || _knownTypes$typesBund22 === void 0 ? void 0 : (_knownTypes$typesBund23 = _knownTypes$typesBund22.chain) === null || _knownTypes$typesBund23 === void 0 ? void 0 : (_knownTypes$typesBund24 = _knownTypes$typesBund23[_chainName]) === null || _knownTypes$typesBund24 === void 0 ? void 0 : _knownTypes$typesBund24.rpc) || {});
  }
  /**
   * @description Based on the chain and runtimeVersion, get the applicable alias definitions (ready for registration)
   */

  function getSpecAlias({
    knownTypes
  }, chainName, specName) {
    var _knownTypes$typesBund25, _knownTypes$typesBund26, _knownTypes$typesBund27, _knownTypes$typesBund28, _knownTypes$typesBund29, _knownTypes$typesBund30;

    const _chainName = chainName.toString();

    const _specName = specName.toString(); // as per versions, first spec, then chain then finally non-versioned


    return _objectSpread$o(_objectSpread$o(_objectSpread$o({}, ((_knownTypes$typesBund25 = knownTypes.typesBundle) === null || _knownTypes$typesBund25 === void 0 ? void 0 : (_knownTypes$typesBund26 = _knownTypes$typesBund25.spec) === null || _knownTypes$typesBund26 === void 0 ? void 0 : (_knownTypes$typesBund27 = _knownTypes$typesBund26[_specName]) === null || _knownTypes$typesBund27 === void 0 ? void 0 : _knownTypes$typesBund27.alias) || {}), ((_knownTypes$typesBund28 = knownTypes.typesBundle) === null || _knownTypes$typesBund28 === void 0 ? void 0 : (_knownTypes$typesBund29 = _knownTypes$typesBund28.chain) === null || _knownTypes$typesBund29 === void 0 ? void 0 : (_knownTypes$typesBund30 = _knownTypes$typesBund29[_chainName]) === null || _knownTypes$typesBund30 === void 0 ? void 0 : _knownTypes$typesBund30.alias) || {}), knownTypes.typesAlias || {});
  }
  /**
   * @description Returns a version record for known chains where upgrades are being tracked
   */

  function getUpgradeVersion(genesisHash, blockNumber) {
    const known = upgrades$1.find(u => genesisHash.eq(u.genesisHash));
    return known ? [known.versions.reduce((last, version) => {
      return blockNumber.gt(version.blockNumber) ? version : last;
    }, undefined), known.versions.find(version => blockNumber.lte(version.blockNumber))] : [undefined, undefined];
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const NumberMap = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

  function mapCapabilities({
    accountIdLength,
    refcount1Length,
    refcount2Length,
    refcount3Length
  }, [leasePeriodsPerSlot, slotRangeCount], [stakingVersion], [keys, accountInfo]) {
    const types = {}; // AccountInfo

    if (accountInfo) {
      const length = accountInfo.length;

      if (length === refcount1Length) {
        types.AccountInfo = 'AccountInfoWithRefCount';
      } else if (length === refcount2Length) {
        types.AccountInfo = 'AccountInfoWithDualRefCount';
      } else if (length === refcount3Length) {
        types.AccountInfo = 'AccountInfoWithTripleRefCount';
      }
    } // ValidatorPrefs


    if (stakingVersion) {
      if (stakingVersion.index >= 4) {
        // v1 = index 0, V5 = index 4
        types.ValidatorPrefs = 'ValidatorPrefsWithBlocked';
      } else {
        types.ValidatorPrefs = 'ValidatorPrefsWithCommission';
      }
    } // Keys


    if (keys) {
      try {
        const [offset, numItems] = util.compactFromU8a(keys);
        const tupleLength = (keys.length - offset) / numItems.toNumber();
        const numIds = tupleLength / accountIdLength;
        const numIdsRound = Math.floor(numIds);
        util.assert(numIds >= 2 && numIds <= 11, () => `Detected ${numIds} in Keys, should be >= 2 and <= 11`);

        if (numIdsRound !== numIds) {
          // Beefy?
          if ((numIdsRound - 1) * accountIdLength + 33 === tupleLength) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            types.Keys = `SessionKeys${numIdsRound - 1}B`;
          } else {
            util.assert(false, () => `Expected integer number of keys, found ${numIds.toFixed(2)}`);
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          types.Keys = `SessionKeys${numIds - 1}`;
        }
      } catch {// ignore
      }
    } // auctions


    if (leasePeriodsPerSlot && slotRangeCount) {
      const _enum = [];

      for (let i = 0; leasePeriodsPerSlot.gtn(i); i++) {
        for (let j = i; leasePeriodsPerSlot.gtn(j); j++) {
          _enum.push(`${NumberMap[i]}${NumberMap[j]}`);
        }
      }

      types.SlotRange = {
        _enum
      };
      types.WinningData = `[WinningDataEntry; ${slotRangeCount.toNumber()}]`;
    }

    return types;
  }

  function filterEntries(original) {
    const included = original.map(c => !!c);
    return {
      filtered: original.filter((_, index) => included[index]),
      included,
      original
    };
  }

  function extractResults(results, map) {
    let offset = -1;
    return map.included.map(isIncluded => isIncluded ? results[++offset] : null);
  }
  /**
   * @description Query the chain for the specific capabilities
   */


  function detectedCapabilities(api, blockHash) {
    var _api$consts$auctions, _api$consts$auctions2, _api$query$staking, _api$query$session, _api$query$system, _api$query$system$acc;

    const emptyAccountId = api.registry.createType('AccountId');
    const consts = filterEntries([(_api$consts$auctions = api.consts.auctions) === null || _api$consts$auctions === void 0 ? void 0 : _api$consts$auctions.leasePeriodsPerSlot, (_api$consts$auctions2 = api.consts.auctions) === null || _api$consts$auctions2 === void 0 ? void 0 : _api$consts$auctions2.slotRangeCount]);
    const queries = filterEntries([(_api$query$staking = api.query.staking) === null || _api$query$staking === void 0 ? void 0 : _api$query$staking.storageVersion]);
    const raws = filterEntries([(_api$query$session = api.query.session) === null || _api$query$session === void 0 ? void 0 : _api$query$session.queuedKeys.key(), (_api$query$system = api.query.system) === null || _api$query$system === void 0 ? void 0 : (_api$query$system$acc = _api$query$system.account) === null || _api$query$system$acc === void 0 ? void 0 : _api$query$system$acc.key(emptyAccountId)]);
    return combineLatest([consts.filtered.length ? blockHash // FIXME consts don't have .at as of yet...
    ? of([]) : of(consts.filtered) : of([]), queries.filtered.length ? blockHash ? combineLatest(queries.filtered.map(c => c.at(blockHash))) : api.queryMulti(queries.filtered) : of([]), raws.filtered.length ? blockHash ? combineLatest(raws.filtered.map(k => api.rpc.state.getStorage.raw(k, blockHash))) : combineLatest(raws.filtered.map(k => api.rpc.state.getStorage.raw(k))) : of([])]).pipe(map(([cResults, qResults, rResults]) => mapCapabilities({
      accountIdLength: emptyAccountId.encodedLength,
      refcount1Length: api.registry.createType('AccountInfoWithRefCount').encodedLength,
      refcount2Length: api.registry.createType('AccountInfoWithDualRefCount').encodedLength,
      refcount3Length: api.registry.createType('AccountInfoWithTripleRefCount').encodedLength
    }, extractResults(cResults, consts), extractResults(qResults, queries), extractResults(rResults, raws))), take(1), catchError(() => of({})));
  }

  // Copyright 2017-2021 @axia-js/rpc-core authors & contributors
  /** @internal */

  function refCountDelay(delay = 1750) {
    return source => {
      // state: 0 = disconnected, 1 = disconnecting, 2 = connecting, 3 = connected
      let [state, refCount, connection, scheduler] = [0, 0, Subscription.EMPTY, Subscription.EMPTY];
      return new Observable(ob => {
        source.subscribe(ob);

        if (refCount++ === 0) {
          if (state === 1) {
            scheduler.unsubscribe();
          } else {
            connection = source.connect();
          }

          state = 3;
        }

        return () => {
          if (--refCount === 0) {
            if (state === 2) {
              state = 0;
              scheduler.unsubscribe();
            } else {
              // state === 3
              state = 1;
              scheduler = asapScheduler.schedule(() => {
                state = 0;
                connection.unsubscribe();
              }, delay);
            }
          }
        };
      });
    };
  }

  // Copyright 2017-2021 @axia-js/rpc-core authors & contributors
  const l$5 = util.logger('drr');

  const CMP = (a, b) => util.stringify({
    t: a
  }) === util.stringify({
    t: b
  });

  const ERR = error => {
    l$5.error(error.message);
    throw error;
  };

  const NOOP = () => undefined;
  /**
   * Shorthand for distinctUntilChanged(), publishReplay(1) and refCount().
   *
   * @ignore
   * @internal
   */


  const drr = ({
    delay,
    skipChange = false,
    skipTimeout = false
  } = {}) => source$ => source$.pipe(catchError(ERR), skipChange ? tap(NOOP) : distinctUntilChanged(CMP), publishReplay(1), skipTimeout ? refCount() : refCountDelay(delay));

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  // Wraps a derive, doing 2 things to optimize calls -
  //   1. creates a memo of the inner fn -> Observable, removing when unsubscribed
  //   2. wraps the observable in a drr() (which includes an unsub delay)

  /** @internal */
  function memo(instanceId, inner) {
    const options = {
      getInstanceId: () => instanceId
    };
    const cached = util.memoize((...params) => new Observable(observer => {
      const subscription = inner(...params).subscribe(observer);
      return () => {
        cached.unmemoize(...params);
        subscription.unsubscribe();
      };
    }).pipe(drr()), options);
    return cached;
  }

  function ownKeys$n(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$n(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$n(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$n(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  const l$4 = util.logger('rpc-core');
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

  function logErrorMessage(method, {
    params,
    type
  }, error) {
    const inputs = params.map(({
      isOptional,
      name,
      type
    }) => `${name}${isOptional ? '?' : ''}: ${type}`).join(', ');
    l$4.error(`${method}(${inputs}): ${type}:: ${error.message}`);
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


  var _instanceId$1 = /*#__PURE__*/_classPrivateFieldKey("instanceId");

  var _registryDefault = /*#__PURE__*/_classPrivateFieldKey("registryDefault");

  var _getBlockRegistry = /*#__PURE__*/_classPrivateFieldKey("getBlockRegistry");

  var _storageCache = /*#__PURE__*/_classPrivateFieldKey("storageCache");

  class RpcCore {
    /**
     * @constructor
     * Default constructor for the Api Object
     * @param  {ProviderInterface} provider An API provider using HTTP or WebSocket
     */
    constructor(instanceId, registry, provider, userRpc = {}) {
      Object.defineProperty(this, _instanceId$1, {
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
      util.assert(provider && util.isFunction(provider.send), 'Expected Provider to API create');
      _classPrivateFieldBase(this, _instanceId$1)[_instanceId$1] = instanceId;
      _classPrivateFieldBase(this, _registryDefault)[_registryDefault] = registry;
      this.provider = provider;
      const sectionNames = Object.keys(types.rpcDefinitions); // these are the base keys (i.e. part of jsonrpc)

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
      _classPrivateFieldBase(this, _getBlockRegistry)[_getBlockRegistry] = util.memoize(registrySwap, {
        getInstanceId: () => _classPrivateFieldBase(this, _instanceId$1)[_instanceId$1]
      });
    }

    addUserInterfaces(userRpc) {
      // add any extra user-defined sections
      this.sections.push(...Object.keys(userRpc).filter(key => !this.sections.includes(key))); // decorate the sections with base and user methods

      this.sections.forEach(sectionName => {
        var _ref, _ref2;

        (_ref = this)[_ref2 = sectionName] || (_ref[_ref2] = {});
        const section = this[sectionName];
        Object.entries(_objectSpread$n(_objectSpread$n({}, this._createInterface(sectionName, types.rpcDefinitions[sectionName] || {})), this._createInterface(sectionName, userRpc[sectionName] || {}))).forEach(([key, value]) => {
          section[key] || (section[key] = value);
        });
      });
    }

    _createInterface(section, methods) {
      return Object.entries(methods).filter(([method, {
        endpoint
      }]) => !this.mapping.has(endpoint || `${section}_${method}`)).reduce((exposed, [method, {
        endpoint
      }]) => {
        const def = methods[method];
        const isSubscription = !!def.pubsub;
        const jsonrpc = endpoint || `${section}_${method}`;
        this.mapping.set(jsonrpc, _objectSpread$n(_objectSpread$n({}, def), {}, {
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
      const memoized = util.memoize(creator('scale'), {
        getInstanceId: () => _classPrivateFieldBase(this, _instanceId$1)[_instanceId$1]
      });
      memoized.json = creator('json');
      memoized.raw = creator('raw');
      memoized.meta = def;
      return memoized;
    }

    _createMethodSend(section, method, def) {
      const rpcName = def.endpoint || `${section}_${method}`;
      const hashIndex = def.params.findIndex(({
        isHistoric
      }) => isHistoric);
      let memoized = null; // execute the RPC call, doing a registry swap for historic as applicable

      const callWithRegistry = async (outputAs, values) => {
        const blockHash = hashIndex === -1 ? null : values[hashIndex];
        const {
          registry
        } = outputAs === 'scale' && blockHash && _classPrivateFieldBase(this, _getBlockRegistry)[_getBlockRegistry] ? await _classPrivateFieldBase(this, _getBlockRegistry)[_getBlockRegistry](util.u8aToU8a(blockHash)) : {
          registry: _classPrivateFieldBase(this, _registryDefault)[_registryDefault]
        };

        const params = this._formatInputs(registry, null, def, values);

        const data = await this.provider.send(rpcName, params.map(param => param.toJSON()));
        return outputAs === 'scale' ? this._formatOutput(registry, blockHash, method, def, params, data) : registry.createType(outputAs === 'raw' ? 'Raw' : 'Json', data);
      };

      const creator = outputAs => (...values) => {
        const isDelayed = outputAs === 'scale' && hashIndex !== -1 && !!values[hashIndex];
        return new Observable(observer => {
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
        }).pipe(publishReplay(1), // create a Replay(1)
        isDelayed ? refCountDelay() // Unsubscribe after delay
        : refCount());
      };

      memoized = this._memomize(creator, def);
      return memoized;
    } // create a subscriptor, it subscribes once and resolves with the id as subscribe


    _createSubscriber({
      paramsJson,
      subName,
      subType,
      update
    }, errorHandler) {
      return new Promise((resolve, reject) => {
        this.provider.subscribe(subType, subName, paramsJson, update).then(resolve).catch(error => {
          errorHandler(error);
          reject(error);
        });
      });
    }

    _createMethodSubscribe(section, method, def) {
      const [updateType, subMethod, unsubMethod] = def.pubsub;
      const subName = `${section}_${subMethod}`;
      const unsubName = `${section}_${unsubMethod}`;
      const subType = `${section}_${updateType}`;
      let memoized = null;

      const creator = outputAs => (...values) => {
        return new Observable(observer => {
          // Have at least an empty promise, as used in the unsubscribe
          let subscriptionPromise = Promise.resolve(null);

          const registry = _classPrivateFieldBase(this, _registryDefault)[_registryDefault];

          const errorHandler = error => {
            logErrorMessage(method, def, error);
            observer.error(error);
          };

          try {
            const params = this._formatInputs(registry, null, def, values);

            const paramsJson = params.map(param => param.toJSON());

            const update = (error, result) => {
              if (error) {
                logErrorMessage(method, def, error);
                return;
              }

              try {
                observer.next(outputAs === 'scale' ? this._formatOutput(registry, null, method, def, params, result) : registry.createType(outputAs === 'raw' ? 'Raw' : 'Json', result));
              } catch (error) {
                observer.error(error);
              }
            };

            subscriptionPromise = this._createSubscriber({
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

            subscriptionPromise.then(subscriptionId => util.isNull(subscriptionId) ? Promise.resolve(false) : this.provider.unsubscribe(subType, unsubName, subscriptionId)).catch(error => logErrorMessage(method, def, error));
          };
        }).pipe(drr());
      };

      memoized = this._memomize(creator, def);
      return memoized;
    }

    _formatInputs(registry, blockHash, def, inputs) {
      const reqArgCount = def.params.filter(({
        isOptional
      }) => !isOptional).length;
      const optText = reqArgCount === def.params.length ? '' : ` (${def.params.length - reqArgCount} optional)`;
      util.assert(inputs.length >= reqArgCount && inputs.length <= def.params.length, () => `Expected ${def.params.length} parameters${optText}, ${inputs.length} found instead`);
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
        const mapped = result.map(({
          block,
          changes
        }) => [registry.createType('Hash', block), this._formatStorageSet(registry, block, params[0], changes)]); // we only query at a specific block, not a range - flatten

        return method === 'queryStorageAt' ? mapped[0][1] : mapped;
      }

      return registry.createTypeUnsafe(rpc.type, [result], {
        blockHash
      });
    }

    _formatStorageData(registry, blockHash, key, value) {
      const isEmpty = util.isNull(value); // we convert to Uint8Array since it maps to the raw encoding, all
      // data will be correctly encoded (incl. numbers, excl. :code)

      const input = isEmpty ? null : isTreatAsHex(key) ? value : util.u8aToU8a(value);
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
      const found = changes.find(([key]) => key === hexKey); // if we don't find the value, this is our fallback
      //   - in the case of an array of values, fill the hole from the cache
      //   - if a single result value, don't fill - it is not an update hole
      //   - fallback to an empty option in all cases

      const value = util.isUndefined(found) ? witCache && _classPrivateFieldBase(this, _storageCache)[_storageCache].get(hexKey) || null : found[1];
      const isEmpty = util.isNull(value);
      const input = isEmpty || isTreatAsHex(key) ? value : util.u8aToU8a(value); // store the retrieved result - the only issue with this cache is that there is no
      // clearing of it, so very long running processes (not just a couple of hours, longer)
      // will increase memory beyond what is allowed.

      _classPrivateFieldBase(this, _storageCache)[_storageCache].set(hexKey, value);

      return this._newType(registry, blockHash, key, input, isEmpty, entryIndex);
    }

    _newType(registry, blockHash, key, input, isEmpty, entryIndex = -1) {
      // single return value (via state.getStorage), decode the value based on the
      // outputType that we have specified. Fallback to Raw on nothing
      const type = key.outputType || 'Raw';
      const meta = key.meta || EMPTY_META;
      const entryNum = entryIndex === -1 ? '' : ` entry ${entryIndex}:`;

      try {
        return registry.createTypeUnsafe(type, [isEmpty ? meta.fallback ? util.hexToU8a(meta.fallback.toHex()) : undefined : meta.modifier.isOptional ? registry.createTypeUnsafe(type, [input], {
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

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const deriveNoopCache = {
    del: () => undefined,
    forEach: () => undefined,
    get: () => undefined,
    set: (_, value) => value
  };

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const CHACHE_EXPIRY = 7 * (24 * 60) * (60 * 1000);
  let deriveCache;

  function wrapCache(keyStart, cache) {
    return {
      del: partial => cache.del(`${keyStart}${partial}`),
      forEach: cache.forEach,
      get: partial => {
        const key = `${keyStart}${partial}`;
        const cached = cache.get(key);

        if (cached) {
          cached.x = Date.now();
          cache.set(key, cached);
          return cached.v;
        }

        return undefined;
      },
      set: (partial, v) => {
        cache.set(`${keyStart}${partial}`, {
          v,
          x: Date.now()
        });
      }
    };
  }

  function clearCache(cache) {
    // clear all expired values
    const now = Date.now();
    const all = [];
    cache.forEach((key, {
      x
    }) => {
      now - x > CHACHE_EXPIRY && all.push(key);
    }); // don't do delete inside loop, just in-case

    all.forEach(key => cache.del(key));
  }

  function setDeriveCache(prefix = '', cache) {
    deriveCache = cache ? wrapCache(`derive:${prefix}:`, cache) : deriveNoopCache;

    if (cache) {
      clearCache(cache);
    }
  }
  setDeriveCache();

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function retrieve$1(api, address) {
    const decoded = util.isU8a(address) ? address : utilCrypto.decodeAddress((address || '').toString());

    if (decoded.length > 8) {
      return of(api.registry.createType('AccountId', decoded));
    }

    const accountIndex = api.registry.createType('AccountIndex', decoded);
    return api.derive.accounts.indexToId(accountIndex.toString()).pipe(map(accountId => util.assertReturn(accountId, 'Unable to retrieve accountId')));
  }
  /**
   * @name accountId
   * @param {(Address | AccountId | AccountIndex | string | null)} address - An accounts address in various formats.
   * @description  An [[AccountId]]
   */


  function accountId(instanceId, api) {
    return memo(instanceId, address => retrieve$1(api, address));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function parseFlags(address, [electionsMembers, councilMembers, technicalCommitteeMembers, societyMembers, sudoKey]) {
    const isIncluded = id => address ? id.toString() === address.toString() : false;

    return {
      isCouncil: ((electionsMembers === null || electionsMembers === void 0 ? void 0 : electionsMembers.map(([id]) => id)) || councilMembers || []).some(isIncluded),
      isSociety: (societyMembers || []).some(isIncluded),
      isSudo: (sudoKey === null || sudoKey === void 0 ? void 0 : sudoKey.toString()) === (address === null || address === void 0 ? void 0 : address.toString()),
      isTechCommittee: (technicalCommitteeMembers || []).some(isIncluded)
    };
  }
  /**
   * @name info
   * @description Returns account membership flags
   */


  function flags(instanceId, api) {
    return memo(instanceId, address => {
      var _api$query$councilSec, _api$query$council, _api$query$technicalC, _api$query$society, _api$query$sudo;

      const councilSection = api.query.phragmenElection ? 'phragmenElection' : api.query.electionsPhragmen ? 'electionsPhragmen' : 'elections';
      return combineLatest([address && (_api$query$councilSec = api.query[councilSection]) !== null && _api$query$councilSec !== void 0 && _api$query$councilSec.members ? api.query[councilSection].members() : of(undefined), address && (_api$query$council = api.query.council) !== null && _api$query$council !== void 0 && _api$query$council.members ? api.query.council.members() : of([]), address && (_api$query$technicalC = api.query.technicalCommittee) !== null && _api$query$technicalC !== void 0 && _api$query$technicalC.members ? api.query.technicalCommittee.members() : of([]), address && (_api$query$society = api.query.society) !== null && _api$query$society !== void 0 && _api$query$society.members ? api.query.society.members() : of([]), address && (_api$query$sudo = api.query.sudo) !== null && _api$query$sudo !== void 0 && _api$query$sudo.key ? api.query.sudo.key() : of(undefined)]).pipe(map(result => parseFlags(address, result)));
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function retrieve(api, address) {
    try {
      // yes, this can fail, don't care too much, catch will catch it
      const decoded = util.isU8a(address) ? address : utilCrypto.decodeAddress((address || '').toString());

      if (decoded.length > 8) {
        const accountId = api.registry.createType('AccountId', decoded);
        return api.derive.accounts.idToIndex(accountId).pipe(map(accountIndex => [accountId, accountIndex]));
      }

      const accountIndex = api.registry.createType('AccountIndex', decoded);
      return api.derive.accounts.indexToId(accountIndex.toString()).pipe(map(accountId => [accountId, accountIndex]));
    } catch (error) {
      return of([undefined, undefined]);
    }
  }
  /**
   * @name idAndIndex
   * @param {(Address | AccountId | AccountIndex | Uint8Array | string | null)} address - An accounts address in various formats.
   * @description  An array containing the [[AccountId]] and [[AccountIndex]] as optional values.
   * @example
   * <BR>
   *
   * ```javascript
   * api.derive.accounts.idAndIndex('F7Hs', ([id, ix]) => {
   *   console.log(`AccountId #${id} with corresponding AccountIndex ${ix}`);
   * });
   * ```
   */


  function idAndIndex(instanceId, api) {
    return memo(instanceId, address => retrieve(api, address));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  /**
   * @name idToIndex
   * @param {( AccountId | string )} accountId - An accounts Id in different formats.
   * @returns Returns the corresponding AccountIndex.
   * @example
   * <BR>
   *
   * ```javascript
   * const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
   * api.derive.accounts.idToIndex(ALICE, (accountIndex) => {
   *   console.log(`The AccountIndex of ${ALICE} is ${accountIndex}`);
   * });
   * ```
   */

  function idToIndex(instanceId, api) {
    return memo(instanceId, accountId => api.derive.accounts.indexes().pipe(map(indexes => (indexes || {})[accountId.toString()])));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const UNDEF_HEX = {
    toHex: () => undefined
  };

  function dataAsString(data) {
    return data.isRaw ? util.u8aToString(data.asRaw.toU8a(true)) : data.isNone ? undefined : data.toHex();
  }

  function extractOther(additional) {
    return additional.reduce((other, [_key, _value]) => {
      const key = dataAsString(_key);
      const value = dataAsString(_value);

      if (key && value) {
        other[key] = value;
      }

      return other;
    }, {});
  }

  function extractIdentity(identityOfOpt, superOf) {
    if (!(identityOfOpt !== null && identityOfOpt !== void 0 && identityOfOpt.isSome)) {
      return {
        judgements: []
      };
    }

    const {
      info,
      judgements
    } = identityOfOpt.unwrap();
    const topDisplay = dataAsString(info.display);
    return {
      display: superOf && dataAsString(superOf[1]) || topDisplay,
      displayParent: superOf && topDisplay,
      email: dataAsString(info.email),
      image: dataAsString(info.image),
      judgements,
      legal: dataAsString(info.legal),
      other: extractOther(info.additional),
      parent: superOf && superOf[0],
      pgp: info.pgpFingerprint.unwrapOr(UNDEF_HEX).toHex(),
      riot: dataAsString(info.riot),
      twitter: dataAsString(info.twitter),
      web: dataAsString(info.web)
    };
  }

  function getParent(api, identityOfOpt, superOfOpt) {
    if (identityOfOpt !== null && identityOfOpt !== void 0 && identityOfOpt.isSome) {
      // this identity has something set
      return of([identityOfOpt, undefined]);
    } else if (superOfOpt !== null && superOfOpt !== void 0 && superOfOpt.isSome) {
      const superOf = superOfOpt.unwrap(); // we have a super

      return combineLatest([api.query.identity.identityOf(superOf[0]), of(superOf)]);
    } // nothing of value returned


    return of([undefined, undefined]);
  }

  function getBase(api, accountId) {
    var _api$query$identity;

    return accountId && (_api$query$identity = api.query.identity) !== null && _api$query$identity !== void 0 && _api$query$identity.identityOf ? api.queryMulti([[api.query.identity.identityOf, accountId], [api.query.identity.superOf, accountId]]) : of([undefined, undefined]);
  }
  /**
   * @name identity
   * @description Returns identity info for an account
   */


  function identity$1(instanceId, api) {
    return memo(instanceId, accountId => getBase(api, accountId).pipe(switchMap(([identityOfOpt, superOfOpt]) => getParent(api, identityOfOpt, superOfOpt)), map(([identityOfOpt, superOf]) => extractIdentity(identityOfOpt, superOf))));
  }
  function hasIdentity(instanceId, api) {
    return memo(instanceId, accountId => api.derive.accounts.hasIdentityMulti([accountId]).pipe(map(([first]) => first)));
  }
  function hasIdentityMulti(instanceId, api) {
    return memo(instanceId, accountIds => {
      var _api$query$identity2;

      return (_api$query$identity2 = api.query.identity) !== null && _api$query$identity2 !== void 0 && _api$query$identity2.identityOf ? combineLatest([api.query.identity.identityOf.multi(accountIds), api.query.identity.superOf.multi(accountIds)]).pipe(map(([identities, supers]) => identities.map((identityOfOpt, index) => {
        const superOfOpt = supers[index];
        const parentId = superOfOpt && superOfOpt.isSome ? superOfOpt.unwrap()[0].toString() : undefined;
        let display;

        if (identityOfOpt && identityOfOpt.isSome) {
          const value = dataAsString(identityOfOpt.unwrap().info.display);

          if (value && !util.isHex(value)) {
            display = value;
          }
        }

        return {
          display,
          hasIdentity: !!(display || parentId),
          parentId
        };
      }))) : of(accountIds.map(() => ({
        hasIdentity: false
      })));
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  /**
   * @name indexToId
   * @param {( AccountIndex | string )} accountIndex - An accounts index in different formats.
   * @returns Returns the corresponding AccountId.
   * @example
   * <BR>
   *
   * ```javascript
   * api.derive.accounts.indexToId('F7Hs', (accountId) => {
   *   console.log(`The AccountId of F7Hs is ${accountId}`);
   * });
   * ```
   */

  function indexToId(instanceId, api) {
    return memo(instanceId, accountIndex => api.query.indices ? api.query.indices.accounts(accountIndex).pipe(map(optResult => optResult.unwrapOr([])[0])) : of(undefined));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  let indicesCache = null;

  function queryAccounts(api) {
    return api.query.indices.accounts.entries().pipe(map(entries => entries.reduce((indexes, [key, idOpt]) => {
      if (idOpt.isSome) {
        indexes[idOpt.unwrap()[0].toString()] = key.args[0];
      }

      return indexes;
    }, {})));
  }
  /**
   * @name indexes
   * @returns Returns all the indexes on the system.
   * @description This is an unwieldly query since it loops through
   * all of the enumsets and returns all of the values found. This could be up to 32k depending
   * on the number of active accounts in the system
   * @example
   * <BR>
   *
   * ```javascript
   * api.derive.accounts.indexes((indexes) => {
   *   console.log('All existing AccountIndexes', indexes);
   * });
   * ```
   */


  function indexes$1(instanceId, api) {
    return memo(instanceId, () => indicesCache ? of(indicesCache) : (api.query.indices ? queryAccounts(api).pipe(startWith({})) : of({})).pipe(map(indices => {
      indicesCache = indices;
      return indices;
    })));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function retrieveNick(api, accountId) {
    var _api$query$nicks;

    return (accountId && (_api$query$nicks = api.query.nicks) !== null && _api$query$nicks !== void 0 && _api$query$nicks.nameOf ? api.query.nicks.nameOf(accountId) : of(undefined)).pipe(map(nameOf => nameOf !== null && nameOf !== void 0 && nameOf.isSome ? util.u8aToString(nameOf.unwrap()[0]).substr(0, api.consts.nicks.maxLength.toNumber()) : undefined));
  }
  /**
   * @name info
   * @description Returns aux. info with regards to an account, current that includes the accountId, accountIndex and nickname
   */


  function info$4(instanceId, api) {
    return memo(instanceId, address => api.derive.accounts.idAndIndex(address).pipe(switchMap(([accountId, accountIndex]) => combineLatest([of({
      accountId,
      accountIndex
    }), api.derive.accounts.identity(accountId), retrieveNick(api, accountId)])), map(([{
      accountId,
      accountIndex
    }, identity, nickname]) => ({
      accountId,
      accountIndex,
      identity,
      nickname
    }))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const accounts$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    accountId: accountId,
    flags: flags,
    idAndIndex: idAndIndex,
    idToIndex: idToIndex,
    identity: identity$1,
    hasIdentity: hasIdentity,
    hasIdentityMulti: hasIdentityMulti,
    indexToId: indexToId,
    indexes: indexes$1,
    info: info$4
  });

  function ownKeys$m(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$m(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$m(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$m(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  const VESTING_ID = '0x76657374696e6720';

  function calcLocked(api, bestNumber, locks) {
    let lockedBalance = api.registry.createType('Balance');
    let lockedBreakdown = [];
    let vestingLocked = api.registry.createType('Balance');
    let allLocked = false;

    if (Array.isArray(locks)) {
      // only get the locks that are valid until passed the current block
      lockedBreakdown = locks.filter(({
        until
      }) => !until || bestNumber && until.gt(bestNumber));
      allLocked = lockedBreakdown.some(({
        amount
      }) => amount && amount.isMax());
      vestingLocked = api.registry.createType('Balance', lockedBreakdown.filter(({
        id
      }) => id.eq(VESTING_ID)).reduce((result, {
        amount
      }) => result.iadd(amount), new util.BN(0))); // get the maximum of the locks according to https://github.com/axia-tech/axlib/blob/master/srml/balances/src/lib.rs#L699

      const notAll = lockedBreakdown.filter(({
        amount
      }) => amount && !amount.isMax());

      if (notAll.length) {
        lockedBalance = api.registry.createType('Balance', util.bnMax(...notAll.map(({
          amount
        }) => amount)));
      }
    }

    return {
      allLocked,
      lockedBalance,
      lockedBreakdown,
      vestingLocked
    };
  }

  function calcShared(api, bestNumber, data, locks) {
    const {
      allLocked,
      lockedBalance,
      lockedBreakdown,
      vestingLocked
    } = calcLocked(api, bestNumber, locks);
    return _objectSpread$m(_objectSpread$m({}, data), {}, {
      availableBalance: api.registry.createType('Balance', allLocked ? 0 : util.bnMax(new util.BN(0), data.freeBalance.sub(lockedBalance))),
      lockedBalance,
      lockedBreakdown,
      vestingLocked
    });
  }

  function calcBalances$1(api, [data, bestNumber, [vesting, allLocks]]) {
    const shared = calcShared(api, bestNumber, data, allLocks[0]); // Calculate the vesting balances,
    //  - offset = balance locked at startingBlock
    //  - perBlock is the unlock amount

    const emptyVest = api.registry.createType('VestingInfo');
    const {
      locked: vestingTotal,
      perBlock,
      startingBlock
    } = vesting || emptyVest;
    const isStarted = bestNumber.gt(startingBlock);
    const vestedNow = isStarted ? perBlock.mul(bestNumber.sub(startingBlock)) : new util.BN(0);
    const vestedBalance = vestedNow.gt(vestingTotal) ? vestingTotal : api.registry.createType('Balance', vestedNow);
    const isVesting = isStarted && !shared.vestingLocked.isZero();
    return _objectSpread$m(_objectSpread$m({}, shared), {}, {
      accountId: data.accountId,
      accountNonce: data.accountNonce,
      additional: allLocks.filter((_, index) => index !== 0).map((l, index) => calcShared(api, bestNumber, data.additional[index], l)),
      isVesting,
      vestedBalance,
      vestedClaimable: api.registry.createType('Balance', isVesting ? shared.vestingLocked.sub(vestingTotal.sub(vestedBalance)) : 0),
      vestingEndBlock: api.registry.createType('BlockNumber', isVesting ? vestingTotal.div(perBlock).add(startingBlock) : 0),
      vestingPerBlock: perBlock,
      vestingTotal
    });
  } // old


  function queryOld(api, accountId) {
    return api.queryMulti([[api.query.balances.locks, accountId], [api.query.balances.vesting, accountId]]).pipe(map(([locks, optVesting]) => {
      let vestingNew = null;

      if (optVesting.isSome) {
        const {
          offset: locked,
          perBlock,
          startingBlock
        } = optVesting.unwrap();
        vestingNew = api.registry.createType('VestingInfo', {
          locked,
          perBlock,
          startingBlock
        });
      }

      return [vestingNew, [locks]];
    }));
  }

  const isNonNullable = nullable => !!nullable; // current (balances, vesting)


  function queryCurrent(api, accountId, balanceInstances = ['balances']) {
    var _api$query$vesting;

    const calls = balanceInstances.map(m => {
      var _m, _api$query;

      return ((_m = api.derive[m]) === null || _m === void 0 ? void 0 : _m.customLocks) || ((_api$query = api.query[m]) === null || _api$query === void 0 ? void 0 : _api$query.locks);
    });
    const lockEmpty = calls.map(c => !c);
    const queries = calls.filter(isNonNullable).map(c => [c, accountId]);
    return ((_api$query$vesting = api.query.vesting) !== null && _api$query$vesting !== void 0 && _api$query$vesting.vesting ? api.queryMulti([[api.query.vesting.vesting, accountId], ...queries]) // TODO We need to check module instances here as well, not only the balances module
    : queries.length ? api.queryMulti(queries).pipe(map(r => [api.registry.createType('Option<VestingInfo>'), ...r])) : of([api.registry.createType('Option<VestingInfo>')])).pipe(map(([opt, ...locks]) => {
      let offset = -1;
      return [opt.unwrapOr(null), lockEmpty.map(e => e ? api.registry.createType('Vec<BalanceLock>') : locks[++offset])];
    }));
  }
  /**
   * @name all
   * @param {( AccountIndex | AccountId | Address | string )} address - An accounts Id in different formats.
   * @returns An object containing the results of various balance queries
   * @example
   * <BR>
   *
   * ```javascript
   * const ALICE = 'F7Hs';
   *
   * api.derive.balances.all(ALICE, ({ accountId, lockedBalance }) => {
   *   console.log(`The account ${accountId} has a locked balance ${lockedBalance} units.`);
   * });
   * ```
   */


  function all(instanceId, api) {
    const balanceInstances = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), 'balances');
    return memo(instanceId, address => api.derive.balances.account(address).pipe(switchMap(account => {
      var _api$query$system, _api$query$balances;

      return !account.accountId.isEmpty ? combineLatest([of(account), api.derive.chain.bestNumber(), util.isFunction((_api$query$system = api.query.system) === null || _api$query$system === void 0 ? void 0 : _api$query$system.account) || util.isFunction((_api$query$balances = api.query.balances) === null || _api$query$balances === void 0 ? void 0 : _api$query$balances.account) ? queryCurrent(api, account.accountId, balanceInstances) : queryOld(api, account.accountId)]) : of([account, api.registry.createType('BlockNumber'), [null, []]]);
    }), map(result => calcBalances$1(api, result))));
  }

  function ownKeys$l(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$l(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$l(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$l(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function zeroBalance(api) {
    return api.registry.createType('Balance');
  }

  function getBalance(api, [freeBalance, reservedBalance, frozenFee, frozenMisc]) {
    const votingBalance = api.registry.createType('Balance', freeBalance.toBn());
    return {
      freeBalance,
      frozenFee,
      frozenMisc,
      reservedBalance,
      votingBalance
    };
  }

  function calcBalances(api, [accountId, [accountNonce, [primary, ...additional]]]) {
    return _objectSpread$l({
      accountId,
      accountNonce,
      additional: additional.map(b => getBalance(api, b))
    }, getBalance(api, primary));
  } // old


  function queryBalancesFree(api, accountId) {
    return api.queryMulti([[api.query.balances.freeBalance, accountId], [api.query.balances.reservedBalance, accountId], [api.query.system.accountNonce, accountId]]).pipe(map(([freeBalance, reservedBalance, accountNonce]) => [accountNonce, [[freeBalance, reservedBalance, zeroBalance(api), zeroBalance(api)]]]));
  }

  function queryNonceOnly(api, accountId) {
    const fill = nonce => [nonce, [[zeroBalance(api), zeroBalance(api), zeroBalance(api), zeroBalance(api)]]];

    return util.isFunction(api.query.system.account) ? api.query.system.account(accountId).pipe(map(({
      nonce
    }) => fill(nonce))) : util.isFunction(api.query.system.accountNonce) ? api.query.system.accountNonce(accountId).pipe(map(nonce => fill(nonce))) : of(fill(api.registry.createType('Index')));
  }

  function queryBalancesAccount(api, accountId, modules = ['balances']) {
    const balances = modules.map(m => {
      var _m, _api$query$m;

      return ((_m = api.derive[m]) === null || _m === void 0 ? void 0 : _m.customAccount) || ((_api$query$m = api.query[m]) === null || _api$query$m === void 0 ? void 0 : _api$query$m.account);
    }).filter(q => util.isFunction(q)).map(q => [q, accountId]);

    const extract = (nonce, data) => [nonce, data.map(({
      feeFrozen,
      free,
      miscFrozen,
      reserved
    }) => [free, reserved, feeFrozen, miscFrozen])]; // NOTE this is for the first case where we do have instances specified


    return balances.length ? util.isFunction(api.query.system.account) ? api.queryMulti([[api.query.system.account, accountId], ...balances]).pipe(map(([{
      nonce
    }, ...balances]) => extract(nonce, balances))) : api.queryMulti([[api.query.system.accountNonce, accountId], ...balances]).pipe(map(([nonce, ...balances]) => extract(nonce, balances))) : queryNonceOnly(api, accountId);
  }

  function querySystemAccount(api, accountId) {
    // AccountInfo is current, support old, eg. Edgeware
    return api.query.system.account(accountId).pipe(map(infoOrTuple => {
      const data = infoOrTuple.nonce ? infoOrTuple.data : infoOrTuple[1];
      const nonce = infoOrTuple.nonce || infoOrTuple[0];

      if (!data || data.isEmpty) {
        return [nonce, [[zeroBalance(api), zeroBalance(api), zeroBalance(api), zeroBalance(api)]]];
      }

      const {
        feeFrozen,
        free,
        miscFrozen,
        reserved
      } = data;
      return [nonce, [[free, reserved, feeFrozen, miscFrozen]]];
    }));
  }
  /**
   * @name account
   * @param {( AccountIndex | AccountId | Address | string )} address - An accounts Id in different formats.
   * @returns An object containing the results of various balance queries
   * @example
   * <BR>
   *
   * ```javascript
   * const ALICE = 'F7Hs';
   *
   * api.derive.balances.all(ALICE, ({ accountId, lockedBalance }) => {
   *   console.log(`The account ${accountId} has a locked balance ${lockedBalance} units.`);
   * });
   * ```
   */


  function account$1(instanceId, api) {
    const balanceInstances = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), 'balances');
    return memo(instanceId, address => api.derive.accounts.accountId(address).pipe(switchMap(accountId => {
      var _api$query$system, _api$query$balances, _api$query$balances2;

      return accountId ? combineLatest([of(accountId), balanceInstances ? queryBalancesAccount(api, accountId, balanceInstances) : util.isFunction((_api$query$system = api.query.system) === null || _api$query$system === void 0 ? void 0 : _api$query$system.account) ? querySystemAccount(api, accountId) : util.isFunction((_api$query$balances = api.query.balances) === null || _api$query$balances === void 0 ? void 0 : _api$query$balances.account) ? queryBalancesAccount(api, accountId) : util.isFunction((_api$query$balances2 = api.query.balances) === null || _api$query$balances2 === void 0 ? void 0 : _api$query$balances2.freeBalance) ? queryBalancesFree(api, accountId) : queryNonceOnly(api, accountId)]) : of([api.registry.createType('AccountId'), [api.registry.createType('Index'), [[zeroBalance(api), zeroBalance(api), zeroBalance(api), zeroBalance(api)]]]]);
    }), map(result => calcBalances(api, result))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  /**
   * @name fees
   * @returns An object containing the combined results of the storage queries for
   * all relevant fees as declared in the axlib chain spec.
   * @example
   * <BR>
   *
   * ```javascript
   * api.derive.balances.fees(({ creationFee, transferFee }) => {
   *   console.log(`The fee for creating a new account on this chain is ${creationFee} units. The fee required for making a transfer is ${transferFee} units.`);
   * });
   * ```
   */

  function fees$1(instanceId, api) {
    return memo(instanceId, () => {
      var _api$consts$balances, _api$consts$balances2, _api$consts$balances3, _api$consts$transacti, _api$consts$transacti2;

      return of([// deprecated - remove
      ((_api$consts$balances = api.consts.balances) === null || _api$consts$balances === void 0 ? void 0 : _api$consts$balances.creationFee) || api.registry.createType('Balance'), ((_api$consts$balances2 = api.consts.balances) === null || _api$consts$balances2 === void 0 ? void 0 : _api$consts$balances2.transferFee) || api.registry.createType('Balance'), // current
      ((_api$consts$balances3 = api.consts.balances) === null || _api$consts$balances3 === void 0 ? void 0 : _api$consts$balances3.existentialDeposit) || api.registry.createType('Balance'), ((_api$consts$transacti = api.consts.transactionPayment) === null || _api$consts$transacti === void 0 ? void 0 : _api$consts$transacti.transactionBaseFee) || api.registry.createType('Balance'), ((_api$consts$transacti2 = api.consts.transactionPayment) === null || _api$consts$transacti2 === void 0 ? void 0 : _api$consts$transacti2.transactionByteFee) || api.registry.createType('Balance')]).pipe(map(([creationFee, transferFee, existentialDeposit, transactionBaseFee, transactionByteFee]) => ({
        creationFee,
        existentialDeposit,
        transactionBaseFee,
        transactionByteFee,
        transferFee
      })));
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function votingBalances(instanceId, api) {
    return memo(instanceId, addresses => !addresses || !addresses.length ? of([]) : combineLatest(addresses.map(accountId => api.derive.balances.account(accountId))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const votingBalance = all;

  const balances = /*#__PURE__*/Object.freeze({
    __proto__: null,
    all: all,
    votingBalance: votingBalance,
    account: account$1,
    fees: fees$1,
    votingBalances: votingBalances
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  function filterBountiesProposals(api, allProposals) {
    const bountyTxBase = api.tx.bounties ? api.tx.bounties : api.tx.treasury;
    const bountyProposalCalls = [bountyTxBase.approveBounty, bountyTxBase.closeBounty, bountyTxBase.proposeCurator, bountyTxBase.unassignCurator];
    return allProposals.filter(proposal => bountyProposalCalls.find(bountyCall => bountyCall.is(proposal.proposal)));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function parseResult$2([maybeBounties, maybeDescriptions, ids, bountyProposals]) {
    const bounties = [];
    maybeBounties.forEach((bounty, index) => {
      if (bounty.isSome) {
        bounties.push({
          bounty: bounty.unwrap(),
          description: maybeDescriptions[index].unwrapOrDefault().toUtf8(),
          index: ids[index],
          proposals: bountyProposals.filter(bountyProposal => ids[index].eq(bountyProposal.proposal.args[0]))
        });
      }
    });
    return bounties;
  }

  function bounties$1(instanceId, api) {
    const bountyBase = api.query.bounties || api.query.treasury;
    return memo(instanceId, () => combineLatest([bountyBase.bountyCount(), api.query.council ? api.query.council.proposalCount() : of(0)]).pipe(switchMap(() => combineLatest([bountyBase.bounties.keys(), api.derive.council ? api.derive.council.proposals() : of([])])), switchMap(([keys, proposals]) => {
      const ids = keys.map(({
        args: [id]
      }) => id);
      return combineLatest([bountyBase.bounties.multi(ids), bountyBase.bountyDescriptions.multi(ids), of(ids), of(filterBountiesProposals(api, proposals))]);
    }), map(parseResult$2)));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const bounties = /*#__PURE__*/Object.freeze({
    __proto__: null,
    bounties: bounties$1
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  /**
   * @name bestNumber
   * @returns The latest block number.
   * @example
   * <BR>
   *
   * ```javascript
   * api.derive.chain.bestNumber((blockNumber) => {
   *   console.log(`the current best block is #${blockNumber}`);
   * });
   * ```
   */

  function bestNumber(instanceId, api) {
    return memo(instanceId, () => api.derive.chain.subscribeNewHeads().pipe(map(header => header.number.unwrap())));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  /**
   * @name bestNumberFinalized
   * @returns A BlockNumber
   * @description Get the latest finalized block number.
   * @example
   * <BR>
   *
   * ```javascript
   * api.derive.chain.bestNumberFinalized((blockNumber) => {
   *   console.log(`the current finalized block is #${blockNumber}`);
   * });
   * ```
   */

  function bestNumberFinalized(instanceId, api) {
    return memo(instanceId, () => api.rpc.chain.subscribeFinalizedHeads().pipe(map(header => header.number.unwrap())));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  /**
   * @name bestNumberLag
   * @returns A number of blocks
   * @description Calculates the lag between finalized head and best head
   * @example
   * <BR>
   *
   * ```javascript
   * api.derive.chain.bestNumberLag((lag) => {
   *   console.log(`finalized is ${lag} blocks behind head`);
   * });
   * ```
   */

  function bestNumberLag(instanceId, api) {
    return memo(instanceId, () => combineLatest([api.derive.chain.bestNumber(), api.derive.chain.bestNumberFinalized()]).pipe(map(([bestNumber, bestNumberFinalized]) => api.registry.createType('BlockNumber', bestNumber.sub(bestNumberFinalized)))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  function extractAuthor(digest, sessionValidators = []) {
    const [citem] = digest.logs.filter(({
      type
    }) => type === 'Consensus');
    const [pitem] = digest.logs.filter(({
      type
    }) => type === 'PreRuntime');
    const [sitem] = digest.logs.filter(({
      type
    }) => type === 'Seal');
    let accountId; // This is critical to be first for BABE (before Consensus)
    // If not first, we end up dropping the author at session-end

    if (pitem) {
      try {
        const [engine, data] = pitem.asPreRuntime;
        accountId = engine.extractAuthor(data, sessionValidators);
      } catch {// ignore
      }
    }

    if (!accountId && citem) {
      try {
        const [engine, data] = citem.asConsensus;
        accountId = engine.extractAuthor(data, sessionValidators);
      } catch {// ignore
      }
    } // SEAL, still used in e.g. Kulupu for pow


    if (!accountId && sitem) {
      try {
        const [engine, data] = sitem.asSeal;
        accountId = engine.extractAuthor(data, sessionValidators);
      } catch {// ignore
      }
    }

    return accountId;
  }

  function createHeaderExtended(registry, header, validators) {
    // an instance of the base extrinsic for us to extend
    const HeaderBase = registry.createClass('Header');

    var _author = /*#__PURE__*/_classPrivateFieldKey("author");

    var _validators = /*#__PURE__*/_classPrivateFieldKey("validators");

    class Implementation extends HeaderBase {
      constructor(registry, header, validators) {
        super(registry, header);
        Object.defineProperty(this, _author, {
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, _validators, {
          writable: true,
          value: void 0
        });
        _classPrivateFieldBase(this, _author)[_author] = extractAuthor(this.digest, validators);
        _classPrivateFieldBase(this, _validators)[_validators] = validators;
        this.createdAtHash = header === null || header === void 0 ? void 0 : header.createdAtHash;
      }
      /**
       * @description Convenience method, returns the author for the block
       */


      get author() {
        return _classPrivateFieldBase(this, _author)[_author];
      }
      /**
       * @description Convenience method, returns the validators for the block
       */


      get validators() {
        return _classPrivateFieldBase(this, _validators)[_validators];
      }

    }

    return new Implementation(registry, header, validators);
  }

  function mapExtrinsics(extrinsics, records) {
    return extrinsics.map((extrinsic, index) => {
      let dispatchError;
      let dispatchInfo;
      const events = records.filter(({
        phase
      }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index)).map(({
        event
      }) => {
        if (event.section === 'system') {
          if (event.method === 'ExtrinsicSuccess') {
            dispatchInfo = event.data[0];
          } else if (event.method === 'ExtrinsicFailed') {
            dispatchError = event.data[0];
            dispatchInfo = event.data[1];
          }
        }

        return event;
      });
      return {
        dispatchError,
        dispatchInfo,
        events,
        extrinsic
      };
    });
  }

  function createSignedBlockExtended(registry, block, events, validators) {
    // an instance of the base extrinsic for us to extend
    const SignedBlockBase = registry.createClass('SignedBlock');

    var _author = /*#__PURE__*/_classPrivateFieldKey("author");

    var _events = /*#__PURE__*/_classPrivateFieldKey("events");

    var _extrinsics = /*#__PURE__*/_classPrivateFieldKey("extrinsics");

    class Implementation extends SignedBlockBase {
      constructor(registry, block, events, validators) {
        super(registry, block);
        Object.defineProperty(this, _author, {
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, _events, {
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, _extrinsics, {
          writable: true,
          value: void 0
        });
        _classPrivateFieldBase(this, _author)[_author] = extractAuthor(this.block.header.digest, validators);
        _classPrivateFieldBase(this, _events)[_events] = events || [];
        _classPrivateFieldBase(this, _extrinsics)[_extrinsics] = mapExtrinsics(this.block.extrinsics, _classPrivateFieldBase(this, _events)[_events]);
        this.createdAtHash = block === null || block === void 0 ? void 0 : block.createdAtHash;
      }
      /**
       * @description Convenience method, returns the author for the block
       */


      get author() {
        return _classPrivateFieldBase(this, _author)[_author];
      }
      /**
       * @description Convenience method, returns the events associated with the block
       */


      get events() {
        return _classPrivateFieldBase(this, _events)[_events];
      }
      /**
       * @description Returns the extrinsics and their events, mapped
       */


      get extrinsics() {
        return _classPrivateFieldBase(this, _extrinsics)[_extrinsics];
      }

    }

    return new Implementation(registry, block, events, validators);
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  /**
   * @name getHeader
   * @param {( Uint8Array | string )} hash - A block hash as U8 array or string.
   * @returns An array containing the block header and the block author
   * @description Get a specific block header and extend it with the author
   * @example
   * <BR>
   *
   * ```javascript
   * const { author, number } = await api.derive.chain.getHeader('0x123...456');
   *
   * console.log(`block #${number} was authored by ${author}`);
   * ```
   */

  function getHeader(instanceId, api) {
    return memo(instanceId, hash => combineLatest([api.rpc.chain.getHeader(hash), api.query.session ? api.query.session.validators.at(hash) : of([])]).pipe(map(([header, validators]) => createHeaderExtended(header.registry, header, validators)), catchError(() => // where rpc.chain.getHeader throws, we will land here - it can happen that
    // we supplied an invalid hash. (Due to defaults, storeage will have an
    // empty value, so only the RPC is affected). So return undefined
    of())));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  /**
   * @name getBlock
   * @param {( Uint8Array | string )} hash - A block hash as U8 array or string.
   * @description Get a specific block (e.g. rpc.chain.getBlock) and extend it with the author
   * @example
   * <BR>
   *
   * ```javascript
   * const { author, block } = await api.derive.chain.getBlock('0x123...456');
   *
   * console.log(`block #${block.header.number} was authored by ${author}`);
   * ```
   */

  function getBlock(instanceId, api) {
    return memo(instanceId, hash => combineLatest([api.rpc.chain.getBlock(hash), api.query.system.events.at(hash), api.query.session ? api.query.session.validators.at(hash) : of([])]).pipe(map(([signedBlock, events, validators]) => createSignedBlockExtended(api.registry, signedBlock, events, validators)), catchError(() => // where rpc.chain.getHeader throws, we will land here - it can happen that
    // we supplied an invalid hash. (Due to defaults, storage will have an
    // empty value, so only the RPC is affected). So return undefined
    of())));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  /**
   * @name subscribeNewBlocks
   * @returns The latest block & events for that block
   */

  function subscribeNewBlocks(instanceId, api) {
    return memo(instanceId, () => api.derive.chain.subscribeNewHeads().pipe(switchMap(header => {
      const blockHash = header.createdAtHash || header.hash;
      return combineLatest(api.rpc.chain.getBlock(blockHash), api.query.system.events.at(blockHash), of(header));
    }), map(([block, events, header]) => createSignedBlockExtended(block.registry, block, events, header.validators))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  /**
   * @name subscribeNewHeads
   * @returns A header with the current header (including extracted author)
   * @description An observable of the current block header and it's author
   * @example
   * <BR>
   *
   * ```javascript
   * api.derive.chain.subscribeNewHeads((header) => {
   *   console.log(`block #${header.number} was authored by ${header.author}`);
   * });
   * ```
   */

  function subscribeNewHeads(instanceId, api) {
    return memo(instanceId, () => combineLatest([api.rpc.chain.subscribeNewHeads(), api.query.session ? api.query.session.validators() : of(undefined)]).pipe(map(([header, validators]) => {
      header.createdAtHash = header.hash;
      return createHeaderExtended(header.registry, header, validators);
    })));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const chain = /*#__PURE__*/Object.freeze({
    __proto__: null,
    bestNumber: bestNumber,
    bestNumberFinalized: bestNumberFinalized,
    bestNumberLag: bestNumberLag,
    getHeader: getHeader,
    getBlock: getBlock,
    subscribeNewBlocks: subscribeNewBlocks,
    subscribeNewHeads: subscribeNewHeads
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  // query via constants (current applicable path)
  function queryConstants(api) {
    return of([// deprecated
    api.consts.contracts.callBaseFee || api.registry.createType('Balance'), api.consts.contracts.contractFee || api.registry.createType('Balance'), api.consts.contracts.creationFee || api.registry.createType('Balance'), api.consts.contracts.transactionBaseFee || api.registry.createType('Balance'), api.consts.contracts.transactionByteFee || api.registry.createType('Balance'), api.consts.contracts.transferFee || api.registry.createType('Balance'), // current
    api.consts.contracts.rentByteFee, api.consts.contracts.rentDepositOffset, api.consts.contracts.surchargeReward, api.consts.contracts.tombstoneDeposit]);
  }
  /**
   * @name fees
   * @returns An object containing the combined results of the queries for
   * all relevant contract fees as declared in the axlib chain spec.
   * @example
   * <BR>
   *
   * ```javascript
   * api.derive.contracts.fees(([creationFee, transferFee]) => {
   *   console.log(`The fee for creating a new contract on this chain is ${creationFee} units. The fee required to call this contract is ${transferFee} units.`);
   * });
   * ```
   */


  function fees(instanceId, api) {
    return memo(instanceId, () => {
      return queryConstants(api).pipe(map(([callBaseFee, contractFee, creationFee, transactionBaseFee, transactionByteFee, transferFee, rentByteFee, rentDepositOffset, surchargeReward, tombstoneDeposit]) => ({
        callBaseFee,
        contractFee,
        creationFee,
        rentByteFee,
        rentDepositOffset,
        surchargeReward,
        tombstoneDeposit,
        transactionBaseFee,
        transactionByteFee,
        transferFee
      })));
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const contracts = /*#__PURE__*/Object.freeze({
    __proto__: null,
    fees: fees
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  function getInstance(api, section) {
    const instances = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), section);
    return instances && instances.length ? instances[0] : section;
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function members$4(instanceId, api, _section) {
    const section = getInstance(api, _section);
    return memo(instanceId, () => {
      var _api$query$section;

      return util.isFunction((_api$query$section = api.query[section]) === null || _api$query$section === void 0 ? void 0 : _api$query$section.members) ? api.query[section].members() : of([]);
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function prime$3(instanceId, api, _section) {
    const section = getInstance(api, _section);
    return memo(instanceId, () => {
      var _api$query;

      return util.isFunction((_api$query = api.query[section]) === null || _api$query === void 0 ? void 0 : _api$query.prime) ? api.query[section].prime().pipe(map(optPrime => optPrime.unwrapOr(null))) : of(null);
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function parse$4(api, [hashes, proposals, votes]) {
    return proposals.map((proposalOpt, index) => proposalOpt && proposalOpt.isSome ? {
      hash: api.registry.createType('Hash', hashes[index]),
      proposal: proposalOpt.unwrap(),
      votes: votes[index].unwrapOr(null)
    } : null).filter(proposal => !!proposal);
  }

  function _proposalsFrom(instanceId, api, section) {
    return memo(instanceId, hashes => {
      var _api$query$section;

      return (util.isFunction((_api$query$section = api.query[section]) === null || _api$query$section === void 0 ? void 0 : _api$query$section.proposals) && hashes.length ? combineLatest([of(hashes), // this should simply be api.query[section].proposalOf.multi<Option<Proposal>>(hashes),
      // however we have had cases on Edgeware where the indices have moved around after an
      // upgrade, which results in invalid on-chain data
      combineLatest(hashes.map(hash => // this should simply be api.query[section].proposalOf.multi<Option<Proposal>>(hashes),
      // however we have had cases on Edgeware where the indices have moved around after an
      // upgrade, which results in invalid on-chain data
      api.query[section].proposalOf(hash).pipe(catchError(() => of(null))))), api.query[section].voting.multi(hashes)]) : of([[], [], []])).pipe(map(result => parse$4(api, result)));
    });
  }

  function hasProposals$3(instanceId, api, _section) {
    const section = getInstance(api, _section);
    return memo(instanceId, () => {
      var _api$query$section2;

      return of(util.isFunction((_api$query$section2 = api.query[section]) === null || _api$query$section2 === void 0 ? void 0 : _api$query$section2.proposals));
    });
  }
  function proposalCount$3(instanceId, api, _section) {
    const section = getInstance(api, _section);
    return memo(instanceId, () => util.isFunction(api.query[section].proposalCount) ? api.query[section].proposalCount() : of(null));
  }
  function proposalHashes$3(instanceId, api, _section) {
    const section = getInstance(api, _section);
    return memo(instanceId, () => {
      var _api$query$section3;

      return util.isFunction((_api$query$section3 = api.query[section]) === null || _api$query$section3 === void 0 ? void 0 : _api$query$section3.proposals) ? api.query[section].proposals() : of([]);
    });
  }
  function proposals$5(instanceId, api, _section) {
    const section = getInstance(api, _section);

    const proposalsFrom = _proposalsFrom(instanceId, api, section);

    const getHashes = proposalHashes$3(instanceId, api, _section);
    return memo(instanceId, () => getHashes().pipe(switchMap(proposalsFrom)));
  }
  function proposal$3(instanceId, api, _section) {
    const section = getInstance(api, _section);

    const proposalsFrom = _proposalsFrom(instanceId, api, section);

    return memo(instanceId, hash => {
      var _api$query$section4;

      return util.isFunction((_api$query$section4 = api.query[section]) === null || _api$query$section4 === void 0 ? void 0 : _api$query$section4.proposals) ? proposalsFrom([hash]).pipe(map(([proposal]) => proposal)) : of(null);
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function members$3(instanceId, api) {
    return memo(instanceId, members$4(instanceId, api, 'council'));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function prime$2(instanceId, api) {
    return memo(instanceId, prime$3(instanceId, api, 'council'));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function hasProposals$2(instanceId, api) {
    return memo(instanceId, hasProposals$3(instanceId, api, 'council'));
  }
  function proposal$2(instanceId, api) {
    return memo(instanceId, proposal$3(instanceId, api, 'council'));
  }
  function proposalCount$2(instanceId, api) {
    return memo(instanceId, proposalCount$3(instanceId, api, 'council'));
  }
  function proposalHashes$2(instanceId, api) {
    return memo(instanceId, proposalHashes$3(instanceId, api, 'council'));
  }
  function proposals$4(instanceId, api) {
    return memo(instanceId, proposals$5(instanceId, api, 'council'));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function isVoter(value) {
    return !Array.isArray(value);
  }

  function retrieveStakeOf(elections) {
    return elections.stakeOf.entries().pipe(map(entries => entries.map(([{
      args: [accountId]
    }, stake]) => [accountId, stake])));
  }

  function retrieveVoteOf(elections) {
    return elections.votesOf.entries().pipe(map(entries => entries.map(([{
      args: [accountId]
    }, votes]) => [accountId, votes])));
  }

  function retrievePrev(api, elections) {
    return combineLatest([retrieveStakeOf(elections), retrieveVoteOf(elections)]).pipe(map(([stakes, votes]) => {
      const result = [];
      votes.forEach(([voter, votes]) => {
        result.push([voter, {
          stake: api.registry.createType('Balance'),
          votes
        }]);
      });
      stakes.forEach(([staker, stake]) => {
        const entry = result.find(([voter]) => voter.eq(staker));

        if (entry) {
          entry[1].stake = stake;
        } else {
          result.push([staker, {
            stake,
            votes: []
          }]);
        }
      });
      return result;
    }));
  }

  function retrieveCurrent(elections) {
    return elections.voting.entries().pipe(map(entries => entries.map(([{
      args: [accountId]
    }, value]) => [accountId, isVoter(value) ? {
      stake: value.stake,
      votes: value.votes
    } : {
      stake: value[0],
      votes: value[1]
    }])));
  }

  function votes(instanceId, api) {
    const elections = api.query.phragmenElection || api.query.electionsPhragmen || api.query.elections;
    return memo(instanceId, () => elections ? elections.stakeOf ? retrievePrev(api, elections) : retrieveCurrent(elections) : of([]));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function votesOf(instanceId, api) {
    return memo(instanceId, accountId => api.derive.council.votes().pipe(map(votes => (votes.find(([from]) => from.eq(accountId)) || [null, {
      stake: api.registry.createType('Balance'),
      votes: []
    }])[1])));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const council = /*#__PURE__*/Object.freeze({
    __proto__: null,
    members: members$3,
    prime: prime$2,
    hasProposals: hasProposals$2,
    proposal: proposal$2,
    proposalCount: proposalCount$2,
    proposalHashes: proposalHashes$2,
    proposals: proposals$4,
    votes: votes,
    votesOf: votesOf
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function createChildKey({
    trieIndex
  }) {
    return util.u8aToHex(util.u8aConcat(':child_storage:default:', utilCrypto.blake2AsU8a(util.u8aConcat('crowdloan', trieIndex.toU8a()))));
  }

  function childKey(instanceId, api) {
    return memo(instanceId, paraId => api.query.crowdloan.funds(paraId).pipe(map(optInfo => optInfo.isSome ? createChildKey(optInfo.unwrap()) : null)));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  function extractContributed(paraId, events) {
    var _events$createdAtHash;

    const added = [];
    const removed = [];
    return events.filter(({
      event: {
        data: [, eventParaId],
        method,
        section
      }
    }) => section === 'crowdloan' && ['Contributed', 'Withdrew'].includes(method) && eventParaId.eq(paraId)).reduce((result, {
      event: {
        data: [accountId],
        method
      }
    }) => {
      if (method === 'Contributed') {
        result.added.push(accountId.toHex());
      } else {
        result.removed.push(accountId.toHex());
      }

      return result;
    }, {
      added,
      blockHash: ((_events$createdAtHash = events.createdAtHash) === null || _events$createdAtHash === void 0 ? void 0 : _events$createdAtHash.toHex()) || '-',
      removed
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const PAGE_SIZE_K$1 = 1000; // limit aligned with the 1k on the node (trie lookups are heavy)

  function _getUpdates(api, paraId) {
    let added = [];
    let removed = [];
    return api.query.system.events().pipe(switchMap(events => {
      const changes = extractContributed(paraId, events);

      if (changes.added.length || changes.removed.length) {
        var _events$createdAtHash;

        added = added.concat(...changes.added);
        removed = removed.concat(...changes.removed);
        return of({
          added,
          addedDelta: changes.added,
          blockHash: ((_events$createdAtHash = events.createdAtHash) === null || _events$createdAtHash === void 0 ? void 0 : _events$createdAtHash.toHex()) || '-',
          removed,
          removedDelta: changes.removed
        });
      }

      return EMPTY;
    }), startWith({
      added,
      addedDelta: [],
      blockHash: '-',
      removed,
      removedDelta: []
    }));
  }

  function _eventTriggerAll(api, paraId) {
    return api.query.system.events().pipe(switchMap(events => {
      var _events$createdAtHash2;

      const items = events.filter(({
        event: {
          data: [eventParaId],
          method,
          section
        }
      }) => section === 'crowdloan' && ['AllRefunded', 'Dissolved', 'PartiallyRefunded'].includes(method) && eventParaId.eq(paraId));
      return items.length ? of(((_events$createdAtHash2 = events.createdAtHash) === null || _events$createdAtHash2 === void 0 ? void 0 : _events$createdAtHash2.toHex()) || '-') : EMPTY;
    }), startWith('-'));
  }

  function _getKeysPaged(api, childKey) {
    const startSubject = new BehaviorSubject(undefined);
    return startSubject.pipe(switchMap(startKey => api.rpc.childstate.getKeysPaged(childKey, '0x', PAGE_SIZE_K$1, startKey)), tap(keys => {
      setTimeout(() => {
        keys.length === PAGE_SIZE_K$1 ? startSubject.next(keys[PAGE_SIZE_K$1 - 1].toHex()) : startSubject.complete();
      }, 0);
    }), toArray(), // toArray since we want to startSubject to be completed
    map(keyArr => util.arrayFlatten(keyArr)));
  }

  function _getAll(api, paraId, childKey) {
    return _eventTriggerAll(api, paraId).pipe(switchMap(() => // FIXME Needs testing and being enabled
    // eslint-disable-next-line no-constant-condition
    util.isFunction(api.rpc.childstate.getKeysPaged) && false ? _getKeysPaged(api, childKey) : api.rpc.childstate.getKeys(childKey, '0x')), map(keys => keys.map(k => k.toHex())));
  }

  function _contributions$1(api, paraId, childKey) {
    return combineLatest([_getAll(api, paraId, childKey), _getUpdates(api, paraId)]).pipe(map(([keys, {
      added,
      blockHash,
      removed
    }]) => {
      const contributorsMap = {};
      keys.forEach(k => {
        contributorsMap[k] = true;
      });
      added.forEach(k => {
        contributorsMap[k] = true;
      });
      removed.forEach(k => {
        delete contributorsMap[k];
      });
      return {
        blockHash,
        contributorsHex: Object.keys(contributorsMap)
      };
    }));
  }

  function contributions(instanceId, api) {
    return memo(instanceId, paraId => api.derive.crowdloan.childKey(paraId).pipe(switchMap(childKey => childKey ? _contributions$1(api, paraId, childKey) : of({
      blockHash: '-',
      contributorsHex: []
    }))));
  }

  function ownKeys$k(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$k(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$k(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$k(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function _getValues(api, childKey, keys) {
    // We actually would love to use multi-keys https://github.com/axia-tech/axlib/issues/9203
    return combineLatest(keys.map(k => api.rpc.childstate.getStorage(childKey, k))).pipe(map(values => values.map(v => api.registry.createType('Option<StorageData>', v)).map(o => o.isSome ? api.registry.createType('Balance', o.unwrap()) : api.registry.createType('Balance')).reduce((all, b, index) => _objectSpread$k(_objectSpread$k({}, all), {}, {
      [keys[index]]: b
    }), {})));
  }

  function _watchOwnChanges(api, paraId, childkey, keys) {
    return api.query.system.events().pipe(switchMap(events => {
      const changes = extractContributed(paraId, events);
      const filtered = keys.filter(k => changes.added.includes(k) || changes.removed.includes(k));
      return filtered.length ? _getValues(api, childkey, filtered) : EMPTY;
    }), startWith({}));
  }

  function _contributions(api, paraId, childKey, keys) {
    return combineLatest([_getValues(api, childKey, keys), _watchOwnChanges(api, paraId, childKey, keys)]).pipe(map(([all, latest]) => _objectSpread$k(_objectSpread$k({}, all), latest)));
  }

  function ownContributions(instanceId, api) {
    return memo(instanceId, (paraId, keys) => api.derive.crowdloan.childKey(paraId).pipe(switchMap(childKey => childKey && keys.length ? _contributions(api, paraId, childKey, keys) : of({}))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const crowdloan = /*#__PURE__*/Object.freeze({
    __proto__: null,
    childKey: childKey,
    contributions: contributions,
    ownContributions: ownContributions
  });

  function ownKeys$j(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$j(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$j(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$j(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  const DEMOCRACY_ID = util.stringToHex('democrac');

  function queryQueue(api) {
    return api.query.democracy.dispatchQueue().pipe(switchMap(dispatches => combineLatest([of(dispatches), api.derive.democracy.preimages(dispatches.map(([, hash]) => hash))])), map(([dispatches, images]) => dispatches.map(([at, imageHash, index], dispatchIndex) => ({
      at,
      image: images[dispatchIndex],
      imageHash,
      index
    }))));
  }

  function schedulerEntries(api) {
    // We don't get entries, but rather we get the keys (triggered via finished referendums) and
    // the subscribe to those keys - this means we pickup when the schedulers actually executes
    // at a block, the entry for that block will become empty
    return api.derive.democracy.referendumsFinished().pipe(switchMap(() => api.query.scheduler.agenda.keys()), switchMap(keys => {
      const blockNumbers = keys.map(({
        args: [blockNumber]
      }) => blockNumber);
      return blockNumbers.length ? combineLatest([of(blockNumbers), // this should simply be api.query.scheduler.agenda.multi<Vec<Option<Scheduled>>>,
      // however we have had cases on Darwinia where the indices have moved around after an
      // upgrade, which results in invalid on-chain data
      combineLatest(blockNumbers.map(blockNumber => api.query.scheduler.agenda(blockNumber).pipe( // this does create an issue since it discards all at that block
      catchError(() => of(null)))))]) : of([[], []]);
    }));
  }

  function queryScheduler(api) {
    return schedulerEntries(api).pipe(switchMap(([blockNumbers, agendas]) => {
      const result = [];
      blockNumbers.forEach((at, index) => {
        (agendas[index] || []).filter(opt => opt.isSome).forEach(optScheduled => {
          const scheduled = optScheduled.unwrap();

          if (scheduled.maybeId.isSome) {
            const id = scheduled.maybeId.unwrap().toHex();

            if (id.startsWith(DEMOCRACY_ID)) {
              const [, index] = api.registry.createType('(u64, ReferendumIndex)', id);
              const imageHash = scheduled.call.args[0];
              result.push({
                at,
                imageHash,
                index
              });
            }
          }
        });
      });
      return result.length ? combineLatest([of(result), api.derive.democracy.preimages(result.map(({
        imageHash
      }) => imageHash))]) : of([[], []]);
    }), map(([infos, images]) => infos.map((info, index) => _objectSpread$j(_objectSpread$j({}, info), {}, {
      image: images[index]
    }))));
  }

  function dispatchQueue(instanceId, api) {
    return memo(instanceId, () => {
      var _api$query$scheduler;

      return util.isFunction((_api$query$scheduler = api.query.scheduler) === null || _api$query$scheduler === void 0 ? void 0 : _api$query$scheduler.agenda) ? queryScheduler(api) : api.query.democracy.dispatchQueue ? queryQueue(api) : of([]);
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const LOCKUPS = [0, 1, 2, 4, 8, 16, 32];

  function parseEnd(api, vote, {
    approved,
    end
  }) {
    return [end, approved.isTrue && vote.isAye || approved.isFalse && vote.isNay ? end.add(api.consts.democracy.enactmentPeriod.muln(LOCKUPS[vote.conviction.index])) : util.BN_ZERO];
  }

  function parseLock(api, [referendumId, accountVote], referendum) {
    const {
      balance,
      vote
    } = accountVote.asStandard;
    const [referendumEnd, unlockAt] = referendum.isFinished ? parseEnd(api, vote, referendum.asFinished) : [util.BN_ZERO, util.BN_ZERO];
    return {
      balance,
      isDelegated: false,
      isFinished: referendum.isFinished,
      referendumEnd,
      referendumId,
      unlockAt,
      vote
    };
  }

  function delegateLocks(api, {
    balance,
    conviction,
    target
  }) {
    return api.derive.democracy.locks(target).pipe(map(available => available.map(({
      isFinished,
      referendumEnd,
      referendumId,
      unlockAt,
      vote
    }) => ({
      balance,
      isDelegated: true,
      isFinished,
      referendumEnd,
      referendumId,
      unlockAt: unlockAt.isZero() ? unlockAt : referendumEnd.add(api.consts.democracy.enactmentPeriod.muln(LOCKUPS[conviction.index])),
      vote: api.registry.createType('Vote', {
        aye: vote.isAye,
        conviction
      })
    }))));
  }

  function directLocks(api, {
    votes
  }) {
    if (!votes.length) {
      return of([]);
    }

    return api.query.democracy.referendumInfoOf.multi(votes.map(([referendumId]) => referendumId)).pipe(map(referendums => votes.map((vote, index) => [vote, referendums[index].unwrapOr(null)]).filter(item => !!item[1] && util.isUndefined(item[1].end) && item[0][1].isStandard).map(([directVote, referendum]) => parseLock(api, directVote, referendum))));
  }

  function locks(instanceId, api) {
    return memo(instanceId, accountId => api.query.democracy.votingOf ? api.query.democracy.votingOf(accountId).pipe(switchMap(voting => voting.isDirect ? directLocks(api, voting.asDirect) : voting.isDelegating ? delegateLocks(api, voting.asDelegating) : of([]))) : of([]));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function withImage(api, nextOpt) {
    if (nextOpt.isNone) {
      return of(null);
    }

    const [imageHash, threshold] = nextOpt.unwrap();
    return api.derive.democracy.preimage(imageHash).pipe(map(image => ({
      image,
      imageHash,
      threshold
    })));
  }

  function nextExternal(instanceId, api) {
    return memo(instanceId, () => {
      var _api$query$democracy;

      return (_api$query$democracy = api.query.democracy) !== null && _api$query$democracy !== void 0 && _api$query$democracy.nextExternal ? api.query.democracy.nextExternal().pipe(switchMap(nextOpt => withImage(api, nextOpt))) : of(null);
    });
  }

  function ownKeys$i(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$i(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$i(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$i(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function isOldInfo(info) {
    return !!info.proposalHash;
  }

  function isCurrentStatus(status) {
    return !!status.tally;
  }

  function isCurrentPreimage(api, imageOpt) {
    return !!imageOpt && !api.query.democracy.dispatchQueue;
  }

  function compareRationals(n1, d1, n2, d2) {
    while (true) {
      const q1 = n1.div(d1);
      const q2 = n2.div(d2);

      if (q1.lt(q2)) {
        return true;
      } else if (q2.lt(q1)) {
        return false;
      }

      const r1 = n1.mod(d1);
      const r2 = n2.mod(d2);

      if (r2.isZero()) {
        return false;
      } else if (r1.isZero()) {
        return true;
      }

      n1 = d2;
      n2 = d1;
      d1 = r2;
      d2 = r1;
    }
  }

  function calcPassingOther(threshold, sqrtElectorate, {
    votedAye,
    votedNay,
    votedTotal
  }) {
    const sqrtVoters = util.bnSqrt(votedTotal);
    return sqrtVoters.isZero() ? false : threshold.isSupermajorityapproval ? compareRationals(votedNay, sqrtVoters, votedAye, sqrtElectorate) : compareRationals(votedNay, sqrtElectorate, votedAye, sqrtVoters);
  }

  function calcPassing(threshold, sqrtElectorate, state) {
    return threshold.isSimplemajority ? state.votedAye.gt(state.votedNay) : calcPassingOther(threshold, sqrtElectorate, state);
  }

  function calcVotesPrev(votesFor) {
    return votesFor.reduce((state, derived) => {
      const {
        balance,
        vote
      } = derived;
      const isDefault = vote.conviction.index === 0;
      const counted = balance.muln(isDefault ? 1 : vote.conviction.index).divn(isDefault ? 10 : 1);

      if (vote.isAye) {
        state.allAye.push(derived);
        state.voteCountAye++;
        state.votedAye.iadd(counted);
      } else {
        state.allNay.push(derived);
        state.voteCountNay++;
        state.votedNay.iadd(counted);
      }

      state.voteCount++;
      state.votedTotal.iadd(counted);
      return state;
    }, {
      allAye: [],
      allNay: [],
      voteCount: 0,
      voteCountAye: 0,
      voteCountNay: 0,
      votedAye: new util.BN(0),
      votedNay: new util.BN(0),
      votedTotal: new util.BN(0)
    });
  }

  function calcVotesCurrent(tally, votes) {
    const allAye = [];
    const allNay = [];
    votes.forEach(derived => {
      if (derived.vote.isAye) {
        allAye.push(derived);
      } else {
        allNay.push(derived);
      }
    });
    return {
      allAye,
      allNay,
      voteCount: allAye.length + allNay.length,
      voteCountAye: allAye.length,
      voteCountNay: allNay.length,
      votedAye: tally.ayes,
      votedNay: tally.nays,
      votedTotal: tally.turnout
    };
  }

  function calcVotes(sqrtElectorate, referendum, votes) {
    const state = isCurrentStatus(referendum.status) ? calcVotesCurrent(referendum.status.tally, votes) : calcVotesPrev(votes);
    return _objectSpread$i(_objectSpread$i({}, state), {}, {
      isPassing: calcPassing(referendum.status.threshold, sqrtElectorate, state),
      votes
    });
  }
  function getStatus(info) {
    if (info.isNone) {
      return null;
    }

    const unwrapped = info.unwrap();

    if (isOldInfo(unwrapped)) {
      return unwrapped;
    } else if (unwrapped.isOngoing) {
      return unwrapped.asOngoing;
    } // done, we don't include it here... only currently active


    return null;
  }

  function constructProposal(api, [bytes, proposer, balance, at]) {
    let proposal;

    try {
      proposal = api.registry.createType('Proposal', bytes.toU8a(true));
    } catch (error) {
      console.error(error);
    }

    return {
      at,
      balance,
      proposal,
      proposer
    };
  }

  function parseImage(api, imageOpt) {
    if (imageOpt.isNone) {
      return;
    }

    if (isCurrentPreimage(api, imageOpt)) {
      const status = imageOpt.unwrap();

      if (status.isMissing) {
        return;
      }

      const {
        data,
        deposit,
        provider,
        since
      } = status.asAvailable;
      return constructProposal(api, [data, provider, deposit, since]);
    }

    return constructProposal(api, imageOpt.unwrap());
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function preimage(instanceId, api) {
    return memo(instanceId, hash => api.query.democracy.preimages(hash).pipe(map(imageOpt => parseImage(api, imageOpt))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function preimages(instanceId, api) {
    return memo(instanceId, hashes => hashes.length ? api.query.democracy.preimages.multi(hashes).pipe(map(images => images.map(imageOpt => parseImage(api, imageOpt)))) : of([]));
  }

  function ownKeys$h(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$h(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$h(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$h(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function isNewDepositors(depositors) {
    // Detect balance...
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return util.isFunction(depositors[1].mul);
  }

  function parse$3([proposals, images, optDepositors]) {
    return proposals.filter(([,, proposer], index) => {
      var _optDepositors$index;

      return !!((_optDepositors$index = optDepositors[index]) !== null && _optDepositors$index !== void 0 && _optDepositors$index.isSome) && !proposer.isEmpty;
    }).map(([index, imageHash, proposer], proposalIndex) => {
      const depositors = optDepositors[proposalIndex].unwrap();
      return _objectSpread$h(_objectSpread$h({}, isNewDepositors(depositors) ? {
        balance: depositors[1],
        seconds: depositors[0]
      } : {
        balance: depositors[0],
        seconds: depositors[1]
      }), {}, {
        image: images[proposalIndex],
        imageHash,
        index,
        proposer
      });
    });
  }

  function proposals$3(instanceId, api) {
    return memo(instanceId, () => {
      var _api$query$democracy, _api$query$democracy2;

      return util.isFunction((_api$query$democracy = api.query.democracy) === null || _api$query$democracy === void 0 ? void 0 : _api$query$democracy.publicProps) && util.isFunction((_api$query$democracy2 = api.query.democracy) === null || _api$query$democracy2 === void 0 ? void 0 : _api$query$democracy2.preimages) ? api.query.democracy.publicProps().pipe(switchMap(proposals => proposals.length ? combineLatest([of(proposals), api.derive.democracy.preimages(proposals.map(([, hash]) => hash)), api.query.democracy.depositOf.multi(proposals.map(([index]) => index))]) : of([[], [], []])), map(parse$3)) : of([]);
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function referendumIds(instanceId, api) {
    return memo(instanceId, () => {
      var _api$query$democracy;

      return (_api$query$democracy = api.query.democracy) !== null && _api$query$democracy !== void 0 && _api$query$democracy.lowestUnbaked ? api.queryMulti([api.query.democracy.lowestUnbaked, api.query.democracy.referendumCount]).pipe(map(([first, total]) => total.gt(first) // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ? [...Array(total.sub(first).toNumber())].map((_, i) => first.addn(i)) : [])) : of([]);
    });
  }

  function ownKeys$g(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$g(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$g(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$g(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  function referendums(instanceId, api) {
    return memo(instanceId, () => api.derive.democracy.referendumsActive().pipe(switchMap(referendums => referendums.length ? combineLatest([of(referendums), api.derive.democracy._referendumsVotes(referendums)]) : of([[], []])), map(([referendums, votes]) => referendums.map((referendum, index) => _objectSpread$g(_objectSpread$g({}, referendum), votes[index])))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function referendumsActive(instanceId, api) {
    return memo(instanceId, () => api.derive.democracy.referendumIds().pipe(switchMap(ids => ids.length ? api.derive.democracy.referendumsInfo(ids) : of([]))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function referendumsFinished(instanceId, api) {
    return memo(instanceId, () => api.derive.democracy.referendumIds().pipe(switchMap(ids => api.query.democracy.referendumInfoOf.multi(ids)), map(infos => infos.map(optInfo => optInfo.unwrapOr(null)).filter(info => !!info && info.isFinished).map(info => info.asFinished))));
  }

  function ownKeys$f(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$f(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$f(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$f(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function votesPrev(api, referendumId) {
    return api.query.democracy.votersFor(referendumId).pipe(switchMap(votersFor => combineLatest([of(votersFor), votersFor.length ? api.query.democracy.voteOf.multi(votersFor.map(accountId => [referendumId, accountId])) : of([]), api.derive.balances.votingBalances(votersFor)])), map(([votersFor, votes, balances]) => votersFor.map((accountId, index) => ({
      accountId,
      balance: balances[index].votingBalance || api.registry.createType('Balance'),
      isDelegating: false,
      vote: votes[index] || api.registry.createType('Vote')
    }))));
  }

  function extractVotes(mapped, referendumId) {
    return mapped.filter(([, voting]) => voting.isDirect).map(([accountId, voting]) => [accountId, voting.asDirect.votes.filter(([idx]) => idx.eq(referendumId))]).filter(([, directVotes]) => !!directVotes.length).reduce((result, [accountId, votes]) => // FIXME We are ignoring split votes
    votes.reduce((result, [, vote]) => {
      if (vote.isStandard) {
        result.push(_objectSpread$f({
          accountId,
          isDelegating: false
        }, vote.asStandard));
      }

      return result;
    }, result), []);
  }

  function votesCurr(api, referendumId) {
    return api.query.democracy.votingOf.entries().pipe(map(allVoting => {
      const mapped = allVoting.map(([{
        args: [accountId]
      }, voting]) => [accountId, voting]);
      const votes = extractVotes(mapped, referendumId);
      const delegations = mapped.filter(([, voting]) => voting.isDelegating).map(([accountId, voting]) => [accountId, voting.asDelegating]); // add delegations

      delegations.forEach(([accountId, {
        balance,
        conviction,
        target
      }]) => {
        // Are we delegating to a delegator
        const toDelegator = delegations.find(([accountId]) => accountId.eq(target));
        const to = votes.find(({
          accountId
        }) => accountId.eq(toDelegator ? toDelegator[0] : target)); // this delegation has a target

        if (to) {
          votes.push({
            accountId,
            balance,
            isDelegating: true,
            vote: api.registry.createType('Vote', {
              aye: to.vote.isAye,
              conviction
            })
          });
        }
      });
      return votes;
    }));
  }

  function _referendumVotes(instanceId, api) {
    return memo(instanceId, referendum => combineLatest([api.derive.democracy.sqrtElectorate(), util.isFunction(api.query.democracy.votingOf) ? votesCurr(api, referendum.index) : votesPrev(api, referendum.index)]).pipe(map(([sqrtElectorate, votes]) => calcVotes(sqrtElectorate, referendum, votes))));
  }
  function _referendumsVotes(instanceId, api) {
    return memo(instanceId, referendums => referendums.length ? combineLatest(referendums.map(referendum => api.derive.democracy._referendumVotes(referendum))) : of([]));
  }
  function _referendumInfo(instanceId, api) {
    return memo(instanceId, (index, info) => {
      const status = getStatus(info);
      return status ? api.query.democracy.preimages(status.proposalHash).pipe(map(preimage => ({
        image: parseImage(api, preimage),
        imageHash: status.proposalHash,
        index: api.registry.createType('ReferendumIndex', index),
        status
      }))) : of(null);
    });
  }
  function referendumsInfo(instanceId, api) {
    return memo(instanceId, ids => ids.length ? api.query.democracy.referendumInfoOf.multi(ids).pipe(switchMap(infos => combineLatest(ids.map((id, index) => api.derive.democracy._referendumInfo(id, infos[index])))), map(infos => infos.filter(referendum => !!referendum))) : of([]));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function sqrtElectorate(instanceId, api) {
    return memo(instanceId, () => api.query.balances.totalIssuance().pipe(map(totalIssuance => util.bnSqrt(totalIssuance))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const democracy = /*#__PURE__*/Object.freeze({
    __proto__: null,
    dispatchQueue: dispatchQueue,
    locks: locks,
    nextExternal: nextExternal,
    preimage: preimage,
    preimages: preimages,
    proposals: proposals$3,
    referendumIds: referendumIds,
    referendums: referendums,
    referendumsActive: referendumsActive,
    referendumsFinished: referendumsFinished,
    _referendumVotes: _referendumVotes,
    _referendumsVotes: _referendumsVotes,
    _referendumInfo: _referendumInfo,
    referendumsInfo: referendumsInfo,
    sqrtElectorate: sqrtElectorate
  });

  function ownKeys$e(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$e(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$e(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$e(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function isSeatHolder(value) {
    return !Array.isArray(value);
  }

  function isCandidateTuple(value) {
    return Array.isArray(value);
  }

  function getAccountTuple(value) {
    return isSeatHolder(value) ? [value.who, value.stake] : value;
  }

  function getCandidate(value) {
    return isCandidateTuple(value) ? value[0] : value;
  }

  function sortAccounts([, balanceA], [, balanceB]) {
    return balanceB.cmp(balanceA);
  }

  function queryElections(api) {
    const elections = api.query.phragmenElection ? 'phragmenElection' : api.query.electionsPhragmen ? 'electionsPhragmen' : api.query.elections ? 'elections' : null;
    const [council] = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), 'council') || ['council'];
    return (elections ? api.queryMulti([api.query[council].members, api.query[elections].candidates, api.query[elections].members, api.query[elections].runnersUp]) : combineLatest([api.query[council].members(), of([]), of([]), of([])])).pipe(map(([councilMembers, candidates, members, runnersUp]) => _objectSpread$e(_objectSpread$e({}, elections ? {
      candidacyBond: api.consts[elections].candidacyBond,
      desiredRunnersUp: api.consts[elections].desiredRunnersUp,
      desiredSeats: api.consts[elections].desiredMembers,
      termDuration: api.consts[elections].termDuration,
      votingBond: api.consts[elections].votingBond
    } : {}), {}, {
      candidateCount: api.registry.createType('u32', candidates.length),
      candidates: candidates.map(getCandidate),
      members: members.length ? members.map(getAccountTuple).sort(sortAccounts) : councilMembers.map(accountId => [accountId, api.registry.createType('Balance')]),
      runnersUp: runnersUp.map(getAccountTuple).sort(sortAccounts)
    })));
  }
  /**
   * @name info
   * @returns An object containing the combined results of the storage queries for
   * all relevant election module properties.
   * @example
   * <BR>
   *
   * ```javascript
   * api.derive.elections.info(({ members, candidates }) => {
   *   console.log(`There are currently ${members.length} council members and ${candidates.length} prospective council candidates.`);
   * });
   * ```
   */


  function info$3(instanceId, api) {
    return memo(instanceId, () => queryElections(api));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const elections = /*#__PURE__*/Object.freeze({
    __proto__: null,
    info: info$3
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function mapResult([result, validators, heartbeats, numBlocks]) {
    validators.forEach((validator, index) => {
      const validatorId = validator.toString();
      const blockCount = numBlocks[index];
      const hasMessage = !heartbeats[index].isEmpty;
      const prev = result[validatorId];

      if (!prev || prev.hasMessage !== hasMessage || !prev.blockCount.eq(blockCount)) {
        result[validatorId] = {
          blockCount,
          hasMessage,
          isOnline: hasMessage || blockCount.gt(util.BN_ZERO)
        };
      }
    });
    return result;
  }
  /**
   * @description Return a boolean array indicating whether the passed accounts had received heartbeats in the current session
   */


  function receivedHeartbeats(instanceId, api) {
    return memo(instanceId, () => {
      var _api$query$imOnline;

      return (_api$query$imOnline = api.query.imOnline) !== null && _api$query$imOnline !== void 0 && _api$query$imOnline.receivedHeartbeats ? api.derive.staking.overview().pipe(switchMap(({
        currentIndex,
        validators
      }) => combineLatest([of({}), of(validators), api.query.imOnline.receivedHeartbeats.multi(validators.map((_address, index) => [currentIndex, index])), api.query.imOnline.authoredBlocks.multi(validators.map(address => [currentIndex, address]))])), map(mapResult)) : of({});
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const imOnline = /*#__PURE__*/Object.freeze({
    __proto__: null,
    receivedHeartbeats: receivedHeartbeats
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function members$2(instanceId, api) {
    return memo(instanceId, members$4(instanceId, api, 'membership'));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function prime$1(instanceId, api) {
    return memo(instanceId, prime$3(instanceId, api, 'membership'));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function hasProposals$1(instanceId, api) {
    return memo(instanceId, hasProposals$3(instanceId, api, 'membership'));
  }
  function proposal$1(instanceId, api) {
    return memo(instanceId, proposal$3(instanceId, api, 'membership'));
  }
  function proposalCount$1(instanceId, api) {
    return memo(instanceId, proposalCount$3(instanceId, api, 'membership'));
  }
  function proposalHashes$1(instanceId, api) {
    return memo(instanceId, proposalHashes$3(instanceId, api, 'membership'));
  }
  function proposals$2(instanceId, api) {
    return memo(instanceId, proposals$5(instanceId, api, 'membership'));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const membership = /*#__PURE__*/Object.freeze({
    __proto__: null,
    members: members$2,
    prime: prime$1,
    hasProposals: hasProposals$1,
    proposal: proposal$1,
    proposalCount: proposalCount$1,
    proposalHashes: proposalHashes$1,
    proposals: proposals$2
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  function didUpdateToBool(didUpdate, id) {
    return didUpdate.isSome ? didUpdate.unwrap().some(paraId => paraId.eq(id)) : false;
  }

  function ownKeys$d(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$d(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$d(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$d(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function parseActive(id, active) {
    const found = active.find(([paraId]) => paraId === id);

    if (found && found[1].isSome) {
      const [collatorId, retriable] = found[1].unwrap();
      return _objectSpread$d({
        collatorId
      }, retriable.isWithRetries ? {
        isRetriable: true,
        retries: retriable.asWithRetries.toNumber()
      } : {
        isRetriable: false,
        retries: 0
      });
    }

    return null;
  }

  function parseCollators(id, collatorQueue) {
    return collatorQueue.map(queue => {
      const found = queue.find(([paraId]) => paraId === id);
      return found ? found[1] : null;
    });
  }

  function parse$2(id, [active, retryQueue, selectedThreads, didUpdate, info, pendingSwap, heads, relayDispatchQueue]) {
    if (info.isNone) {
      return null;
    }

    return {
      active: parseActive(id, active),
      didUpdate: didUpdateToBool(didUpdate, id),
      heads,
      id,
      info: _objectSpread$d({
        id
      }, info.unwrap()),
      pendingSwapId: pendingSwap.unwrapOr(null),
      relayDispatchQueue,
      retryCollators: parseCollators(id, retryQueue),
      selectedCollators: parseCollators(id, selectedThreads)
    };
  }

  function info$2(instanceId, api) {
    return memo(instanceId, id => api.query.registrar && api.query.allychains ? api.queryMulti([api.query.registrar.active, api.query.registrar.retryQueue, api.query.registrar.selectedThreads, api.query.allychains.didUpdate, [api.query.registrar.paras, id], [api.query.registrar.pendingSwap, id], [api.query.allychains.heads, id], [api.query.allychains.relayDispatchQueue, id]]).pipe(map(result => parse$2(api.registry.createType('ParaId', id), result))) : of(null));
  }

  function ownKeys$c(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$c(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$c(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$c(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function parse$1([ids, didUpdate, infos, pendingSwaps, relayDispatchQueueSizes]) {
    return ids.map((id, index) => ({
      didUpdate: didUpdateToBool(didUpdate, id),
      id,
      info: _objectSpread$c({
        id
      }, infos[index].unwrapOr(null)),
      pendingSwapId: pendingSwaps[index].unwrapOr(null),
      relayDispatchQueueSize: relayDispatchQueueSizes[index][0].toNumber()
    }));
  }

  function overview$1(instanceId, api) {
    return memo(instanceId, () => {
      var _api$query$registrar;

      return (_api$query$registrar = api.query.registrar) !== null && _api$query$registrar !== void 0 && _api$query$registrar.allychains && api.query.allychains ? api.query.registrar.allychains().pipe(switchMap(paraIds => combineLatest([of(paraIds), api.query.allychains.didUpdate(), api.query.registrar.paras.multi(paraIds), api.query.registrar.pendingSwap.multi(paraIds), api.query.allychains.relayDispatchQueueSize.multi(paraIds)])), map(parse$1)) : of([]);
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const allychains = /*#__PURE__*/Object.freeze({
    __proto__: null,
    info: info$2,
    overview: overview$1
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function eraLength(instanceId, api) {
    return memo(instanceId, () => api.derive.session.info().pipe(map(info => info.eraLength)));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function eraProgress(instanceId, api) {
    return memo(instanceId, () => api.derive.session.progress().pipe(map(info => info.eraProgress)));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function parse([currentIndex, activeEra, activeEraStart, currentEra, validatorCount]) {
    return {
      activeEra,
      activeEraStart,
      currentEra,
      currentIndex,
      validatorCount
    };
  } // query based on latest


  function queryStaking(api) {
    return api.queryMulti([api.query.session.currentIndex, api.query.staking.activeEra, api.query.staking.currentEra, api.query.staking.validatorCount]).pipe(map(([currentIndex, activeOpt, currentEra, validatorCount]) => {
      const {
        index,
        start
      } = activeOpt.unwrapOrDefault();
      return parse([currentIndex, index, start, currentEra.unwrapOrDefault(), validatorCount]);
    }));
  } // query based on latest


  function querySession(api) {
    return api.query.session.currentIndex().pipe(map(currentIndex => parse([currentIndex, api.registry.createType('EraIndex'), api.registry.createType('Option<Moment>'), api.registry.createType('EraIndex'), api.registry.createType('u32')])));
  } // empty set when none is available


  function empty(api) {
    return of(parse([api.registry.createType('SessionIndex', 1), api.registry.createType('EraIndex'), api.registry.createType('Option<Moment>'), api.registry.createType('EraIndex'), api.registry.createType('u32')]));
  }

  function indexes(instanceId, api) {
    return memo(instanceId, () => api.query.session ? api.query.staking ? queryStaking(api) : querySession(api) : empty(api));
  }

  function ownKeys$b(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$b(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$b(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$b(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  /**
   * @description Retrieves all the session and era query and calculates specific values on it as the length of the session and eras
   */

  function info$1(instanceId, api) {
    return memo(instanceId, () => api.derive.session.indexes().pipe(map(indexes => {
      var _api$consts, _api$consts$babe, _api$consts2, _api$consts2$staking;

      const sessionLength = ((_api$consts = api.consts) === null || _api$consts === void 0 ? void 0 : (_api$consts$babe = _api$consts.babe) === null || _api$consts$babe === void 0 ? void 0 : _api$consts$babe.epochDuration) || api.registry.createType('u64', 1);
      const sessionsPerEra = ((_api$consts2 = api.consts) === null || _api$consts2 === void 0 ? void 0 : (_api$consts2$staking = _api$consts2.staking) === null || _api$consts2$staking === void 0 ? void 0 : _api$consts2$staking.sessionsPerEra) || api.registry.createType('SessionIndex', 1);
      return _objectSpread$b(_objectSpread$b({}, indexes), {}, {
        eraLength: api.registry.createType('BlockNumber', sessionsPerEra.mul(sessionLength)),
        isEpoch: !!api.query.babe,
        sessionLength,
        sessionsPerEra
      });
    })));
  }

  function ownKeys$a(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$a(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$a(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$a(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function createDerive(api, info, [currentSlot, epochIndex, epochOrGenesisStartSlot, activeEraStartSessionIndex]) {
    const epochStartSlot = epochIndex.mul(info.sessionLength).iadd(epochOrGenesisStartSlot);
    const sessionProgress = currentSlot.sub(epochStartSlot);
    const eraProgress = info.currentIndex.sub(activeEraStartSessionIndex).imul(info.sessionLength).iadd(sessionProgress);
    return _objectSpread$a(_objectSpread$a({}, info), {}, {
      eraProgress: api.registry.createType('BlockNumber', eraProgress),
      sessionProgress: api.registry.createType('BlockNumber', sessionProgress)
    });
  }

  function queryAura(api) {
    return api.derive.session.info().pipe(map(info => _objectSpread$a(_objectSpread$a({}, info), {}, {
      eraProgress: api.registry.createType('BlockNumber'),
      sessionProgress: api.registry.createType('BlockNumber')
    })));
  }

  function queryBabe(api) {
    return api.derive.session.info().pipe(switchMap(info => {
      var _api$query$staking;

      return combineLatest([of(info), // we may have no staking, but have babe (permissioned)
      (_api$query$staking = api.query.staking) !== null && _api$query$staking !== void 0 && _api$query$staking.erasStartSessionIndex ? api.queryMulti([api.query.babe.currentSlot, api.query.babe.epochIndex, api.query.babe.genesisSlot, [api.query.staking.erasStartSessionIndex, info.activeEra]]) : api.queryMulti([api.query.babe.currentSlot, api.query.babe.epochIndex, api.query.babe.genesisSlot])]);
    }), map(([info, [currentSlot, epochIndex, genesisSlot, optStartIndex]]) => [info, [currentSlot, epochIndex, genesisSlot, optStartIndex && optStartIndex.isSome ? optStartIndex.unwrap() : api.registry.createType('SessionIndex', 1)]]));
  }
  /**
   * @description Retrieves all the session and era query and calculates specific values on it as the length of the session and eras
   */


  function progress(instanceId, api) {
    return memo(instanceId, () => api.query.babe ? queryBabe(api).pipe(map(([info, slots]) => createDerive(api, info, slots))) : queryAura(api));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function sessionProgress(instanceId, api) {
    return memo(instanceId, () => api.derive.session.progress().pipe(map(info => info.sessionProgress)));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const session = /*#__PURE__*/Object.freeze({
    __proto__: null,
    eraLength: eraLength,
    eraProgress: eraProgress,
    indexes: indexes,
    info: info$1,
    progress: progress,
    sessionProgress: sessionProgress
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  /**
   * @description Get the candidate info for a society
   */
  function candidates(instanceId, api) {
    return memo(instanceId, () => api.query.society.candidates().pipe(switchMap(candidates => combineLatest([of(candidates), api.query.society.suspendedCandidates.multi(candidates.map(({
      who
    }) => who))])), map(([candidates, suspended]) => candidates.map(({
      kind,
      value,
      who
    }, index) => ({
      accountId: who,
      isSuspended: suspended[index].isSome,
      kind,
      value
    })))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  /**
   * @description Get the overall info for a society
   */
  function info(instanceId, api) {
    return memo(instanceId, () => api.queryMulti([api.query.society.bids, api.query.society.defender, api.query.society.founder, api.query.society.head, api.query.society.maxMembers, api.query.society.pot]).pipe(map(([bids, defender, founder, head, maxMembers, pot]) => ({
      bids,
      defender: defender.unwrapOr(undefined),
      founder: founder.unwrapOr(undefined),
      hasDefender: defender.isSome && head.isSome && !head.eq(defender) || false,
      head: head.unwrapOr(undefined),
      maxMembers,
      pot
    }))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  /**
   * @description Get the member info for a society
   */

  function member(instanceId, api) {
    return memo(instanceId, accountId => api.derive.society._members([accountId]).pipe(map(([result]) => result)));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function _members(instanceId, api) {
    return memo(instanceId, accountIds => combineLatest([of(accountIds), api.query.society.payouts.multi(accountIds), api.query.society.strikes.multi(accountIds), api.query.society.defenderVotes.multi(accountIds), api.query.society.suspendedMembers.multi(accountIds), api.query.society.vouching.multi(accountIds)]).pipe(map(([accountIds, payouts, strikes, defenderVotes, suspended, vouching]) => accountIds.map((accountId, index) => ({
      accountId,
      isDefenderVoter: defenderVotes[index].isSome,
      isSuspended: suspended[index].isTrue,
      payouts: payouts[index],
      strikes: strikes[index],
      vote: defenderVotes[index].unwrapOr(undefined),
      vouching: vouching[index].unwrapOr(undefined)
    })))));
  }
  /**
   * @description Get the member info for a society
   */

  function members$1(instanceId, api) {
    return memo(instanceId, () => api.query.society.members().pipe(switchMap(members => api.derive.society._members(members))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const society = /*#__PURE__*/Object.freeze({
    __proto__: null,
    candidates: candidates,
    info: info,
    member: member,
    _members: _members,
    members: members$1
  });

  function ownKeys$9(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$9(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$9(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$9(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  const QUERY_OPTS = {
    withDestination: true,
    withLedger: true,
    withNominations: true,
    withPrefs: true
  };

  function groupByEra(list) {
    return list.reduce((map, {
      era,
      value
    }) => {
      const key = era.toString();
      map[key] = (map[key] || util.BN_ZERO).add(value.unwrap());
      return map;
    }, {});
  }

  function calculateUnlocking(api, stakingLedger, sessionInfo) {
    const results = Object.entries(groupByEra(((stakingLedger === null || stakingLedger === void 0 ? void 0 : stakingLedger.unlocking) || []).filter(({
      era
    }) => era.unwrap().gt(sessionInfo.activeEra)))).map(([eraString, value]) => ({
      remainingEras: new util.BN(eraString).isub(sessionInfo.activeEra),
      value: api.registry.createType('Balance', value)
    }));
    return results.length ? results : undefined;
  }

  function redeemableSum(api, stakingLedger, sessionInfo) {
    return api.registry.createType('Balance', ((stakingLedger === null || stakingLedger === void 0 ? void 0 : stakingLedger.unlocking) || []).reduce((total, {
      era,
      value
    }) => {
      return sessionInfo.activeEra.gte(era.unwrap()) ? total.iadd(value.unwrap()) : total;
    }, new util.BN(0)));
  }

  function parseResult$1(api, sessionInfo, keys, query) {
    return _objectSpread$9(_objectSpread$9(_objectSpread$9({}, keys), query), {}, {
      redeemable: redeemableSum(api, query.stakingLedger, sessionInfo),
      unlocking: calculateUnlocking(api, query.stakingLedger, sessionInfo)
    });
  }
  /**
   * @description From a list of stashes, fill in all the relevant staking details
   */


  function accounts(instanceId, api) {
    return memo(instanceId, accountIds => api.derive.session.info().pipe(switchMap(sessionInfo => combineLatest([api.derive.staking.keysMulti(accountIds), api.derive.staking.queryMulti(accountIds, QUERY_OPTS)]).pipe(map(([keys, queries]) => queries.map((query, index) => parseResult$1(api, sessionInfo, keys[index], query)))))));
  }
  /**
   * @description From a stash, retrieve the controllerId and fill in all the relevant staking details
   */

  function account(instanceId, api) {
    return memo(instanceId, accountId => api.derive.staking.accounts([accountId]).pipe(map(([first]) => first)));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  /**
   * @description Retrieve the staking overview, including elected and points earned
   */

  function currentPoints(instanceId, api) {
    return memo(instanceId, () => api.derive.session.indexes().pipe(switchMap(({
      activeEra
    }) => api.query.staking.erasRewardPoints(activeEra))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const CACHE_KEY$4 = 'eraExposure';

  function mapStakers(era, stakers) {
    const nominators = {};
    const validators = {};
    stakers.forEach(([key, exposure]) => {
      const validatorId = key.args[1].toString();
      validators[validatorId] = exposure;
      exposure.others.forEach(({
        who
      }, validatorIndex) => {
        const nominatorId = who.toString();
        nominators[nominatorId] = nominators[nominatorId] || [];
        nominators[nominatorId].push({
          validatorId,
          validatorIndex
        });
      });
    });
    return {
      era,
      nominators,
      validators
    };
  }

  function _eraExposure(instanceId, api) {
    return memo(instanceId, (era, withActive) => {
      const cacheKey = `${CACHE_KEY$4}-${era.toString()}`;
      const cached = withActive ? undefined : deriveCache.get(cacheKey);
      return cached ? of(cached) : api.query.staking.erasStakersClipped.entries(era).pipe(map(stakers => {
        const value = mapStakers(era, stakers);
        !withActive && deriveCache.set(cacheKey, value);
        return value;
      }));
    });
  }
  function eraExposure(instanceId, api) {
    return memo(instanceId, era => api.derive.staking._eraExposure(era, true));
  }
  function _erasExposure(instanceId, api) {
    return memo(instanceId, (eras, withActive) => eras.length ? combineLatest(eras.map(era => api.derive.staking._eraExposure(era, withActive))) : of([]));
  }
  function erasExposure(instanceId, api) {
    return memo(instanceId, (withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._erasExposure(eras, withActive))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function erasHistoric(instanceId, api) {
    return memo(instanceId, withActive => api.queryMulti([api.query.staking.activeEra, api.query.staking.historyDepth]).pipe(map(([activeEraOpt, historyDepth]) => {
      const result = [];
      const max = historyDepth.toNumber();
      const activeEra = activeEraOpt.unwrapOrDefault().index;
      let lastEra = activeEra;

      while (lastEra.gte(util.BN_ZERO) && result.length < max) {
        if (lastEra !== activeEra || withActive === true) {
          result.push(api.registry.createType('EraIndex', lastEra));
        }

        lastEra = lastEra.sub(util.BN_ONE);
      } // go from oldest to newest


      return result.reverse();
    })));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  function filterEras(eras, list) {
    return eras.filter(era => !list.some(entry => era.eq(entry.era)));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const CACHE_KEY$3 = 'eraPoints';

  function mapValidators({
    individual
  }) {
    return [...individual.entries()].filter(([, points]) => points.gt(util.BN_ZERO)).reduce((result, [validatorId, points]) => {
      result[validatorId.toString()] = points;
      return result;
    }, {});
  }

  function mapPoints(eras, points) {
    return eras.map((era, index) => ({
      era,
      eraPoints: points[index].total,
      validators: mapValidators(points[index])
    }));
  }

  function _erasPoints(instanceId, api) {
    return memo(instanceId, (eras, withActive) => {
      if (!eras.length) {
        return of([]);
      }

      const cached = withActive ? [] : eras.map(era => deriveCache.get(`${CACHE_KEY$3}-${era.toString()}`)).filter(value => !!value);
      const remaining = filterEras(eras, cached);
      return !remaining.length ? of(cached) : api.query.staking.erasRewardPoints.multi(remaining).pipe(map(points => {
        const query = mapPoints(remaining, points);
        !withActive && query.forEach(q => deriveCache.set(`${CACHE_KEY$3}-${q.era.toString()}`, q));
        return eras.map(era => cached.find(cached => era.eq(cached.era)) || query.find(query => era.eq(query.era)));
      }));
    });
  }
  function erasPoints(instanceId, api) {
    return memo(instanceId, (withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._erasPoints(eras, withActive))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const CACHE_KEY$2 = 'eraPrefs';

  function mapPrefs(era, all) {
    const validators = {};
    all.forEach(([key, prefs]) => {
      validators[key.args[1].toString()] = prefs;
    });
    return {
      era,
      validators
    };
  }

  function _eraPrefs(instanceId, api) {
    return memo(instanceId, (era, withActive) => {
      const cacheKey = `${CACHE_KEY$2}-${era.toString()}`;
      const cached = withActive ? undefined : deriveCache.get(cacheKey);
      return cached ? of(cached) : api.query.staking.erasValidatorPrefs.entries(era).pipe(map(prefs => {
        const value = mapPrefs(era, prefs);
        !withActive && deriveCache.set(cacheKey, value);
        return value;
      }));
    });
  }
  function eraPrefs(instanceId, api) {
    return memo(instanceId, era => api.derive.staking._eraPrefs(era, true));
  }
  function _erasPrefs(instanceId, api) {
    return memo(instanceId, (eras, withActive) => eras.length ? combineLatest(eras.map(era => api.derive.staking._eraPrefs(era, withActive))) : of([]));
  }
  function erasPrefs(instanceId, api) {
    return memo(instanceId, (withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._erasPrefs(eras, withActive))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const CACHE_KEY$1 = 'eraRewards';

  function mapRewards(eras, optRewards) {
    return eras.map((era, index) => ({
      era,
      eraReward: optRewards[index].unwrapOrDefault()
    }));
  }

  function _erasRewards(instanceId, api) {
    return memo(instanceId, (eras, withActive) => {
      if (!eras.length) {
        return of([]);
      }

      const cached = withActive ? [] : eras.map(era => deriveCache.get(`${CACHE_KEY$1}-${era.toString()}`)).filter(value => !!value);
      const remaining = filterEras(eras, cached);

      if (!remaining.length) {
        return of(cached);
      }

      return api.query.staking.erasValidatorReward.multi(remaining).pipe(map(optRewards => {
        const query = mapRewards(remaining, optRewards);
        !withActive && query.forEach(q => deriveCache.set(`${CACHE_KEY$1}-${q.era.toString()}`, q));
        return eras.map(era => cached.find(cached => era.eq(cached.era)) || query.find(query => era.eq(query.era)));
      }));
    });
  }
  function erasRewards(instanceId, api) {
    return memo(instanceId, (withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._erasRewards(eras, withActive))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const CACHE_KEY = 'eraSlashes';

  function mapSlashes(era, noms, vals) {
    const nominators = {};
    const validators = {};
    noms.forEach(([key, optBalance]) => {
      nominators[key.args[1].toString()] = optBalance.unwrap();
    });
    vals.forEach(([key, optRes]) => {
      validators[key.args[1].toString()] = optRes.unwrapOrDefault()[1];
    });
    return {
      era,
      nominators,
      validators
    };
  }

  function _eraSlashes(instanceId, api) {
    return memo(instanceId, (era, withActive) => {
      const cacheKey = `${CACHE_KEY}-${era.toString()}`;
      const cached = withActive ? undefined : deriveCache.get(cacheKey);
      return cached ? of(cached) : combineLatest([api.query.staking.nominatorSlashInEra.entries(era), api.query.staking.validatorSlashInEra.entries(era)]).pipe(map(([noms, vals]) => {
        const value = mapSlashes(era, noms, vals);
        !withActive && deriveCache.set(cacheKey, value);
        return value;
      }));
    });
  }
  function eraSlashes(instanceId, api) {
    return memo(instanceId, era => api.derive.staking._eraSlashes(era, true));
  }
  function _erasSlashes(instanceId, api) {
    return memo(instanceId, (eras, withActive) => eras.length ? combineLatest(eras.map(era => api.derive.staking._eraSlashes(era, withActive))) : of([]));
  }
  function erasSlashes(instanceId, api) {
    return memo(instanceId, (withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._erasSlashes(eras, withActive))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const DEFAULT_FLAGS$1 = {
    withController: true,
    withExposure: true,
    withPrefs: true
  };

  function combineAccounts(nextElected, validators) {
    return util.arrayFlatten([nextElected, validators.filter(v => !nextElected.find(n => n.eq(v)))]);
  }

  function electedInfo(instanceId, api) {
    return memo(instanceId, (flags = DEFAULT_FLAGS$1) => api.derive.staking.validators().pipe(switchMap(({
      nextElected,
      validators
    }) => api.derive.staking.queryMulti(combineAccounts(nextElected, validators), flags).pipe(map(info => ({
      info,
      nextElected,
      validators
    }))))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function extractsIds(stashId, queuedKeys, nextKeys) {
    const sessionIds = (queuedKeys.find(([currentId]) => currentId.eq(stashId)) || [undefined, []])[1];
    const nextSessionIds = nextKeys.unwrapOr([]);
    return {
      nextSessionIds,
      sessionIds
    };
  }

  function keys$1(instanceId, api) {
    return memo(instanceId, stashId => api.derive.staking.keysMulti([stashId]).pipe(map(([first]) => first)));
  }
  function keysMulti(instanceId, api) {
    return memo(instanceId, stashIds => stashIds.length ? api.query.session.queuedKeys().pipe(switchMap(queuedKeys => {
      var _api$consts$session;

      return combineLatest([of(queuedKeys), (_api$consts$session = api.consts.session) !== null && _api$consts$session !== void 0 && _api$consts$session.dedupKeyPrefix ? api.query.session.nextKeys.multi(stashIds.map(stashId => [api.consts.session.dedupKeyPrefix, stashId])) : api.query.session.nextKeys.multi(stashIds)]);
    }), map(([queuedKeys, nextKeys]) => stashIds.map((stashId, index) => extractsIds(stashId, queuedKeys, nextKeys[index])))) : of([]));
  }

  function ownKeys$8(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$8(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$8(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$8(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  /**
   * @description Retrieve the staking overview, including elected and points earned
   */

  function overview(instanceId, api) {
    return memo(instanceId, () => combineLatest([api.derive.session.indexes(), api.derive.staking.validators()]).pipe(map(([indexes, {
      nextElected,
      validators
    }]) => _objectSpread$8(_objectSpread$8({}, indexes), {}, {
      nextElected,
      validators
    }))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function _ownExposures(instanceId, api) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return memo(instanceId, (accountId, eras, _withActive) => eras.length ? api.queryMulti([...eras.map(era => [api.query.staking.erasStakersClipped, [era, accountId]]), ...eras.map(era => [api.query.staking.erasStakers, [era, accountId]])]).pipe(map(all => eras.map((era, index) => ({
      clipped: all[index],
      era,
      exposure: all[eras.length + index]
    })))) : of([]));
  }
  function ownExposure(instanceId, api) {
    return memo(instanceId, (accountId, era) => api.derive.staking._ownExposures(accountId, [era], true).pipe(map(([first]) => first)));
  }
  function ownExposures(instanceId, api) {
    return memo(instanceId, (accountId, withActive = false) => {
      return api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._ownExposures(accountId, eras, withActive)));
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function _ownSlashes(instanceId, api) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return memo(instanceId, (accountId, eras, _withActive) => eras.length ? api.queryMulti([...eras.map(era => [api.query.staking.validatorSlashInEra, [era, accountId]]), ...eras.map(era => [api.query.staking.nominatorSlashInEra, [era, accountId]])]).pipe(map(values => eras.map((era, index) => ({
      era,
      total: values[index].isSome ? values[index].unwrap()[1] : values[index + eras.length].unwrapOrDefault()
    })))) : of([]));
  }
  function ownSlash(instanceId, api) {
    return memo(instanceId, (accountId, era) => api.derive.staking._ownSlashes(accountId, [era], true).pipe(map(([first]) => first)));
  }
  function ownSlashes(instanceId, api) {
    return memo(instanceId, (accountId, withActive = false) => {
      return api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._ownSlashes(accountId, eras, withActive)));
    });
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function parseDetails(stashId, controllerIdOpt, nominatorsOpt, rewardDestination, validatorPrefs, exposure, stakingLedgerOpt) {
    return {
      accountId: stashId,
      controllerId: controllerIdOpt && controllerIdOpt.unwrapOr(null),
      exposure,
      nominators: nominatorsOpt.isSome ? nominatorsOpt.unwrap().targets : [],
      rewardDestination,
      stakingLedger: stakingLedgerOpt.unwrapOrDefault(),
      stashId,
      validatorPrefs
    };
  }

  function getLedgers(api, optIds, {
    withLedger = false
  }) {
    const ids = optIds.filter(opt => withLedger && !!opt && opt.isSome).map(opt => opt.unwrap());
    const emptyLed = api.registry.createType('Option<StakingLedger>');
    return (ids.length ? api.query.staking.ledger.multi(ids) : of([])).pipe(map(optLedgers => {
      let offset = -1;
      return optIds.map(opt => opt && opt.isSome ? optLedgers[++offset] || emptyLed : emptyLed);
    }));
  }

  function getStashInfo(api, stashIds, activeEra, {
    withController,
    withDestination,
    withExposure,
    withLedger,
    withNominations,
    withPrefs
  }) {
    const emptyNoms = api.registry.createType('Option<Nominations>');
    const emptyRewa = api.registry.createType('RewardDestination');
    const emptyExpo = api.registry.createType('Exposure');
    const emptyPrefs = api.registry.createType('ValidatorPrefs');
    return combineLatest([withController || withLedger ? api.query.staking.bonded.multi(stashIds) : of(stashIds.map(() => null)), withNominations ? api.query.staking.nominators.multi(stashIds) : of(stashIds.map(() => emptyNoms)), withDestination ? api.query.staking.payee.multi(stashIds) : of(stashIds.map(() => emptyRewa)), withPrefs ? api.query.staking.validators.multi(stashIds) : of(stashIds.map(() => emptyPrefs)), withExposure ? api.query.staking.erasStakers.multi(stashIds.map(stashId => [activeEra, stashId])) : of(stashIds.map(() => emptyExpo))]);
  }

  function getBatch(api, activeEra, stashIds, flags) {
    return getStashInfo(api, stashIds, activeEra, flags).pipe(switchMap(([controllerIdOpt, nominatorsOpt, rewardDestination, validatorPrefs, exposure]) => getLedgers(api, controllerIdOpt, flags).pipe(map(stakingLedgerOpts => stashIds.map((stashId, index) => parseDetails(stashId, controllerIdOpt[index], nominatorsOpt[index], rewardDestination[index], validatorPrefs[index], exposure[index], stakingLedgerOpts[index]))))));
  } //

  /**
   * @description From a stash, retrieve the controllerId and all relevant details
   */


  function query(instanceId, api) {
    return memo(instanceId, (accountId, flags) => api.derive.staking.queryMulti([accountId], flags).pipe(map(([first]) => first)));
  }
  function queryMulti(instanceId, api) {
    return memo(instanceId, (accountIds, flags) => accountIds.length ? api.derive.session.indexes().pipe(switchMap(({
      activeEra
    }) => {
      const stashIds = accountIds.map(accountId => api.registry.createType('AccountId', accountId));
      return getBatch(api, activeEra, stashIds, flags);
    })) : of([]));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function _stakerExposures(instanceId, api) {
    return memo(instanceId, (accountIds, eras, withActive) => {
      const stakerIds = accountIds.map(a => api.registry.createType('AccountId', a).toString());
      return api.derive.staking._erasExposure(eras, withActive).pipe(map(exposures => stakerIds.map(stakerId => exposures.map(({
        era,
        nominators: allNominators,
        validators: allValidators
      }) => {
        const isValidator = !!allValidators[stakerId];
        const validators = {};
        const nominating = allNominators[stakerId] || [];

        if (isValidator) {
          validators[stakerId] = allValidators[stakerId];
        } else if (nominating) {
          nominating.forEach(({
            validatorId
          }) => {
            validators[validatorId] = allValidators[validatorId];
          });
        }

        return {
          era,
          isEmpty: !Object.keys(validators).length,
          isValidator,
          nominating,
          validators
        };
      }))));
    });
  }
  function stakerExposures(instanceId, api) {
    return memo(instanceId, (accountIds, withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._stakerExposures(accountIds, eras, withActive))));
  }
  function stakerExposure(instanceId, api) {
    return memo(instanceId, (accountId, withActive = false) => api.derive.staking.stakerExposures([accountId, withActive]).pipe(map(([first]) => first)));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function _stakerPoints(instanceId, api) {
    return memo(instanceId, (accountId, eras, withActive) => {
      const stakerId = api.registry.createType('AccountId', accountId).toString();
      return api.derive.staking._erasPoints(eras, withActive).pipe(map(points => points.map(({
        era,
        eraPoints,
        validators
      }) => ({
        era,
        eraPoints,
        points: validators[stakerId] || api.registry.createType('RewardPoint')
      }))));
    });
  }
  function stakerPoints(instanceId, api) {
    return memo(instanceId, (accountId, withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._stakerPoints(accountId, eras, withActive))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function _stakerPrefs(instanceId, api) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return memo(instanceId, (accountId, eras, _withActive) => api.query.staking.erasValidatorPrefs.multi(eras.map(era => [era, accountId])).pipe(map(all => all.map((validatorPrefs, index) => ({
      era: eras[index],
      validatorPrefs
    })))));
  }
  function stakerPrefs(instanceId, api) {
    return memo(instanceId, (accountId, withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._stakerPrefs(accountId, eras, withActive))));
  }

  function ownKeys$7(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$7(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$7(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$7(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function parseRewards(api, stashId, [erasPoints, erasPrefs, erasRewards], exposures) {
    return exposures.map(({
      era,
      isEmpty,
      isValidator,
      nominating,
      validators: eraValidators
    }) => {
      const {
        eraPoints,
        validators: allValPoints
      } = erasPoints.find(p => p.era.eq(era)) || {
        eraPoints: util.BN_ZERO,
        validators: {}
      };
      const {
        eraReward
      } = erasRewards.find(r => r.era.eq(era)) || {
        eraReward: api.registry.createType('Balance')
      };
      const {
        validators: allValPrefs
      } = erasPrefs.find(p => p.era.eq(era)) || {
        validators: {}
      };
      const validators = {};
      const stakerId = stashId.toString();
      Object.entries(eraValidators).forEach(([validatorId, exposure]) => {
        var _allValPrefs$validato, _exposure$total;

        const valPoints = allValPoints[validatorId] || util.BN_ZERO;
        const valComm = ((_allValPrefs$validato = allValPrefs[validatorId]) === null || _allValPrefs$validato === void 0 ? void 0 : _allValPrefs$validato.commission.unwrap()) || util.BN_ZERO;
        const expTotal = ((_exposure$total = exposure.total) === null || _exposure$total === void 0 ? void 0 : _exposure$total.unwrap()) || util.BN_ZERO;
        let avail = util.BN_ZERO;
        let value;

        if (!(expTotal.isZero() || valPoints.isZero() || eraPoints.isZero())) {
          avail = eraReward.mul(valPoints).div(eraPoints);
          const valCut = valComm.mul(avail).div(util.BN_BILLION);
          let staked;

          if (validatorId === stakerId) {
            staked = exposure.own.unwrap();
          } else {
            const stakerExp = exposure.others.find(({
              who
            }) => who.eq(stakerId));
            staked = stakerExp ? stakerExp.value.unwrap() : util.BN_ZERO;
          }

          value = avail.sub(valCut).imul(staked).div(expTotal).iadd(validatorId === stakerId ? valCut : util.BN_ZERO);
        }

        validators[validatorId] = {
          total: api.registry.createType('Balance', avail),
          value: api.registry.createType('Balance', value)
        };
      });
      return {
        era,
        eraReward,
        isEmpty,
        isValidator,
        nominating,
        validators
      };
    });
  }

  function allUniqValidators(rewards) {
    return rewards.reduce(([all, perStash], rewards) => {
      const uniq = [];
      perStash.push(uniq);
      rewards.forEach(({
        validators
      }) => Object.keys(validators).forEach(validatorId => {
        if (!uniq.includes(validatorId)) {
          uniq.push(validatorId);

          if (!all.includes(validatorId)) {
            all.push(validatorId);
          }
        }
      }));
      return [all, perStash];
    }, [[], []]);
  }

  function removeClaimed(validators, queryValidators, reward) {
    const rm = [];
    Object.keys(reward.validators).forEach(validatorId => {
      const index = validators.indexOf(validatorId);

      if (index !== -1) {
        const valLedger = queryValidators[index].stakingLedger;

        if (valLedger !== null && valLedger !== void 0 && valLedger.claimedRewards.some(era => reward.era.eq(era))) {
          rm.push(validatorId);
        }
      }
    });
    rm.forEach(validatorId => {
      delete reward.validators[validatorId];
    });
  }

  function filterRewards(eras, valInfo, {
    rewards,
    stakingLedger
  }) {
    const filter = eras.filter(era => !stakingLedger.claimedRewards.some(e => e.eq(era)));
    const validators = valInfo.map(([v]) => v);
    const queryValidators = valInfo.map(([, q]) => q);
    return rewards.filter(({
      isEmpty
    }) => !isEmpty).filter(reward => {
      if (!filter.some(filter => reward.era.eq(filter))) {
        return false;
      }

      removeClaimed(validators, queryValidators, reward);
      return true;
    }).filter(({
      validators
    }) => Object.keys(validators).length !== 0).map(reward => _objectSpread$7(_objectSpread$7({}, reward), {}, {
      nominators: reward.nominating.filter(n => reward.validators[n.validatorId])
    }));
  }

  function _stakerRewardsEras(instanceId, api) {
    return memo(instanceId, (eras, withActive) => combineLatest([api.derive.staking._erasPoints(eras, withActive), api.derive.staking._erasPrefs(eras, withActive), api.derive.staking._erasRewards(eras, withActive)]));
  }
  function _stakerRewards(instanceId, api) {
    return memo(instanceId, (accountIds, eras, withActive) => combineLatest([api.derive.staking.queryMulti(accountIds, {
      withLedger: true
    }), api.derive.staking._stakerExposures(accountIds, eras, withActive), api.derive.staking._stakerRewardsEras(eras, withActive)]).pipe(switchMap(([queries, exposures, erasResult]) => {
      const allRewards = queries.map(({
        stakingLedger,
        stashId
      }, index) => !stashId || !stakingLedger ? [] : parseRewards(api, stashId, erasResult, exposures[index]));

      if (withActive) {
        return of(allRewards);
      }

      const [allValidators, stashValidators] = allUniqValidators(allRewards);
      return api.derive.staking.queryMulti(allValidators, {
        withLedger: true
      }).pipe(map(queriedVals => queries.map(({
        stakingLedger
      }, index) => filterRewards(eras, stashValidators[index].map(validatorId => [validatorId, queriedVals.find(q => q.accountId.eq(validatorId))]), {
        rewards: allRewards[index],
        stakingLedger
      }))));
    })));
  }
  function stakerRewards(instanceId, api) {
    return memo(instanceId, (accountId, withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._stakerRewards([accountId], eras, withActive)), map(([first]) => first)));
  }
  function stakerRewardsMultiEras(instanceId, api) {
    return memo(instanceId, (accountIds, eras) => accountIds.length && eras.length ? api.derive.staking._stakerRewards(accountIds, eras, false) : of([]));
  }
  function stakerRewardsMulti(instanceId, api) {
    return memo(instanceId, (accountIds, withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking.stakerRewardsMultiEras(accountIds, eras))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function _stakerSlashes(instanceId, api) {
    return memo(instanceId, (accountId, eras, withActive) => {
      const stakerId = api.registry.createType('AccountId', accountId).toString();
      return api.derive.staking._erasSlashes(eras, withActive).pipe(map(slashes => slashes.map(({
        era,
        nominators,
        validators
      }) => ({
        era,
        total: nominators[stakerId] || validators[stakerId] || api.registry.createType('Balance')
      }))));
    });
  }
  function stakerSlashes(instanceId, api) {
    return memo(instanceId, (accountId, withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._stakerSlashes(accountId, eras, withActive))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function onBondedEvent(api) {
    let current = Date.now();
    return api.query.system.events().pipe(map(events => {
      current = events.filter(({
        event,
        phase
      }) => {
        try {
          return phase.isApplyExtrinsic && event.section === 'staking' && event.method === 'Bonded';
        } catch {
          return false;
        }
      }) ? Date.now() : current;
      return current;
    }), startWith(current), drr({
      skipTimeout: true
    }));
  }
  /**
   * @description Retrieve the list of all validator stashes
   */


  function stashes(instanceId, api) {
    return memo(instanceId, () => onBondedEvent(api).pipe(switchMap(() => api.query.staking.validators.keys()), map(keys => keys.map(({
      args: [validatorId]
    }) => validatorId).filter(a => a))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function nextElected(instanceId, api) {
    return memo(instanceId, () => api.query.staking.erasStakers ? api.derive.session.indexes().pipe( // only populate for next era in the last session, so track both here - entries are not
    // subscriptions, so we need a trigger - currentIndex acts as that trigger to refresh
    switchMap(({
      currentEra
    }) => api.query.staking.erasStakers.keys(currentEra)), map(keys => keys.map(({
      args: [, accountId]
    }) => accountId))) : api.query.staking.currentElected());
  }
  /**
   * @description Retrieve latest list of validators
   */

  function validators(instanceId, api) {
    return memo(instanceId, () => // Sadly the node-template is (for some obscure reason) not comprehensive, so while the derive works
    // in all actual real-world deployed chains, it does create some confusion for limited template chains
    combineLatest([api.query.session ? api.query.session.validators() : of([]), api.query.staking ? api.derive.staking.nextElected() : of([])]).pipe(map(([validators, nextElected]) => ({
      nextElected: nextElected.length ? nextElected : validators,
      validators
    }))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const DEFAULT_FLAGS = {
    withController: true,
    withPrefs: true
  };
  function waitingInfo(instanceId, api) {
    return memo(instanceId, (flags = DEFAULT_FLAGS) => combineLatest([api.derive.staking.validators(), api.derive.staking.stashes()]).pipe(switchMap(([{
      nextElected
    }, stashes]) => {
      const elected = nextElected.map(a => a.toString());
      const waiting = stashes.filter(v => !elected.includes(v.toString()));
      return api.derive.staking.queryMulti(waiting, flags).pipe(map(info => ({
        info,
        waiting
      })));
    })));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const staking = /*#__PURE__*/Object.freeze({
    __proto__: null,
    accounts: accounts,
    account: account,
    currentPoints: currentPoints,
    _eraExposure: _eraExposure,
    eraExposure: eraExposure,
    _erasExposure: _erasExposure,
    erasExposure: erasExposure,
    erasHistoric: erasHistoric,
    _erasPoints: _erasPoints,
    erasPoints: erasPoints,
    _eraPrefs: _eraPrefs,
    eraPrefs: eraPrefs,
    _erasPrefs: _erasPrefs,
    erasPrefs: erasPrefs,
    _erasRewards: _erasRewards,
    erasRewards: erasRewards,
    _eraSlashes: _eraSlashes,
    eraSlashes: eraSlashes,
    _erasSlashes: _erasSlashes,
    erasSlashes: erasSlashes,
    electedInfo: electedInfo,
    keys: keys$1,
    keysMulti: keysMulti,
    overview: overview,
    _ownExposures: _ownExposures,
    ownExposure: ownExposure,
    ownExposures: ownExposures,
    _ownSlashes: _ownSlashes,
    ownSlash: ownSlash,
    ownSlashes: ownSlashes,
    query: query,
    queryMulti: queryMulti,
    _stakerExposures: _stakerExposures,
    stakerExposures: stakerExposures,
    stakerExposure: stakerExposure,
    _stakerPoints: _stakerPoints,
    stakerPoints: stakerPoints,
    _stakerPrefs: _stakerPrefs,
    stakerPrefs: stakerPrefs,
    _stakerRewardsEras: _stakerRewardsEras,
    _stakerRewards: _stakerRewards,
    stakerRewards: stakerRewards,
    stakerRewardsMultiEras: stakerRewardsMultiEras,
    stakerRewardsMulti: stakerRewardsMulti,
    _stakerSlashes: _stakerSlashes,
    stakerSlashes: stakerSlashes,
    stashes: stashes,
    nextElected: nextElected,
    validators: validators,
    waitingInfo: waitingInfo
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function members(instanceId, api) {
    return memo(instanceId, members$4(instanceId, api, 'technicalCommittee'));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function prime(instanceId, api) {
    return memo(instanceId, prime$3(instanceId, api, 'technicalCommittee'));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function hasProposals(instanceId, api) {
    return memo(instanceId, hasProposals$3(instanceId, api, 'technicalCommittee'));
  }
  function proposal(instanceId, api) {
    return memo(instanceId, proposal$3(instanceId, api, 'technicalCommittee'));
  }
  function proposalCount(instanceId, api) {
    return memo(instanceId, proposalCount$3(instanceId, api, 'technicalCommittee'));
  }
  function proposalHashes(instanceId, api) {
    return memo(instanceId, proposalHashes$3(instanceId, api, 'technicalCommittee'));
  }
  function proposals$1(instanceId, api) {
    return memo(instanceId, proposals$5(instanceId, api, 'technicalCommittee'));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const technicalCommittee = /*#__PURE__*/Object.freeze({
    __proto__: null,
    members: members,
    prime: prime,
    hasProposals: hasProposals,
    proposal: proposal,
    proposalCount: proposalCount,
    proposalHashes: proposalHashes,
    proposals: proposals$1
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function parseResult(api, {
    allIds,
    allProposals,
    approvalIds,
    councilProposals,
    proposalCount
  }) {
    const approvals = [];
    const proposals = [];
    const councilTreasury = councilProposals.filter(({
      proposal
    }) => api.tx.treasury.approveProposal.is(proposal) || api.tx.treasury.rejectProposal.is(proposal));
    allIds.forEach((id, index) => {
      if (allProposals[index].isSome) {
        const council = councilTreasury.filter(({
          proposal
        }) => id.eq(proposal.args[0])).sort((a, b) => a.proposal.method.localeCompare(b.proposal.method));
        const isApproval = approvalIds.some(approvalId => approvalId.eq(id));
        const derived = {
          council,
          id,
          proposal: allProposals[index].unwrap()
        };

        if (isApproval) {
          approvals.push(derived);
        } else {
          proposals.push(derived);
        }
      }
    });
    return {
      approvals,
      proposalCount,
      proposals
    };
  }

  function retrieveProposals(api, proposalCount, approvalIds) {
    const proposalIds = [];
    const count = proposalCount.toNumber();

    for (let index = 0; index < count; index++) {
      if (!approvalIds.some(id => id.eqn(index))) {
        proposalIds.push(api.registry.createType('ProposalIndex', index));
      }
    }

    const allIds = [...proposalIds, ...approvalIds];
    return combineLatest([api.query.treasury.proposals.multi(allIds), api.derive.council ? api.derive.council.proposals() : of([])]).pipe(map(([allProposals, councilProposals]) => parseResult(api, {
      allIds,
      allProposals,
      approvalIds,
      councilProposals,
      proposalCount
    })));
  }
  /**
   * @description Retrieve all active and approved treasury proposals, along with their info
   */


  function proposals(instanceId, api) {
    return memo(instanceId, () => api.query.treasury ? combineLatest([api.query.treasury.proposalCount(), api.query.treasury.approvals()]).pipe(switchMap(([proposalCount, approvalIds]) => retrieveProposals(api, proposalCount, approvalIds))) : of({
      approvals: [],
      proposalCount: api.registry.createType('ProposalIndex'),
      proposals: []
    }));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const treasury = /*#__PURE__*/Object.freeze({
    __proto__: null,
    proposals: proposals
  });

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  function events(instanceId, api) {
    return memo(instanceId, at => combineLatest([api.query.system.events.at(at), api.rpc.chain.getBlock(at)]).pipe(map(([events, block]) => ({
      block,
      events
    }))));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors
  const FALLBACK_MAX_HASH_COUNT = 250; // default here to 5 min eras, adjusted based on the actual blocktime

  const FALLBACK_PERIOD = new util.BN(6 * 1000);
  const MAX_FINALITY_LAG = new util.BN(5);
  const MORTAL_PERIOD = new util.BN(5 * 60 * 1000);

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  function latestNonce(api, address) {
    return api.derive.balances.account(address).pipe(map(({
      accountNonce
    }) => accountNonce));
  }

  function nextNonce(api, address) {
    var _api$rpc$system;

    return (_api$rpc$system = api.rpc.system) !== null && _api$rpc$system !== void 0 && _api$rpc$system.accountNextIndex ? api.rpc.system.accountNextIndex(address) : latestNonce(api, address);
  }

  function signingHeader(api) {
    return combineLatest([api.rpc.chain.getHeader(), api.rpc.chain.getFinalizedHead()]).pipe(switchMap(([bestHeader, finHash]) => // retrieve the headers - in the case of the current block, we use the parent
    // to minimize (not completely remove) the impact that forks do have on the system
    // (when at genesis, just return the current header as the last known)
    bestHeader.parentHash.isEmpty ? of([bestHeader, bestHeader]) : combineLatest([api.rpc.chain.getHeader(bestHeader.parentHash), api.rpc.chain.getHeader(finHash)])), map(([current, finalized]) => // determine the hash to use, current when lag > max, else finalized
    current.number.unwrap().sub(finalized.number.unwrap()).gt(MAX_FINALITY_LAG) ? current : finalized));
  }

  function signingInfo(_instanceId, api) {
    // no memo, we want to do this fresh on each run
    return (address, nonce, era) => combineLatest([// retrieve nonce if none was specified
    util.isUndefined(nonce) ? latestNonce(api, address) : nonce === -1 ? nextNonce(api, address) : of(api.registry.createType('Index', nonce)), // if no era (create) or era > 0 (mortal), do block retrieval
    util.isUndefined(era) || util.isNumber(era) && era > 0 ? signingHeader(api) : of(null)]).pipe(map(([nonce, header]) => {
      var _api$consts$system, _api$consts$system$bl, _api$consts$babe, _api$consts$timestamp;

      return {
        header,
        mortalLength: Math.min(((_api$consts$system = api.consts.system) === null || _api$consts$system === void 0 ? void 0 : (_api$consts$system$bl = _api$consts$system.blockHashCount) === null || _api$consts$system$bl === void 0 ? void 0 : _api$consts$system$bl.toNumber()) || FALLBACK_MAX_HASH_COUNT, MORTAL_PERIOD.div(((_api$consts$babe = api.consts.babe) === null || _api$consts$babe === void 0 ? void 0 : _api$consts$babe.expectedBlockTime) || ((_api$consts$timestamp = api.consts.timestamp) === null || _api$consts$timestamp === void 0 ? void 0 : _api$consts$timestamp.minimumPeriod.muln(2)) || FALLBACK_PERIOD).iadd(MAX_FINALITY_LAG).toNumber()),
        nonce
      };
    }));
  }

  // Copyright 2017-2021 @axia-js/api-derive authors & contributors

  const tx = /*#__PURE__*/Object.freeze({
    __proto__: null,
    events: events,
    signingInfo: signingInfo
  });

  function ownKeys$6(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$6(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$6(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$6(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  const derive = {
    accounts: accounts$1,
    balances,
    bounties,
    chain,
    contracts,
    council,
    crowdloan,
    democracy,
    elections,
    imOnline,
    membership,
    allychains,
    session,
    society,
    staking,
    technicalCommittee,
    treasury,
    tx
  };
  // Enable derive only if some of these modules are available
  const checks = {
    contracts: {
      instances: ['contracts']
    },
    council: {
      instances: ['council'],
      withDetect: true
    },
    crowdloan: {
      instances: ['crowdloan']
    },
    democracy: {
      instances: ['democracy']
    },
    elections: {
      instances: ['phragmenElection', 'electionsPhragmen', 'elections', 'council'],
      withDetect: true
    },
    imOnline: {
      instances: ['imOnline']
    },
    membership: {
      instances: ['membership']
    },
    allychains: {
      instances: ['allychains', 'registrar']
    },
    session: {
      instances: ['session']
    },
    society: {
      instances: ['society']
    },
    staking: {
      instances: ['staking']
    },
    technicalCommittee: {
      instances: ['technicalCommittee'],
      withDetect: true
    },
    treasury: {
      instances: ['treasury']
    }
  };
  /**
   * Returns an object that will inject `api` into all the functions inside
   * `allSections`, and keep the object architecture of `allSections`.
   */

  /** @internal */

  function injectFunctions(instanceId, api, allSections) {
    const queryKeys = Object.keys(api.query);
    const specName = api.runtimeVersion.specName.toString();
    return Object.keys(allSections).filter(sectionName => !checks[sectionName] || checks[sectionName].instances.some(q => queryKeys.includes(q)) || checks[sectionName].withDetect && checks[sectionName].instances.some(q => (api.registry.getModuleInstances(specName, q) || []).some(q => queryKeys.includes(q)))).reduce((derives, sectionName) => {
      const section = allSections[sectionName];
      derives[sectionName] = Object.entries(section).reduce((methods, [methodName, creator]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
        methods[methodName] = creator(instanceId, api);
        return methods;
      }, {});
      return derives;
    }, {});
  } // FIXME The return type of this function should be {...ExactDerive, ...DeriveCustom}
  // For now we just drop the custom derive typings

  /** @internal */


  function decorateDerive(instanceId, api, custom = {}) {
    return _objectSpread$6(_objectSpread$6({}, injectFunctions(instanceId, api, derive)), injectFunctions(instanceId, api, custom));
  }

  // Copyright 2017-2021 @axia-js/api authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  // Most generic typings for `api.derive.*.*`
  // Exact typings for a particular section `api.derive.section.*`
  // Exact typings for all sections `api.derive.*.*`
  // A technically unsafe version of Object.keys(obj) that assumes that
  // obj only has known properties of T
  function keys(obj) {
    return Object.keys(obj);
  }
  /**
   * This is a methods decorator which keeps all type information.
   */


  function decorateMethods(section, decorateMethod) {
    return keys(section).reduce((acc, methodName) => {
      const method = section[methodName]; // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

      acc[methodName] = decorateMethod(method);
      return acc;
    }, {});
  }
  /**
   * This is a section decorator which keeps all type information.
   */


  function decorateSections(allSections, decorateMethod) {
    return keys(allSections).reduce((acc, sectionName) => {
      acc[sectionName] = decorateMethods(allSections[sectionName], decorateMethod);
      return acc;
    }, {});
  }

  // Copyright 2017-2021 @axia-js/api authors & contributors
  const l$3 = util.logger('api/util');

  // Copyright 2017-2021 @axia-js/api authors & contributors
  function filterEvents(extHash, {
    block: {
      extrinsics,
      header
    }
  }, allEvents, status) {
    // extrinsics to hashes
    const myHash = extHash.toHex();
    const allHashes = extrinsics.map(ext => ext.hash.toHex()); // find the index of our extrinsic in the block

    const index = allHashes.indexOf(myHash); // if we do get the block after finalized, it _should_ be there

    if (index === -1) {
      // only warn on filtering with isInBlock (finalization finalizes after)
      if (status.isInBlock) {
        l$3.warn(`block ${header.hash.toHex()}: Unable to find extrinsic ${myHash} inside ${allHashes.join(', ')}`);
      }

      return;
    }

    return allEvents.filter(({
      phase
    }) => // only ApplyExtrinsic has the extrinsic index
    phase.isApplyExtrinsic && phase.asApplyExtrinsic.eqn(index));
  }

  // Copyright 2017-2021 @axia-js/api authors & contributors
  function isKeyringPair(account) {
    return util.isFunction(account.sign);
  }

  // Copyright 2017-2021 @axia-js/api authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  const recordIdentity = record => record;

  function filterAndApply(events, section, methods, onFound) {
    return events.filter(({
      event
    }) => section === event.section && methods.includes(event.method)).map(record => onFound(record));
  }

  function extractError(events = []) {
    return filterAndApply(events, 'system', ['ExtrinsicFailed'], ({
      event: {
        data
      }
    }) => data[0])[0];
  }

  function extractInfo(events = []) {
    return filterAndApply(events, 'system', ['ExtrinsicFailed', 'ExtrinsicSuccess'], ({
      event: {
        data,
        method
      }
    }) => method === 'ExtrinsicSuccess' ? data[0] : data[1])[0];
  }

  class SubmittableResult {
    constructor({
      dispatchError,
      dispatchInfo,
      events,
      internalError,
      status
    }) {
      this.dispatchError = void 0;
      this.dispatchInfo = void 0;
      this.internalError = void 0;
      this.events = void 0;
      this.status = void 0;
      this.dispatchError = dispatchError || extractError(events);
      this.dispatchInfo = dispatchInfo || extractInfo(events);
      this.events = events || [];
      this.internalError = internalError;
      this.status = status;
    }

    get isCompleted() {
      return this.isError || this.status.isInBlock || this.status.isFinalized;
    }

    get isError() {
      return this.status.isDropped || this.status.isFinalityTimeout || this.status.isInvalid || this.status.isUsurped;
    }

    get isFinalized() {
      return this.status.isFinalized;
    }

    get isInBlock() {
      return this.status.isInBlock;
    }

    get isWarning() {
      return this.status.isRetracted;
    }
    /**
     * @description Filters EventRecords for the specified method & section (there could be multiple)
     */


    filterRecords(section, method) {
      return filterAndApply(this.events, section, Array.isArray(method) ? method : [method], recordIdentity);
    }
    /**
     * @description Finds an EventRecord for the specified method & section
     */


    findRecord(section, method) {
      return this.filterRecords(section, method)[0];
    }
    /**
     * @description Creates a human representation of the output
     */


    toHuman(isExtended) {
      var _this$dispatchError, _this$dispatchInfo, _this$internalError;

      return {
        dispatchError: (_this$dispatchError = this.dispatchError) === null || _this$dispatchError === void 0 ? void 0 : _this$dispatchError.toHuman(),
        dispatchInfo: (_this$dispatchInfo = this.dispatchInfo) === null || _this$dispatchInfo === void 0 ? void 0 : _this$dispatchInfo.toHuman(),
        events: this.events.map(event => event.toHuman(isExtended)),
        internalError: (_this$internalError = this.internalError) === null || _this$internalError === void 0 ? void 0 : _this$internalError.message.toString(),
        status: this.status.toHuman(isExtended)
      };
    }

  }

  function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$5(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  const identity = input => input;

  function createClass({
    api,
    apiType,
    decorateMethod
  }) {
    // an instance of the base extrinsic for us to extend
    const ExtrinsicBase = api.registry.createClass('Extrinsic');

    var _ignoreStatusCb = /*#__PURE__*/_classPrivateFieldKey("ignoreStatusCb");

    var _transformResult = /*#__PURE__*/_classPrivateFieldKey("transformResult");

    var _makeEraOptions = /*#__PURE__*/_classPrivateFieldKey("makeEraOptions");

    var _makeSignOptions = /*#__PURE__*/_classPrivateFieldKey("makeSignOptions");

    var _makeSignAndSendOptions = /*#__PURE__*/_classPrivateFieldKey("makeSignAndSendOptions");

    var _observeSign = /*#__PURE__*/_classPrivateFieldKey("observeSign");

    var _observeStatus = /*#__PURE__*/_classPrivateFieldKey("observeStatus");

    var _observeSend = /*#__PURE__*/_classPrivateFieldKey("observeSend");

    var _observeSubscribe = /*#__PURE__*/_classPrivateFieldKey("observeSubscribe");

    var _optionsOrNonce = /*#__PURE__*/_classPrivateFieldKey("optionsOrNonce");

    var _signViaSigner = /*#__PURE__*/_classPrivateFieldKey("signViaSigner");

    var _updateSigner = /*#__PURE__*/_classPrivateFieldKey("updateSigner");

    class Submittable extends ExtrinsicBase {
      constructor(registry, extrinsic) {
        super(registry, extrinsic, {
          version: api.extrinsicType
        });
        Object.defineProperty(this, _ignoreStatusCb, {
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, _transformResult, {
          writable: true,
          value: identity
        });
        Object.defineProperty(this, _makeEraOptions, {
          writable: true,
          value: (options, {
            header,
            mortalLength,
            nonce
          }) => {
            if (!header) {
              if (util.isNumber(options.era)) {
                // since we have no header, it is immortal, remove any option overrides
                // so we only supply the genesisHash and no era to the construction
                delete options.era;
                delete options.blockHash;
              }

              return _classPrivateFieldBase(this, _makeSignOptions)[_makeSignOptions](options, {
                nonce
              });
            }

            return _classPrivateFieldBase(this, _makeSignOptions)[_makeSignOptions](options, {
              blockHash: header.hash,
              era: this.registry.createType('ExtrinsicEra', {
                current: header.number,
                period: options.era || mortalLength
              }),
              nonce
            });
          }
        });
        Object.defineProperty(this, _makeSignOptions, {
          writable: true,
          value: (options, extras) => {
            return _objectSpread$5(_objectSpread$5(_objectSpread$5({
              blockHash: api.genesisHash,
              genesisHash: api.genesisHash
            }, options), extras), {}, {
              runtimeVersion: api.runtimeVersion,
              signedExtensions: api.registry.signedExtensions,
              version: api.extrinsicType
            });
          }
        });
        Object.defineProperty(this, _makeSignAndSendOptions, {
          writable: true,
          value: (optionsOrStatus, statusCb) => {
            let options = {};

            if (util.isFunction(optionsOrStatus)) {
              statusCb = optionsOrStatus;
            } else {
              options = _objectSpread$5({}, optionsOrStatus);
            }

            return [options, statusCb];
          }
        });
        Object.defineProperty(this, _observeSign, {
          writable: true,
          value: (account, optionsOrNonce) => {
            const address = isKeyringPair(account) ? account.address : account.toString();

            const options = _classPrivateFieldBase(this, _optionsOrNonce)[_optionsOrNonce](optionsOrNonce);

            let updateId;
            return api.derive.tx.signingInfo(address, options.nonce, options.era).pipe(first(), mergeMap(async signingInfo => {
              const eraOptions = _classPrivateFieldBase(this, _makeEraOptions)[_makeEraOptions](options, signingInfo);

              if (isKeyringPair(account)) {
                this.sign(account, eraOptions);
              } else {
                updateId = await _classPrivateFieldBase(this, _signViaSigner)[_signViaSigner](address, eraOptions, signingInfo.header);
              }
            }), mapTo(updateId));
          }
        });
        Object.defineProperty(this, _observeStatus, {
          writable: true,
          value: (hash, status) => {
            if (!status.isFinalized && !status.isInBlock) {
              return of(_classPrivateFieldBase(this, _transformResult)[_transformResult](new SubmittableResult({
                status
              })));
            }

            const blockHash = status.isInBlock ? status.asInBlock : status.asFinalized;
            return api.derive.tx.events(blockHash).pipe(map(({
              block,
              events
            }) => _classPrivateFieldBase(this, _transformResult)[_transformResult](new SubmittableResult({
              events: filterEvents(hash, block, events, status),
              status
            }))), catchError(internalError => of(_classPrivateFieldBase(this, _transformResult)[_transformResult](new SubmittableResult({
              internalError,
              status
            })))));
          }
        });
        Object.defineProperty(this, _observeSend, {
          writable: true,
          value: (updateId = -1) => {
            return api.rpc.author.submitExtrinsic(this).pipe(tap(hash => {
              _classPrivateFieldBase(this, _updateSigner)[_updateSigner](updateId, hash);
            }));
          }
        });
        Object.defineProperty(this, _observeSubscribe, {
          writable: true,
          value: (updateId = -1) => {
            const hash = this.hash;
            return api.rpc.author.submitAndWatchExtrinsic(this).pipe(switchMap(status => _classPrivateFieldBase(this, _observeStatus)[_observeStatus](hash, status)), tap(status => {
              _classPrivateFieldBase(this, _updateSigner)[_updateSigner](updateId, status);
            }));
          }
        });
        Object.defineProperty(this, _optionsOrNonce, {
          writable: true,
          value: (optionsOrNonce = {}) => {
            return util.isBn(optionsOrNonce) || util.isNumber(optionsOrNonce) ? {
              nonce: optionsOrNonce
            } : optionsOrNonce;
          }
        });
        Object.defineProperty(this, _signViaSigner, {
          writable: true,
          value: async (address, options, header) => {
            const signer = options.signer || api.signer;
            util.assert(signer, 'No signer specified, either via api.setSigner or via sign options. You possibly need to pass through an explicit keypair for the origin so it can be used for signing.');
            const payload = this.registry.createType('SignerPayload', _objectSpread$5(_objectSpread$5({}, options), {}, {
              address,
              blockNumber: header ? header.number : 0,
              method: this.method
            }));
            let result;

            if (signer.signPayload) {
              result = await signer.signPayload(payload.toPayload());
            } else if (signer.signRaw) {
              result = await signer.signRaw(payload.toRaw());
            } else {
              throw new Error('Invalid signer interface, it should implement either signPayload or signRaw (or both)');
            } // Here we explicitly call `toPayload()` again instead of working with an object
            // (reference) as passed to the signer. This means that we are sure that the
            // payload data is not modified from our inputs, but the signer


            super.addSignature(address, result.signature, payload.toPayload());
            return result.id;
          }
        });
        Object.defineProperty(this, _updateSigner, {
          writable: true,
          value: (updateId, status) => {
            if (updateId !== -1 && api.signer && api.signer.update) {
              api.signer.update(updateId, status);
            }
          }
        });
        _classPrivateFieldBase(this, _ignoreStatusCb)[_ignoreStatusCb] = apiType === 'rxjs';
      } // dry run an extrinsic


      dryRun(account, optionsOrHash) {
        if (util.isString(optionsOrHash) || util.isU8a(optionsOrHash)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return decorateMethod(() => api.rpc.system.dryRun(this.toHex(), optionsOrHash));
        } // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call


        return decorateMethod(() => _classPrivateFieldBase(this, _observeSign)[_observeSign](account, optionsOrHash).pipe(switchMap(() => api.rpc.system.dryRun(this.toHex()))))();
      } // calculate the payment info for this transaction (if signed and submitted)


      paymentInfo(account, optionsOrHash) {
        if (util.isString(optionsOrHash) || util.isU8a(optionsOrHash)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return decorateMethod(() => api.rpc.payment.queryInfo(this.toHex(), optionsOrHash));
        }

        const [allOptions] = _classPrivateFieldBase(this, _makeSignAndSendOptions)[_makeSignAndSendOptions](optionsOrHash);

        const address = isKeyringPair(account) ? account.address : account.toString(); // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call

        return decorateMethod(() => api.derive.tx.signingInfo(address, allOptions.nonce, allOptions.era).pipe(first(), switchMap(signingInfo => {
          // setup our options (same way as in signAndSend)
          const eraOptions = _classPrivateFieldBase(this, _makeEraOptions)[_makeEraOptions](allOptions, signingInfo);

          const signOptions = _classPrivateFieldBase(this, _makeSignOptions)[_makeSignOptions](eraOptions, {});

          this.signFake(address, signOptions);
          return api.rpc.payment.queryInfo(this.toHex());
        })))();
      } // send with an immediate Hash result


      // send implementation for both immediate Hash and statusCb variants
      send(statusCb) {
        const isSubscription = api.hasSubscriptions && (_classPrivateFieldBase(this, _ignoreStatusCb)[_ignoreStatusCb] || !!statusCb); // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call

        return decorateMethod(isSubscription ? _classPrivateFieldBase(this, _observeSubscribe)[_observeSubscribe] : _classPrivateFieldBase(this, _observeSend)[_observeSend])(statusCb);
      }
      /**
       * @description Sign a transaction, returning the this to allow chaining, i.e. .sign(...).send(). When options, e.g. nonce/blockHash are not specified, it will be inferred. To retrieve eg. nonce use `signAsync` (the preferred interface, this is provided for backwards compatibility)
       * @deprecated
       */


      sign(account, optionsOrNonce) {
        super.sign(account, _classPrivateFieldBase(this, _makeSignOptions)[_makeSignOptions](_classPrivateFieldBase(this, _optionsOrNonce)[_optionsOrNonce](optionsOrNonce), {}));
        return this;
      }
      /**
       * @description Signs a transaction, returning `this` to allow chaining. E.g.: `sign(...).send()`. Like `.signAndSend` this will retrieve the nonce and blockHash to send the tx with.
       */


      signAsync(account, optionsOrNonce) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
        return decorateMethod(() => _classPrivateFieldBase(this, _observeSign)[_observeSign](account, optionsOrNonce).pipe(mapTo(this)))();
      } // signAndSend with an immediate Hash result


      // signAndSend implementation for all 3 cases above
      signAndSend(account, optionsOrStatus, optionalStatusCb) {
        const [options, statusCb] = _classPrivateFieldBase(this, _makeSignAndSendOptions)[_makeSignAndSendOptions](optionsOrStatus, optionalStatusCb);

        const isSubscription = api.hasSubscriptions && (_classPrivateFieldBase(this, _ignoreStatusCb)[_ignoreStatusCb] || !!statusCb); // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call

        return decorateMethod(() => _classPrivateFieldBase(this, _observeSign)[_observeSign](account, options).pipe(switchMap(updateId => isSubscription ? _classPrivateFieldBase(this, _observeSubscribe)[_observeSubscribe](updateId) : _classPrivateFieldBase(this, _observeSend)[_observeSend](updateId))) // FIXME This is wrong, SubmittableResult is _not_ a codec
        )(statusCb);
      } // adds a transform to the result, applied before result is returned


      withResultTransform(transform) {
        _classPrivateFieldBase(this, _transformResult)[_transformResult] = transform;
        return this;
      }

    }

    return Submittable;
  }

  // Copyright 2017-2021 @axia-js/api authors & contributors
  function createSubmittable(apiType, api, decorateMethod) {
    const Submittable = createClass({
      api,
      apiType,
      decorateMethod
    });
    return extrinsic => new Submittable(api.registry, extrinsic);
  }

  // Copyright 2017-2021 @axia-js/api authors & contributors
  const l$2 = util.logger('api/augment');

  function logLength(type, values, and = []) {
    return values.length ? ` ${values.length} ${type}${and.length ? ' and' : ''}` : '';
  }

  function logValues(type, values) {
    return values.length ? `\n\t${type.padStart(7)}: ${values.sort().join(', ')}` : '';
  } // log details to console


  function warn(prefix, type, [added, removed]) {
    if (added.length || removed.length) {
      l$2.warn(`api.${prefix}: Found${logLength('added', added, removed)}${logLength('removed', removed)} ${type}:${logValues('added', added)}${logValues('removed', removed)}`);
    }
  }

  function extractKeys(src, dst) {
    return [Object.keys(src), Object.keys(dst)];
  }

  function findSectionExcludes(a, b) {
    return a.filter(section => !b.includes(section));
  }

  function extractSections(src, dst) {
    const [srcSections, dstSections] = extractKeys(src, dst);
    return [findSectionExcludes(srcSections, dstSections), findSectionExcludes(dstSections, srcSections)];
  }

  function findMethodExcludes(src, dst) {
    const srcSections = Object.keys(src);
    const dstSections = Object.keys(dst);
    return dstSections.filter(section => srcSections.includes(section)).reduce((rmMethods, section) => {
      const srcMethods = Object.keys(src[section]);
      return rmMethods.concat(...Object.keys(dst[section]).filter(method => !srcMethods.includes(method)).map(method => `${section}.${method}`));
    }, []);
  }

  function extractMethods(src, dst) {
    return [findMethodExcludes(dst, src), findMethodExcludes(src, dst)];
  }
  /**
   * Takes a decorated api section (e.g. api.tx) and augment it with the details. It does not override what is
   * already available, but rather just adds new missing ites into the result object.
   * @internal
   */


  function augmentObject(prefix, src, dst, fromEmpty = false) {
    if (fromEmpty) {
      Object.keys(dst).forEach(key => {
        delete dst[key];
      });
    }

    if (prefix && Object.keys(dst).length) {
      warn(prefix, 'modules', extractSections(src, dst));
      warn(prefix, 'calls', extractMethods(src, dst));
    }

    return Object.keys(src).reduce((newSection, sectionName) => {
      const section = src[sectionName];
      newSection[sectionName] = Object.keys(section).reduce((result, methodName) => {
        // TODO When it does match, check the actual details and warn when there are differences
        if (!result[methodName]) {
          result[methodName] = section[methodName];
        }

        return result;
      }, dst[sectionName] || {});
      return newSection;
    }, dst);
  }

  // Copyright 2017-2019 @axia-js/api authors & contributors

  function sig({
    lookup
  }, {
    method,
    section
  }, args) {
    return `${section}.${method}(${args.map(a => lookup.getTypeDef(a).type).join(', ')})`;
  } // sets up the arguments in the form of [creator, args] ready to be used in a storage
  // call. Additionally, it verifies that the correct number of arguments have been passed


  function extractStorageArgs(registry, creator, _args) {
    const args = _args.filter(arg => !util.isUndefined(arg));

    if (creator.meta.type.isPlain) {
      util.assert(args.length === 0, () => `${sig(registry, creator, [])} does not take any arguments, ${args.length} found`);
    } else {
      const {
        hashers,
        key
      } = creator.meta.type.asMap;
      const keys = hashers.length === 1 ? [key] : registry.lookup.getSiType(key).def.asTuple.map(t => t);
      util.assert(args.length === keys.length, () => `${sig(registry, creator, keys)} is a map, requiring ${keys.length} arguments, ${args.length} found`);
    } // pass as tuple


    return [creator, args];
  }

  var _eventemitter = /*#__PURE__*/_classPrivateFieldKey("eventemitter");

  class Events {
    constructor() {
      Object.defineProperty(this, _eventemitter, {
        writable: true,
        value: new EventEmitter()
      });
    }

    emit(type, ...args) {
      return _classPrivateFieldBase(this, _eventemitter)[_eventemitter].emit(type, ...args);
    }
    /**
     * @description Attach an eventemitter handler to listen to a specific event
     *
     * @param type The type of event to listen to. Available events are `connected`, `disconnected`, `ready` and `error`
     * @param handler The callback to be called when the event fires. Depending on the event type, it could fire with additional arguments.
     *
     * @example
     * <BR>
     *
     * ```javascript
     * api.on('connected', (): void => {
     *   console.log('API has been connected to the endpoint');
     * });
     *
     * api.on('disconnected', (): void => {
     *   console.log('API has been disconnected from the endpoint');
     * });
     * ```
     */


    on(type, handler) {
      _classPrivateFieldBase(this, _eventemitter)[_eventemitter].on(type, handler);

      return this;
    }
    /**
     * @description Remove the given eventemitter handler
     *
     * @param type The type of event the callback was attached to. Available events are `connected`, `disconnected`, `ready` and `error`
     * @param handler The callback to unregister.
     *
     * @example
     * <BR>
     *
     * ```javascript
     * const handler = (): void => {
     *  console.log('Connected !);
     * };
     *
     * // Start listening
     * api.on('connected', handler);
     *
     * // Stop listening
     * api.off('connected', handler);
     * ```
     */


    off(type, handler) {
      _classPrivateFieldBase(this, _eventemitter)[_eventemitter].removeListener(type, handler);

      return this;
    }
    /**
     * @description Attach an one-time eventemitter handler to listen to a specific event
     *
     * @param type The type of event to listen to. Available events are `connected`, `disconnected`, `ready` and `error`
     * @param handler The callback to be called when the event fires. Depending on the event type, it could fire with additional arguments.
     *
     * @example
     * <BR>
     *
     * ```javascript
     * api.once('connected', (): void => {
     *   console.log('API has been connected to the endpoint');
     * });
     *
     * api.once('disconnected', (): void => {
     *   console.log('API has been disconnected from the endpoint');
     * });
     * ```
     */


    once(type, handler) {
      _classPrivateFieldBase(this, _eventemitter)[_eventemitter].once(type, handler);

      return this;
    }

  }

  function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$4(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  // the max amount of keys/values that we will retrieve at once
  const PAGE_SIZE_K = 1000; // limit aligned with the 1k on the node (trie lookups are heavy)

  const PAGE_SIZE_V = 250; // limited since the data may be very large (e.g. misfiring elections)

  const l$1 = util.logger('api/init');
  let instanceCounter = 0;

  var _instanceId = /*#__PURE__*/_classPrivateFieldKey("instanceId");

  var _registry = /*#__PURE__*/_classPrivateFieldKey("registry");

  class Decorate extends Events {
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
      this.__phantom = new util.BN(0);
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

      _classPrivateFieldBase(this, _instanceId)[_instanceId] = `${++instanceCounter}`;
      _classPrivateFieldBase(this, _registry)[_registry] = ((_options$source = options.source) === null || _options$source === void 0 ? void 0 : _options$source.registry) || options.registry || new types.TypeRegistry();
      this._rx.registry = _classPrivateFieldBase(this, _registry)[_registry];
      const thisProvider = options.source ? options.source._rpcCore.provider.clone() : options.provider || new WsProvider();
      this._decorateMethod = decorateMethod;
      this._options = options;
      this._type = type; // The RPC interface decorates the known interfaces on init

      this._rpcCore = new RpcCore(_classPrivateFieldBase(this, _instanceId)[_instanceId], _classPrivateFieldBase(this, _registry)[_registry], thisProvider, this._options.rpc);
      this._isConnected = new BehaviorSubject(this._rpcCore.provider.isConnected);
      this._rx.hasSubscriptions = this._rpcCore.provider.hasSubscriptions;
    }
    /**
     * @description Return the current used registry
     */


    get registry() {
      return _classPrivateFieldBase(this, _registry)[_registry];
    }
    /**
     * @description Creates an instance of a type as registered
     */


    createType(type, ...params) {
      return _classPrivateFieldBase(this, _registry)[_registry].createType(type, ...params);
    }
    /**
     * @description Register additional user-defined of chain-specific types in the type registry
     */


    registerTypes(types) {
      types && _classPrivateFieldBase(this, _registry)[_registry].register(types);
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
        registry.decoratedMeta = types.expandMetadata(registry.registry, registry.metadata);
      } // adjust the versioned registry


      augmentObject('consts', registry.decoratedMeta.consts, decoratedApi.consts, fromEmpty);
      augmentObject('errors', registry.decoratedMeta.errors, decoratedApi.errors, fromEmpty);
      augmentObject('events', registry.decoratedMeta.events, decoratedApi.events, fromEmpty);
      const storage = blockHash ? this._decorateStorageAt(registry.decoratedMeta, this._decorateMethod, blockHash) : this._decorateStorage(registry.decoratedMeta, this._decorateMethod);
      augmentObject('query', storage, decoratedApi.query, fromEmpty);
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
        augmentObject('tx', this._decorateExtrinsics(decoratedMeta, this._decorateMethod), this._extrinsics, false);
        augmentObject(null, this._decorateExtrinsics(decoratedMeta, this._rxDecorateMethod), this._rx.tx, false);
      } // rx


      augmentObject(null, this._decorateStorage(decoratedMeta, this._rxDecorateMethod), this._rx.query, fromEmpty);
      augmentObject(null, decoratedMeta.consts, this._rx.consts, fromEmpty);
    }
    /**
     * @deprecated
     * backwards compatible endpoint for metadata injection, may be removed in the future (However, it is still useful for testing injection)
     */


    injectMetadata(metadata, fromEmpty, registry) {
      this._injectMetadata({
        metadata,
        registry: registry || _classPrivateFieldBase(this, _registry)[_registry],
        specName: _classPrivateFieldBase(this, _registry)[_registry].createType('Text'),
        specVersion: util.BN_ZERO
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
      const allKeys = allKnown.reduce((allKeys, [, {
        alias,
        endpoint,
        method,
        pubsub,
        section
      }]) => {
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
      const deletion = allKnown.filter(([k]) => hasResults && !exposed.includes(k) && k !== 'rpc_methods');

      if (unknown.length) {
        l$1.warn(`RPC methods not decorated: ${unknown.join(', ')}`);
      } // loop through all entries we have (populated in decorate) and filter as required
      // only remove when we have results and method missing, or with no results if optional


      deletion.forEach(([, {
        method,
        section
      }]) => {
        delete this._rpc[section][method];
        delete this._rx.rpc[section][method];
      });
    }

    _decorateRpc(rpc, decorateMethod, input = {}) {
      return rpc.sections.reduce((out, _sectionName) => {
        const sectionName = _sectionName;

        if (!out[sectionName]) {
          // out and section here are horrors to get right from a typing perspective :(
          out[sectionName] = Object.entries(rpc[sectionName]).reduce((section, [methodName, method]) => {
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

    _decorateExtrinsics({
      tx
    }, decorateMethod) {
      const creator = createSubmittable(this._type, this._rx, decorateMethod);
      return Object.entries(tx).reduce((out, [name, section]) => {
        out[name] = Object.entries(section).reduce((out, [name, method]) => {
          out[name] = this._decorateExtrinsicEntry(method, creator);
          return out;
        }, {});
        return out;
      }, creator);
    }

    _decorateExtrinsicEntry(method, creator) {
      const decorated = (...params) => creator(method(...params)); // pass through the `.is`


      decorated.is = other => method.is(other); // eslint-disable-next-line @typescript-eslint/no-unsafe-return


      return this._decorateFunctionMeta(method, decorated);
    }

    _decorateStorage({
      query
    }, decorateMethod) {
      return Object.entries(query).reduce((out, [name, section]) => {
        out[name] = Object.entries(section).reduce((out, [name, method]) => {
          out[name] = this._decorateStorageEntry(method, decorateMethod);
          return out;
        }, {});
        return out;
      }, {});
    }

    _decorateStorageAt({
      query
    }, decorateMethod, blockHash) {
      return Object.entries(query).reduce((out, [name, section]) => {
        out[name] = Object.entries(section).reduce((out, [name, method]) => {
          out[name] = this._decorateStorageEntryAt(method, decorateMethod, blockHash);
          return out;
        }, {});
        return out;
      }, {});
    }

    _decorateStorageEntry(creator, decorateMethod) {
      // get the storage arguments, with DoubleMap as an array entry, otherwise spread
      const getArgs = args => extractStorageArgs(_classPrivateFieldBase(this, _registry)[_registry], creator, args); // Disable this where it occurs for each field we are decorating

      /* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */


      const decorated = this._decorateStorageCall(creator, decorateMethod);

      decorated.creator = creator;
      decorated.at = decorateMethod((hash, ...args) => this._rpcCore.state.getStorage(getArgs(args), hash));
      decorated.hash = decorateMethod((...args) => this._rpcCore.state.getStorageHash(getArgs(args)));

      decorated.is = key => key.section === creator.section && key.method === creator.method;

      decorated.key = (...args) => util.u8aToHex(util.compactStripLength(creator(...args))[1]);

      decorated.keyPrefix = (...args) => util.u8aToHex(creator.keyPrefix(...args));

      decorated.range = decorateMethod((range, ...args) => this._decorateStorageRange(decorated, args, range));
      decorated.size = decorateMethod((...args) => this._rpcCore.state.getStorageSize(getArgs(args)));
      decorated.sizeAt = decorateMethod((hash, ...args) => this._rpcCore.state.getStorageSize(getArgs(args), hash)); // .keys() & .entries() only available on map types

      if (creator.iterKey && creator.meta.type.isMap) {
        decorated.entries = decorateMethod(memo(_classPrivateFieldBase(this, _instanceId)[_instanceId], (...args) => this._retrieveMapEntries(creator, null, args)));
        decorated.entriesAt = decorateMethod(memo(_classPrivateFieldBase(this, _instanceId)[_instanceId], (hash, ...args) => this._retrieveMapEntries(creator, hash, args)));
        decorated.entriesPaged = decorateMethod(memo(_classPrivateFieldBase(this, _instanceId)[_instanceId], opts => this._retrieveMapEntriesPaged(creator, opts)));
        decorated.keys = decorateMethod(memo(_classPrivateFieldBase(this, _instanceId)[_instanceId], (...args) => this._retrieveMapKeys(creator, null, args)));
        decorated.keysAt = decorateMethod(memo(_classPrivateFieldBase(this, _instanceId)[_instanceId], (hash, ...args) => this._retrieveMapKeys(creator, hash, args)));
        decorated.keysPaged = decorateMethod(memo(_classPrivateFieldBase(this, _instanceId)[_instanceId], opts => this._retrieveMapKeysPaged(creator, opts)));
      }

      if (this.supportMulti && creator.meta.type.isMap) {
        // When using double map storage function, user need to pass double map key as an array
        decorated.multi = decorateMethod(args => creator.meta.type.asMap.hashers.length === 1 ? this._retrieveMulti(args.map(a => [creator, [a]])) : this._retrieveMulti(args.map(a => [creator, a])));
      }
      /* eslint-enable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */


      return this._decorateFunctionMeta(creator, decorated);
    }

    _decorateStorageEntryAt(creator, decorateMethod, blockHash) {
      // get the storage arguments, with DoubleMap as an array entry, otherwise spread
      const getArgs = args => extractStorageArgs(_classPrivateFieldBase(this, _registry)[_registry], creator, args); // Disable this where it occurs for each field we are decorating

      /* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */


      const decorated = decorateMethod((...args) => this._rpcCore.state.getStorage(getArgs(args), blockHash));
      decorated.creator = creator;
      decorated.hash = decorateMethod((...args) => this._rpcCore.state.getStorageHash(getArgs(args), blockHash));

      decorated.is = key => key.section === creator.section && key.method === creator.method;

      decorated.key = (...args) => util.u8aToHex(util.compactStripLength(creator(creator.meta.type.isPlain ? undefined : args))[1]);

      decorated.keyPrefix = (...keys) => util.u8aToHex(creator.keyPrefix(...keys));

      decorated.size = decorateMethod((...args) => this._rpcCore.state.getStorageSize(getArgs(args), blockHash)); // FIXME NMap support
      // .keys() & .entries() only available on map types

      if (creator.iterKey && creator.meta.type.isMap) {
        decorated.entries = decorateMethod(memo(_classPrivateFieldBase(this, _instanceId)[_instanceId], (...args) => this._retrieveMapEntries(creator, blockHash, args)));
        decorated.keys = decorateMethod(memo(_classPrivateFieldBase(this, _instanceId)[_instanceId], (...args) => this._retrieveMapKeys(creator, blockHash, args)));
      }
      /* eslint-enable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */


      return this._decorateFunctionMeta(creator, decorated);
    } // Decorate the base storage call. In the case or rxjs or promise-without-callback (await)
    // we make a subscription, alternatively we push this through a single-shot query


    _decorateStorageCall(creator, decorateMethod) {
      return decorateMethod((...args) => {
        return this.hasSubscriptions ? this._rpcCore.state.subscribeStorage([extractStorageArgs(_classPrivateFieldBase(this, _registry)[_registry], creator, args)]).pipe(map(([data]) => data) // extract first/only result from list
        ) : this._rpcCore.state.getStorage(extractStorageArgs(_classPrivateFieldBase(this, _registry)[_registry], creator, args));
      }, {
        methodName: creator.method,
        overrideNoSub: (...args) => this._rpcCore.state.getStorage(extractStorageArgs(_classPrivateFieldBase(this, _registry)[_registry], creator, args))
      });
    }

    _decorateStorageRange(decorated, args, range) {
      const outputType = types.unwrapStorageType(_classPrivateFieldBase(this, _registry)[_registry], decorated.creator.meta.type, decorated.creator.meta.modifier.isOptional);
      return this._rpcCore.state.queryStorage([decorated.key(...args)], ...range).pipe(map(result => result.map(([blockHash, [value]]) => [blockHash, this.createType(outputType, value.isSome ? value.unwrap().toHex() : undefined)])));
    } // retrieve a set of values for a specific set of keys - here we chunk the keys into PAGE_SIZE sizes


    _retrieveMulti(keys) {
      if (!keys.length) {
        return of([]);
      }

      const queryCall = this.hasSubscriptions ? this._rpcCore.state.subscribeStorage : this._rpcCore.state.queryStorageAt;
      return combineLatest(util.arrayChunk(keys, PAGE_SIZE_V).map(keys => queryCall(keys))).pipe(map(util.arrayFlatten));
    }

    _retrieveMapKeys({
      iterKey,
      meta,
      method,
      section
    }, at, args) {
      util.assert(iterKey && meta.type.isMap, 'keys can only be retrieved on maps');
      const headKey = iterKey(...args).toHex();
      const startSubject = new BehaviorSubject(headKey);
      const queryCall = at ? startKey => this._rpcCore.state.getKeysPaged(headKey, PAGE_SIZE_K, startKey, at) : startKey => this._rpcCore.state.getKeysPaged(headKey, PAGE_SIZE_K, startKey);
      return startSubject.pipe(switchMap(queryCall), map(keys => keys.map(key => key.setMeta(meta, section, method))), tap(keys => {
        setTimeout(() => {
          keys.length === PAGE_SIZE_K ? startSubject.next(keys[PAGE_SIZE_K - 1].toHex()) : startSubject.complete();
        }, 0);
      }), toArray(), // toArray since we want to startSubject to be completed
      map(util.arrayFlatten));
    }

    _retrieveMapKeysPaged({
      iterKey,
      meta,
      method,
      section
    }, opts) {
      util.assert(iterKey && meta.type.isMap, 'keys can only be retrieved on maps');
      const headKey = iterKey(...opts.args).toHex();
      return this._rpcCore.state.getKeysPaged(headKey, opts.pageSize, opts.startKey || headKey).pipe(map(keys => keys.map(key => key.setMeta(meta, section, method))));
    }

    _retrieveMapEntries(entry, at, args) {
      const query = at ? keyset => this._rpcCore.state.queryStorageAt(keyset, at) : keyset => this._rpcCore.state.queryStorageAt(keyset);
      return this._retrieveMapKeys(entry, at, args).pipe(switchMap(keys => keys.length ? combineLatest(util.arrayChunk(keys, PAGE_SIZE_V).map(query)).pipe(map(valsArr => util.arrayFlatten(valsArr).map((value, index) => [keys[index], value]))) : of([])));
    }

    _retrieveMapEntriesPaged(entry, opts) {
      return this._retrieveMapKeysPaged(entry, opts).pipe(switchMap(keys => keys.length ? this._rpcCore.state.queryStorageAt(keys).pipe(map(valsArr => valsArr.map((value, index) => [keys[index], value]))) : of([])));
    }

    _decorateDeriveRx(decorateMethod) {
      var _this$_runtimeVersion, _this$_options$typesB, _this$_options$typesB2, _this$_options$typesB3;

      const specName = (_this$_runtimeVersion = this._runtimeVersion) === null || _this$_runtimeVersion === void 0 ? void 0 : _this$_runtimeVersion.specName.toString();

      const derives = _objectSpread$4(_objectSpread$4({}, this._options.derives), ((_this$_options$typesB = this._options.typesBundle) === null || _this$_options$typesB === void 0 ? void 0 : (_this$_options$typesB2 = _this$_options$typesB.spec) === null || _this$_options$typesB2 === void 0 ? void 0 : (_this$_options$typesB3 = _this$_options$typesB2[specName !== null && specName !== void 0 ? specName : '']) === null || _this$_options$typesB3 === void 0 ? void 0 : _this$_options$typesB3.derives) || {}); // Pull in derive from api-derive


      const derive = decorateDerive(_classPrivateFieldBase(this, _instanceId)[_instanceId], this._rx, derives);
      return decorateSections(derive, decorateMethod);
    }

    _decorateDerive(decorateMethod) {
      return decorateSections(this._rx.derive, decorateMethod);
    }
    /**
     * Put the `this.onCall` function of ApiRx here, because it is needed by
     * `api._rx`.
     */


  }

  function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$3(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  const KEEPALIVE_INTERVAL = 10000;
  const l = util.logger('api/init');

  var _healthTimer = /*#__PURE__*/_classPrivateFieldKey("healthTimer");

  var _registries = /*#__PURE__*/_classPrivateFieldKey("registries");

  var _updateSub = /*#__PURE__*/_classPrivateFieldKey("updateSub");

  var _onProviderConnect = /*#__PURE__*/_classPrivateFieldKey("onProviderConnect");

  var _onProviderDisconnect = /*#__PURE__*/_classPrivateFieldKey("onProviderDisconnect");

  var _onProviderError = /*#__PURE__*/_classPrivateFieldKey("onProviderError");

  class Init extends Decorate {
    constructor(options, type, decorateMethod) {
      super(options, type, decorateMethod); // all injected types added to the registry for overrides

      Object.defineProperty(this, _healthTimer, {
        writable: true,
        value: null
      });
      Object.defineProperty(this, _registries, {
        writable: true,
        value: []
      });
      Object.defineProperty(this, _updateSub, {
        writable: true,
        value: null
      });
      Object.defineProperty(this, _onProviderConnect, {
        writable: true,
        value: async () => {
          this._isConnected.next(true);

          this.emit('connected');

          try {
            const [hasMeta, cryptoReady] = await Promise.all([this._loadMeta(), this._options.initWasm === false ? Promise.resolve(true) : utilCrypto.cryptoWaitReady()]);

            this._subscribeHealth();

            if (hasMeta && !this._isReady && cryptoReady) {
              this._isReady = true;
              this.emit('ready', this);
            }
          } catch (_error) {
            const error = new Error(`FATAL: Unable to initialize the API: ${_error.message}`);
            l.error(error);
            this.emit('error', error);
          }
        }
      });
      Object.defineProperty(this, _onProviderDisconnect, {
        writable: true,
        value: () => {
          this._isConnected.next(false);

          this._unsubscribeHealth();

          this.emit('disconnected');
        }
      });
      Object.defineProperty(this, _onProviderError, {
        writable: true,
        value: error => {
          this.emit('error', error);
        }
      });
      this.registry.setKnownTypes(options); // We only register the types (global) if this is not a cloned instance.
      // Do right up-front, so we get in the user types before we are actually
      // doing anything on-chain, this ensures we have the overrides in-place

      if (!options.source) {
        this.registerTypes(options.types);
      } else {
        _classPrivateFieldBase(this, _registries)[_registries] = _classPrivateFieldBase(options.source, _registries)[_registries];
      }

      this._rpc = this._decorateRpc(this._rpcCore, this._decorateMethod);
      this._rx.rpc = this._decorateRpc(this._rpcCore, this._rxDecorateMethod);

      if (this.supportMulti) {
        this._queryMulti = this._decorateMulti(this._decorateMethod);
        this._rx.queryMulti = this._decorateMulti(this._rxDecorateMethod);
      }

      this._rx.signer = options.signer;

      this._rpcCore.setRegistrySwap(blockHash => this.getBlockRegistry(blockHash));

      if (this.hasSubscriptions) {
        this._rpcCore.provider.on('disconnected', _classPrivateFieldBase(this, _onProviderDisconnect)[_onProviderDisconnect]);

        this._rpcCore.provider.on('error', _classPrivateFieldBase(this, _onProviderError)[_onProviderError]);

        this._rpcCore.provider.on('connected', _classPrivateFieldBase(this, _onProviderConnect)[_onProviderConnect]);
      } else {
        l.warn('Api will be available in a limited mode since the provider does not support subscriptions');
      } // If the provider was instantiated earlier, and has already emitted a
      // 'connected' event, then the `on('connected')` won't fire anymore. To
      // cater for this case, we call manually `this._onProviderConnect`.


      if (this._rpcCore.provider.isConnected) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        _classPrivateFieldBase(this, _onProviderConnect)[_onProviderConnect]();
      }
    }
    /**
     * @description Decorates a registry based on the runtime version
     */


    _initRegistry(registry, chain, version, metadata, chainProps) {
      registry.setChainProperties(chainProps || this.registry.getChainProperties());
      registry.setKnownTypes(this._options);
      registry.register(getSpecTypes(registry, chain, version.specName, version.specVersion));
      registry.setHasher(getSpecHasher(registry, chain, version.specName)); // for bundled types, pull through the aliases defined

      if (registry.knownTypes.typesBundle) {
        registry.knownTypes.typesAlias = getSpecAlias(registry, chain, version.specName);
      }

      registry.setMetadata(metadata, undefined, _objectSpread$3(_objectSpread$3({}, getSpecExtensions(registry, chain, version.specName)), this._options.signedExtensions || {}));
    }
    /**
     * @description Returns the default versioned registry
     */


    _getDefaultRegistry() {
      // get the default registry version
      const thisRegistry = _classPrivateFieldBase(this, _registries)[_registries].find(({
        isDefault
      }) => isDefault);

      util.assert(thisRegistry, 'Initialization error, cannot find the default registry');
      return thisRegistry;
    }
    /**
     * @description Returns a decorated API instance at a specific point in time
     */


    async at(blockHash) {
      const u8aHash = util.u8aToU8a(blockHash);
      const registry = await this.getBlockRegistry(u8aHash); // always create a new decoration for this specific hash

      return this._createDecorated(registry, true, u8aHash).decoratedApi;
    }
    /**
     * @description Sets up a registry based on the block hash defined
     */


    async getBlockRegistry(blockHash) {
      const existingViaHash = _classPrivateFieldBase(this, _registries)[_registries].find(({
        lastBlockHash
      }) => lastBlockHash && util.u8aEq(lastBlockHash, blockHash));

      if (existingViaHash) {
        return existingViaHash;
      } // ensure we have everything required


      util.assert(this._genesisHash && this._runtimeVersion, 'Cannot retrieve data on an uninitialized chain'); // We have to assume that on the RPC layer the calls used here does not call back into
      // the registry swap, so getHeader & getRuntimeVersion should not be historic

      const header = this.registry.createType('HeaderPartial', this._genesisHash.eq(blockHash) ? {
        number: util.BN_ZERO,
        parentHash: this._genesisHash
      } : await firstValueFrom(this._rpcCore.chain.getHeader.json(blockHash)));
      util.assert(!header.parentHash.isEmpty, 'Unable to retrieve header and parent from supplied hash'); // get the runtime version, either on-chain or via an known upgrade history

      const [firstVersion, lastVersion] = getUpgradeVersion(this._genesisHash, header.number);
      const version = this.registry.createType('RuntimeVersionPartial', firstVersion && (lastVersion || firstVersion.specVersion.eq(this._runtimeVersion.specVersion)) ? {
        specName: this._runtimeVersion.specName,
        specVersion: firstVersion.specVersion
      } : await firstValueFrom(this._rpcCore.state.getRuntimeVersion.json(header.parentHash))); // check for pre-existing registries. We also check specName, e.g. it
      // could be changed like in Westmint with upgrade from  shell -> westmint

      const existingViaVersion = _classPrivateFieldBase(this, _registries)[_registries].find(({
        specName,
        specVersion
      }) => specName.eq(version.specName) && specVersion.eq(version.specVersion));

      if (existingViaVersion) {
        existingViaVersion.lastBlockHash = blockHash;
        return existingViaVersion;
      } // nothing has been found, construct new


      const registry = new types.TypeRegistry(blockHash);
      const metadata = new types.Metadata(registry, await firstValueFrom(this._rpcCore.state.getMetadata.raw(header.parentHash)));

      this._initRegistry(registry, this._runtimeChain, version, metadata); // add our new registry


      const result = {
        lastBlockHash: blockHash,
        metadata,
        registry,
        specName: version.specName,
        specVersion: version.specVersion
      };

      _classPrivateFieldBase(this, _registries)[_registries].push(result); // TODO This could be useful for historic, disabled due to cross-looping, i.e. .at queries
      // this._detectCapabilities(registry, blockHash);


      return result;
    }

    async _loadMeta() {
      var _this$_options$source;

      // on re-connection to the same chain, we don't want to re-do everything from chain again
      if (this._isReady) {
        return true;
      }

      this._unsubscribeUpdates(); // only load from on-chain if we are not a clone (default path), alternatively
      // just use the values from the source instance provided


      [this._genesisHash, this._runtimeMetadata] = (_this$_options$source = this._options.source) !== null && _this$_options$source !== void 0 && _this$_options$source._isReady ? await this._metaFromSource(this._options.source) : await this._metaFromChain(this._options.metadata);
      return this._initFromMeta(this._runtimeMetadata);
    } // eslint-disable-next-line @typescript-eslint/require-await


    async _metaFromSource(source) {
      this._extrinsicType = source.extrinsicVersion;
      this._runtimeChain = source.runtimeChain;
      this._runtimeVersion = source.runtimeVersion;
      const methods = []; // manually build a list of all available methods in this RPC, we are
      // going to filter on it to align the cloned RPC without making a call

      Object.keys(source.rpc).forEach(section => {
        Object.keys(source.rpc[section]).forEach(method => {
          methods.push(`${section}_${method}`);
        });
      });

      this._filterRpc(methods, getSpecRpc(this.registry, source.runtimeChain, source.runtimeVersion.specName));

      return [source.genesisHash, source.runtimeMetadata];
    }

    _detectCapabilities(registry, blockHash) {
      firstValueFrom(detectedCapabilities(this._rx, blockHash)).then(types => {
        if (Object.keys(types).length) {
          registry.register(types);
          l.debug(() => `Capabilities detected${blockHash ? ` (${util.u8aToHex(util.u8aToU8a(blockHash))})` : ''}: ${util.stringify(types)}`);
        }
      }).catch(undefined);
      return true;
    } // subscribe to metadata updates, inject the types on changes


    _subscribeUpdates() {
      if (_classPrivateFieldBase(this, _updateSub)[_updateSub] || !this.hasSubscriptions) {
        return;
      }

      _classPrivateFieldBase(this, _updateSub)[_updateSub] = this._rpcCore.state.subscribeRuntimeVersion().pipe(switchMap(version => {
        var _this$_runtimeVersion;

        return (// only retrieve the metadata when the on-chain version has been changed
          (_this$_runtimeVersion = this._runtimeVersion) !== null && _this$_runtimeVersion !== void 0 && _this$_runtimeVersion.specVersion.eq(version.specVersion) ? of(false) : this._rpcCore.state.getMetadata().pipe(map(metadata => {
            l.log(`Runtime version updated to spec=${version.specVersion.toString()}, tx=${version.transactionVersion.toString()}`);
            this._runtimeMetadata = metadata;
            this._runtimeVersion = version;
            this._rx.runtimeVersion = version; // update the default registry version

            const thisRegistry = this._getDefaultRegistry(); // setup the data as per the current versions


            thisRegistry.metadata = metadata;
            thisRegistry.specVersion = version.specVersion; // clear the registry types to ensure that we override correctly

            this._initRegistry(thisRegistry.registry.init(), this._runtimeChain, version, metadata);

            this._injectMetadata(thisRegistry, false);

            return this._detectCapabilities(thisRegistry.registry);
          }))
        );
      })).subscribe();
    }

    async _metaFromChain(optMetadata) {
      const [genesisHash, runtimeVersion, chain, chainProps, rpcMethods, chainMetadata] = await Promise.all([firstValueFrom(this._rpcCore.chain.getBlockHash(0)), firstValueFrom(this._rpcCore.state.getRuntimeVersion()), firstValueFrom(this._rpcCore.system.chain()), firstValueFrom(this._rpcCore.system.properties()), firstValueFrom(this._rpcCore.rpc.methods()), optMetadata ? Promise.resolve(null) : firstValueFrom(this._rpcCore.state.getMetadata())]); // set our chain version & genesisHash as returned

      this._runtimeChain = chain;
      this._runtimeVersion = runtimeVersion;
      this._rx.runtimeVersion = runtimeVersion; // retrieve metadata, either from chain  or as pass-in via options

      const metadataKey = `${genesisHash.toHex() || '0x'}-${runtimeVersion.specVersion.toString()}`;
      const metadata = chainMetadata || (optMetadata && optMetadata[metadataKey] ? new types.Metadata(this.registry, optMetadata[metadataKey]) : await firstValueFrom(this._rpcCore.state.getMetadata())); // initializes the registry & RPC

      this._initRegistry(this.registry, chain, runtimeVersion, metadata, chainProps);

      this._filterRpc(rpcMethods.methods.map(t => t.toString()), getSpecRpc(this.registry, chain, runtimeVersion.specName));

      this._subscribeUpdates(); // setup the initial registry, when we have none


      if (!_classPrivateFieldBase(this, _registries)[_registries].length) {
        _classPrivateFieldBase(this, _registries)[_registries].push({
          isDefault: true,
          metadata,
          registry: this.registry,
          specName: runtimeVersion.specName,
          specVersion: runtimeVersion.specVersion
        });
      } // get unique types & validate


      metadata.getUniqTypes(this._options.throwOnUnknown || false);
      return [genesisHash, metadata];
    }

    _initFromMeta(metadata) {
      this._extrinsicType = metadata.asLatest.extrinsic.version.toNumber();
      this._rx.extrinsicType = this._extrinsicType;
      this._rx.genesisHash = this._genesisHash;
      this._rx.runtimeVersion = this._runtimeVersion; // must be set here
      // inject metadata and adjust the types as detected

      this._injectMetadata(this._getDefaultRegistry(), true); // derive is last, since it uses the decorated rx


      this._rx.derive = this._decorateDeriveRx(this._rxDecorateMethod);
      this._derive = this._decorateDerive(this._decorateMethod); // detect the on-chain capabilities

      this._detectCapabilities(this.registry);

      return true;
    }

    _subscribeHealth() {
      // Only enable the health keepalive on WS, not needed on HTTP
      _classPrivateFieldBase(this, _healthTimer)[_healthTimer] = this.hasSubscriptions ? setInterval(() => {
        firstValueFrom(this._rpcCore.system.health()).catch(() => undefined);
      }, KEEPALIVE_INTERVAL) : null;
    }

    _unsubscribeHealth() {
      if (_classPrivateFieldBase(this, _healthTimer)[_healthTimer]) {
        clearInterval(_classPrivateFieldBase(this, _healthTimer)[_healthTimer]);
        _classPrivateFieldBase(this, _healthTimer)[_healthTimer] = null;
      }
    }

    _unsubscribeUpdates() {
      if (_classPrivateFieldBase(this, _updateSub)[_updateSub]) {
        _classPrivateFieldBase(this, _updateSub)[_updateSub].unsubscribe();

        _classPrivateFieldBase(this, _updateSub)[_updateSub] = null;
      }
    }

    _unsubscribe() {
      this._unsubscribeHealth();

      this._unsubscribeUpdates();
    }

  }

  // Copyright 2017-2021 @axia-js/api authors & contributors

  function assertResult(value) {
    return util.assertReturn(value, 'Api needs to be initialized before using, listen on \'ready\'');
  }

  class Getters extends Init {
    /**
     * @description Contains the parameter types (constants) of all modules.
     *
     * The values are instances of the appropriate type and are accessible using `section`.`constantName`,
     *
     * @example
     * <BR>
     *
     * ```javascript
     * console.log(api.consts.democracy.enactmentPeriod.toString())
     * ```
     */
    get consts() {
      return assertResult(this._consts);
    }
    /**
     * @description Derived results that are injected into the API, allowing for combinations of various query results.
     *
     * @example
     * <BR>
     *
     * ```javascript
     * api.derive.chain.bestNumber((number) => {
     *   console.log('best number', number);
     * });
     * ```
     */


    get derive() {
      return assertResult(this._derive);
    }
    /**
     * @description Errors from metadata
     */


    get errors() {
      return assertResult(this._errors);
    }
    /**
     * @description Events from metadata
     */


    get events() {
      return assertResult(this._events);
    }
    /**
     * @description  Returns the version of extrinsics in-use on this chain
     */


    get extrinsicVersion() {
      return this._extrinsicType;
    }
    /**
     * @description Contains the genesis Hash of the attached chain. Apart from being useful to determine the actual chain, it can also be used to sign immortal transactions.
     */


    get genesisHash() {
      return assertResult(this._genesisHash);
    }
    /**
     * @description true is the underlying provider is connected
     */


    get isConnected() {
      return this._isConnected.getValue();
    }
    /**
     * @description The library information name & version (from package.json)
     */


    get libraryInfo() {
      return `${packageInfo.name} v${packageInfo.version}`;
    }
    /**
     * @description Contains all the chain state modules and their subsequent methods in the API. These are attached dynamically from the runtime metadata.
     *
     * All calls inside the namespace, is denoted by `section`.`method` and may take an optional query parameter. As an example, `api.query.timestamp.now()` (current block timestamp) does not take parameters, while `api.query.system.account(<accountId>)` (retrieving the associated nonce & balances for an account), takes the `AccountId` as a parameter.
     *
     * @example
     * <BR>
     *
     * ```javascript
     * api.query.system.account(<accountId>, ([nonce, balance]) => {
     *   console.log('new free balance', balance.free, 'new nonce', nonce);
     * });
     * ```
     */


    get query() {
      return assertResult(this._query);
    }
    /**
     * @description Allows for the querying of multiple storage entries and the combination thereof into a single result. This is a very optimal way to make multiple queries since it only makes a single connection to the node and retrieves the data over one subscription.
     *
     * @example
     * <BR>
     *
     * ```javascript
     * const unsub = await api.queryMulti(
     *   [
     *     // you can include the storage without any parameters
     *     api.query.balances.totalIssuance,
     *     // or you can pass parameters to the storage query
     *     [api.query.system.account, '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY']
     *   ],
     *   ([existential, [, { free }]]) => {
     *     console.log(`You have ${free.sub(existential)} more than the existential deposit`);
     *
     *     unsub();
     *   }
     * );
     * ```
     */


    get queryMulti() {
      return assertResult(this._queryMulti);
    }
    /**
     * @description Contains all the raw rpc sections and their subsequent methods in the API as defined by the jsonrpc interface definitions. Unlike the dynamic `api.query` and `api.tx` sections, these methods are fixed (although extensible with node upgrades) and not determined by the runtime.
     *
     * RPC endpoints available here allow for the query of chain, node and system information, in addition to providing interfaces for the raw queries of state (using known keys) and the submission of transactions.
     *
     * @example
     * <BR>
     *
     * ```javascript
     * api.rpc.chain.subscribeNewHeads((header) => {
     *   console.log('new header', header);
     * });
     * ```
     */


    get rpc() {
      return assertResult(this._rpc);
    }
    /**
     * @description Contains the chain information for the current node.
     */


    get runtimeChain() {
      return assertResult(this._runtimeChain);
    }
    /**
     * @description Yields the current attached runtime metadata. Generally this is only used to construct extrinsics & storage, but is useful for current runtime inspection.
     */


    get runtimeMetadata() {
      return assertResult(this._runtimeMetadata);
    }
    /**
     * @description Contains the version information for the current runtime.
     */


    get runtimeVersion() {
      return assertResult(this._runtimeVersion);
    }
    /**
     * @description The underlying Rx API interface
     */


    get rx() {
      return assertResult(this._rx);
    }
    /**
     * @description The type of this API instance, either 'rxjs' or 'promise'
     */


    get type() {
      return this._type;
    }
    /**
     * @description Contains all the extrinsic modules and their subsequent methods in the API. It allows for the construction of transactions and the submission thereof. These are attached dynamically from the runtime metadata.
     *
     * @example
     * <BR>
     *
     * ```javascript
     * api.tx.balances
     *   .transfer(<recipientId>, <balance>)
     *   .signAndSend(<keyPair>, ({status}) => {
     *     console.log('tx status', status.asFinalized.toHex());
     *   });
     * ```
     */


    get tx() {
      return assertResult(this._extrinsics);
    }

  }

  function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$2(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  class ApiBase extends Getters {
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
    constructor(options = {}, type, decorateMethod) {
      super(options, type, decorateMethod);
    }
    /**
     * @description Connect from the underlying provider, halting all network traffic
     */


    connect() {
      return this._rpcCore.connect();
    }
    /**
     * @description Disconnect from the underlying provider, halting all network traffic
     */


    disconnect() {
      this._unsubscribe();

      return this._rpcCore.disconnect();
    }
    /**
     * @description Finds the definition for a specific [[CallFunction]] based on the index supplied
     */


    findCall(callIndex) {
      return this.registry.findMetaCall(util.u8aToU8a(callIndex));
    }
    /**
     * @description Finds the definition for a specific [[RegistryError]] based on the index supplied
     */


    findError(errorIndex) {
      return this.registry.findMetaError(util.u8aToU8a(errorIndex));
    }
    /**
     * @description Set an external signer which will be used to sign extrinsic when account passed in is not KeyringPair
     */


    setSigner(signer) {
      this._rx.signer = signer;
    }
    /**
     * @description Signs a raw signer payload, string or Uint8Array
     */


    async sign(address, data, {
      signer
    } = {}) {
      if (util.isString(address)) {
        const _signer = signer || this._rx.signer;

        util.assert(_signer === null || _signer === void 0 ? void 0 : _signer.signRaw, 'No signer exists with a signRaw interface. You possibly need to pass through an explicit keypair for the origin so it can be used for signing.');
        return (await _signer.signRaw(_objectSpread$2(_objectSpread$2({
          type: 'bytes'
        }, data), {}, {
          address
        }))).signature;
      }

      return util.u8aToHex(address.sign(util.u8aToU8a(data.data)));
    }

  }

  var _allHasFired = /*#__PURE__*/_classPrivateFieldKey("allHasFired");

  var _callback = /*#__PURE__*/_classPrivateFieldKey("callback");

  var _fired = /*#__PURE__*/_classPrivateFieldKey("fired");

  var _fns = /*#__PURE__*/_classPrivateFieldKey("fns");

  var _isActive = /*#__PURE__*/_classPrivateFieldKey("isActive");

  var _results = /*#__PURE__*/_classPrivateFieldKey("results");

  var _subscriptions = /*#__PURE__*/_classPrivateFieldKey("subscriptions");

  class Combinator {
    constructor(fns, callback) {
      Object.defineProperty(this, _allHasFired, {
        writable: true,
        value: false
      });
      Object.defineProperty(this, _callback, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _fired, {
        writable: true,
        value: []
      });
      Object.defineProperty(this, _fns, {
        writable: true,
        value: []
      });
      Object.defineProperty(this, _isActive, {
        writable: true,
        value: true
      });
      Object.defineProperty(this, _results, {
        writable: true,
        value: []
      });
      Object.defineProperty(this, _subscriptions, {
        writable: true,
        value: []
      });
      _classPrivateFieldBase(this, _callback)[_callback] = callback; // eslint-disable-next-line @typescript-eslint/require-await

      _classPrivateFieldBase(this, _subscriptions)[_subscriptions] = fns.map(async (input, index) => {
        const [fn, ...args] = Array.isArray(input) ? input : [input];

        _classPrivateFieldBase(this, _fired)[_fired].push(false);

        _classPrivateFieldBase(this, _fns)[_fns].push(fn); // Not quite 100% how to have a variable number at the front here
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/ban-types


        return fn(...args, this._createCallback(index));
      });
    }

    _allHasFired() {
      var _classPrivateFieldLoo;

      (_classPrivateFieldLoo = _classPrivateFieldBase(this, _allHasFired))[_allHasFired] || (_classPrivateFieldLoo[_allHasFired] = _classPrivateFieldBase(this, _fired)[_fired].filter(hasFired => !hasFired).length === 0);
      return _classPrivateFieldBase(this, _allHasFired)[_allHasFired];
    }

    _createCallback(index) {
      return value => {
        _classPrivateFieldBase(this, _fired)[_fired][index] = true;
        _classPrivateFieldBase(this, _results)[_results][index] = value;

        this._triggerUpdate();
      };
    }

    _triggerUpdate() {
      if (!_classPrivateFieldBase(this, _isActive)[_isActive] || !util.isFunction(_classPrivateFieldBase(this, _callback)[_callback]) || !this._allHasFired()) {
        return;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        _classPrivateFieldBase(this, _callback)[_callback](_classPrivateFieldBase(this, _results)[_results]);
      } catch (error) {// swallow, we don't want the handler to trip us up
      }
    }

    unsubscribe() {
      if (!_classPrivateFieldBase(this, _isActive)[_isActive]) {
        return;
      }

      _classPrivateFieldBase(this, _isActive)[_isActive] = false; // eslint-disable-next-line @typescript-eslint/no-misused-promises

      _classPrivateFieldBase(this, _subscriptions)[_subscriptions].forEach(async subscription => {
        try {
          const unsubscribe = await subscription;

          if (util.isFunction(unsubscribe)) {
            unsubscribe();
          }
        } catch (error) {// ignore
        }
      });
    }

  }

  function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  // extract the arguments and callback params from a value array possibly containing a callback
  function extractArgs(args, needsCallback) {
    let callback;
    const actualArgs = args.slice(); // If the last arg is a function, we pop it, put it into callback.
    // actualArgs will then hold the actual arguments to be passed to `method`

    if (args.length && util.isFunction(args[args.length - 1])) {
      callback = actualArgs.pop();
    } // When we need a subscription, ensure that a valid callback is actually passed


    util.assert(!needsCallback || util.isFunction(callback), 'Expected a callback to be passed with subscriptions');
    return [actualArgs, callback];
  } // a Promise completion tracker, wrapping an isComplete variable that ensures the promise only resolves once


  function promiseTracker(resolve, reject) {
    let isCompleted = false;
    return {
      reject: error => {
        if (!isCompleted) {
          isCompleted = true;
          reject(error);
        }

        return EMPTY;
      },
      resolve: value => {
        if (!isCompleted) {
          isCompleted = true;
          resolve(value);
        }
      }
    };
  } // Decorate a call for a single-shot result - retrieve and then immediate unsubscribe


  function decorateCall(method, actualArgs) {
    return new Promise((resolve, reject) => {
      // single result tracker - either reject with Error or resolve with Codec result
      const tracker = promiseTracker(resolve, reject); // encoding errors reject immediately, any result unsubscribes and resolves

      const subscription = method(...actualArgs).pipe(catchError(error => tracker.reject(error))).subscribe(result => {
        tracker.resolve(result);
        setTimeout(() => subscription.unsubscribe(), 0);
      });
    });
  } // Decorate a subscription where we have a result callback specified


  function decorateSubscribe(method, actualArgs, resultCb) {
    return new Promise((resolve, reject) => {
      // either reject with error or resolve with unsubscribe callback
      const tracker = promiseTracker(resolve, reject); // errors reject immediately, the first result resolves with an unsubscribe promise, all results via callback

      const subscription = method(...actualArgs).pipe(catchError(error => tracker.reject(error)), tap(() => tracker.resolve(() => subscription.unsubscribe()))).subscribe(result => {
        // queue result (back of queue to clear current)
        setTimeout(() => resultCb(result), 0);
      });
    });
  }
  /**
   * @description Decorate method for ApiPromise, where the results are converted to the Promise equivalent
   */


  function decorateMethod$1(method, options) {
    const needsCallback = options && options.methodName && options.methodName.includes('subscribe');
    return function (...args) {
      const [actualArgs, resultCb] = extractArgs(args, !!needsCallback);
      return resultCb ? decorateSubscribe(method, actualArgs, resultCb) : decorateCall((options === null || options === void 0 ? void 0 : options.overrideNoSub) || method, actualArgs);
    };
  }
  /**
   * # @axia-js/api/promise
   *
   * ## Overview
   *
   * @name ApiPromise
   * @description
   * ApiPromise is a standard JavaScript wrapper around the RPC and interfaces on the AXIA network. As a full Promise-based, all interface calls return Promises, including the static `.create(...)`. Subscription calls utilise `(value) => {}` callbacks to pass through the latest values.
   *
   * The API is well suited to real-time applications where either the single-shot state is needed or use is to be made of the subscription-based features of AXIA (and Axlib) clients.
   *
   * @see [[ApiRx]]
   *
   * ## Usage
   *
   * Making rpc calls -
   * <BR>
   *
   * ```javascript
   * import ApiPromise from '@axia-js/api/promise';
   *
   * // initialise via static create
   * const api = await ApiPromise.create();
   *
   * // make a subscription to the network head
   * api.rpc.chain.subscribeNewHeads((header) => {
   *   console.log(`Chain is at #${header.number}`);
   * });
   * ```
   * <BR>
   *
   * Subscribing to chain state -
   * <BR>
   *
   * ```javascript
   * import { ApiPromise, WsProvider } from '@axia-js/api';
   *
   * // initialise a provider with a specific endpoint
   * const provider = new WsProvider('wss://example.com:9944')
   *
   * // initialise via isReady & new with specific provider
   * const api = await new ApiPromise({ provider }).isReady;
   *
   * // retrieve the block target time
   * const blockPeriod = await api.query.timestamp.blockPeriod().toNumber();
   * let last = 0;
   *
   * // subscribe to the current block timestamp, updates automatically (callback provided)
   * api.query.timestamp.now((timestamp) => {
   *   const elapsed = last
   *     ? `, ${timestamp.toNumber() - last}s since last`
   *     : '';
   *
   *   last = timestamp.toNumber();
   *   console.log(`timestamp ${timestamp}${elapsed} (${blockPeriod}s target)`);
   * });
   * ```
   * <BR>
   *
   * Submitting a transaction -
   * <BR>
   *
   * ```javascript
   * import ApiPromise from '@axia-js/api/promise';
   *
   * ApiPromise.create().then((api) => {
   *   const [nonce] = await api.query.system.account(keyring.alice.address);
   *
   *   api.tx.balances
   *     // create transfer
   *     transfer(keyring.bob.address, 12345)
   *     // sign the transcation
   *     .sign(keyring.alice, { nonce })
   *     // send the transaction (optional status callback)
   *     .send((status) => {
   *       console.log(`current status ${status.type}`);
   *     })
   *     // retrieve the submitted extrinsic hash
   *     .then((hash) => {
   *       console.log(`submitted with hash ${hash}`);
   *     });
   * });
   * ```
   */

  var _isReadyPromise = /*#__PURE__*/_classPrivateFieldKey("isReadyPromise");

  var _isReadyOrErrorPromise = /*#__PURE__*/_classPrivateFieldKey("isReadyOrErrorPromise");

  class ApiPromise extends ApiBase {
    /**
     * @description Creates an ApiPromise instance using the supplied provider. Returns an Promise containing the actual Api instance.
     * @param options options that is passed to the class contructor. Can be either [[ApiOptions]] or a
     * provider (see the constructor arguments)
     * @example
     * <BR>
     *
     * ```javascript
     * import Api from '@axia-js/api/promise';
     *
     * Api.create().then(async (api) => {
     *   const timestamp = await api.query.timestamp.now();
     *
     *   console.log(`lastest block timestamp ${timestamp}`);
     * });
     * ```
     */
    static create(options) {
      const instance = new ApiPromise(options);

      if (options && options.throwOnConnect) {
        return instance.isReadyOrError;
      } // Swallow any rejections on isReadyOrError
      // (in Node 15.x this creates issues, when not being looked at)


      instance.isReadyOrError.catch(() => {// ignore
      });
      return instance.isReady;
    }
    /**
     * @description Creates an instance of the ApiPromise class
     * @param options Options to create an instance. This can be either [[ApiOptions]] or
     * an [[WsProvider]].
     * @example
     * <BR>
     *
     * ```javascript
     * import Api from '@axia-js/api/promise';
     *
     * new Api().isReady.then((api) => {
     *   api.rpc.subscribeNewHeads((header) => {
     *     console.log(`new block #${header.number.toNumber()}`);
     *   });
     * });
     * ```
     */


    constructor(options) {
      super(options, 'promise', decorateMethod$1);
      Object.defineProperty(this, _isReadyPromise, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isReadyOrErrorPromise, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldBase(this, _isReadyPromise)[_isReadyPromise] = new Promise(resolve => {
        super.once('ready', () => resolve(this));
      });
      _classPrivateFieldBase(this, _isReadyOrErrorPromise)[_isReadyOrErrorPromise] = new Promise((resolve, reject) => {
        const tracker = promiseTracker(resolve, reject);
        super.once('ready', () => tracker.resolve(this));
        super.once('error', e => tracker.reject(e));
      });
    }
    /**
     * @description Promise that resolves the first time we are connected and loaded
     */


    get isReady() {
      return _classPrivateFieldBase(this, _isReadyPromise)[_isReadyPromise];
    }
    /**
     * @description Promise that resolves if we can connect, or reject if there is an error
     */


    get isReadyOrError() {
      return _classPrivateFieldBase(this, _isReadyOrErrorPromise)[_isReadyOrErrorPromise];
    }
    /**
     * @description Returns a clone of this ApiPromise instance (new underlying provider connection)
     */


    clone() {
      return new ApiPromise(_objectSpread$1(_objectSpread$1({}, this._options), {}, {
        source: this
      }));
    }
    /**
     * @description Creates a combinator that can be used to combine the latest results from multiple subscriptions
     * @param fns An array of function to combine, each in the form of `(cb: (value: void)) => void`
     * @param callback A callback that will return an Array of all the values this combinator has been applied to
     * @example
     * <BR>
     *
     * ```javascript
     * const address = '5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFacT7';
     *
     * // combines values from balance & nonce as it updates
     * api.combineLatest([
     *   api.rpc.chain.subscribeNewHeads,
     *   (cb) => api.query.system.account(address, cb)
     * ], ([head, [balance, nonce]]) => {
     *   console.log(`#${head.number}: You have ${balance.free} units, with ${nonce} transactions sent`);
     * });
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/require-await


    async combineLatest(fns, callback) {
      const combinator = new Combinator(fns, callback);
      return () => {
        combinator.unsubscribe();
      };
    }

  }

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  function decorateMethod(method) {
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

  var _isReadyRx = /*#__PURE__*/_classPrivateFieldKey("isReadyRx");

  class ApiRx extends ApiBase {
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
      _classPrivateFieldBase(this, _isReadyRx)[_isReadyRx] = from( // You can create an observable from an event, however my mind groks this form better
      new Promise(resolve => {
        super.on('ready', () => resolve(this));
      }));
    }
    /**
     * @description Observable that returns the first time we are connected and loaded
     */


    get isReady() {
      return _classPrivateFieldBase(this, _isReadyRx)[_isReadyRx];
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

  Object.defineProperty(exports, 'Keyring', {
    enumerable: true,
    get: function () { return keyring.Keyring; }
  });
  exports.ApiPromise = ApiPromise;
  exports.ApiRx = ApiRx;
  exports.HttpProvider = HttpProvider;
  exports.SubmittableResult = SubmittableResult;
  exports.WsProvider = WsProvider;
  exports.decorateMethodPromise = decorateMethod$1;
  exports.decorateMethodRx = decorateMethod;
  exports.packageInfo = packageInfo;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({}, axiaKeyring, axiaUtil, axiaTypes, axiaUtilCrypto);
