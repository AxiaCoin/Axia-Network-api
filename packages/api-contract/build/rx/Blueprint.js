// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { decorateMethodRx } from '@axia-js/api';
import { Blueprint as BaseBlueprint } from "../base/index.js";
export class Blueprint extends BaseBlueprint {
  constructor(api, abi, codeHash) {
    super(api, abi, codeHash, decorateMethodRx);
  }

}