// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { Bytes } from '@axia-js/types';
import { compactAddLength, u8aToU8a } from '@axia-js/util';
import { randomAsU8a } from '@axia-js/util-crypto';
import { extractOptions, isOptions } from "../util.js";
export const EMPTY_SALT = new Uint8Array();
export function createBluePrintTx(fn) {
  return (options, ...params) => isOptions(options) ? fn(options, params) : fn(...extractOptions(options, params));
}
export function createBluePrintWithId(fn) {
  return (constructorOrId, options, ...params) => isOptions(options) ? fn(constructorOrId, options, params) : fn(constructorOrId, ...extractOptions(options, params));
}
export function encodeSalt(salt = randomAsU8a()) {
  return salt instanceof Bytes ? salt : salt && salt.length ? compactAddLength(u8aToU8a(salt)) : EMPTY_SALT;
}