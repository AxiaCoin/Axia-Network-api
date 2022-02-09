// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface DeriveCache {
  del: (key: string) => void;
  forEach: (cb: (key: string, value: any) => void) => void;
  get: <T = any> (key: string) => T | undefined;
  set: (key: string, value: any) => void;
}
