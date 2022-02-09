// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@axia-js/api';
import type { AnyJson } from '@axia-js/types/types';

import { decorateMethodPromise } from '@axia-js/api';

import { Abi } from '../Abi';
import { Code as BaseCode } from '../base';

export class Code extends BaseCode<'promise'> {
  constructor (api: ApiPromise, abi: AnyJson | Abi, wasm: Uint8Array | string | Buffer | null | undefined) {
    super(api, abi, wasm, decorateMethodPromise);
  }
}
