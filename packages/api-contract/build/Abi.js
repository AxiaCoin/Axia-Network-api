import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _classPrivateFieldLooseBase from "@babel/runtime/helpers/esm/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/esm/classPrivateFieldLooseKey";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, assertReturn, compactAddLength, compactStripLength, isNumber, isObject, isString, logger, stringCamelCase, stringify, u8aConcat, u8aToHex } from '@axia-js/util';
import { MetaRegistry } from "./MetaRegistry.js";
const l = logger('Abi');

function findMessage(list, messageOrId) {
  const message = isNumber(messageOrId) ? list[messageOrId] : isString(messageOrId) ? list.find(({
    identifier
  }) => [identifier, stringCamelCase(identifier)].includes(messageOrId.toString())) : messageOrId;
  return assertReturn(message, () => `Attempted to call an invalid contract interface, ${stringify(messageOrId)}`);
}

var _events = /*#__PURE__*/_classPrivateFieldLooseKey("events");

var _createArgs = /*#__PURE__*/_classPrivateFieldLooseKey("createArgs");

var _createEvent = /*#__PURE__*/_classPrivateFieldLooseKey("createEvent");

var _createMessage = /*#__PURE__*/_classPrivateFieldLooseKey("createMessage");

var _decodeArgs = /*#__PURE__*/_classPrivateFieldLooseKey("decodeArgs");

var _decodeMessage = /*#__PURE__*/_classPrivateFieldLooseKey("decodeMessage");

var _encodeArgs = /*#__PURE__*/_classPrivateFieldLooseKey("encodeArgs");

export class Abi {
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
            assert(isObject(arg.type), 'Invalid type definition found');
            return {
              name: stringCamelCase(arg.name),
              type: this.registry.getMetaTypeDef(arg.type)
            };
          } catch (error) {
            l.error(`Error expanding argument ${index} in ${stringify(spec)}`);
            throw error;
          }
        });
      }
    });
    Object.defineProperty(this, _createEvent, {
      writable: true,
      value: (spec, index) => {
        const args = _classPrivateFieldLooseBase(this, _createArgs)[_createArgs](spec.args, spec);

        const event = {
          args,
          docs: spec.docs.map(d => d.toString()),
          fromU8a: data => ({
            args: _classPrivateFieldLooseBase(this, _decodeArgs)[_decodeArgs](args, data),
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
        const args = _classPrivateFieldLooseBase(this, _createArgs)[_createArgs](spec.args, spec);

        const identifier = spec.name.toString();

        const message = _objectSpread(_objectSpread({}, add), {}, {
          args,
          docs: spec.docs.map(d => d.toString()),
          fromU8a: data => ({
            args: _classPrivateFieldLooseBase(this, _decodeArgs)[_decodeArgs](args, data),
            message
          }),
          identifier,
          index,
          method: stringCamelCase(identifier),
          selector: spec.selector,
          toU8a: params => _classPrivateFieldLooseBase(this, _encodeArgs)[_encodeArgs](spec, args, params)
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
        const [, trimmed] = compactStripLength(data);
        const selector = trimmed.subarray(0, 4);
        const message = list.find(m => m.selector.eq(selector));
        assert(message, `Unable to find ${type} with selector ${u8aToHex(selector)}`);
        return message.fromU8a(trimmed.subarray(4));
      }
    });
    Object.defineProperty(this, _encodeArgs, {
      writable: true,
      value: ({
        name,
        selector
      }, args, data) => {
        assert(data.length === args.length, () => `Expected ${args.length} arguments to contract message '${name.toString()}', found ${data.length}`);
        return compactAddLength(u8aConcat(this.registry.createType('ContractSelector', selector).toU8a(), ...args.map(({
          type
        }, index) => this.registry.createType(type.type, data[index]).toU8a())));
      }
    });
    const json = isString(abiJson) ? JSON.parse(abiJson) : abiJson;
    assert(isObject(json) && !Array.isArray(json) && json.metadataVersion && isObject(json.spec) && !Array.isArray(json.spec) && Array.isArray(json.spec.constructors) && Array.isArray(json.spec.messages), 'Invalid JSON ABI structure supplied, expected a recent metadata version');
    this.json = json;
    this.registry = new MetaRegistry(json.metadataVersion, chainProperties);
    this.project = this.registry.createType('ContractProject', json);
    this.registry.setMetaTypes(this.project.types);
    this.project.types.forEach((_, index) => this.registry.getMetaTypeDef({
      type: this.registry.createType('Si0LookupTypeId', index + this.registry.typeOffset)
    }));
    this.constructors = this.project.spec.constructors.map((spec, index) => _classPrivateFieldLooseBase(this, _createMessage)[_createMessage](spec, index, {
      isConstructor: true
    }));
    _classPrivateFieldLooseBase(this, _events)[_events] = this.project.spec.events.map((spec, index) => _classPrivateFieldLooseBase(this, _createEvent)[_createEvent](spec, index));
    this.messages = this.project.spec.messages.map((spec, index) => {
      const typeSpec = spec.returnType.unwrapOr(null);
      return _classPrivateFieldLooseBase(this, _createMessage)[_createMessage](spec, index, {
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

    const event = _classPrivateFieldLooseBase(this, _events)[_events][index];

    assert(event, () => `Unable to find event with index ${index}`);
    return event.fromU8a(data.subarray(1));
  }
  /**
   * Warning: Unstable API, bound to change
   */


  decodeConstructor(data) {
    return _classPrivateFieldLooseBase(this, _decodeMessage)[_decodeMessage]('message', this.constructors, data);
  }
  /**
   * Warning: Unstable API, bound to change
   */


  decodeMessage(data) {
    return _classPrivateFieldLooseBase(this, _decodeMessage)[_decodeMessage]('message', this.messages, data);
  }

  findConstructor(constructorOrId) {
    return findMessage(this.constructors, constructorOrId);
  }

  findMessage(messageOrId) {
    return findMessage(this.messages, messageOrId);
  }

}