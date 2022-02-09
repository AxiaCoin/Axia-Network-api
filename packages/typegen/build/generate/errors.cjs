"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateDefaultErrors = generateDefaultErrors;

var _handlebars = _interopRequireDefault(require("handlebars"));

var _util = require("@axia-js/util");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
const template = (0, _index.readTemplate)('errors');

const generateForMetaTemplate = _handlebars.default.compile(template);
/** @internal */


function generateForMeta(meta, dest, isStrict) {
  (0, _index.writeFile)(dest, () => {
    const imports = (0, _index.createImports)({});
    const {
      lookup,
      pallets
    } = meta.asLatest;
    const modules = pallets.filter(_ref => {
      let {
        errors
      } = _ref;
      return errors.isSome;
    }).map(_ref2 => {
      let {
        errors,
        name
      } = _ref2;
      return {
        items: lookup.getSiType(errors.unwrap().type).def.asVariant.variants.map(_ref3 => {
          let {
            docs,
            name
          } = _ref3;
          return {
            docs,
            name: name.toString()
          };
        }).sort(_index.compareName),
        name: (0, _util.stringCamelCase)(name)
      };
    }).sort(_index.compareName);
    return generateForMetaTemplate({
      headerType: 'chain',
      imports,
      isStrict,
      modules,
      types: [{
        file: '@axia-js/api/types',
        types: ['ApiTypes']
      }]
    });
  });
} // Call `generateForMeta()` with current static metadata

/** @internal */


function generateDefaultErrors() {
  let dest = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'packages/api/src/augment/errors.ts';
  let data = arguments.length > 1 ? arguments[1] : undefined;
  let extraTypes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  let isStrict = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  const {
    metadata
  } = (0, _index.initMeta)(data, extraTypes);
  return generateForMeta(metadata, dest, isStrict);
}