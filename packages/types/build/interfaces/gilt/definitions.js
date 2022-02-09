// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
// order important in structs... :)

/* eslint-disable sort-keys */
export default {
  rpc: {},
  types: {
    ActiveGilt: {
      proportion: 'Perquintill',
      amount: 'Balance',
      who: 'AccountId',
      expiry: 'BlockNumber'
    },
    ActiveGiltsTotal: {
      frozen: 'Balance',
      proportion: 'Perquintill',
      index: 'ActiveIndex',
      target: 'Perquintill'
    },
    ActiveIndex: 'u32',
    GiltBid: {
      amount: 'Balance',
      who: 'AccountId'
    }
  }
};