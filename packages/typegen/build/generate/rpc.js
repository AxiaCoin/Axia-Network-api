import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
import Handlebars from 'handlebars';
import * as defaultDefinitions from '@axia-js/types/interfaces/definitions';
import { createImports, formatType, getSimilarTypes, initMeta, readTemplate, setImports, writeFile } from "../util/index.js";
const StorageKeyTye = 'StorageKey | string | Uint8Array | any';
const template = readTemplate('rpc');
const generateRpcTypesTemplate = Handlebars.compile(template);
/** @internal */

export function generateRpcTypes(registry, importDefinitions, dest, extraTypes = {}) {
  writeFile(dest, () => {
    const allTypes = _objectSpread({
      '@axia-js/types/interfaces': importDefinitions
    }, extraTypes);

    const imports = createImports(allTypes);
    const definitions = imports.definitions;
    const allDefs = Object.entries(allTypes).reduce((defs, [path, obj]) => {
      return Object.entries(obj).reduce((defs, [key, value]) => _objectSpread(_objectSpread({}, defs), {}, {
        [`${path}/${key}`]: value
      }), defs);
    }, {});
    const rpcKeys = Object.keys(definitions).filter(key => Object.keys(definitions[key].rpc || {}).length !== 0).sort();
    const additional = {};
    const modules = rpcKeys.map(sectionFullName => {
      const rpc = definitions[sectionFullName].rpc;
      const section = sectionFullName.split('/').pop();
      const allMethods = Object.keys(rpc).sort().map(methodName => {
        const def = rpc[methodName];
        let args;
        let type;
        let generic; // These are too hard to type with generics, do manual overrides

        if (section === 'state') {
          setImports(allDefs, imports, ['Codec', 'Hash', 'StorageKey', 'Vec']);

          if (methodName === 'getStorage') {
            generic = 'T = Codec';
            args = [`key: ${StorageKeyTye}, block?: Hash | Uint8Array | string`];
            type = 'T';
          } else if (methodName === 'queryStorage') {
            generic = 'T = Codec[]';
            args = [`keys: Vec<StorageKey> | (${StorageKeyTye})[], fromBlock?: Hash | Uint8Array | string, toBlock?: Hash | Uint8Array | string`];
            type = '[Hash, T][]';
          } else if (methodName === 'queryStorageAt') {
            generic = 'T = Codec[]';
            args = [`keys: Vec<StorageKey> | (${StorageKeyTye})[], at?: Hash | Uint8Array | string`];
            type = 'T';
          } else if (methodName === 'subscribeStorage') {
            generic = 'T = Codec[]';
            args = [`keys?: Vec<StorageKey> | (${StorageKeyTye})[]`];
            type = 'T';
          }
        }

        if (args === undefined) {
          setImports(allDefs, imports, [def.type]);
          args = def.params.map(param => {
            const similarTypes = getSimilarTypes(registry, definitions, param.type, imports);
            setImports(allDefs, imports, [param.type, ...similarTypes]);
            return `${param.name}${param.isOptional ? '?' : ''}: ${similarTypes.join(' | ')}`;
          });
          type = formatType(registry, allDefs, def.type, imports);
          generic = '';
        }

        const item = {
          args: args.join(', '),
          docs: [def.description],
          generic,
          name: methodName,
          type
        };

        if (def.aliasSection) {
          if (!additional[def.aliasSection]) {
            additional[def.aliasSection] = {
              items: [],
              name: def.aliasSection
            };
          }

          additional[def.aliasSection].items.push(item);
          return null;
        }

        return item;
      }).filter(item => !!item);
      return {
        items: allMethods,
        name: section || 'unknown'
      };
    }).concat(...Object.values(additional)).sort((a, b) => a.name.localeCompare(b.name));
    imports.typesTypes.Observable = true;
    return generateRpcTypesTemplate({
      headerType: 'chain',
      imports,
      modules,
      types: [...Object.keys(imports.localTypes).sort().map(packagePath => ({
        file: packagePath.replace('@axia-js/types/augment', '@axia-js/types'),
        types: Object.keys(imports.localTypes[packagePath])
      }))]
    });
  });
}
export function generateDefaultRpc(dest = 'packages/api/src/augment/rpc.ts', extraTypes = {}) {
  const {
    registry
  } = initMeta(undefined, extraTypes);
  generateRpcTypes(registry, defaultDefinitions, dest, extraTypes);
}