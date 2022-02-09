// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { combineLatest, of } from 'rxjs';
import { memo } from "../util/index.js";
export function votingBalances(instanceId, api) {
  return memo(instanceId, addresses => !addresses || !addresses.length ? of([]) : combineLatest(addresses.map(accountId => api.derive.balances.account(accountId))));
}