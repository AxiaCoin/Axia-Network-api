// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Hash } from '@axia-js/types/interfaces';
import type { AnyJson } from '@axia-js/types/types';

import { ApiPromise, decorateMethodPromise } from '@axia-js/api';

import { Abi } from '../Abi';
import { Blueprint as BaseBlueprint } from '../base';

export class Blueprint extends BaseBlueprint<'promise'> {
  constructor (api: ApiPromise, abi: AnyJson | Abi, codeHash: string | Hash) {
    super(api, abi, codeHash, decorateMethodPromise);
  }
}
