// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, DispatchError, DispatchInfo, Event, EventRecord, Extrinsic, Header, SignedBlock } from '@axia-js/types/interfaces';

export interface HeaderExtended extends Header {
  readonly author: AccountId | undefined;
  readonly validators: AccountId[] | undefined;
}

export interface SignedBlockExtended extends SignedBlock {
  readonly author: AccountId | undefined;
  readonly events: EventRecord[];
  readonly extrinsics: TxWithEvent[];
}

export interface TxWithEvent {
  dispatchError?: DispatchError;
  dispatchInfo?: DispatchInfo;
  events: Event[];
  extrinsic: Extrinsic;
}
