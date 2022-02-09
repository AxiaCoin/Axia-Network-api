// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableResult } from '@axia-js/api';
import type { SubmittableExtrinsic } from '@axia-js/api/submittable/types';
import type { ApiTypes } from '@axia-js/api/types';
import type { BN } from '@axia-js/util';
import type { AbiConstructor, BlueprintOptions } from '../types';
import type { BlueprintDeploy, ContractGeneric } from './types';

import { Bytes } from '@axia-js/types';
import { compactAddLength, u8aToU8a } from '@axia-js/util';
import { randomAsU8a } from '@axia-js/util-crypto';

import { extractOptions, isOptions } from '../util';

export const EMPTY_SALT = new Uint8Array();

export function createBluePrintTx <ApiType extends ApiTypes, R extends SubmittableResult> (fn: (options: BlueprintOptions, params: unknown[]) => SubmittableExtrinsic<ApiType, R>): BlueprintDeploy<ApiType> {
  return (options: bigint | string | number | BN | BlueprintOptions, ...params: unknown[]): SubmittableExtrinsic<ApiType, R> =>
    isOptions(options)
      ? fn(options, params)
      : fn(...extractOptions(options, params));
}

export function createBluePrintWithId <T> (fn: (constructorOrId: AbiConstructor | string | number, options: BlueprintOptions, params: unknown[]) => T): ContractGeneric<BlueprintOptions, T> {
  return (constructorOrId: AbiConstructor | string | number, options: bigint | string | number | BN | BlueprintOptions, ...params: unknown[]): T =>
    isOptions(options)
      ? fn(constructorOrId, options, params)
      : fn(constructorOrId, ...extractOptions(options, params));
}

export function encodeSalt (salt: Uint8Array | string | null = randomAsU8a()): Uint8Array {
  return salt instanceof Bytes
    ? salt
    : salt && salt.length
      ? compactAddLength(u8aToU8a(salt))
      : EMPTY_SALT;
}
