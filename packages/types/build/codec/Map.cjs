"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodecMap = void 0;

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseKey"));

var _util = require("@axia-js/util");

var _AbstractArray = require("./AbstractArray.cjs");

var _Enum = require("./Enum.cjs");

var _Struct = require("./Struct.cjs");

var _index = require("./utils/index.cjs");

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
const l = (0, _util.logger)('Map');
/** @internal */

function decodeMapFromU8a(registry, KeyClass, ValClass, u8a) {
  const output = new Map();
  const [offset, length] = (0, _util.compactFromU8a)(u8a);
  const types = [];

  for (let i = 0; i < length.toNumber(); i++) {
    types.push(KeyClass, ValClass);
  }

  const values = (0, _index.decodeU8a)(registry, u8a.subarray(offset), types);

  for (let i = 0; i < values.length; i += 2) {
    output.set(values[i], values[i + 1]);
  }

  return output;
}
/** @internal */


function decodeMapFromMap(registry, KeyClass, ValClass, value) {
  const output = new Map();
  value.forEach((val, key) => {
    const isComplex = KeyClass.prototype instanceof _AbstractArray.AbstractArray || KeyClass.prototype instanceof _Struct.Struct || KeyClass.prototype instanceof _Enum.Enum;

    try {
      output.set(key instanceof KeyClass ? key : new KeyClass(registry, isComplex ? JSON.parse(key) : key), val instanceof ValClass ? val : new ValClass(registry, val));
    } catch (error) {
      l.error('Failed to decode key or value:', error.message);
      throw error;
    }
  });
  return output;
}
/**
 * Decode input to pass into constructor.
 *
 * @param KeyClass - Type of the map key
 * @param ValClass - Type of the map value
 * @param value - Value to decode, one of:
 * - null
 * - undefined
 * - hex
 * - Uint8Array
 * - Map<any, any>, where both key and value types are either
 *   constructors or decodeable values for their types.
 * @param jsonMap
 * @internal
 */


function decodeMap(registry, keyType, valType, value) {
  const KeyClass = (0, _index.typeToConstructor)(registry, keyType);
  const ValClass = (0, _index.typeToConstructor)(registry, valType);

  if (!value) {
    return new Map();
  } else if ((0, _util.isU8a)(value) || (0, _util.isHex)(value)) {
    return decodeMapFromU8a(registry, KeyClass, ValClass, (0, _util.u8aToU8a)(value));
  } else if (value instanceof Map) {
    return decodeMapFromMap(registry, KeyClass, ValClass, value);
  } else if ((0, _util.isObject)(value)) {
    return decodeMapFromMap(registry, KeyClass, ValClass, new Map(Object.entries(value)));
  }

  throw new Error('Map: cannot decode type');
}

var _KeyClass = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("KeyClass");

var _ValClass = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("ValClass");

var _type = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("type");

class CodecMap extends Map {
  constructor(registry, keyType, valType, rawValue) {
    let type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'HashMap';
    const decoded = decodeMap(registry, keyType, valType, rawValue);
    super(type === 'BTreeMap' ? (0, _index.sortMap)(decoded) : decoded);
    this.registry = void 0;
    this.createdAtHash = void 0;
    Object.defineProperty(this, _KeyClass, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _ValClass, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _type, {
      writable: true,
      value: void 0
    });
    this.registry = registry;
    (0, _classPrivateFieldLooseBase2.default)(this, _KeyClass)[_KeyClass] = (0, _index.typeToConstructor)(registry, keyType);
    (0, _classPrivateFieldLooseBase2.default)(this, _ValClass)[_ValClass] = (0, _index.typeToConstructor)(registry, valType);
    (0, _classPrivateFieldLooseBase2.default)(this, _type)[_type] = type;
  }
  /**
   * @description The length of the value when encoded as a Uint8Array
   */


  get encodedLength() {
    let len = (0, _util.compactToU8a)(this.size).length;
    this.forEach((v, k) => {
      len += v.encodedLength + k.encodedLength;
    });
    return len;
  }
  /**
   * @description Returns a hash of the value
   */


  get hash() {
    return this.registry.hash(this.toU8a());
  }
  /**
   * @description Checks if the value is an empty value
   */


  get isEmpty() {
    return this.size === 0;
  }
  /**
   * @description Compares the value of the input to see if there is a match
   */


  eq(other) {
    return (0, _index.compareMap)(this, other);
  }
  /**
   * @description Returns a hex string representation of the value. isLe returns a LE (number-only) representation
   */


  toHex() {
    return (0, _util.u8aToHex)(this.toU8a());
  }
  /**
   * @description Converts the Object to to a human-friendly JSON, with additional fields, expansion and formatting of information
   */


  toHuman(isExtended) {
    const json = {};
    this.forEach((v, k) => {
      json[k.toString()] = v.toHuman(isExtended);
    });
    return json;
  }
  /**
   * @description Converts the Object to JSON, typically used for RPC transfers
   */


  toJSON() {
    const json = {};
    this.forEach((v, k) => {
      json[k.toString()] = v.toJSON();
    });
    return json;
  }
  /**
   * @description Returns the base runtime type name for this instance
   */


  toRawType() {
    return `${(0, _classPrivateFieldLooseBase2.default)(this, _type)[_type]}<${this.registry.getClassName((0, _classPrivateFieldLooseBase2.default)(this, _KeyClass)[_KeyClass]) || new ((0, _classPrivateFieldLooseBase2.default)(this, _KeyClass)[_KeyClass])(this.registry).toRawType()},${this.registry.getClassName((0, _classPrivateFieldLooseBase2.default)(this, _ValClass)[_ValClass]) || new ((0, _classPrivateFieldLooseBase2.default)(this, _ValClass)[_ValClass])(this.registry).toRawType()}>`;
  }
  /**
   * @description Returns the string representation of the value
   */


  toString() {
    return (0, _util.stringify)(this.toJSON());
  }
  /**
   * @description Encodes the value as a Uint8Array as per the SCALE specifications
   * @param isBare true when the value has none of the type-specific prefixes (internal)
   */


  toU8a(isBare) {
    const encoded = new Array();

    if (!isBare) {
      encoded.push((0, _util.compactToU8a)(this.size));
    }

    this.forEach((v, k) => {
      encoded.push(k.toU8a(isBare), v.toU8a(isBare));
    });
    return (0, _util.u8aConcat)(...encoded);
  }

}

exports.CodecMap = CodecMap;