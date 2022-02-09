// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { axlib } from "./axlib.js";
/** @internal */

export function getStorage(registry) {
  return {
    axlib: Object.entries(axlib).reduce((storage, [key, fn]) => {
      storage[key] = fn(registry);
      return storage;
    }, {})
  };
}