// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Metadata } from '@axia-js/types/metadata/Metadata';
import type { ExtraTypes } from './types';

import Handlebars from 'handlebars';

import lookupDefinitions from '@axia-js/types/augment/lookup/definitions';
import * as defaultDefs from '@axia-js/types/interfaces/definitions';
import { stringCamelCase } from '@axia-js/util';

import { compareName, createImports, formatType, initMeta, readTemplate, setImports, writeFile } from '../util';

const template = readTemplate('consts');
const generateForMetaTemplate = Handlebars.compile(template);

/** @internal */
function generateForMeta (meta: Metadata, dest: string, extraTypes: ExtraTypes, isStrict: boolean): void {
  writeFile(dest, (): string => {
    const allTypes = {
      '@axia-js/types/augment': { lookup: lookupDefinitions },
      '@axia-js/types/interfaces': defaultDefs,
      ...extraTypes
    };
    const imports = createImports(allTypes);
    const allDefs = Object.entries(allTypes).reduce((defs, [path, obj]) => {
      return Object.entries(obj).reduce((defs, [key, value]) => ({ ...defs, [`${path}/${key}`]: value }), defs);
    }, {});
    const { lookup, pallets, registry } = meta.asLatest;

    const modules = pallets
      .filter(({ constants }) => constants.length > 0)
      .map(({ constants, name }) => {
        if (!isStrict) {
          setImports(allDefs, imports, ['Codec']);
        }

        const items = constants
          .map(({ docs, name, type }) => {
            const typeDef = lookup.getTypeDef(type);
            const returnType = typeDef.lookupName || formatType(registry, allDefs, typeDef, imports);

            setImports(allDefs, imports, [returnType]);

            return {
              docs,
              name: stringCamelCase(name),
              type: returnType
            };
          })
          .sort(compareName);

        return {
          items,
          name: stringCamelCase(name)
        };
      })
      .sort(compareName);

    return generateForMetaTemplate({
      headerType: 'chain',
      imports,
      isStrict,
      modules,
      types: [
        ...Object.keys(imports.localTypes).sort().map<{ file: string; types: string[] }>((packagePath) => ({
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
export function generateDefaultConsts (dest = 'packages/api/src/augment/consts.ts', data?: string, extraTypes: ExtraTypes = {}, isStrict = false): void {
  const { metadata } = initMeta(data, extraTypes);

  return generateForMeta(metadata, dest, extraTypes, isStrict);
}
