"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createImports = createImports;
exports.setImports = setImports;

var codecClasses = _interopRequireWildcard(require("@axia-js/types/codec"));

var _create = require("@axia-js/types/create");

var _types = require("@axia-js/types/create/types");

var extrinsicClasses = _interopRequireWildcard(require("@axia-js/types/extrinsic"));

var genericClasses = _interopRequireWildcard(require("@axia-js/types/generic"));

var primitiveClasses = _interopRequireWildcard(require("@axia-js/types/primitive"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
// Maps the types as found to the source location. This is used to generate the
// imports in the output file, dep-duped and sorted

/** @internal */
function setImports(allDefs, imports, types) {
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
      const typeDef = (0, _create.getTypeDef)(type);
      setImports(allDefs, imports, [_types.TypeDefInfo[typeDef.info]]); // TypeDef.sub is a `TypeDef | TypeDef[]`

      if (Array.isArray(typeDef.sub)) {
        typeDef.sub.forEach(subType => setImports(allDefs, imports, [subType.lookupName || subType.type]));
      } else if (typeDef.sub && (typeDef.info !== _types.TypeDefInfo.VecFixed || typeDef.sub.type !== 'u8')) {
        // typeDef.sub is a TypeDef in this case
        setImports(allDefs, imports, [typeDef.sub.lookupName || typeDef.sub.type]);
      }
    } else if (type.includes('[') && type.includes('|')) {
      // We split the types (we already dod the check above, so safe-path should not be caught)
      const splitTypes = (/\[\s?(.+?)\s?\]/.exec(type) || ['', ''])[1].split(/\s?\|\s?/);
      setImports(allDefs, imports, splitTypes);
    } else {
      // find this module inside the exports from the rest
      const [moduleName] = Object.entries(allDefs).find(_ref => {
        let [, {
          types
        }] = _ref;
        return Object.keys(types).includes(type);
      }) || [null];

      if (moduleName) {
        localTypes[moduleName][type] = true;
      }
    }
  });
} // Create an Imports object, can be pre-filled with `ignoredTypes`

/** @internal */


function createImports(importDefinitions) {
  let {
    types
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    types: {}
  };
  const definitions = {};
  const typeToModule = {};
  Object.entries(importDefinitions).forEach(_ref2 => {
    let [packagePath, packageDef] = _ref2;
    Object.entries(packageDef).forEach(_ref3 => {
      let [name, moduleDef] = _ref3;
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