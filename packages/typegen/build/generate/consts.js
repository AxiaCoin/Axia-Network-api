import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
import Handlebars from 'handlebars';
import lookupDefinitions from '@axia-js/types/augment/lookup/definitions';
import * as defaultDefs from '@axia-js/types/interfaces/definitions';
import { stringCamelCase } from '@axia-js/util';
import { compareName, createImports, formatType, initMeta, readTemplate, setImports, writeFile } from "../util/index.js";
const template = readTemplate('consts');
const generateForMetaTemplate = Handlebars.compile(template);
/** @internal */

function generateForMeta(meta, dest, extraTypes, isStrict) {
  writeFile(dest, () => {
    const allTypes = _objectSpread({
      '@axia-js/types/augment': {
        lookup: lookupDefinitions
      },
      '@axia-js/types/interfaces': defaultDefs
    }, extraTypes);

    const imports = createImports(allTypes);
    const allDefs = Object.entries(allTypes).reduce((defs, [path, obj]) => {
      return Object.entries(obj).reduce((defs, [key, value]) => _objectSpread(_objectSpread({}, defs), {}, {
        [`${path}/${key}`]: value
      }), defs);
    }, {});
    const {
      lookup,
      pallets,
      registry
    } = meta.asLatest;
    const modules = pallets.filter(({
      constants
    }) => constants.length > 0).map(({
      constants,
      name
    }) => {
      if (!isStrict) {
        setImports(allDefs, imports, ['Codec']);
      }

      const items = constants.map(({
        docs,
        name,
        type
      }) => {
        const typeDef = lookup.getTypeDef(type);
        const returnType = typeDef.lookupName || formatType(registry, allDefs, typeDef, imports);
        setImports(allDefs, imports, [returnType]);
        return {
          docs,
          name: stringCamelCase(name),
          type: returnType
        };
      }).sort(compareName);
      return {
        items,
        name: stringCamelCase(name)
      };
    }).sort(compareName);
    return generateForMetaTemplate({
      headerType: 'chain',
      imports,
      isStrict,
      modules,
      types: [...Object.keys(imports.localTypes).sort().map(packagePath => ({
        file: packagePath.replace('@axia-js/types/augment', '@axia-js/types'),
        types: Object.keys(imports.localTypes[packagePath])
      })), {
        file: '@axia-js/api/types',
        types: ['ApiTypes']
      }]
    });
  });
} // Call `generateForMeta()` with current static metadata

/** @internal */


export function generateDefaultConsts(dest = 'packages/api/src/augment/consts.ts', data, extraTypes = {}, isStrict = false) {
  const {
    metadata
  } = initMeta(data, extraTypes);
  return generateForMeta(metadata, dest, extraTypes, isStrict);
}