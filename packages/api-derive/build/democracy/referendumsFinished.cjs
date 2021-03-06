"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.referendumsFinished = referendumsFinished;

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function referendumsFinished(instanceId, api) {
  return (0, _index.memo)(instanceId, () => api.derive.democracy.referendumIds().pipe((0, _rxjs.switchMap)(ids => api.query.democracy.referendumInfoOf.multi(ids)), (0, _rxjs.map)(infos => infos.map(optInfo => optInfo.unwrapOr(null)).filter(info => !!info && info.isFinished).map(info => info.asFinished))));
}