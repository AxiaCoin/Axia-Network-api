// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@axia-js/api/types';
import type { Option } from '@axia-js/types';
import type { ReferendumInfo, ReferendumInfoFinished } from '@axia-js/types/interfaces';

import { map, switchMap } from 'rxjs';

import { memo } from '../util';

export function referendumsFinished (instanceId: string, api: ApiInterfaceRx): () => Observable<ReferendumInfoFinished[]> {
  return memo(instanceId, (): Observable<ReferendumInfoFinished[]> =>
    api.derive.democracy.referendumIds().pipe(
      switchMap((ids) =>
        api.query.democracy.referendumInfoOf.multi<Option<ReferendumInfo>>(ids)
      ),
      map((infos): ReferendumInfoFinished[] =>
        infos
          .map((optInfo) => optInfo.unwrapOr(null))
          .filter((info): info is ReferendumInfo => !!info && info.isFinished)
          .map((info) => info.asFinished)
      )
    )
  );
}
