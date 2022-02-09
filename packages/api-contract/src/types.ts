// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiBase } from '@axia-js/api/base';
import type { ApiTypes } from '@axia-js/api/types';
import type { Text, u64 } from '@axia-js/types';
import type { ContractExecResultResult, ContractSelector } from '@axia-js/types/interfaces';
import type { Codec, TypeDef } from '@axia-js/types/types';
import type { BN } from '@axia-js/util';
import type { Abi } from '.';

export interface ContractBase<ApiType extends ApiTypes> {
  readonly abi: Abi;
  readonly api: ApiBase<ApiType>;

  getMessage: (name: string) => AbiMessage;
  messages: AbiMessage[];
}

export interface AbiParam {
  name: string;
  type: TypeDef;
}

export interface AbiEvent {
  args: AbiParam[];
  docs: string[];
  fromU8a: (data: Uint8Array) => DecodedEvent;
  identifier: string;
  index: number;
}

export interface AbiMessage {
  args: AbiParam[];
  docs: string[];
  fromU8a: (data: Uint8Array) => DecodedMessage;
  identifier: string;
  index: number;
  isConstructor?: boolean;
  isMutating?: boolean;
  isPayable?: boolean;
  method: string;
  returnType?: TypeDef | null;
  selector: ContractSelector;
  toU8a: (params: unknown[]) => Uint8Array;
}

export type AbiConstructor = AbiMessage;

export interface InterfaceContractCalls {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [index: string]: Function;
}

export interface ContractCallOutcome {
  debugMessage: Text;
  gasConsumed: u64;
  gasRequired: u64;
  output: Codec | null;
  result: ContractExecResultResult;
}

export interface DecodedEvent {
  args: Codec[];
  event: AbiEvent;
}

export interface DecodedMessage {
  args: Codec[];
  message: AbiMessage;
}

export interface BlueprintOptions {
  gasLimit?: bigint | string | number | BN;
  salt?: Uint8Array | string | null;
  value?: bigint | string | number | BN;
}

export interface ContractOptions {
  gasLimit?: bigint | BN | string | number;
  value?: bigint | BN | string | number;
}
