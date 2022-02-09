import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
import Handlebars from 'handlebars';
import { Json, Raw } from '@axia-js/types/codec';
import { TypeRegistry } from '@axia-js/types/create';
import * as defaultDefinitions from '@axia-js/types/interfaces/definitions';
import * as defaultPrimitives from '@axia-js/types/primitive';
import { createImports, readTemplate, setImports, writeFile } from "../util/index.js";

const primitiveClasses = _objectSpread(_objectSpread({}, defaultPrimitives), {}, {
  Json,
  Raw
});

const template = readTemplate('interfaceRegistry');
const generateInterfaceTypesTemplate = Handlebars.compile(template);
/** @internal */

export function generateInterfaceTypes(importDefinitions, dest) {
  const registry = new TypeRegistry();
  writeFile(dest, () => {
    Object.entries(importDefinitions).reduce((acc, def) => Object.assign(acc, def), {});
    const imports = createImports(importDefinitions);
    const definitions = imports.definitions;
    const items = []; // first we create imports for our known classes from the API

    Object.keys(primitiveClasses).filter(name => !name.includes('Generic')).forEach(primitiveName => {
      setImports(definitions, imports, [primitiveName]);
      items.push(primitiveName);
    });
    const existingTypes = {}; // ensure we have everything registered since we will get the definition
    // form the available types (so any unknown should show after this)

    Object.values(definitions).forEach(({
      types
    }) => {
      registry.register(types);
    }); // create imports for everything that we have available

    Object.values(definitions).forEach(({
      types
    }) => {
      setImports(definitions, imports, Object.keys(types));
      const uniqueTypes = Object.keys(types).filter(type => !existingTypes[type]);
      uniqueTypes.forEach(type => {
        existingTypes[type] = true;
        items.push(type);
      });
    });
    return generateInterfaceTypesTemplate({
      headerType: 'defs',
      imports,
      items: items.sort((a, b) => a.localeCompare(b)),
      types: [...Object.keys(imports.localTypes).sort().map(packagePath => ({
        file: packagePath,
        types: Object.keys(imports.localTypes[packagePath])
      }))]
    });
  });
} // Generate `packages/types/src/interfaceRegistry.ts`, the registry of all interfaces

export function generateDefaultInterface() {
  generateInterfaceTypes({
    '@axia-js/types/interfaces': defaultDefinitions
  }, 'packages/types/src/augment/registry.ts');
}