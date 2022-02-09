"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Abi = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseKey"));

var _util = require("@axia-js/util");

var _MetaRegistry = require("./MetaRegistry.cjs");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const l = (0, _util.logger)('Abi');

function findMessage(list, messageOrId) {
  const message = (0, _util.isNumber)(messageOrId) ? list[messageOrId] : (0, _util.isString)(messageOrId) ? list.find(_ref => {
    let {
      identifier
    } = _ref;
    return [identifier, (0, _util.stringCamelCase)(identifier)].includes(messageOrId.toString());
  }) : messageOrId;
  return (0, _util.assertReturn)(message, () => `Attempted to call an invalid contract interface, ${(0, _util.stringify)(messageOrId)}`);
}

var _events = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("events");

var _createArgs = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("createArgs");

var _createEvent = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("createEvent");

var _createMessage = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("createMessage");

var _decodeArgs = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("decodeArgs");

var _decodeMessage = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("decodeMessage");

var _encodeArgs = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("encodeArgs");

class Abi {
  constructor(abiJson, chainProperties) {
    var _this = this;

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
            (0, _util.assert)((0, _util.isObject)(arg.type), 'Invalid type definition found');
            return {
              name: (0, _util.stringCamelCase)(arg.name),
              type: this.registry.getMetaTypeDef(arg.type)
            };
          } catch (error) {
            l.error(`Error expanding argument ${index} in ${(0, _util.stringify)(spec)}`);
            throw error;
          }
        });
      }
    });
    Object.defineProperty(this, _createEvent, {
      writable: true,
      value: (spec, index) => {
        const args = (0, _classPrivateFieldLooseBase2.default)(this, _createArgs)[_createArgs](spec.args, spec);

        const event = {
          args,
          docs: spec.docs.map(d => d.toString()),
          fromU8a: data => ({
            args: (0, _classPrivateFieldLooseBase2.default)(this, _decodeArgs)[_decodeArgs](args, data),
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
      value: function (spec, index) {
        let add = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        const args = (0, _classPrivateFieldLooseBase2.default)(_this, _createArgs)[_createArgs](spec.args, spec);

        const identifier = spec.name.toString();

        const message = _objectSpread(_objectSpread({}, add), {}, {
          args,
          docs: spec.docs.map(d => d.toString()),
          fromU8a: data => ({
            args: (0, _classPrivateFieldLooseBase2.default)(_this, _decodeArgs)[_decodeArgs](args, data),
            message
          }),
          identifier,
          index,
          method: (0, _util.stringCamelCase)(identifier),
          selector: spec.selector,
          toU8a: params => (0, _classPrivateFieldLooseBase2.default)(_this, _encodeArgs)[_encodeArgs](spec, args, params)
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
        return args.map(_ref2 => {
          let {
            type
          } = _ref2;
          const value = this.registry.createType(type.type, data.subarray(offset));
          offset += value.encodedLength;
          return value;
        });
      }
    });
    Object.defineProperty(this, _decodeMessage, {
      writable: true,
      value: (type, list, data) => {
        const [, trimmed] = (0, _util.compactStripLength)(data);
        const selector = trimmed.subarray(0, 4);
        const message = list.find(m => m.selector.eq(selector));
        (0, _util.assert)(message, `Unable to find ${type} with selector ${(0, _util.u8aToHex)(selector)}`);
        return message.fromU8a(trimmed.subarray(4));
      }
    });
    Object.defineProperty(this, _encodeArgs, {
      writable: true,
      value: (_ref3, args, data) => {
        let {
          name,
          selector
        } = _ref3;
        (0, _util.assert)(data.length === args.length, () => `Expected ${args.length} arguments to contract message '${name.toString()}', found ${data.length}`);
        return (0, _util.compactAddLength)((0, _util.u8aConcat)(this.registry.createType('ContractSelector', selector).toU8a(), ...args.map((_ref4, index) => {
          let {
            type
          } = _ref4;
          return this.registry.createType(type.type, data[index]).toU8a();
        })));
      }
    });
    const json = (0, _util.isString)(abiJson) ? JSON.parse(abiJson) : abiJson;
    (0, _util.assert)((0, _util.isObject)(json) && !Array.isArray(json) && json.metadataVersion && (0, _util.isObject)(json.spec) && !Array.isArray(json.spec) && Array.isArray(json.spec.constructors) && Array.isArray(json.spec.messages), 'Invalid JSON ABI structure supplied, expected a recent metadata version');
    this.json = json;
    this.registry = new _MetaRegistry.MetaRegistry(json.metadataVersion, chainProperties);
    this.project = this.registry.createType('ContractProject', json);
    this.registry.setMetaTypes(this.project.types);
    this.project.types.forEach((_, index) => this.registry.getMetaTypeDef({
      type: this.registry.createType('Si0LookupTypeId', index + this.registry.typeOffset)
    }));
    this.constructors = this.project.spec.constructors.map((spec, index) => (0, _classPrivateFieldLooseBase2.default)(this, _createMessage)[_createMessage](spec, index, {
      isConstructor: true
    }));
    (0, _classPrivateFieldLooseBase2.default)(this, _events)[_events] = this.project.spec.events.map((spec, index) => (0, _classPrivateFieldLooseBase2.default)(this, _createEvent)[_createEvent](spec, index));
    this.messages = this.project.spec.messages.map((spec, index) => {
      const typeSpec = spec.returnType.unwrapOr(null);
      return (0, _classPrivateFieldLooseBase2.default)(this, _createMessage)[_createMessage](spec, index, {
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

    const event = (0, _classPrivateFieldLooseBase2.default)(this, _events)[_events][index];

    (0, _util.assert)(event, () => `Unable to find event with index ${index}`);
    return event.fromU8a(data.subarray(1));
  }
  /**
   * Warning: Unstable API, bound to change
   */


  decodeConstructor(data) {
    return (0, _classPrivateFieldLooseBase2.default)(this, _decodeMessage)[_decodeMessage]('message', this.constructors, data);
  }
  /**
   * Warning: Unstable API, bound to change
   */


  decodeMessage(data) {
    return (0, _classPrivateFieldLooseBase2.default)(this, _decodeMessage)[_decodeMessage]('message', this.messages, data);
  }

  findConstructor(constructorOrId) {
    return findMessage(this.constructors, constructorOrId);
  }

  findMessage(messageOrId) {
    return findMessage(this.messages, messageOrId);
  }

}

exports.Abi = Abi;