const axiaApiContract = (function (exports, util, types, api, utilCrypto) {
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

  function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  // convert the offset into project-specific, index-1
  function getRegistryOffset(id, typeOffset) {
    return id.toNumber() - typeOffset;
  }
  const PRIMITIVE_ALIAS = {
    Char: 'u32',
    // Rust char is 4-bytes
    Str: 'Text'
  };
  const PRIMITIVE_ALWAYS = ['AccountId', 'AccountIndex', 'Address', 'Balance']; // TODO Replace usages with PortableRegistry

  var _siTypes = /*#__PURE__*/_classPrivateFieldKey("siTypes");

  var _getMetaType = /*#__PURE__*/_classPrivateFieldKey("getMetaType");

  var _extract = /*#__PURE__*/_classPrivateFieldKey("extract");

  var _extractArray = /*#__PURE__*/_classPrivateFieldKey("extractArray");

  var _extractFields = /*#__PURE__*/_classPrivateFieldKey("extractFields");

  var _extractPrimitive = /*#__PURE__*/_classPrivateFieldKey("extractPrimitive");

  var _extractPrimitivePath = /*#__PURE__*/_classPrivateFieldKey("extractPrimitivePath");

  var _extractSequence = /*#__PURE__*/_classPrivateFieldKey("extractSequence");

  var _extractTuple = /*#__PURE__*/_classPrivateFieldKey("extractTuple");

  var _extractVariant = /*#__PURE__*/_classPrivateFieldKey("extractVariant");

  var _extractVariantSub = /*#__PURE__*/_classPrivateFieldKey("extractVariantSub");

  class MetaRegistry extends types.TypeRegistry {
    constructor(metadataVersion, chainProperties) {
      super();
      this.metaTypeDefs = [];
      this.typeOffset = void 0;
      Object.defineProperty(this, _siTypes, {
        writable: true,
        value: []
      });
      Object.defineProperty(this, _getMetaType, {
        writable: true,
        value: id => {
          const type = _classPrivateFieldBase(this, _siTypes)[_siTypes][getRegistryOffset(id, this.typeOffset)];

          util.assert(!util.isUndefined(type), () => `getMetaType:: Unable to find ${id.toNumber()} in type values`);
          return this.createType('Si0Type', type);
        }
      });
      Object.defineProperty(this, _extract, {
        writable: true,
        value: (type, id) => {
          var _path$pop;

          const path = [...type.path];
          const isPrimitivePath = !!path.length && (path.length > 2 && path[0].eq('ink_env') && path[1].eq('types') || PRIMITIVE_ALWAYS.includes(path[path.length - 1].toString()));
          let typeDef;

          if (isPrimitivePath) {
            typeDef = _classPrivateFieldBase(this, _extractPrimitivePath)[_extractPrimitivePath](type);
          } else if (type.def.isPrimitive) {
            typeDef = _classPrivateFieldBase(this, _extractPrimitive)[_extractPrimitive](type);
          } else if (type.def.isComposite) {
            typeDef = _classPrivateFieldBase(this, _extractFields)[_extractFields](type.def.asComposite.fields);
          } else if (type.def.isVariant) {
            typeDef = _classPrivateFieldBase(this, _extractVariant)[_extractVariant](type.def.asVariant, id);
          } else if (type.def.isArray) {
            typeDef = _classPrivateFieldBase(this, _extractArray)[_extractArray](type.def.asArray);
          } else if (type.def.isSequence) {
            typeDef = _classPrivateFieldBase(this, _extractSequence)[_extractSequence](type.def.asSequence, id);
          } else if (type.def.isTuple) {
            typeDef = _classPrivateFieldBase(this, _extractTuple)[_extractTuple](type.def.asTuple);
          } else {
            throw new Error(`Invalid ink! type at index ${id.toString()}`);
          }

          const displayName = (_path$pop = path.pop()) === null || _path$pop === void 0 ? void 0 : _path$pop.toString();
          return types.withTypeString(this, _objectSpread$1(_objectSpread$1(_objectSpread$1(_objectSpread$1({}, displayName ? {
            displayName
          } : {}), path.length > 1 ? {
            namespace: path.map(s => s.toString()).join('::')
          } : {}), type.params.length > 0 ? {
            sub: type.params.map(type => this.getMetaTypeDef({
              type
            }))
          } : {}), typeDef));
        }
      });
      Object.defineProperty(this, _extractArray, {
        writable: true,
        value: ({
          len: length,
          type
        }) => {
          util.assert(!length || length.toNumber() <= 256, 'MetaRegistry: Only support for [Type; <length>], where length <= 256');
          return {
            info: types.TypeDefInfo.VecFixed,
            length: length.toNumber(),
            sub: this.getMetaTypeDef({
              type
            })
          };
        }
      });
      Object.defineProperty(this, _extractFields, {
        writable: true,
        value: fields => {
          const [isStruct, isTuple] = fields.reduce(([isAllNamed, isAllUnnamed], {
            name
          }) => [isAllNamed && name.isSome, isAllUnnamed && name.isNone], [true, true]);
          util.assert(isTuple || isStruct, 'Invalid fields type detected, expected either Tuple or Struct');
          const sub = fields.map(({
            name,
            type
          }) => _objectSpread$1(_objectSpread$1({}, this.getMetaTypeDef({
            type
          })), name.isSome ? {
            name: name.unwrap().toString()
          } : {}));
          return isTuple && sub.length === 1 ? sub[0] : {
            // check for tuple first (no fields may be available)
            info: isTuple ? types.TypeDefInfo.Tuple : types.TypeDefInfo.Struct,
            sub
          };
        }
      });
      Object.defineProperty(this, _extractPrimitive, {
        writable: true,
        value: type => {
          const typeStr = type.def.asPrimitive.type.toString();
          return {
            info: types.TypeDefInfo.Plain,
            type: PRIMITIVE_ALIAS[typeStr] || typeStr.toLowerCase()
          };
        }
      });
      Object.defineProperty(this, _extractPrimitivePath, {
        writable: true,
        value: type => {
          return {
            info: types.TypeDefInfo.Plain,
            type: type.path[type.path.length - 1].toString()
          };
        }
      });
      Object.defineProperty(this, _extractSequence, {
        writable: true,
        value: ({
          type
        }, id) => {
          util.assert(!!type, () => `ContractRegistry: Invalid sequence type found at id ${id.toString()}`);
          return {
            info: types.TypeDefInfo.Vec,
            sub: this.getMetaTypeDef({
              type
            })
          };
        }
      });
      Object.defineProperty(this, _extractTuple, {
        writable: true,
        value: ids => {
          return ids.length === 1 ? this.getMetaTypeDef({
            type: ids[0]
          }) : {
            info: types.TypeDefInfo.Tuple,
            sub: ids.map(type => this.getMetaTypeDef({
              type
            }))
          };
        }
      });
      Object.defineProperty(this, _extractVariant, {
        writable: true,
        value: ({
          variants
        }, id) => {
          const {
            params,
            path
          } = _classPrivateFieldBase(this, _getMetaType)[_getMetaType](id);

          const specialVariant = path[0].toString();
          return specialVariant === 'Option' ? {
            info: types.TypeDefInfo.Option,
            sub: this.getMetaTypeDef({
              type: params[0]
            })
          } : specialVariant === 'Result' ? {
            info: types.TypeDefInfo.Result,
            sub: params.map((type, index) => _objectSpread$1({
              name: ['Ok', 'Error'][index]
            }, this.getMetaTypeDef({
              type
            })))
          } : {
            info: types.TypeDefInfo.Enum,
            sub: _classPrivateFieldBase(this, _extractVariantSub)[_extractVariantSub](variants)
          };
        }
      });
      Object.defineProperty(this, _extractVariantSub, {
        writable: true,
        value: variants => {
          return variants.every(({
            fields
          }) => fields.length === 0) ? variants.map(({
            discriminant,
            name
          }) => _objectSpread$1(_objectSpread$1({}, discriminant.isSome ? {
            ext: {
              discriminant: discriminant.unwrap().toNumber()
            }
          } : {}), {}, {
            info: types.TypeDefInfo.Plain,
            name: name.toString(),
            type: 'Null'
          })) : variants.map(({
            fields,
            name
          }) => types.withTypeString(this, _objectSpread$1(_objectSpread$1({}, _classPrivateFieldBase(this, _extractFields)[_extractFields](fields)), {}, {
            name: name.toString()
          })));
        }
      });
      const [major, minor] = metadataVersion.split('.').map(n => parseInt(n, 10)); // type indexes are 1-based pre 0.7 and 0-based post

      this.typeOffset = major === 0 && minor < 7 ? 1 : 0;

      if (chainProperties) {
        this.setChainProperties(chainProperties);
      }
    }

    setMetaTypes(metaTypes) {
      _classPrivateFieldBase(this, _siTypes)[_siTypes] = metaTypes;
    }

    getMetaTypeDef(typeSpec) {
      const offset = getRegistryOffset(typeSpec.type, this.typeOffset);
      let typeDef = this.metaTypeDefs[offset];

      if (!typeDef) {
        typeDef = _classPrivateFieldBase(this, _extract)[_extract](_classPrivateFieldBase(this, _getMetaType)[_getMetaType](typeSpec.type), typeSpec.type);
        this.metaTypeDefs[offset] = typeDef;
      }

      if (typeSpec.displayName && typeSpec.displayName.length) {
        const displayName = typeSpec.displayName[typeSpec.displayName.length - 1].toString();

        if (!typeDef.type.startsWith(displayName)) {
          typeDef = _objectSpread$1(_objectSpread$1({}, typeDef), {}, {
            displayName,
            type: PRIMITIVE_ALWAYS.includes(displayName) ? displayName : typeDef.type
          });
        }
      } // Here we protect against the following cases
      //   - No displayName present, these are generally known primitives
      //   - displayName === type, these generate circular references
      //   - displayName Option & type Option<...something...>


      if (typeDef.displayName && !this.hasType(typeDef.displayName) && !(typeDef.type === typeDef.displayName || typeDef.type.startsWith(`${typeDef.displayName}<`))) {
        this.register({
          [typeDef.displayName]: typeDef.type
        });
      }

      return typeDef;
    }

  }

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  const l$1 = util.logger('Abi');

  function findMessage(list, messageOrId) {
    const message = util.isNumber(messageOrId) ? list[messageOrId] : util.isString(messageOrId) ? list.find(({
      identifier
    }) => [identifier, util.stringCamelCase(identifier)].includes(messageOrId.toString())) : messageOrId;
    return util.assertReturn(message, () => `Attempted to call an invalid contract interface, ${util.stringify(messageOrId)}`);
  }

  var _events = /*#__PURE__*/_classPrivateFieldKey("events");

  var _createArgs = /*#__PURE__*/_classPrivateFieldKey("createArgs");

  var _createEvent = /*#__PURE__*/_classPrivateFieldKey("createEvent");

  var _createMessage = /*#__PURE__*/_classPrivateFieldKey("createMessage");

  var _decodeArgs = /*#__PURE__*/_classPrivateFieldKey("decodeArgs");

  var _decodeMessage = /*#__PURE__*/_classPrivateFieldKey("decodeMessage");

  var _encodeArgs = /*#__PURE__*/_classPrivateFieldKey("encodeArgs");

  class Abi {
    constructor(abiJson, chainProperties) {
      Object.defineProperty(this, _events, {
        writable: true,
        value: void 0
      });
      this.constructors = void 0;
      this.json = void 0;
      this.messages = void 0;
      this.project = void 0;
      this.registry = void 0;
      Object.defineProperty(this, _createArgs, {
        writable: true,
        value: (args, spec) => {
          return args.map((arg, index) => {
            try {
              util.assert(util.isObject(arg.type), 'Invalid type definition found');
              return {
                name: util.stringCamelCase(arg.name),
                type: this.registry.getMetaTypeDef(arg.type)
              };
            } catch (error) {
              l$1.error(`Error expanding argument ${index} in ${util.stringify(spec)}`);
              throw error;
            }
          });
        }
      });
      Object.defineProperty(this, _createEvent, {
        writable: true,
        value: (spec, index) => {
          const args = _classPrivateFieldBase(this, _createArgs)[_createArgs](spec.args, spec);

          const event = {
            args,
            docs: spec.docs.map(d => d.toString()),
            fromU8a: data => ({
              args: _classPrivateFieldBase(this, _decodeArgs)[_decodeArgs](args, data),
              event
            }),
            identifier: spec.name.toString(),
            index
          };
          return event;
        }
      });
      Object.defineProperty(this, _createMessage, {
        writable: true,
        value: (spec, index, add = {}) => {
          const args = _classPrivateFieldBase(this, _createArgs)[_createArgs](spec.args, spec);

          const identifier = spec.name.toString();

          const message = _objectSpread(_objectSpread({}, add), {}, {
            args,
            docs: spec.docs.map(d => d.toString()),
            fromU8a: data => ({
              args: _classPrivateFieldBase(this, _decodeArgs)[_decodeArgs](args, data),
              message
            }),
            identifier,
            index,
            method: util.stringCamelCase(identifier),
            selector: spec.selector,
            toU8a: params => _classPrivateFieldBase(this, _encodeArgs)[_encodeArgs](spec, args, params)
          });

          return message;
        }
      });
      Object.defineProperty(this, _decodeArgs, {
        writable: true,
        value: (args, data) => {
          // for decoding we expect the input to be just the arg data, no selectors
          // no length added (this allows use with events as well)
          let offset = 0;
          return args.map(({
            type
          }) => {
            const value = this.registry.createType(type.type, data.subarray(offset));
            offset += value.encodedLength;
            return value;
          });
        }
      });
      Object.defineProperty(this, _decodeMessage, {
        writable: true,
        value: (type, list, data) => {
          const [, trimmed] = util.compactStripLength(data);
          const selector = trimmed.subarray(0, 4);
          const message = list.find(m => m.selector.eq(selector));
          util.assert(message, `Unable to find ${type} with selector ${util.u8aToHex(selector)}`);
          return message.fromU8a(trimmed.subarray(4));
        }
      });
      Object.defineProperty(this, _encodeArgs, {
        writable: true,
        value: ({
          name,
          selector
        }, args, data) => {
          util.assert(data.length === args.length, () => `Expected ${args.length} arguments to contract message '${name.toString()}', found ${data.length}`);
          return util.compactAddLength(util.u8aConcat(this.registry.createType('ContractSelector', selector).toU8a(), ...args.map(({
            type
          }, index) => this.registry.createType(type.type, data[index]).toU8a())));
        }
      });
      const json = util.isString(abiJson) ? JSON.parse(abiJson) : abiJson;
      util.assert(util.isObject(json) && !Array.isArray(json) && json.metadataVersion && util.isObject(json.spec) && !Array.isArray(json.spec) && Array.isArray(json.spec.constructors) && Array.isArray(json.spec.messages), 'Invalid JSON ABI structure supplied, expected a recent metadata version');
      this.json = json;
      this.registry = new MetaRegistry(json.metadataVersion, chainProperties);
      this.project = this.registry.createType('ContractProject', json);
      this.registry.setMetaTypes(this.project.types);
      this.project.types.forEach((_, index) => this.registry.getMetaTypeDef({
        type: this.registry.createType('Si0LookupTypeId', index + this.registry.typeOffset)
      }));
      this.constructors = this.project.spec.constructors.map((spec, index) => _classPrivateFieldBase(this, _createMessage)[_createMessage](spec, index, {
        isConstructor: true
      }));
      _classPrivateFieldBase(this, _events)[_events] = this.project.spec.events.map((spec, index) => _classPrivateFieldBase(this, _createEvent)[_createEvent](spec, index));
      this.messages = this.project.spec.messages.map((spec, index) => {
        const typeSpec = spec.returnType.unwrapOr(null);
        return _classPrivateFieldBase(this, _createMessage)[_createMessage](spec, index, {
          isMutating: spec.mutates.isTrue,
          isPayable: spec.payable.isTrue,
          returnType: typeSpec ? this.registry.getMetaTypeDef(typeSpec) : null
        });
      });
    }
    /**
     * Warning: Unstable API, bound to change
     */


    decodeEvent(data) {
      const index = data[0];

      const event = _classPrivateFieldBase(this, _events)[_events][index];

      util.assert(event, () => `Unable to find event with index ${index}`);
      return event.fromU8a(data.subarray(1));
    }
    /**
     * Warning: Unstable API, bound to change
     */


    decodeConstructor(data) {
      return _classPrivateFieldBase(this, _decodeMessage)[_decodeMessage]('message', this.constructors, data);
    }
    /**
     * Warning: Unstable API, bound to change
     */


    decodeMessage(data) {
      return _classPrivateFieldBase(this, _decodeMessage)[_decodeMessage]('message', this.messages, data);
    }

    findConstructor(constructorOrId) {
      return findMessage(this.constructors, constructorOrId);
    }

    findMessage(messageOrId) {
      return findMessage(this.messages, messageOrId);
    }

  }

  // Copyright 2017-2021 @axia-js/api-contract authors & contributors
  // SPDX-License-Identifier: Apache-2.0
  // Auto-generated by @axia-js/dev, do not edit
  const packageInfo = {
    name: '@axia-js/api-contract',
    version: '0.1.0'
  };

  // Copyright 2017-2021 @axia-js/rpc-contract authors & contributors
  function applyOnEvent(result, types, fn) {
    if (result.isInBlock || result.isFinalized) {
      const records = result.filterRecords('contracts', types);

      if (records.length) {
        return fn(records);
      }
    }

    return undefined;
  }
  function isOptions(options) {
    return !(util.isBn(options) || util.isBigInt(options) || util.isNumber(options) || util.isString(options));
  }
  function extractOptions(value, params) {
    const gasLimit = params.shift();
    return [{
      gasLimit,
      value
    }, params];
  }

  // Copyright 2017-2021 @axia-js/api authors & contributors
  class Base {
    constructor(api, abi, decorateMethod) {
      this.abi = void 0;
      this.api = void 0;
      this.registry = void 0;
      this._decorateMethod = void 0;
      this.abi = abi instanceof Abi ? abi : new Abi(abi, api.registry.getChainProperties());
      this.api = api;
      this.registry = this.abi.registry;
      this._decorateMethod = decorateMethod;
      util.assert(!!(api && api.isConnected && api.tx && api.tx.contracts && Object.keys(api.tx.contracts).length), 'Your API has not been initialized correctly and it not decorated with the runtime interfaces for contracts as retrieved from the on-chain runtime');
      util.assert(util.isFunction(api.tx.contracts.instantiateWithCode), 'You need to connect to a chain with a runtime with a V3 contracts module. The runtime does not expose api.tx.contracts.instantiateWithCode');
    }

  }

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
          {
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

  function map(project, thisArg) {
      return operate(function (source, subscriber) {
          var index = 0;
          source.subscribe(new OperatorSubscriber(subscriber, function (value) {
              subscriber.next(project.call(thisArg, value, index++));
          }));
      });
  }

  const MAX_CALL_GAS = new util.BN(5000000000000).isub(util.BN_ONE);
  const ERROR_NO_CALL = 'Your node does not expose the contracts.call RPC. This is most probably due to a runtime configuration.';
  const l = util.logger('Contract');

  function createQuery(fn) {
    return (origin, options, ...params) => isOptions(options) ? fn(origin, options, params) : fn(origin, ...extractOptions(options, params));
  }

  function createTx(fn) {
    return (options, ...params) => isOptions(options) ? fn(options, params) : fn(...extractOptions(options, params));
  }

  class ContractSubmittableResult extends api.SubmittableResult {
    constructor(result, contractEvents) {
      super(result);
      this.contractEvents = void 0;
      this.contractEvents = contractEvents;
    }

  }

  var _query = /*#__PURE__*/_classPrivateFieldKey("query");

  var _tx$2 = /*#__PURE__*/_classPrivateFieldKey("tx");

  var _getGas = /*#__PURE__*/_classPrivateFieldKey("getGas");

  var _exec = /*#__PURE__*/_classPrivateFieldKey("exec");

  var _read = /*#__PURE__*/_classPrivateFieldKey("read");

  class Contract$2 extends Base {
    /**
     * @description The on-chain address for this contract
     */
    constructor(api, abi, address, decorateMethod) {
      super(api, abi, decorateMethod);
      this.address = void 0;
      Object.defineProperty(this, _query, {
        writable: true,
        value: {}
      });
      Object.defineProperty(this, _tx$2, {
        writable: true,
        value: {}
      });
      Object.defineProperty(this, _getGas, {
        writable: true,
        value: (_gasLimit, isCall = false) => {
          const gasLimit = util.bnToBn(_gasLimit);
          return gasLimit.lte(util.BN_ZERO) ? isCall ? MAX_CALL_GAS : (this.api.consts.system.blockWeights ? this.api.consts.system.blockWeights.maxBlock : this.api.consts.system.maximumBlockWeight).muln(64).div(util.BN_HUNDRED) : gasLimit;
        }
      });
      Object.defineProperty(this, _exec, {
        writable: true,
        value: (messageOrId, {
          gasLimit = util.BN_ZERO,
          value = util.BN_ZERO
        }, params) => {
          return this.api.tx.contracts.call(this.address, value, _classPrivateFieldBase(this, _getGas)[_getGas](gasLimit), this.abi.findMessage(messageOrId).toU8a(params)).withResultTransform(result => // ContractEmitted is the current generation, ContractExecution is the previous generation
          new ContractSubmittableResult(result, applyOnEvent(result, ['ContractEmitted', 'ContractExecution'], records => records.map(({
            event: {
              data: [, data]
            }
          }) => {
            try {
              return this.abi.decodeEvent(data);
            } catch (error) {
              l.error(`Unable to decode contract event: ${error.message}`);
              return null;
            }
          }).filter(decoded => !!decoded))));
        }
      });
      Object.defineProperty(this, _read, {
        writable: true,
        value: (messageOrId, {
          gasLimit = util.BN_ZERO,
          value = util.BN_ZERO
        }, params) => {
          util.assert(this.hasRpcContractsCall, ERROR_NO_CALL);
          const message = this.abi.findMessage(messageOrId);
          return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            send: this._decorateMethod(origin => this.api.rx.rpc.contracts.call({
              dest: this.address,
              gasLimit: _classPrivateFieldBase(this, _getGas)[_getGas](gasLimit, true),
              inputData: message.toU8a(params),
              origin,
              value
            }).pipe(map(({
              debugMessage,
              gasConsumed,
              gasRequired,
              result
            }) => ({
              debugMessage,
              gasConsumed,
              gasRequired: gasRequired && !gasRequired.isZero() ? gasRequired : gasConsumed,
              output: result.isOk && message.returnType ? types.createTypeUnsafe(this.registry, message.returnType.type, [result.asOk.data.toU8a(true)], {
                isPedantic: true
              }) : null,
              result
            }))))
          };
        }
      });
      this.address = this.registry.createType('AccountId', address);
      this.abi.messages.forEach(m => {
        if (util.isUndefined(_classPrivateFieldBase(this, _tx$2)[_tx$2][m.method])) {
          _classPrivateFieldBase(this, _tx$2)[_tx$2][m.method] = createTx((o, p) => _classPrivateFieldBase(this, _exec)[_exec](m, o, p));
        }

        if (util.isUndefined(_classPrivateFieldBase(this, _query)[_query][m.method])) {
          _classPrivateFieldBase(this, _query)[_query][m.method] = createQuery((f, o, p) => _classPrivateFieldBase(this, _read)[_read](m, o, p).send(f));
        }
      });
    }

    get hasRpcContractsCall() {
      var _this$api$rx$rpc$cont;

      return util.isFunction((_this$api$rx$rpc$cont = this.api.rx.rpc.contracts) === null || _this$api$rx$rpc$cont === void 0 ? void 0 : _this$api$rx$rpc$cont.call);
    }

    get query() {
      util.assert(this.hasRpcContractsCall, ERROR_NO_CALL);
      return _classPrivateFieldBase(this, _query)[_query];
    }

    get tx() {
      return _classPrivateFieldBase(this, _tx$2)[_tx$2];
    }

  }

  // Copyright 2017-2021 @axia-js/api-contract authors & contributors
  const EMPTY_SALT = new Uint8Array();
  function createBluePrintTx(fn) {
    return (options, ...params) => isOptions(options) ? fn(options, params) : fn(...extractOptions(options, params));
  }
  function encodeSalt(salt = utilCrypto.randomAsU8a()) {
    return salt instanceof types.Bytes ? salt : salt && salt.length ? util.compactAddLength(util.u8aToU8a(salt)) : EMPTY_SALT;
  }

  class BlueprintSubmittableResult extends api.SubmittableResult {
    constructor(result, contract) {
      super(result);
      this.contract = void 0;
      this.contract = contract;
    }

  }

  var _tx$1 = /*#__PURE__*/_classPrivateFieldKey("tx");

  var _deploy = /*#__PURE__*/_classPrivateFieldKey("deploy");

  class Blueprint$2 extends Base {
    /**
     * @description The on-chain code hash for this blueprint
     */
    constructor(api, abi, codeHash, decorateMethod) {
      super(api, abi, decorateMethod);
      this.codeHash = void 0;
      Object.defineProperty(this, _tx$1, {
        writable: true,
        value: {}
      });
      Object.defineProperty(this, _deploy, {
        writable: true,
        value: (constructorOrId, {
          gasLimit = util.BN_ZERO,
          salt,
          value = util.BN_ZERO
        }, params) => {
          return this.api.tx.contracts.instantiate(value, gasLimit, this.codeHash, this.abi.findConstructor(constructorOrId).toU8a(params), encodeSalt(salt)).withResultTransform(result => new BlueprintSubmittableResult(result, applyOnEvent(result, ['Instantiated'], ([record]) => new Contract$2(this.api, this.abi, record.event.data[1], this._decorateMethod))));
        }
      });
      this.codeHash = this.registry.createType('Hash', codeHash);
      this.abi.constructors.forEach(c => {
        if (util.isUndefined(_classPrivateFieldBase(this, _tx$1)[_tx$1][c.method])) {
          _classPrivateFieldBase(this, _tx$1)[_tx$1][c.method] = createBluePrintTx((o, p) => _classPrivateFieldBase(this, _deploy)[_deploy](c, o, p));
        }
      });
    }

    get tx() {
      return _classPrivateFieldBase(this, _tx$1)[_tx$1];
    }

  }

  class CodeSubmittableResult extends api.SubmittableResult {
    constructor(result, blueprint, contract) {
      super(result);
      this.blueprint = void 0;
      this.contract = void 0;
      this.blueprint = blueprint;
      this.contract = contract;
    }

  }

  var _tx = /*#__PURE__*/_classPrivateFieldKey("tx");

  var _instantiate = /*#__PURE__*/_classPrivateFieldKey("instantiate");

  class Code$2 extends Base {
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
          gasLimit = util.BN_ZERO,
          salt,
          value = util.BN_ZERO
        }, params) => {
          return this.api.tx.contracts.instantiateWithCode(value, gasLimit, util.compactAddLength(this.code), this.abi.findConstructor(constructorOrId).toU8a(params), encodeSalt(salt)).withResultTransform(result => new CodeSubmittableResult(result, ...(applyOnEvent(result, ['CodeStored', 'Instantiated'], records => records.reduce(([blueprint, contract], {
            event
          }) => this.api.events.contracts.Instantiated.is(event) ? [blueprint, new Contract$2(this.api, this.abi, event.data[1], this._decorateMethod)] : this.api.events.contracts.CodeStored.is(event) ? [new Blueprint$2(this.api, this.abi, event.data[0], this._decorateMethod), contract] : [blueprint, contract], [])) || [])));
        }
      });
      this.code = util.isWasm(this.abi.project.source.wasm) ? this.abi.project.source.wasm : util.u8aToU8a(wasm);
      util.assert(util.isWasm(this.code), 'No WASM code provided');
      this.abi.constructors.forEach(c => {
        if (util.isUndefined(_classPrivateFieldBase(this, _tx)[_tx][c.method])) {
          _classPrivateFieldBase(this, _tx)[_tx][c.method] = createBluePrintTx((o, p) => _classPrivateFieldBase(this, _instantiate)[_instantiate](c, o, p));
        }
      });
    }

    get tx() {
      return _classPrivateFieldBase(this, _tx)[_tx];
    }

  }

  // Copyright 2017-2021 @axia-js/api-contract authors & contributors
  class Blueprint$1 extends Blueprint$2 {
    constructor(api$1, abi, codeHash) {
      super(api$1, abi, codeHash, api.decorateMethodPromise);
    }

  }

  // Copyright 2017-2021 @axia-js/api-contract authors & contributors
  class Code$1 extends Code$2 {
    constructor(api$1, abi, wasm) {
      super(api$1, abi, wasm, api.decorateMethodPromise);
    }

  }

  // Copyright 2017-2021 @axia-js/api-contract authors & contributors
  class Contract$1 extends Contract$2 {
    constructor(api$1, abi, address) {
      super(api$1, abi, address, api.decorateMethodPromise);
    }

  }

  // Copyright 2017-2021 @axia-js/api-contract authors & contributors
  class Blueprint extends Blueprint$2 {
    constructor(api$1, abi, codeHash) {
      super(api$1, abi, codeHash, api.decorateMethodRx);
    }

  }

  // Copyright 2017-2021 @axia-js/api-contract authors & contributors
  class Code extends Code$2 {
    constructor(api$1, abi, wasm) {
      super(api$1, abi, wasm, api.decorateMethodRx);
    }

  }

  // Copyright 2017-2021 @axia-js/api-contract authors & contributors
  class Contract extends Contract$2 {
    constructor(api$1, abi, address) {
      super(api$1, abi, address, api.decorateMethodRx);
    }

  }

  exports.Abi = Abi;
  exports.BlueprintPromise = Blueprint$1;
  exports.BlueprintRx = Blueprint;
  exports.CodePromise = Code$1;
  exports.CodeRx = Code;
  exports.ContractPromise = Contract$1;
  exports.ContractRx = Contract;
  exports.packageInfo = packageInfo;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({}, axiaUtil, axiaTypes, axiaApi, axiaUtilCrypto);
