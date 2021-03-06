import _classPrivateFieldLooseBase from "@babel/runtime/helpers/esm/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/esm/classPrivateFieldLooseKey";
// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, BN, bnToBn, bnToU8a, isBn, isNumber, isString, isU8a, isUndefined, stringCamelCase, stringify, stringUpperFirst, u8aToBn, u8aToHex, u8aToU8a } from '@axia-js/util';
import { compareArray } from "./utils/index.js";

function encodeSet(setValues, value) {
  return value.reduce((result, value) => {
    return result.or(bnToBn(setValues[value] || 0));
  }, new BN(0));
}
/** @internal */


function decodeSetArray(setValues, value) {
  return value.reduce((result, key) => {
    assert(!isUndefined(setValues[key]), () => `Set: Invalid key '${key}' passed to Set, allowed ${Object.keys(setValues).join(', ')}`);
    result.push(key);
    return result;
  }, []);
}
/** @internal */


function decodeSetNumber(setValues, _value) {
  const bn = bnToBn(_value);
  const result = Object.keys(setValues).reduce((result, key) => {
    if (bn.and(bnToBn(setValues[key])).eq(bnToBn(setValues[key]))) {
      result.push(key);
    }

    return result;
  }, []);
  const computed = encodeSet(setValues, result);
  assert(bn.eq(computed), () => `Set: Mismatch decoding '${bn.toString()}', computed as '${computed.toString()}' with ${result.join(', ')}`);
  return result;
}
/** @internal */


function decodeSet(setValues, value = 0, bitLength) {
  assert(bitLength % 8 === 0, () => `Expected valid bitLength, power of 8, found ${bitLength}`);
  const byteLength = bitLength / 8;

  if (isString(value)) {
    return decodeSet(setValues, u8aToU8a(value), byteLength);
  } else if (isU8a(value)) {
    return value.length === 0 ? [] : decodeSetNumber(setValues, u8aToBn(value.subarray(0, byteLength), {
      isLe: true
    }));
  } else if (value instanceof Set || Array.isArray(value)) {
    const input = Array.isArray(value) ? value : [...value.values()];
    return decodeSetArray(setValues, input);
  }

  return decodeSetNumber(setValues, value);
}
/**
 * @name Set
 * @description
 * An Set is an array of string values, represented an an encoded type by
 * a bitwise representation of the values.
 */


var _allowed = /*#__PURE__*/_classPrivateFieldLooseKey("allowed");

var _byteLength = /*#__PURE__*/_classPrivateFieldLooseKey("byteLength");

export class CodecSet extends Set {
  constructor(registry, setValues, value, bitLength = 8) {
    super(decodeSet(setValues, value, bitLength));
    this.registry = void 0;
    this.createdAtHash = void 0;
    Object.defineProperty(this, _allowed, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _byteLength, {
      writable: true,
      value: void 0
    });

    this.add = key => {
      // ^^^ add = () property done to assign this instance's this, otherwise Set.add creates "some" chaos
      // we have the isUndefined(this._setValues) in here as well, add is used internally
      // in the Set constructor (so it is undefined at this point, and should allow)
      assert(isUndefined(_classPrivateFieldLooseBase(this, _allowed)[_allowed]) || !isUndefined(_classPrivateFieldLooseBase(this, _allowed)[_allowed][key]), () => `Set: Invalid key '${key}' on add`);
      super.add(key);
      return this;
    };

    this.registry = registry;
    _classPrivateFieldLooseBase(this, _allowed)[_allowed] = setValues;
    _classPrivateFieldLooseBase(this, _byteLength)[_byteLength] = bitLength / 8;
  }

  static with(values, bitLength) {
    return class extends CodecSet {
      constructor(registry, value) {
        super(registry, values, value, bitLength);
        Object.keys(values).forEach(_key => {
          const iskey = `is${stringUpperFirst(stringCamelCase(_key))}`;
          isUndefined(this[iskey]) && Object.defineProperty(this, iskey, {
            enumerable: true,
            get: () => this.strings.includes(_key)
          });
        });
      }

    };
  }
  /**
   * @description The length of the value when encoded as a Uint8Array
   */


  get encodedLength() {
    return _classPrivateFieldLooseBase(this, _byteLength)[_byteLength];
  }
  /**
   * @description returns a hash of the contents
   */


  get hash() {
    return this.registry.hash(this.toU8a());
  }
  /**
   * @description true is the Set contains no values
   */


  get isEmpty() {
    return this.size === 0;
  }
  /**
   * @description The actual set values as a string[]
   */


  get strings() {
    return [...super.values()];
  }
  /**
   * @description The encoded value for the set members
   */


  get valueEncoded() {
    return encodeSet(_classPrivateFieldLooseBase(this, _allowed)[_allowed], this.strings);
  }
  /**
   * @description adds a value to the Set (extended to allow for validity checking)
   */


  /**
   * @description Compares the value of the input to see if there is a match
   */
  eq(other) {
    if (Array.isArray(other)) {
      // we don't actually care about the order, sort the values
      return compareArray(this.strings.sort(), other.sort());
    } else if (other instanceof Set) {
      return this.eq([...other.values()]);
    } else if (isNumber(other) || isBn(other)) {
      return this.valueEncoded.eq(bnToBn(other));
    }

    return false;
  }
  /**
   * @description Returns a hex string representation of the value
   */


  toHex() {
    return u8aToHex(this.toU8a());
  }
  /**
   * @description Converts the Object to to a human-friendly JSON, with additional fields, expansion and formatting of information
   */


  toHuman() {
    return this.toJSON();
  }
  /**
   * @description Converts the Object to JSON, typically used for RPC transfers
   */


  toJSON() {
    return this.strings;
  }
  /**
   * @description The encoded value for the set members
   */


  toNumber() {
    return this.valueEncoded.toNumber();
  }
  /**
   * @description Returns the base runtime type name for this instance
   */


  toRawType() {
    return stringify({
      _set: _classPrivateFieldLooseBase(this, _allowed)[_allowed]
    });
  }
  /**
   * @description Returns the string representation of the value
   */


  toString() {
    return `[${this.strings.join(', ')}]`;
  }
  /**
   * @description Encodes the value as a Uint8Array as per the SCALE specifications
   * @param isBare true when the value has none of the type-specific prefixes (internal)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars


  toU8a(isBare) {
    return bnToU8a(this.valueEncoded, {
      bitLength: _classPrivateFieldLooseBase(this, _byteLength)[_byteLength] * 8,
      isLe: true
    });
  }

}