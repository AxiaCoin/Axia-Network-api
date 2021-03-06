// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { combineLatest, map, of, switchMap } from 'rxjs';
import { createSignedBlockExtended } from "../type/index.js";
import { memo } from "../util/index.js";
/**
 * @name subscribeNewBlocks
 * @returns The latest block & events for that block
 */

export function subscribeNewBlocks(instanceId, api) {
  return memo(instanceId, () => api.derive.chain.subscribeNewHeads().pipe(switchMap(header => {
    const blockHash = header.createdAtHash || header.hash;
    return combineLatest(api.rpc.chain.getBlock(blockHash), api.query.system.events.at(blockHash), of(header));
  }), map(([block, events, header]) => createSignedBlockExtended(block.registry, block, events, header.validators))));
}