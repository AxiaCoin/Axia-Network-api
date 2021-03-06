// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiRx } from '@axia-js/api';
import type { AnyJson } from '@axia-js/types/types';

import { decorateMethodRx } from '@axia-js/api';

import { Abi } from '../Abi';
import { Code as BaseCode } from '../base';

export class Code extends BaseCode<'rxjs'> {
  constructor (api: ApiRx, abi: AnyJson | Abi, wasm: Uint8Array | string | Buffer | null | undefined) {
    super(api, abi, wasm, decorateMethodRx);
  }
}
