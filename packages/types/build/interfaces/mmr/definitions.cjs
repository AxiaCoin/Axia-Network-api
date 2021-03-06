"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
// order important in structs... :)

/* eslint-disable sort-keys */
var _default = {
  rpc: {
    generateProof: {
      description: 'Generate MMR proof for given leaf index.',
      params: [{
        name: 'leafIndex',
        type: 'u64'
      }, {
        name: 'at',
        type: 'BlockHash',
        isHistoric: true,
        isOptional: true
      }],
      type: 'MmrLeafProof'
    }
  },
  types: {
    MmrLeafProof: {
      blockHash: 'BlockHash',
      leaf: 'Bytes',
      proof: 'Bytes'
    }
  }
};
exports.default = _default;