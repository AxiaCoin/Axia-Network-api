// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, isAscii, isUndefined, isUtf8, u8aToHex, u8aToString, u8aToU8a } from '@axia-js/util';
/**
 * @name Raw
 * @description
 * A basic wrapper around Uint8Array, with no frills and no fuss. It does differ
 * from other implementations where it will consume the full Uint8Array as passed to it.
 * As such it is meant to be subclassed where the wrapper takes care of the
 * actual lengths instead of used directly.
 * @noInheritDoc
 */

export class Raw extends Uint8Array {
  constructor(registry, value) {
    super(u8aToU8a(value));
    this.registry = void 0;
    this.createdAtHash = void 0;
    this.registry = registry;
  }
  /**
   * @description The length of the value when encoded as a Uint8Array
   */


  get encodedLength() {
    return this.length;
  }
  /**
   * @description returns a hash of the contents
   */


  get hash() {
    return this.registry.hash(this.toU8a());
  }
  /**
   * @description Returns true if the wrapped value contains only ASCII printable characters
   */


  get isAscii() {
    return isAscii(this);
  }
  /**
   * @description Returns true if the type wraps an empty/default all-0 value
   */


  get isEmpty() {
    return !this.length || isUndefined(this.find(value => !!value));
  }
  /**
   * @description Returns true if the wrapped value contains only utf8 characters
   */


  get isUtf8() {
    return isUtf8(this);
  }
  /**
   * @description The length of the value
   */


  get length() {
    // only included here since we ignore inherited docs
    return super.length;
  }
  /**
   * @description Returns the number of bits in the value
   */


  bitLength() {
    return this.length * 8;
  }
  /**
   * @description Compares the value of the input to see if there is a match
   */


  eq(other) {
    if (other instanceof Uint8Array) {
      return this.length === other.length && !this.some((value, index) => value !== other[index]);
    }

    return this.eq(u8aToU8a(other));
  }
  /**
   * @description Create a new slice from the actual buffer. (compat)
   * @param start The position to start at
   * @param end The position to end at
   */


  slice(start, end) {
    // Like subarray below, we have to follow this approach since we are extending the TypeArray.
    // This happens especially when it comes to further extensions, the length may be an override
    return Uint8Array.from(this).slice(start, end);
  }
  /**
   * @description Create a new subarray from the actual buffer. (compat)
   * @param begin The position to start at
   * @param end The position to end at
   */


  subarray(begin, end) {
    return Uint8Array.from(this).subarray(begin, end);
  }
  /**
   * @description Returns a hex string representation of the value
   */


  toHex() {
    return u8aToHex(this);
  }
  /**
   * @description Converts the Object to to a human-friendly JSON, with additional fields, expansion and formatting of information
   */


  toHuman() {
    return this.isAscii ? this.toUtf8() : this.toJSON();
  }
  /**
   * @description Converts the Object to JSON, typically used for RPC transfers
   */


  toJSON() {
    return this.toHex();
  }
  /**
   * @description Returns the base runtime type name for this instance
   */


  toRawType() {
    return 'Raw';
  }
  /**
   * @description Returns the string representation of the value
   */


  toString() {
    return this.toHex();
  }
  /**
   * @description Encodes the value as a Uint8Array as per the SCALE specifications
   * @param isBare true when the value has none of the type-specific prefixes (internal)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars


  toU8a(isBare) {
    return Uint8Array.from(this);
  }
  /**
   * @description Returns the wrapped data as a UTF-8 string
   */


  toUtf8() {
    assert(this.isUtf8, 'The character sequence is not a valid Utf8 string');
    return u8aToString(this);
  }

}