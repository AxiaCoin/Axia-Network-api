import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
import Handlebars from 'handlebars';
import lookupDefinitions from '@axia-js/types/augment/lookup/definitions';
import * as defaultDefs from '@axia-js/types/interfaces/definitions';
import { stringCamelCase } from '@axia-js/util';
import { compareName, createImports, formatType, getSimilarTypes, initMeta, readTemplate, setImports, writeFile } from "../util/index.js";
const MAPPED_NAMES = {
  class: 'clazz',
  new: 'updated'
};

function mapName(_name) {
  const name = stringCamelCase(_name);
  return MAPPED_NAMES[name] || name;
}

const template = readTemplate('tx');
const generateForMetaTemplate = Handlebars.compile(template);
/** @internal */

function generateForMeta(registry, meta, dest, extraTypes, isStrict) {
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
      pallets
    } = meta.asLatest;
    const modules = pallets.sort(compareName).filter(({
      calls
    }) => calls.isSome).map(({
      calls,
      name
    }) => {
      setImports(allDefs, imports, ['Call', 'Extrinsic', 'SubmittableExtrinsic']);
      const sectionName = stringCamelCase(name);
      const items = lookup.getSiType(calls.unwrap().type).def.asVariant.variants.map(({
        docs,
        fields,
        name
      }) => {
        const typesInfo = fields.map(({
          name,
          type,
          typeName
        }, index) => {
          const typeDef = registry.lookup.getTypeDef(type);
          return [name.isSome ? mapName(name.unwrap()) : `param${index}`, typeName.isSome ? typeName.toString() : typeDef.type, typeDef.isFromSi ? typeDef.type : typeDef.lookupName || typeDef.type];
        });
        const params = typesInfo.map(([name,, typeStr]) => {
          const similarTypes = getSimilarTypes(registry, allDefs, typeStr, imports);
          setImports(allDefs, imports, [typeStr, ...similarTypes]);
          return `${name}: ${similarTypes.join(' | ')}`;
        }).join(', ');
        return {
          args: typesInfo.map(([,, typeStr]) => formatType(registry, allDefs, typeStr, imports)).join(', '),
          docs,
          name: stringCamelCase(name),
          params
        };
      }).sort(compareName);
      return {
        items,
        name: sectionName
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
        types: ['ApiTypes', 'SubmittableExtrinsic']
      }]
    });
  });
} // Call `generateForMeta()` with current static metadata

/** @internal */


export function generateDefaultTx(dest = 'packages/api/src/augment/tx.ts', data, extraTypes = {}, isStrict = false) {
  const {
    metadata,
    registry
  } = initMeta(data, extraTypes);
  return generateForMeta(registry, metadata, dest, extraTypes, isStrict);
}