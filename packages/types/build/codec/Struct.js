import _classPrivateFieldLooseBase from "@babel/runtime/helpers/esm/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/esm/classPrivateFieldLooseKey";
// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, hexToU8a, isBoolean, isFunction, isHex, isObject, isU8a, isUndefined, stringCamelCase, stringify, u8aConcat, u8aToHex } from '@axia-js/util';
import { compareMap, decodeU8a, mapToTypeMap } from "./utils/index.js";

/** @internal */
function decodeStructFromObject(registry, Types, value, jsonMap) {
  let jsonObj;
  const inputKeys = Object.keys(Types);
  assert(!Array.isArray(value) || value.length === inputKeys.length, () => `Struct: Unable to map ${stringify(value)} array to object with known keys ${inputKeys.join(', ')}`);
  return inputKeys.reduce((raw, key, index) => {
    // The key in the JSON can be snake_case (or other cases), but in our
    // Types, result or any other maps, it's camelCase
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const jsonKey = jsonMap.get(key) && !value[key] ? jsonMap.get(key) : key;
    const Type = Types[key];

    try {
      if (Array.isArray(value)) {
        // TS2322: Type 'Codec' is not assignable to type 'T[keyof S]'.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        raw[key] = value[index] instanceof Type ? value[index] : new Type(registry, value[index]);
      } else if (value instanceof Map) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const mapped = value.get(jsonKey); // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access

        raw[key] = mapped instanceof Type ? mapped : new Type(registry, mapped);
      } else if (isObject(value)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let assign = value[jsonKey];

        if (isUndefined(assign)) {
          if (isUndefined(jsonObj)) {
            jsonObj = Object.entries(value).reduce((all, [key, value]) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              all[stringCamelCase(key)] = value;
              return all;
            }, {});
          } // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment


          assign = jsonObj[jsonKey];
        } // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access


        raw[key] = assign instanceof Type ? assign : new Type(registry, assign);
      } else {
        throw new Error(`Cannot decode value ${stringify(value)} (typeof ${typeof value}), expected an input object with known keys`);
      }
    } catch (error) {
      let type = Type.name;

      try {
        type = new Type(registry).toRawType();
      } catch (error) {// ignore
      }

      throw new Error(`Struct: failed on ${jsonKey}: ${type}:: ${error.message}`);
    }

    return raw;
  }, {});
}
/**
 * Decode input to pass into constructor.
 *
 * @param Types - Types definition.
 * @param value - Value to decode, one of:
 * - null
 * - undefined
 * - hex
 * - Uint8Array
 * - object with `{ key1: value1, key2: value2 }`, assuming `key1` and `key2`
 * are also keys in `Types`
 * - array with `[value1, value2]` assuming the array has the same length as
 * `Object.keys(Types)`
 * @param jsonMap
 * @internal
 */


function decodeStruct(registry, Types, value, jsonMap) {
  if (isHex(value)) {
    return decodeStruct(registry, Types, hexToU8a(value), jsonMap);
  } else if (isU8a(value)) {
    const keys = Object.keys(Types);
    const values = decodeU8a(registry, value, Object.values(Types), keys); // Transform array of values to {key: value} mapping

    return keys.reduce((raw, key, index) => {
      // TS2322: Type 'Codec' is not assignable to type 'T[keyof S]'.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      raw[key] = values[index];
      return raw;
    }, {});
  } else if (!value) {
    return {};
  } // We assume from here that value is a JS object (Array, Map, Object)


  return decodeStructFromObject(registry, Types, value, jsonMap);
}
/**
 * @name Struct
 * @description
 * A Struct defines an Object with key-value pairs - where the values are Codec values. It removes
 * a lot of repetition from the actual coding, define a structure type, pass it the key/Codec
 * values in the constructor and it manages the decoding. It is important that the constructor
 * values matches 100% to the order in th Rust code, i.e. don't go crazy and make it alphabetical,
 * it needs to decoded in the specific defined order.
 * @noInheritDoc
 */


var _jsonMap = /*#__PURE__*/_classPrivateFieldLooseKey("jsonMap");

