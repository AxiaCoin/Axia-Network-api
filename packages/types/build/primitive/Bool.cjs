"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bool = void 0;

var _util = require("@axia-js/util");

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** @internal */
function decodeBool(value) {
  if (value instanceof Boolean) {
    return value.valueOf();
  } else if ((0, _util.isU8a)(value)) {
    return value[0] === 1;
  }

  return !!value;
}
/**
 * @name bool
 * @description
 * Representation for a boolean value in the system. It extends the base JS `Boolean` class
 * @noInheritDoc
 */


class bool extends Boolean {
  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(registry) {
    let value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    super(decodeBool(value));
    this.registry = void 0;
    this.createdAtHash = void 0;
    this.registry = registry;
  }
  /**
   * @description The length of the value when encoded as a Uint8Array
   */


  get encodedLength() {
    return 1;
  }
  /**
   * @description returns a hash of the contents
   */


  get hash() {
    return this.registry.hash(this.toU8a());
  }
  /**
   * @description Checks if the value is an empty value (true when it wraps false/default)
   */


  get isEmpty() {
    return this.isFalse;
  }
  /**
   * @description Checks if the value is an empty value (always false)
   */


  get isFalse() {
    return !this.isTrue;
  }
  /**
   * @description Checks if the value is an empty value (always false)
   */


  get isTrue() {
    return this.valueOf();
  }
  /**
   * @description Compares the value of the input to see if there is a match
   */


  eq(other) {
    return this.valueOf() === (other instanceof Boolean ? other.valueOf() : other);
  }
  /**
   * @description Returns a hex string representation of the value
   */


  toHex() {
    return (0, _util.u8aToHex)(this.toU8a());
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
    return this.valueOf();
  }
  /**
   * @description Returns the base runtime type name for this instance
   */


  toRawType() {
    return 'bool';
  }
  /**
   * @description Returns the string representation of the value
   */


  toString() {
    return this.toJSON().toString();
  }
  /**
   * @description Encodes the value as a Uint8Array as per the SCALE specifications
   * @param isBare true when the value has none of the type-specific prefixes (internal)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars


  toU8a(isBare) {
    return new Uint8Array([this.valueOf() ? 1 : 0]);
  }

}

exports.bool = bool;