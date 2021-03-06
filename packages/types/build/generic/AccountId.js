// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, hexToU8a, isHex, isString, isU8a, u8aToU8a } from '@axia-js/util';
import { decodeAddress, encodeAddress } from '@axia-js/util-crypto';
import { U8aFixed } from "../codec/U8aFixed.js";
/** @internal */

function decodeAccountId(value) {
  if (!value) {
    return new Uint8Array();
  } else if (isU8a(value) || Array.isArray(value)) {
    return u8aToU8a(value);
  } else if (isHex(value)) {
    return hexToU8a(value);
  } else if (isString(value)) {
    return decodeAddress(value);
  }

  throw new Error(`Unknown type passed to AccountId constructor, found typeof ${typeof value}`);
}
/**
 * @name GenericAccountId
 * @description
 * A wrapper around an AccountId/PublicKey representation. Since we are dealing with
 * underlying PublicKeys (32 bytes in length), we extend from U8aFixed which is
 * just a Uint8Array wrapper with a fixed length.
 */


export class GenericAccountId extends U8aFixed {
  constructor(registry, value) {
    const decoded = decodeAccountId(value); // Part of stream containing >= 32 bytes or a all empty (defaults)

    assert(decoded.length >= 32 || !decoded.some(b => b), () => `Invalid AccountId provided, expected 32 bytes, found ${decoded.length}`);
    super(registry, decoded, 256);
  }
  /**
   * @description Compares the value of the input to see if there is a match
   */


  eq(other) {
    return super.eq(decodeAccountId(other));
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
    return this.toString();
  }
  /**
   * @description Returns the string representation of the value
   */


  toString() {
    return encodeAddress(this, this.registry.chainSS58);
  }
  /**
   * @description Returns the base runtime type name for this instance
   */


  toRawType() {
    return 'AccountId';
  }

}