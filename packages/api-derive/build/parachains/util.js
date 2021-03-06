// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
export function didUpdateToBool(didUpdate, id) {
  return didUpdate.isSome ? didUpdate.unwrap().some(paraId => paraId.eq(id)) : false;
}