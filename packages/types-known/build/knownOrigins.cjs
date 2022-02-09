"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.knownOrigins = void 0;
// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
// We want predictive ordering (manually managed)

/* eslint-disable sort-keys */
// FIXME: Need some sort of solution for specifying these
// Since we don't have insight into the origin specification, we can only define what we know about
// in a pure Axlib/AXIA implementation, any other custom origins won't be handled at all
const knownOrigins = {
  //
  // (1) Defaults from Axlib
  //
  Council: 'CollectiveOrigin',
  System: 'SystemOrigin',
  TechnicalCommittee: 'CollectiveOrigin',
  //
  // (2) Defaults from AXIA
  //
  Xcm: 'XcmOrigin',
  XcmPallet: 'XcmOrigin',
  //
  // (3) Defaults from Acala
  //
  Authority: 'AuthorityOrigin',
  GeneralCouncil: 'CollectiveOrigin'
};
exports.knownOrigins = knownOrigins;