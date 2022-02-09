// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
export * from "./derived.js";
export * from "./docs.js";
export * from "./file.js";
export * from "./formatting.js";
export * from "./imports.js";
export * from "./initMeta.js";
export * from "./register.js";
export function compareName(a, b) {
  return a.name.toString().localeCompare(b.name.toString());
}