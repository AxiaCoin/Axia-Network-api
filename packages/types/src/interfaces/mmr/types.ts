// Auto-generated via `yarn axia-types-from-defs`, do not edit
/* eslint-disable */

import type { Bytes, Struct } from '@axia-js/types';
import type { BlockHash } from '@axia-js/types/interfaces/chain';

/** @name MmrLeafProof */
export interface MmrLeafProof extends Struct {
  readonly blockHash: BlockHash;
  readonly leaf: Bytes;
  readonly proof: Bytes;
}

export type PHANTOM_MMR = 'mmr';
