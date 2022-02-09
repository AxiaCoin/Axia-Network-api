// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
import * as codecClasses from '@axia-js/types/codec';
import { getTypeDef } from '@axia-js/types/create';
import { TypeDefInfo } from '@axia-js/types/create/types';
import * as extrinsicClasses from '@axia-js/types/extrinsic';
import * as genericClasses from '@axia-js/types/generic';
import * as primitiveClasses from '@axia-js/types/primitive';
// Maps the types as found to the source location. This is used to generate the
// imports in the output file, dep-duped and sorted

/** @internal */
export function setImports(allDefs, imports, types) {
  const {
    codecTypes,
    extrinsicTypes,
    genericTypes,
    ignoredTypes,
    localTypes,
    metadataTypes,
    primitiveTypes,
    typesTypes
  } = imports;
  types.filter(t => !!t).forEach(type => {
    if (ignoredTypes.includes(type)) {// do nothing
    } else if (['AnyNumber', 'CallFunction', 'Codec', 'IExtrinsic', 'ITuple'].includes(type)) {
      typesTypes[type] = true;
    } else if (type === 'Metadata') {
      metadataTypes[type] = true;
    } else if (codecClasses[type]) {
      codecTypes[type] = true;
    } else if (extrinsicClasses[type]) {
      extrinsicTypes[type] = true;
    } else if (genericClasses[type]) {
      genericTypes[type] = true;
    } else if (primitiveClasses[type]) {
      primitiveTypes[type] = true;
    } else if (type.includes('<') || type.includes('(') || type.includes('[') && !type.includes('|')) {
      // If the type is a bit special (tuple, fixed u8, nested type...), then we
      // need to parse it with `getTypeDef`. We skip the case where type ~ [a | b | c ... , ... , ... w | y | z ]
      // since that represents a tuple's similar types, which are covered in the next block
      const typeDef = getTypeDef(type);
      setImports(allDefs, imports, [TypeDefInfo[typeDef.info]]); // TypeDef.sub is a `TypeDef | TypeDef[]`

      if (Array.isArray(typeDef.sub)) {
        typeDef.sub.forEach(subType => setImports(allDefs, imports, [subType.lookupName || subType.type]));
      } else if (typeDef.sub && (typeDef.info !== TypeDefInfo.VecFixed || typeDef.sub.type !== 'u8')) {
        // typeDef.sub is a TypeDef in this case
        setImports(allDefs, imports, [typeDef.sub.lookupName || typeDef.sub.type]);
      }
    } else if (type.includes('[') && type.includes('|')) {
      // We split the types (we already dod the check above, so safe-path should not be caught)
      const splitTypes = (/\[\s?(.+?)\s?\]/.exec(type) || ['', ''])[1].split(/\s?\|\s?/);
      setImports(allDefs, imports, splitTypes);
    } else {
      // find this module inside the exports from the rest
      const [moduleName] = Object.entries(allDefs).find(([, {
        types
      }]) => Object.keys(types).includes(type)) || [null];

      if (moduleName) {
        localTypes[moduleName][type] = true;
      }
    }
  });
} // Create an Imports object, can be pre-filled with `ignoredTypes`

/** @internal */

export function createImports(importDefinitions, {
  types
} = {
  types: {}
}) {
  const definitions = {};
  const typeToModule = {};
  Object.entries(importDefinitions).forEach(([packagePath, packageDef]) => {
    Object.entries(packageDef).forEach(([name, moduleDef]) => {
      const fullName = `${packagePath}/${name}`;
      definitions[fullName] = moduleDef;
      Object.keys(moduleDef.types).forEach(type => {
        if (typeToModule[type]) {
          console.warn(`\t\tWARN: Overwriting duplicated type '${type}' ${typeToModule[type]} -> ${fullName}`);
        }

        typeToModule[type] = fullName;
      });
    });
  });
  return {
    codecTypes: {},
    definitions,
    extrinsicTypes: {},
    genericTypes: {},
    ignoredTypes: Object.keys(types),
    localTypes: Object.keys(definitions).reduce((local, mod) => {
      local[mod] = {};
      return local;
    }, {}),
    metadataTypes: {},
    primitiveTypes: {},
    typeToModule,
    typesTypes: {}
  };
}