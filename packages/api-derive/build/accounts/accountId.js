// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { map, of } from 'rxjs';
import { assertReturn, isU8a } from '@axia-js/util';
import { decodeAddress } from '@axia-js/util-crypto';
import { memo } from "../util/index.js";

function retrieve(api, address) {
  const decoded = isU8a(address) ? address : decodeAddress((address || '').toString());

  if (decoded.length > 8) {
    return of(api.registry.createType('AccountId', decoded));
  }

  const accountIndex = api.registry.createType('AccountIndex', decoded);
  return api.derive.accounts.indexToId(accountIndex.toString()).pipe(map(accountId => assertReturn(accountId, 'Unable to retrieve accountId')));
}
/**
 * @name accountId
 * @param {(Address | AccountId | AccountIndex | string | null)} address - An accounts address in various formats.
 * @description  An [[AccountId]]
 */


export function accountId(instanceId, api) {
  return memo(instanceId, address => retrieve(api, address));
}