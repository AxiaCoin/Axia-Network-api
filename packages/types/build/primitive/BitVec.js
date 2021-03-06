// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, compactFromU8a, compactToU8a, isString, u8aConcat, u8aToU8a } from '@axia-js/util';
import { Raw } from "../codec/Raw.js";
/** @internal */

function decodeBitVecU8a(value) {
  if (!value || !value.length) {
    return [0, new Uint8Array()];
  } // handle all other Uint8Array inputs, these do have a length prefix which is the number of bits encoded


  const [offset, length] = compactFromU8a(value);
  const total = offset + Math.ceil(length.toNumber() / 8);
  assert(total <= value.length, () => `BitVec: required length less than remainder, expected at least ${total}, found ${value.length}`);
  return [length.toNumber(), value.subarray(offset, total)];
}
/** @internal */


function decodeBitVec(value) {
  if (Array.isArray(value) || isString(value)) {
    const u8a = u8aToU8a(value);
    return [u8a.length / 8, u8a];
  }

  return decodeBitVecU8a(value);
}
/**
 * @name BitVec
 * @description
 * A BitVec that represents an array of bits. The bits are however stored encoded. The difference between this
 * and a normal Bytes would be that the length prefix indicates the number of bits encoded, not the bytes
 */


export class BitVec extends Raw {
  constructor(registry, value) {
    const [decodedLength, u8a] = decodeBitVec(value);
    super(registry, u8a);
    this._decodedLength = void 0;
    this._decodedLength = decodedLength;
  }
  /**
   * @description The length of the value when encoded as a Uint8Array
   */


  get encodedLength() {
    return this.length + compactToU8a(this._decodedLength).length;
  }

  toHuman() {
    return `0b${[...this.toU8a(true)].map(d => `00000000${d.toString(2)}`.slice(-8)).join('_')}`;
  }
  /**
   * @description Returns the base runtime type name for this instance
   */


  toRawType() {
    return 'BitVec';
  }
  /**
   * @description Encodes the value as a Uint8Array as per the SCALE specifications
   * @param isBare true when the value has none of the type-specific prefixes (internal)
   */


  toU8a(isBare) {
    const bitVec = super.toU8a();
    return isBare ? bitVec : u8aConcat(compactToU8a(this._decodedLength), bitVec);
  }

}