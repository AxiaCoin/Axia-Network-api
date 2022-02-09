// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@axia-js/types/interfaces';
import type { AnyJson } from '@axia-js/types/types';

import { ApiRx, decorateMethodRx } from '@axia-js/api';

import { Abi } from '../Abi';
import { Contract as BaseContract } from '../base';

export class Contract extends BaseContract<'rxjs'> {
  constructor (api: ApiRx, abi: AnyJson | Abi, address: string | AccountId) {
    super(api, abi, address, decorateMethodRx);
  }
}
