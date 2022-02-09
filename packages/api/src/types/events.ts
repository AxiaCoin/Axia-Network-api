// Copyright 2017-2021 @axia-js/api authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IsEvent } from '@axia-js/types/metadata/decorate/types';
import type { AnyTuple } from '@axia-js/types/types';
import type { ApiTypes } from './base';

// In events we don't need the ApiType, however add it for consistency
// eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/no-unused-vars
export interface AugmentedEvents<ApiType extends ApiTypes> { }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type AugmentedEvent<ApiType extends ApiTypes, T extends AnyTuple = AnyTuple> = IsEvent<T>;

export interface ModuleEvents<ApiType extends ApiTypes> {
  [key: string]: AugmentedEvent<ApiType, AnyTuple>;
}
