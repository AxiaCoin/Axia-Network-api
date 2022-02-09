// Auto-generated via `yarn axia-types-from-defs`, do not edit
/* eslint-disable */

import type { Struct, Vec } from '@axia-js/types';
import type { CandidateReceipt, ParaId } from '@axia-js/types/interfaces/allychains';
import type { AccountId, BlockNumber, H256, Hash } from '@axia-js/types/interfaces/runtime';
import type { SessionIndex } from '@axia-js/types/interfaces/session';

/** @name BlockAttestations */
export interface BlockAttestations extends Struct {
  readonly receipt: CandidateReceipt;
  readonly valid: Vec<AccountId>;
  readonly invalid: Vec<AccountId>;
}

/** @name IncludedBlocks */
export interface IncludedBlocks extends Struct {
  readonly actualNumber: BlockNumber;
  readonly session: SessionIndex;
  readonly randomSeed: H256;
  readonly activeAllychains: Vec<ParaId>;
  readonly paraBlocks: Vec<Hash>;
}

/** @name MoreAttestations */
export interface MoreAttestations extends Struct {}

export type PHANTOM_ATTESTATIONS = 'attestations';