var _Types = /*#__PURE__*/_classPrivateFieldLooseKey("Types");

export class Struct extends Map {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  constructor(registry, Types, value = {}, jsonMap = new Map()) {
    super(Object.entries(decodeStruct(registry, mapToTypeMap(registry, Types), value, jsonMap)));
    this.registry = void 0;
    this.createdAtHash = void 0;
    Object.defineProperty(this, _jsonMap, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _Types, {
      writable: true,
      value: void 0
    });
    this.registry = registry;
    _classPrivateFieldLooseBase(this, _jsonMap)[_jsonMap] = jsonMap;
    _classPrivateFieldLooseBase(this, _Types)[_Types] = mapToTypeMap(registry, Types);
  }

  static with(Types, jsonMap) {
    return class extends Struct {
      constructor(registry, value) {
        super(registry, Types, value, jsonMap);
        Object.keys(Types).forEach(key => {
          isUndefined(this[key]) && Object.defineProperty(this, key, {
            enumerable: true,
            get: () => this.get(key)
          });
        });
      }

    };
  }

  static typesToMap(registry, Types) {
    return Object.entries(Types).reduce((result, [key, Type]) => {
      result[key] = registry.getClassName(Type) || new Type(registry).toRawType();
      return result;
    }, {});
  }
  /**
   * @description The available keys for this struct
   */


  get defKeys() {
    return Object.keys(_classPrivateFieldLooseBase(this, _Types)[_Types]);
  }
  /**
   * @description Checks if the value is an empty value
   */


  get isEmpty() {
    const items = this.toArray();

    for (let i = 0; i < items.length; i++) {
      if (!items[i].isEmpty) {
        return false;
      }
    }

    return true;
  }
  /**
   * @description Returns the Type description to sthe structure
   */


  get Type() {
    return Object.entries(_classPrivateFieldLooseBase(this, _Types)[_Types]).reduce((result, [key, Type]) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      result[key] = new Type(this.registry).toRawType();
      return result;
    }, {});
  }
  /**
   * @description The length of the value when encoded as a Uint8Array
   */


  get encodedLength() {
    return this.toArray().reduce((length, entry) => {
      length += entry.encodedLength;
      return length;
    }, 0);
  }
  /**
   * @description returns a hash of the contents
   */


  get hash() {
    return this.registry.hash(this.toU8a());
  }
  /**
   * @description Compares the value of the input to see if there is a match
   */


  eq(other) {
    return compareMap(this, other);
  }
  /**
   * @description Returns a specific names entry in the structure
   * @param name The name of the entry to retrieve
   */


  get(name) {
    return super.get(name);
  }
  /**
   * @description Returns the values of a member at a specific index (Rather use get(name) for performance)
   */


  getAtIndex(index) {
    return this.toArray()[index];
  }
  /**
   * @description Converts the Object to an standard JavaScript Array
   */


  toArray() {
    return [...this.values()];
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


  toHuman(isExtended) {
    return [...this.keys()].reduce((json, key) => {
      const value = this.get(key);
      json[key] = value && value.toHuman(isExtended);
      return json;
    }, {});
  }
  /**
   * @description Converts the Object to JSON, typically used for RPC transfers
   */


  toJSON() {
    return [...this.keys()].reduce((json, key) => {
      const jsonKey = _classPrivateFieldLooseBase(this, _jsonMap)[_jsonMap].get(key) || key;
      const value = this.get(key);
      json[jsonKey] = value && value.toJSON();
      return json;
    }, {});
  }
  /**
   * @description Returns the base runtime type name for this instance
   */


  toRawType() {
    return stringify(Struct.typesToMap(this.registry, _classPrivateFieldLooseBase(this, _Types)[_Types]));
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
    // we have keyof S here, cast to string to make it compatible with isBare
    const entries = [...this.entries()];
    return u8aConcat(...entries // eslint-disable-next-line @typescript-eslint/unbound-method
    .filter(([, value]) => isFunction(value === null || value === void 0 ? void 0 : value.toU8a)).map(([key, value]) => value.toU8a(!isBare || isBoolean(isBare) ? isBare : isBare[key])));
  }

}