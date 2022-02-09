// Copyright 2017-2021 @axia-js/api authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { isFunction } from '@axia-js/util';
export function isKeyringPair(account) {
  return isFunction(account.sign);
}