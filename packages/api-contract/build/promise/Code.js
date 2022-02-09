// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { decorateMethodPromise } from '@axia-js/api';
import { Code as BaseCode } from "../base/index.js";
export class Code extends BaseCode {
  constructor(api, abi, wasm) {
    super(api, abi, wasm, decorateMethodPromise);
  }

}