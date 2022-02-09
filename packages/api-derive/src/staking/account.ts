// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@axia-js/api/types';
import type { Balance, StakingLedger, UnlockChunk } from '@axia-js/types/interfaces';
import type { DeriveSessionInfo, DeriveStakingAccount, DeriveStakingKeys, DeriveStakingQuery, DeriveUnlocking } from '../types';

import { combineLatest, map, switchMap } from 'rxjs';

import { BN, BN_ZERO } from '@axia-js/util';

import { memo } from '../util';

const QUERY_OPTS = {
  withDestination: true,
  withLedger: true,
  withNominations: true,
  withPrefs: true
};

function groupByEra (list: UnlockChunk[]): Record<string, BN> {
  return list.reduce((map: Record<string, BN>, { era, value }): Record<string, BN> => {
    const key = era.toString();

    map[key] = (map[key] || BN_ZERO).add(value.unwrap());

    return map;
  }, {});
}

function calculateUnlocking (api: ApiInterfaceRx, stakingLedger: StakingLedger | undefined, sessionInfo: DeriveSessionInfo): DeriveUnlocking[] | undefined {
  const results = Object
    .entries(groupByEra(
      (stakingLedger?.unlocking || []).filter(({ era }) => era.unwrap().gt(sessionInfo.activeEra))
    ))
    .map(([eraString, value]): DeriveUnlocking => ({
      remainingEras: new BN(eraString).isub(sessionInfo.activeEra),
      value: api.registry.createType('Balance', value)
    }));

  return results.length
    ? results
    : undefined;
}

function redeemableSum (api: ApiInterfaceRx, stakingLedger: StakingLedger | undefined, sessionInfo: DeriveSessionInfo): Balance {
  return api.registry.createType('Balance', (stakingLedger?.unlocking || [] as UnlockChunk[]).reduce((total, { era, value }): BN => {
    return sessionInfo.activeEra.gte(era.unwrap())
      ? total.iadd(value.unwrap())
      : total;
  }, new BN(0)));
}

function parseResult (api: ApiInterfaceRx, sessionInfo: DeriveSessionInfo, keys: DeriveStakingKeys, query: DeriveStakingQuery): DeriveStakingAccount {
  return {
    ...keys,
    ...query,
    redeemable: redeemableSum(api, query.stakingLedger, sessionInfo),
    unlocking: calculateUnlocking(api, query.stakingLedger, sessionInfo)
  };
}

/**
 * @description From a list of stashes, fill in all the relevant staking details
 */
export function accounts (instanceId: string, api: ApiInterfaceRx): (accountIds: (Uint8Array | string)[]) => Observable<DeriveStakingAccount[]> {
  return memo(instanceId, (accountIds: (Uint8Array | string)[]): Observable<DeriveStakingAccount[]> =>
    api.derive.session.info().pipe(
      switchMap((sessionInfo) =>
        combineLatest([
          api.derive.staking.keysMulti(accountIds),
          api.derive.staking.queryMulti(accountIds, QUERY_OPTS)
        ]).pipe(
          map(([keys, queries]) => queries.map((query, index) => parseResult(api, sessionInfo, keys[index], query)))
        )
      )
    )
  );
}

/**
 * @description From a stash, retrieve the controllerId and fill in all the relevant staking details
 */
export function account (instanceId: string, api: ApiInterfaceRx): (accountId: Uint8Array | string) => Observable<DeriveStakingAccount> {
  return memo(instanceId, (accountId: Uint8Array | string): Observable<DeriveStakingAccount> =>
    api.derive.staking.accounts([accountId]).pipe(
      map(([first]) => first)
    )
  );
}