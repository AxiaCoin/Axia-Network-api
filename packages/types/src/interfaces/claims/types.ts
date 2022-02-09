// Auto-generated via `yarn axia-types-from-defs`, do not edit
/* eslint-disable */

import type { Enum } from '@axia-js/types';
import type { H160 } from '@axia-js/types/interfaces/runtime';

/** @name EthereumAddress */
export interface EthereumAddress extends H160 {}

/** @name StatementKind */
export interface StatementKind extends Enum {
  readonly isRegular: boolean;
  readonly isSaft: boolean;
}

export type PHANTOM_CLAIMS = 'claims';
