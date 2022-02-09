// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PortableRegistry, StorageEntryMetadataLatest } from '@axia-js/types/interfaces/metadata';
import type { Metadata } from '@axia-js/types/metadata/Metadata';
import type { Registry } from '@axia-js/types/types';
import type { ExtraTypes } from './types';

import Handlebars from 'handlebars';

import lookupDefinitions from '@axia-js/types/augment/lookup/definitions';
import * as defaultDefs from '@axia-js/types/interfaces/definitions';
import { unwrapStorageSi } from '@axia-js/types/primitive/StorageKey';
import { stringCamelCase } from '@axia-js/util';

import { compareName, createImports, formatType, getSimilarTypes, initMeta, readTemplate, setImports, TypeImports, writeFile } from '../util';
import { ModuleTypes } from '../util/imports';

// From a storage entry metadata, we return [args, returnType]
/** @internal */
function entrySignature (lookup: PortableRegistry, allDefs: Record<string, ModuleTypes>, registry: Registry, storageEntry: StorageEntryMetadataLatest, imports: TypeImports): [boolean, string, string, string] {
  const outputType = lookup.getTypeDef(unwrapStorageSi(storageEntry.type));

  if (storageEntry.type.isPlain) {
    const typeDef = lookup.getTypeDef(storageEntry.type.asPlain);

    setImports(allDefs, imports, [typeDef.lookupName || typeDef.type]);

    return [storageEntry.modifier.isOptional, '', '', formatType(registry, allDefs, outputType, imports)];
  } else if (storageEntry.type.isMap) {
    const { hashers, key, value } = storageEntry.type.asMap;
    const keyDefs = hashers.length === 1
      ? [lookup.getTypeDef(key)]
      : lookup.getSiType(key).def.asTuple.map((k) => lookup.getTypeDef(k));
    const similarTypes = keyDefs.map((k) => getSimilarTypes(registry, allDefs, k.lookupName || k.type, imports));
    const keyTypes = similarTypes.map((t) => t.join(' | '));
    const defValue = lookup.getTypeDef(value);

    setImports(allDefs, imports, [
      ...similarTypes.reduce<string[]>((all, t) => all.concat(t), []),
      defValue.lookupName
        ? undefined
        : defValue.type
    ]);

    return [
      storageEntry.modifier.isOptional,
      keyDefs.map((k) => formatType(registry, allDefs, k.lookupName || k.type, imports)).join(', '),
      keyTypes.map((t, i) => `arg${keyTypes.length === 1 ? '' : (i + 1)}: ${t}`).join(', '),
      formatType(registry, allDefs, outputType, imports)
    ];
  }

  throw new Error(`entryArgs: Cannot parse args of entry ${storageEntry.name.toString()}`);
}

const template = readTemplate('query');
const generateForMetaTemplate = Handlebars.compile(template);

/** @internal */
function generateForMeta (registry: Registry, meta: Metadata, dest: string, extraTypes: ExtraTypes, isStrict: boolean): void {
  writeFile(dest, (): string => {
    const allTypes: ExtraTypes = {
      '@axia-js/types/augment': { lookup: lookupDefinitions },
      '@axia-js/types/interfaces': defaultDefs,
      ...extraTypes
    };
    const imports = createImports(allTypes);
    const allDefs = Object.entries(allTypes).reduce((defs, [path, obj]) => {
      return Object.entries(obj).reduce((defs, [key, value]) => ({ ...defs, [`${path}/${key}`]: value }), defs);
    }, {});
    const { lookup, pallets } = meta.asLatest;
    const modules = pallets
      .filter(({ storage }) => storage.isSome)
      .map(({ name, storage }) => {
        const items = storage.unwrap().items
          .map((storageEntry) => {
            const [isOptional, args, params, _returnType] = entrySignature(lookup, allDefs, registry, storageEntry, imports);
            const returnType = isOptional
              ? `Option<${_returnType}>`
              : _returnType;

            return {
              args,
              docs: storageEntry.docs,
              entryType: 'AugmentedQuery',
              name: stringCamelCase(storageEntry.name),
              params,
              returnType
            };
          })
          .sort(compareName);

        return {
          items,
          name: stringCamelCase(name)
        };
      })
      .sort(compareName);

    imports.typesTypes.Observable = true;

    return generateForMetaTemplate({
      headerType: 'chain',
      imports,
      isStrict,
      modules,
      types: [
        ...Object.keys(imports.localTypes).sort().map((packagePath): { file: string; types: string[] } => ({
          file: packagePath.replace('@axia-js/types/augment', '@axia-js/types'),
          types: Object.keys(imports.localTypes[packagePath])
        })),
        {
          file: '@axia-js/api/types',
          types: ['ApiTypes']
        }
      ]
    });
  });
}

// Call `generateForMeta()` with current static metadata
/** @internal */
export function generateDefaultQuery (dest = 'packages/api/src/augment/query.ts', data?: string, extraTypes: ExtraTypes = {}, isStrict = false): void {
  const { metadata, registry } = initMeta(data, extraTypes);

  return generateForMeta(registry, metadata, dest, extraTypes, isStrict);
}
