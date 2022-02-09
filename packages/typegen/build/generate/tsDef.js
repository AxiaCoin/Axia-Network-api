import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
import Handlebars from 'handlebars';
import path from 'path';
import { getTypeDef, TypeRegistry } from '@axia-js/types/create';
import { TypeDefInfo } from '@axia-js/types/create/types';
import * as defaultDefinitions from '@axia-js/types/interfaces/definitions';
import { assert, isString, stringCamelCase, stringify, stringUpperFirst } from '@axia-js/util';
import { createImports, exportInterface, exportType, formatType, readTemplate, setImports, writeFile } from "../util/index.js";
// helper to generate a `readonly <Name>: <Type>;` getter

/** @internal */
export function createGetter(definitions, name = '', type, imports) {
  setImports(definitions, imports, [type]);
  return `  readonly ${name}: ${type};\n`;
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-unused-vars

function errorUnhandled(_, definitions, def, imports) {
  throw new Error(`Generate: ${def.name || ''}: Unhandled type ${TypeDefInfo[def.info]}`);
}
/** @internal */


function tsExport(registry, definitions, def, imports) {
  return exportInterface(def.lookupIndex, def.name, formatType(registry, definitions, def, imports, false));
}

const tsBTreeMap = tsExport;
const tsBTreeSet = tsExport;
const tsCompact = tsExport;
const tsDoNotConstruct = tsExport;
const tsHashMap = tsExport;
const tsOption = tsExport;
const tsPlain = tsExport;
const tsTuple = tsExport;
/** @internal */

function tsEnum(registry, definitions, {
  lookupIndex,
  name: enumName,
  sub
}, imports) {
  setImports(definitions, imports, ['Enum']);
  const keys = sub.map((def, index) => {
    const {
      info,
      lookupName,
      name = `unknown${index}`,
      type
    } = def;
    const getter = stringUpperFirst(stringCamelCase(name.replace(' ', '_')));
    const isComplex = [TypeDefInfo.Result, TypeDefInfo.Struct, TypeDefInfo.Tuple, TypeDefInfo.Vec, TypeDefInfo.VecFixed].includes(info);
    const asGetter = type === 'Null' || info === TypeDefInfo.DoNotConstruct ? '' : createGetter(definitions, `as${getter}`, lookupName || (isComplex ? formatType(registry, definitions, info === TypeDefInfo.Struct ? def : type, imports, false) : type), imports);
    const isGetter = info === TypeDefInfo.DoNotConstruct ? '' : createGetter(definitions, `is${getter}`, 'boolean', imports);

    switch (info) {
      case TypeDefInfo.Compact:
      case TypeDefInfo.Plain:
      case TypeDefInfo.Result:
      case TypeDefInfo.Si:
      case TypeDefInfo.Struct:
      case TypeDefInfo.Tuple:
      case TypeDefInfo.Vec:
      case TypeDefInfo.Option:
      case TypeDefInfo.VecFixed:
        return `${isGetter}${asGetter}`;

      case TypeDefInfo.DoNotConstruct:
      case TypeDefInfo.Null:
        return `${isGetter}`;

      default:
        throw new Error(`Enum: ${enumName || 'undefined'}: Unhandled type ${TypeDefInfo[info]}, ${stringify(def)}`);
    }
  });
  return exportInterface(lookupIndex, enumName, 'Enum', keys.join(''));
}

function tsInt(_, definitions, def, imports, type = 'Int') {
  setImports(definitions, imports, [type]);
  return exportInterface(def.lookupIndex, def.name, type);
}
/** @internal */


function tsNull(registry, definitions, {
  lookupIndex = -1,
  name
}, imports) {
  setImports(definitions, imports, ['Null']); // * @description extends [[${base}]]

  const doc = `/** @name ${name || ''}${lookupIndex !== -1 ? ` (${lookupIndex})` : ''} */\n`;
  return `${doc}export type ${name || ''} = Null;`;
}
/** @internal */


function tsResultGetter(registry, definitions, resultName = '', getter, def, imports) {
  const {
    info,
    lookupName,
    type
  } = def;
  const asGetter = type === 'Null' ? '' : (getter === 'Error' ? '  /** @deprecated Use asErr */\n' : '') + createGetter(definitions, `as${getter}`, lookupName || (info === TypeDefInfo.Tuple ? formatType(registry, definitions, def, imports, false) : type), imports);
  const isGetter = (getter === 'Error' ? '  /** @deprecated Use isErr */\n' : '') + createGetter(definitions, `is${getter}`, 'boolean', imports);

  switch (info) {
    case TypeDefInfo.Plain:
    case TypeDefInfo.Si:
    case TypeDefInfo.Tuple:
    case TypeDefInfo.Vec:
    case TypeDefInfo.Option:
      return `${isGetter}${asGetter}`;

    case TypeDefInfo.Null:
      return `${isGetter}`;

    default:
      throw new Error(`Result: ${resultName}: Unhandled type ${TypeDefInfo[info]}, ${stringify(def)}`);
  }
}
/** @internal */


function tsResult(registry, definitions, def, imports) {
  const [okDef, errorDef] = def.sub;
  const inner = [tsResultGetter(registry, definitions, def.name, 'Err', errorDef, imports), // @deprecated, use Err
  tsResultGetter(registry, definitions, def.name, 'Error', errorDef, imports), tsResultGetter(registry, definitions, def.name, 'Ok', okDef, imports)].join('');
  setImports(definitions, imports, [def.type]);
  const fmtType = def.lookupName && def.name !== def.lookupName ? def.lookupName : formatType(registry, definitions, def, imports, false);
  return exportInterface(def.lookupIndex, def.name, fmtType, inner);
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-unused-vars


function tsSi(registry, definitions, typeDef, imports) {
  // FIXME
  return `// SI: ${JSON.stringify(typeDef)}`;
}
/** @internal */


function tsSet(_, definitions, {
  lookupIndex,
  name: setName,
  sub
}, imports) {
  setImports(definitions, imports, ['Set']);
  const types = sub.map(({
    name
  }) => {
    assert(name, 'Invalid TypeDef found, no name specified');
    return createGetter(definitions, `is${name}`, 'boolean', imports);
  });
  return exportInterface(lookupIndex, setName, 'Set', types.join(''));
}
/** @internal */


function tsStruct(registry, definitions, {
  lookupIndex,
  name: structName,
  sub
}, imports) {
  setImports(definitions, imports, ['Struct']);
  const keys = sub.map(def => {
    const fmtType = def.lookupName && def.name !== def.lookupName ? def.lookupName : formatType(registry, definitions, def, imports, false);
    return createGetter(definitions, def.name, fmtType, imports);
  });
  return exportInterface(lookupIndex, structName, 'Struct', keys.join(''));
}
/** @internal */


function tsUInt(registry, definitions, def, imports) {
  return tsInt(registry, definitions, def, imports, 'UInt');
}
/** @internal */


function tsVec(registry, definitions, def, imports) {
  const type = def.sub.type;

  if (type === 'u8') {
    if (def.info === TypeDefInfo.VecFixed) {
      setImports(definitions, imports, ['U8aFixed']);
      return exportType(def.lookupIndex, def.name, 'U8aFixed');
    } else {
      setImports(definitions, imports, ['Bytes']);
      return exportType(def.lookupIndex, def.name, 'Bytes');
    }
  }

  const fmtType = def.lookupName && def.name !== def.lookupName ? def.lookupName : formatType(registry, definitions, def, imports, false);
  return exportInterface(def.lookupIndex, def.name, fmtType);
} // handlers are defined externally to use - this means that when we do a
// `generators[typedef.info](...)` TS will show any unhandled types. Rather
// we are being explicit in having no handlers where we do not support (yet)


export const typeEncoders = {
  [TypeDefInfo.BTreeMap]: tsBTreeMap,
  [TypeDefInfo.BTreeSet]: tsBTreeSet,
  [TypeDefInfo.Compact]: tsCompact,
  [TypeDefInfo.DoNotConstruct]: tsDoNotConstruct,
  [TypeDefInfo.Enum]: tsEnum,
  [TypeDefInfo.HashMap]: tsHashMap,
  [TypeDefInfo.Int]: tsInt,
  [TypeDefInfo.Linkage]: errorUnhandled,
  [TypeDefInfo.Null]: tsNull,
  [TypeDefInfo.Option]: tsOption,
  [TypeDefInfo.Plain]: tsPlain,
  [TypeDefInfo.Range]: errorUnhandled,
  [TypeDefInfo.Result]: tsResult,
  [TypeDefInfo.Set]: tsSet,
  [TypeDefInfo.Si]: tsSi,
  [TypeDefInfo.Struct]: tsStruct,
  [TypeDefInfo.Tuple]: tsTuple,
  [TypeDefInfo.UInt]: tsUInt,
  [TypeDefInfo.Vec]: tsVec,
  [TypeDefInfo.VecFixed]: tsVec
};
/** @internal */

function generateInterfaces(registry, definitions, {
  types
}, imports) {
  return Object.entries(types).map(([name, type]) => {
    const def = getTypeDef(isString(type) ? type : stringify(type), {
      name
    });
    return [name, typeEncoders[def.info](registry, definitions, def, imports)];
  });
}

const templateIndex = readTemplate('tsDef/index');
const generateTsDefIndexTemplate = Handlebars.compile(templateIndex);
const templateModuleTypes = readTemplate('tsDef/moduleTypes');
const generateTsDefModuleTypesTemplate = Handlebars.compile(templateModuleTypes);
const templateTypes = readTemplate('tsDef/types');
const generateTsDefTypesTemplate = Handlebars.compile(templateTypes);
/** @internal */

export function generateTsDefFor(registry, importDefinitions, defName, {
  types
}, outputDir) {
  const imports = _objectSpread(_objectSpread({}, createImports(importDefinitions, {
    types
  })), {}, {
    interfaces: []
  });

  const definitions = imports.definitions;
  const interfaces = generateInterfaces(registry, definitions, {
    types
  }, imports);
  const items = interfaces.sort((a, b) => a[0].localeCompare(b[0])).map(([, definition]) => definition);
  writeFile(path.join(outputDir, defName, 'types.ts'), () => generateTsDefModuleTypesTemplate({
    headerType: 'defs',
    imports,
    items,
    name: defName,
    types: [...Object.keys(imports.localTypes).sort().map(packagePath => ({
      file: packagePath.replace('@axia-js/types/augment', '@axia-js/types'),
      types: Object.keys(imports.localTypes[packagePath])
    }))]
  }), true);
  writeFile(path.join(outputDir, defName, 'index.ts'), () => generateTsDefIndexTemplate({
    headerType: 'defs'
  }), true);
}
/** @internal */

export function generateTsDef(importDefinitions, outputDir, generatingPackage) {
  const registry = new TypeRegistry();
  writeFile(path.join(outputDir, 'types.ts'), () => {
    const definitions = importDefinitions[generatingPackage];
    Object.entries(definitions).forEach(([defName, obj]) => {
      console.log(`\tExtracting interfaces for ${defName}`);
      generateTsDefFor(registry, importDefinitions, defName, obj, outputDir);
    });
    return generateTsDefTypesTemplate({
      headerType: 'defs',
      items: Object.keys(definitions)
    });
  });
  writeFile(path.join(outputDir, 'index.ts'), () => generateTsDefIndexTemplate({
    headerType: 'defs'
  }), true);
}
/** @internal */

export function generateDefaultTsDef() {
  generateTsDef({
    '@axia-js/types/interfaces': defaultDefinitions
  }, 'packages/types/src/interfaces', '@axia-js/types/interfaces');
}