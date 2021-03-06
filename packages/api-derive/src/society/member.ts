// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@axia-js/api/types';
import type { AccountId } from '@axia-js/types/interfaces';
import type { DeriveSocietyMember } from '../types';

import { map } from 'rxjs';

import { memo } from '../util';

/**
 * @description Get the member info for a society
 */
export function member (instanceId: string, api: ApiInterfaceRx): (accountId: AccountId) => Observable<DeriveSocietyMember> {
  return memo(instanceId, (accountId: AccountId): Observable<DeriveSocietyMember> =>
    api.derive.society._members([accountId]).pipe(
      map(([result]) => result)
    )
  );
}
