// Auto-generated via `yarn axia-types-from-defs`, do not edit
/* eslint-disable */

import type { Struct } from '@axia-js/types';
import type { Balance, BlockNumber } from '@axia-js/types/interfaces/runtime';

/** @name VestingInfo */
export interface VestingInfo extends Struct {
  readonly locked: Balance;
  readonly perBlock: Balance;
  readonly startingBlock: BlockNumber;
}

export type PHANTOM_VESTING = 'vesting';
