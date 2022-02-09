// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { isU8a } from '@axia-js/util';
import { Struct } from "../../codec/Struct.js";
export const EXTRINSIC_VERSION = 4;

/**
 * @name GenericExtrinsicV4
 * @description
 * The third generation of compact extrinsics
 */
export class GenericExtrinsicV4 extends Struct {
  constructor(registry, value, {
    isSigned
  } = {}) {
    super(registry, {
      signature: 'ExtrinsicSignatureV4',
      // eslint-disable-next-line sort-keys
      method: 'Call'
    }, GenericExtrinsicV4.decodeExtrinsic(registry, value, isSigned));
  }
  /** @internal */


  static decodeExtrinsic(registry, value, isSigned = false) {
    if (value instanceof GenericExtrinsicV4) {
      return value;
    } else if (value instanceof registry.createClass('Call')) {
      return {
        method: value
      };
    } else if (isU8a(value)) {
      // here we decode manually since we need to pull through the version information
      const signature = registry.createType('ExtrinsicSignatureV4', value, {
        isSigned
      });
      const method = registry.createType('Call', value.subarray(signature.encodedLength));
      return {
        method,
        signature
      };
    }

    return value || {};
  }
  /**
   * @description The length of the value when encoded as a Uint8Array
   */


  get encodedLength() {
    return this.toU8a().length;
  }
  /**
   * @description The [[Call]] this extrinsic wraps
   */


  get method() {
    return this.get('method');
  }
  /**
   * @description The [[ExtrinsicSignatureV4]]
   */


  get signature() {
    return this.get('signature');
  }
  /**
   * @description The version for the signature
   */


  get version() {
    return EXTRINSIC_VERSION;
  }
  /**
   * @description Add an [[ExtrinsicSignatureV4]] to the extrinsic (already generated)
   */


  addSignature(signer, signature, payload) {
    this.signature.addSignature(signer, signature, payload);
    return this;
  }
  /**
   * @description Sign the extrinsic with a specific keypair
   */


  sign(account, options) {
    this.signature.sign(this.method, account, options);
    return this;
  }
  /**
   * @describe Adds a fake signature to the extrinsic
   */


  signFake(signer, options) {
    this.signature.signFake(this.method, signer, options);
    return this;
  }

}