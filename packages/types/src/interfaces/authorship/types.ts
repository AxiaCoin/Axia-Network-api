// Auto-generated via `yarn axia-types-from-defs`, do not edit
/* eslint-disable */

import type { Enum, Option } from '@axia-js/types';
import type { AccountId, BlockNumber, Hash } from '@axia-js/types/interfaces/runtime';
import type { ITuple } from '@axia-js/types/types';

/** @name UncleEntryItem */
export interface UncleEntryItem extends Enum {
  readonly isInclusionHeight: boolean;
  readonly asInclusionHeight: BlockNumber;
  readonly isUncle: boolean;
  readonly asUncle: ITuple<[Hash, Option<AccountId>]>;
}

export type PHANTOM_AUTHORSHIP = 'authorship';
