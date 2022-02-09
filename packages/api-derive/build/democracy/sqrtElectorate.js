// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { map } from 'rxjs';
import { bnSqrt } from '@axia-js/util';
import { memo } from "../util/index.js";
export function sqrtElectorate(instanceId, api) {
  return memo(instanceId, () => api.query.balances.totalIssuance().pipe(map(totalIssuance => bnSqrt(totalIssuance))));
}