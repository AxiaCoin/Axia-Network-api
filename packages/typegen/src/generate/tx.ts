// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Metadata } from '@axia-js/types/metadata/Metadata';
import type { Registry } from '@axia-js/types/types';
import type { ExtraTypes } from './types';

import Handlebars from 'handlebars';

import lookupDefinitions from '@axia-js/types/augment/lookup/definitions';
import * as defaultDefs from '@axia-js/types/interfaces/definitions';
import { Text } from '@axia-js/types/primitive';
import { stringCamelCase } from '@axia-js/util';

import { compareName, createImports, formatType, getSimilarTypes, initMeta, readTemplate, setImports, writeFile } from '../util';

const MAPPED_NAMES: Record<string, string> = {
  class: 'clazz',
  new: 'updated'
};

function mapName (_name: Text): string {
  const name = stringCamelCase(_name);

  return MAPPED_NAMES[name] || name;
}

const template = readTemplate('tx');
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
      .sort(compareName)
      .filter(({ calls }) => calls.isSome)
      .map(({ calls, name }) => {
        setImports(allDefs, imports, ['Call', 'Extrinsic', 'SubmittableExtrinsic']);

        const sectionName = stringCamelCase(name);
        const items = lookup.getSiType(calls.unwrap().type).def.asVariant.variants
          .map(({ docs, fields, name }) => {
            const typesInfo = fields.map(({ name, type, typeName }, index): [string, string, string] => {
              const typeDef = registry.lookup.getTypeDef(type);

              return [
                name.isSome
                  ? mapName(name.unwrap())
                  : `param${index}`,
                typeName.isSome
                  ? typeName.toString()
                  : typeDef.type,
                typeDef.isFromSi
                  ? typeDef.type
                  : typeDef.lookupName || typeDef.type
              ];
            });
            const params = typesInfo
              .map(([name,, typeStr]) => {
                const similarTypes = getSimilarTypes(registry, allDefs, typeStr, imports);

                setImports(allDefs, imports, [typeStr, ...similarTypes]);

                return `${name}: ${similarTypes.join(' | ')}`;
              })
              .join(', ');

            return {
              args: typesInfo.map(([,, typeStr]) =>
                formatType(registry, allDefs, typeStr, imports)
              ).join(', '),
              docs,
              name: stringCamelCase(name),
              params
            };
          })
          .sort(compareName);

        return {
          items,
          name: sectionName
        };
      })
      .sort(compareName);

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
          types: ['ApiTypes', 'SubmittableExtrinsic']
        }
      ]
    });
  });
}

// Call `generateForMeta()` with current static metadata
/** @internal */
export function generateDefaultTx (dest = 'packages/api/src/augment/tx.ts', data?: string, extraTypes: ExtraTypes = {}, isStrict = false): void {
  const { metadata, registry } = initMeta(data, extraTypes);

  return generateForMeta(registry, metadata, dest, extraTypes, isStrict);
}
