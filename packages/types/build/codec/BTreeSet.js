import _classPrivateFieldLooseBase from "@babel/runtime/helpers/esm/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/esm/classPrivateFieldLooseKey";
// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { compactFromU8a, compactToU8a, isHex, isU8a, logger, stringify, u8aConcat, u8aToHex, u8aToU8a } from '@axia-js/util';
import { compareSet, decodeU8a, sortSet, typeToConstructor } from "./utils/index.js";
const l = logger('BTreeSet');
/** @internal */

function decodeSetFromU8a(registry, ValClass, u8a) {
  const output = new Set();
  const [offset, length] = compactFromU8a(u8a);
  const types = [];

  for (let i = 0; i < length.toNumber(); i++) {
    types.push(ValClass);
  }

  const values = decodeU8a(registry, u8a.subarray(offset), types);

  for (let i = 0; i < values.length; i++) {
    output.add(values[i]);
  }

  return output;
}
/** @internal */


function decodeSetFromSet(registry, ValClass, value) {
  const output = new Set();
  value.forEach(val => {
    try {
      output.add(val instanceof ValClass ? val : new ValClass(registry, val));
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
 * @param ValClass - Type of the map value
 * @param value - Value to decode, one of:
 * - null
 * - undefined
 * - hex
 * - Uint8Array
 * - Set<any>, where both key and value types are either
 *   constructors or decodeable values for their types.
 * @param jsonSet
 * @internal
 */


function decodeSet(registry, valType, value) {
  if (!value) {
    return new Set();
  }

  const ValClass = typeToConstructor(registry, valType);

  if (isHex(value) || isU8a(value)) {
    return decodeSetFromU8a(registry, ValClass, u8aToU8a(value));
  } else if (Array.isArray(value) || value instanceof Set) {
    return decodeSetFromSet(registry, ValClass, value);
  }

  throw new Error('BTreeSet: cannot decode type');
}

var _ValClass = /*#__PURE__*/_classPrivateFieldLooseKey("ValClass");

export class BTreeSet extends Set {
  constructor(registry, valType, rawValue) {
    super(sortSet(decodeSet(registry, valType, rawValue)));
    this.registry = void 0;
    this.createdAtHash = void 0;
    Object.defineProperty(this, _ValClass, {
      writable: true,
      value: void 0
    });
    this.registry = registry;
    _classPrivateFieldLooseBase(this, _ValClass)[_ValClass] = typeToConstructor(registry, valType);
  }

  static with(valType) {
    return class extends BTreeSet {
      constructor(registry, value) {
        super(registry, valType, value);
      }

    };
  }
  /**
   * @description The length of the value when encoded as a Uint8Array
   */


  get encodedLength() {
    let len = compactToU8a(this.size).length;
    this.forEach(v => {
      len += v.encodedLength;
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
   * @description The actual set values as a string[]
   */


  get strings() {
    return [...super.values()].map(v => v.toString());
  }
  /**
   * @description Compares the value of the input to see if there is a match
   */


  eq(other) {
    return compareSet(this, other);
  }
  /**
   * @description Returns a hex string representation of the value. isLe returns a LE (number-only) representation
   */


  toHex() {
    return u8aToHex(this.toU8a());
  }
  /**
   * @description Converts the Object to to a human-friendly JSON, with additional fields, expansion and formatting of information
   */


  toHuman(isExtended) {
    const json = [];
    this.forEach(v => {
      json.push(v.toHuman(isExtended));
    });
    return json;
  }
  /**
   * @description Converts the Object to JSON, typically used for RPC transfers
   */


  toJSON() {
    const json = [];
    this.forEach(v => {
      json.push(v.toJSON());
    });
    return json;
  }
  /**
   * @description Returns the base runtime type name for this instance
   */


  toRawType() {
    return `BTreeSet<${this.registry.getClassName(_classPrivateFieldLooseBase(this, _ValClass)[_ValClass]) || new (_classPrivateFieldLooseBase(this, _ValClass)[_ValClass])(this.registry).toRawType()}>`;
  }
  /**
   * @description Returns the string representation of the value
   */


  toString() {
    return stringify(this.toJSON());
  }
  /**
   * @description Encodes the value as a Uint8Array as per the SCALE specifications
   * @param isBare true when the value has none of the type-specific prefixes (internal)
   */


  toU8a(isBare) {
    const encoded = new Array();

    if (!isBare) {
      encoded.push(compactToU8a(this.size));
    }

    this.forEach(v => {
      encoded.push(v.toU8a(isBare));
    });
    return u8aConcat(...encoded);
  }

}