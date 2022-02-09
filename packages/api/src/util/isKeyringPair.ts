// Copyright 2017-2021 @axia-js/api authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, Address } from '@axia-js/types/interfaces';
import type { IKeyringPair } from '@axia-js/types/types';

import { isFunction } from '@axia-js/util';

export function isKeyringPair (account: string | IKeyringPair | AccountId | Address): account is IKeyringPair {
  return isFunction((account as IKeyringPair).sign);
}
