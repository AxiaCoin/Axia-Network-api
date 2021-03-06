// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { hexToU8a, isHex, isString, isU8a, u8aToU8a } from '@axia-js/util';
import { ethereumEncode, isEthereumAddress } from '@axia-js/util-crypto';
import { U8aFixed } from "../codec/U8aFixed.js";
/** @internal */

function decodeAccountId(value) {
  if (isU8a(value) || Array.isArray(value)) {
    return u8aToU8a(value);
  } else if (isHex(value) || isEthereumAddress(value)) {
    return hexToU8a(value);
  } else if (isString(value)) {
    return u8aToU8a(value);
  }

  return value;
}
/**
 * @name GenericEthereumAccountId
 * @description
 * A wrapper around an Ethereum-compatible AccountId. Since we are dealing with
 * underlying addresses (20 bytes in length), we extend from U8aFixed which is
 * just a Uint8Array wrapper with a fixed length.
 */


export class GenericEthereumAccountId extends U8aFixed {
  constructor(registry, value = new Uint8Array()) {
    super(registry, decodeAccountId(value), 160);
  }

  static encode(value) {
    return ethereumEncode(value);
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
    return GenericEthereumAccountId.encode(this);
  }
  /**
   * @description Returns the base runtime type name for this instance
   */


  toRawType() {
    return 'AccountId';
  }

}