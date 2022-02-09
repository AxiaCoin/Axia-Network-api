"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decorateEvents = decorateEvents;

var _util = require("@axia-js/util");

var _index = require("../errors/index.cjs");

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** @internal */
function decorateEvents(registry, _ref, metaVersion) {
  let {
    lookup,
    pallets
  } = _ref;
  return pallets.filter(_ref2 => {
    let {
      events
    } = _ref2;
    return events.isSome;
  }).reduce((result, _ref3, _sectionIndex) => {
    let {
      events,
      index,
      name
    } = _ref3;
    const sectionIndex = metaVersion >= 12 ? index.toNumber() : _sectionIndex;
    result[(0, _util.stringCamelCase)(name)] = lookup.getSiType(events.unwrap().type).def.asVariant.variants.reduce((newModule, variant) => {
      // we don't camelCase the event name
      newModule[variant.name.toString()] = {
        is: eventRecord => eventRecord.index[0] === sectionIndex && variant.index.eq(eventRecord.index[1]),
        meta: registry.createType('EventMetadataLatest', (0, _index.variantToMeta)(lookup, variant))
      };
      return newModule;
    }, {});
    return result;
  }, {});
}