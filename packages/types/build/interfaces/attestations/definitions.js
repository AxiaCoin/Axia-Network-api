// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
// order important in structs... :)

/* eslint-disable sort-keys */
export default {
  rpc: {},
  types: {
    BlockAttestations: {
      receipt: 'CandidateReceipt',
      valid: 'Vec<AccountId>',
      invalid: 'Vec<AccountId>'
    },
    IncludedBlocks: {
      actualNumber: 'BlockNumber',
      session: 'SessionIndex',
      randomSeed: 'H256',
      activeAllychains: 'Vec<ParaId>',
      paraBlocks: 'Vec<Hash>'
    },
    MoreAttestations: {}
  }
};