// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@axia-js/api/types';
import type { Option, Vec } from '@axia-js/types';
import type { AccountId, BalanceOf, Bid, BidKind } from '@axia-js/types/interfaces';
import type { ITuple } from '@axia-js/types/types';
import type { DeriveSocietyCandidate } from '../types';

import { combineLatest, map, of, switchMap } from 'rxjs';

import { memo } from '../util';

type ResultSuspend = Option<ITuple<[BalanceOf, BidKind]>>;
type Result = [Bid[], ResultSuspend[]]

/**
 * @description Get the candidate info for a society
 */
export function candidates (instanceId: string, api: ApiInterfaceRx): () => Observable<DeriveSocietyCandidate[]> {
  return memo(instanceId, (): Observable<DeriveSocietyCandidate[]> =>
    api.query.society.candidates<Vec<Bid>>().pipe(
      switchMap((candidates: Vec<Bid>): Observable<Result> =>
        combineLatest([
          of(candidates),
          api.query.society.suspendedCandidates.multi<ResultSuspend>(
            candidates.map(({ who }): AccountId => who))
        ])
      ),
      map(([candidates, suspended]: Result): DeriveSocietyCandidate[] =>
        candidates.map(({ kind, value, who }, index) => ({
          accountId: who,
          isSuspended: suspended[index].isSome,
          kind,
          value
        }))
      )
    )
  );
}
