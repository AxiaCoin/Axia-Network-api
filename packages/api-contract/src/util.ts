// Copyright 2017-2021 @axia-js/rpc-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableResult } from '@axia-js/api';
import type { EventRecord } from '@axia-js/types/interfaces';
import type { BN } from '@axia-js/util';
import type { BlueprintOptions, ContractOptions } from './types';

import { isBigInt, isBn, isNumber, isString } from '@axia-js/util';

type ContractEvents = 'CodeStored' | 'ContractEmitted' | 'ContractExecution' | 'Instantiated';

type TOptions = BlueprintOptions | ContractOptions;

export function applyOnEvent <T> (result: SubmittableResult, types: ContractEvents[], fn: (records: EventRecord[]) => T): T | undefined {
  if (result.isInBlock || result.isFinalized) {
    const records = result.filterRecords('contracts', types);

    if (records.length) {
      return fn(records);
    }
  }

  return undefined;
}

export function isOptions <T> (options: bigint | string | number | BN | T): options is T {
  return !(isBn(options) || isBigInt(options) || isNumber(options) || isString(options));
}

export function extractOptions <T extends TOptions> (value: bigint | string | number | BN, params: unknown[]): [T, unknown[]] {
  const gasLimit = params.shift() as BN;

  return [{ gasLimit, value } as T, params];
}
