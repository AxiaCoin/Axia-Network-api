"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
// order important in structs... :)

/* eslint-disable sort-keys */
const QUERY_PARAMS = [{
  name: 'extrinsic',
  type: 'Bytes'
}, {
  name: 'at',
  type: 'BlockHash',
  isHistoric: true,
  isOptional: true
}];
var _default = {
  rpc: {
    queryInfo: {
      description: 'Retrieves the fee information for an encoded extrinsic',
      params: QUERY_PARAMS,
      type: 'RuntimeDispatchInfo'
    },
    queryFeeDetails: {
      description: 'Query the detailed fee of a given encoded extrinsic',
      params: QUERY_PARAMS,
      type: 'FeeDetails'
    }
  },
  types: {
    FeeDetails: {
      inclusionFee: 'Option<InclusionFee>' // skipped in serde
      // tip: 'Balance'

    },
    InclusionFee: {
      baseFee: 'Balance',
      lenFee: 'Balance',
      adjustedWeightFee: 'Balance'
    },
    RuntimeDispatchInfo: {
      weight: 'Weight',
      class: 'DispatchClass',
      partialFee: 'Balance'
    }
  }
};
exports.default = _default;