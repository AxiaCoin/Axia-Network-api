// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@axia-js/api/types';
import type { Vec } from '@axia-js/types';
import type { EventRecord, SignedBlock } from '@axia-js/types/interfaces';
import type { HeaderExtended, SignedBlockExtended } from '../type/types';

import { combineLatest, map, of, switchMap } from 'rxjs';

import { createSignedBlockExtended } from '../type';
import { memo } from '../util';

/**
 * @name subscribeNewBlocks
 * @returns The latest block & events for that block
 */
export function subscribeNewBlocks (instanceId: string, api: ApiInterfaceRx): () => Observable<SignedBlockExtended> {
  return memo(instanceId, (): Observable<SignedBlockExtended> =>
    api.derive.chain.subscribeNewHeads().pipe(
      switchMap((header): Observable<[SignedBlock, Vec<EventRecord>, HeaderExtended]> => {
        const blockHash = header.createdAtHash || header.hash;

        return combineLatest(
          api.rpc.chain.getBlock(blockHash),
          api.query.system.events.at(blockHash),
          of(header)
        );
      }),
      map(([block, events, header]) =>
        createSignedBlockExtended(block.registry, block, events, header.validators)
      )
    )
  );
}
