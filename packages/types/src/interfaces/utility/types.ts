// Auto-generated via `yarn axia-types-from-defs`, do not edit
/* eslint-disable */

import type { Struct, Vec, u32 } from '@axia-js/types';
import type { AccountId, Balance, BlockNumber } from '@axia-js/types/interfaces/runtime';

/** @name Multisig */
export interface Multisig extends Struct {
  readonly when: Timepoint;
  readonly deposit: Balance;
  readonly depositor: AccountId;
  readonly approvals: Vec<AccountId>;
}

/** @name Timepoint */
export interface Timepoint extends Struct {
  readonly height: BlockNumber;
  readonly index: u32;
}

export type PHANTOM_UTILITY = 'utility';
