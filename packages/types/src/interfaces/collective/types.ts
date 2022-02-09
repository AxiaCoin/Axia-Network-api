// Auto-generated via `yarn axia-types-from-defs`, do not edit
/* eslint-disable */

import type { Enum, Struct, Vec, u32 } from '@axia-js/types';
import type { AccountId, BlockNumber } from '@axia-js/types/interfaces/runtime';
import type { ITuple } from '@axia-js/types/types';

/** @name CollectiveOrigin */
export interface CollectiveOrigin extends Enum {
  readonly isMembers: boolean;
  readonly asMembers: ITuple<[MemberCount, MemberCount]>;
  readonly isMember: boolean;
  readonly asMember: AccountId;
}

/** @name MemberCount */
export interface MemberCount extends u32 {}

/** @name ProposalIndex */
export interface ProposalIndex extends u32 {}

/** @name Votes */
export interface Votes extends Struct {
  readonly index: ProposalIndex;
  readonly threshold: MemberCount;
  readonly ayes: Vec<AccountId>;
  readonly nays: Vec<AccountId>;
  readonly end: BlockNumber;
}

/** @name VotesTo230 */
export interface VotesTo230 extends Struct {
  readonly index: ProposalIndex;
  readonly threshold: MemberCount;
  readonly ayes: Vec<AccountId>;
  readonly nays: Vec<AccountId>;
}

export type PHANTOM_COLLECTIVE = 'collective';
