"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractAuthor = extractAuthor;

// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function extractAuthor(digest) {
  let sessionValidators = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  const [citem] = digest.logs.filter(_ref => {
    let {
      type
    } = _ref;
    return type === 'Consensus';
  });
  const [pitem] = digest.logs.filter(_ref2 => {
    let {
      type
    } = _ref2;
    return type === 'PreRuntime';
  });
  const [sitem] = digest.logs.filter(_ref3 => {
    let {
      type
    } = _ref3;
    return type === 'Seal';
  });
  let accountId; // This is critical to be first for BABE (before Consensus)
  // If not first, we end up dropping the author at session-end

  if (pitem) {
    try {
      const [engine, data] = pitem.asPreRuntime;
      accountId = engine.extractAuthor(data, sessionValidators);
    } catch {// ignore
    }
  }

  if (!accountId && citem) {
    try {
      const [engine, data] = citem.asConsensus;
      accountId = engine.extractAuthor(data, sessionValidators);
    } catch {// ignore
    }
  } // SEAL, still used in e.g. Kulupu for pow


  if (!accountId && sitem) {
    try {
      const [engine, data] = sitem.asSeal;
      accountId = engine.extractAuthor(data, sessionValidators);
    } catch {// ignore
    }
  }

  return accountId;
}