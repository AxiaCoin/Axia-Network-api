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
    genSyncSpec: {
      endpoint: 'sync_state_genSyncSpec',
      description: 'Returns the json-serialized chainspec running the node, with a sync state.',
      params: [{
        name: 'raw',
        type: 'bool'
      }],
      type: 'Json'
    }
  },
  types: {}
};
exports.default = _default;