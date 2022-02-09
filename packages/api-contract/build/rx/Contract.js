// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { decorateMethodRx } from '@axia-js/api';
import { Contract as BaseContract } from "../base/index.js";
export class Contract extends BaseContract {
  constructor(api, abi, address) {
    super(api, abi, address, decorateMethodRx);
  }

}