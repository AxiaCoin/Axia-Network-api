// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { isString } from '@axia-js/util';
export function typeToConstructor(registry, type) {
  return isString(type) ? registry.createClass(type) : type;
}