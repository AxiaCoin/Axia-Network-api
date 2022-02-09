// Copyright 2017-2021 @axia-js/rpc-core authors & contributors
// SPDX-License-Identifier: Apache-2.0

// FIXME, this whole file needs to move to API

import type { AnyFunction } from '@axia-js/types/types';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RpcInterface {}

export type AugmentedRpc<F extends AnyFunction> = F;
