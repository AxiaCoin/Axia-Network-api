// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@axia-js/api/types';
import type { AccountId } from '@axia-js/types/interfaces';

import { prime as collectivePrime } from '../collective';
import { memo } from '../util';

export function prime (instanceId: string, api: ApiInterfaceRx): () => Observable<AccountId | null> {
  return memo(instanceId, collectivePrime(instanceId, api, 'membership'));
}
