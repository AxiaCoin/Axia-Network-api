// Auto-generated via `yarn axia-types-from-defs`, do not edit
/* eslint-disable */

import type { Bytes, Enum, Struct } from '@axia-js/types';
import type { Balance, Permill } from '@axia-js/types/interfaces/runtime';

/** @name AccountStatus */
export interface AccountStatus extends Struct {
  readonly validity: AccountValidity;
  readonly freeBalance: Balance;
  readonly lockedBalance: Balance;
  readonly signature: Bytes;
  readonly vat: Permill;
}

/** @name AccountValidity */
export interface AccountValidity extends Enum {
  readonly isInvalid: boolean;
  readonly isInitiated: boolean;
  readonly isPending: boolean;
  readonly isValidLow: boolean;
  readonly isValidHigh: boolean;
  readonly isCompleted: boolean;
}

export type PHANTOM_PURCHASE = 'purchase';
