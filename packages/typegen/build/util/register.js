// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
export function registerDefinitions(registry, extras) {
  Object.values(extras).forEach(def => {
    Object.values(def).forEach(({
      types
    }) => {
      registry.register(types);
    });
  });
}