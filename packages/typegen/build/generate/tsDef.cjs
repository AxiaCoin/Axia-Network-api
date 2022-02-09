"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createGetter = createGetter;
exports.generateDefaultTsDef = generateDefaultTsDef;
exports.generateTsDef = generateTsDef;
exports.generateTsDefFor = generateTsDefFor;
exports.typeEncoders = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _handlebars = _interopRequireDefault(require("handlebars"));

var _path = _interopRequireDefault(require("path"));

var _create = require("@axia-js/types/create");

var _types = require("@axia-js/types/create/types");

var defaultDefinitions = _interopRequireWildcard(require("@axia-js/types/interfaces/definitions"));

var _util = require("@axia-js/util");

var _index = require("../util/index.cjs");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// helper to generate a `readonly <Name>: <Type>;` getter

/** @internal */
function createGetter(definitions) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  let type = arguments.length > 2 ? arguments[2] : undefined;
  let imports = arguments.length > 3 ? arguments[3] : undefined;
  (0, _index.setImports)(definitions, imports, [type]);
  return `  readonly ${name}: ${type};\n`;
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-unused-vars


function errorUnhandled(_, definitions, def, imports) {
  throw new Error(`Generate: ${def.name || ''}: Unhandled type ${_types.TypeDefInfo[def.info]}`);
}
/** @internal */


function tsExport(registry, definitions, def, imports) {
  return (0, _index.exportInterface)(def.lookupIndex, def.name, (0, _index.formatType)(registry, definitions, def, imports, false));
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

function tsEnum(registry, definitions, _ref, imports) {
  let {
    lookupIndex,
    name: enumName,
    sub
  } = _ref;
  (0, _index.setImports)(definitions, imports, ['Enum']);
  const keys = sub.map((def, index) => {
    const {
      info,
      lookupName,
      name = `unknown${index}`,
      type
    } = def;
    const getter = (0, _util.stringUpperFirst)((0, _util.stringCamelCase)(name.replace(' ', '_')));
    const isComplex = [_types.TypeDefInfo.Result, _types.TypeDefInfo.Struct, _types.TypeDefInfo.Tuple, _types.TypeDefInfo.Vec, _types.TypeDefInfo.VecFixed].includes(info);
    const asGetter = type === 'Null' || info === _types.TypeDefInfo.DoNotConstruct ? '' : createGetter(definitions, `as${getter}`, lookupName || (isComplex ? (0, _index.formatType)(registry, definitions, info === _types.TypeDefInfo.Struct ? def : type, imports, false) : type), imports);
    const isGetter = info === _types.TypeDefInfo.DoNotConstruct ? '' : createGetter(definitions, `is${getter}`, 'boolean', imports);

    switch (info) {
      case _types.TypeDefInfo.Compact:
      case _types.TypeDefInfo.Plain:
      case _types.TypeDefInfo.Result:
      case _types.TypeDefInfo.Si:
      case _types.TypeDefInfo.Struct:
      case _types.TypeDefInfo.Tuple:
      case _types.TypeDefInfo.Vec:
      case _types.TypeDefInfo.Option:
      case _types.TypeDefInfo.VecFixed:
        return `${isGetter}${asGetter}`;

      case _types.TypeDefInfo.DoNotConstruct:
      case _types.TypeDefInfo.Null:
        return `${isGetter}`;

      default:
        throw new Error(`Enum: ${enumName || 'undefined'}: Unhandled type ${_types.TypeDefInfo[info]}, ${(0, _util.stringify)(def)}`);
    }
  });
  return (0, _index.exportInterface)(lookupIndex, enumName, 'Enum', keys.join(''));
}

function tsInt(_, definitions, def, imports) {
  let type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'Int';
  (0, _index.setImports)(definitions, imports, [type]);
  return (0, _index.exportInterface)(def.lookupIndex, def.name, type);
}
/** @internal */


function tsNull(registry, definitions, _ref2, imports) {
  let {
    lookupIndex = -1,
    name
  } = _ref2;
  (0, _index.setImports)(definitions, imports, ['Null']); // * @description extends [[${base}]]

  const doc = `/** @name ${name || ''}${lookupIndex !== -1 ? ` (${lookupIndex})` : ''} */\n`;
  return `${doc}export type ${name || ''} = Null;`;
}
/** @internal */


function tsResultGetter(registry, definitions) {
  let resultName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  let getter = arguments.length > 3 ? arguments[3] : undefined;
  let def = arguments.length > 4 ? arguments[4] : undefined;
  let imports = arguments.length > 5 ? arguments[5] : undefined;
  const {
    info,
    lookupName,
    type
  } = def;
  const asGetter = type === 'Null' ? '' : (getter === 'Error' ? '  /** @deprecated Use asErr */\n' : '') + createGetter(definitions, `as${getter}`, lookupName || (info === _types.TypeDefInfo.Tuple ? (0, _index.formatType)(registry, definitions, def, imports, false) : type), imports);
  const isGetter = (getter === 'Error' ? '  /** @deprecated Use isErr */\n' : '') + createGetter(definitions, `is${getter}`, 'boolean', imports);

  switch (info) {
    case _types.TypeDefInfo.Plain:
    case _types.TypeDefInfo.Si:
    case _types.TypeDefInfo.Tuple:
    case _types.TypeDefInfo.Vec:
    case _types.TypeDefInfo.Option:
      return `${isGetter}${asGetter}`;

    case _types.TypeDefInfo.Null:
      return `${isGetter}`;

    default:
      throw new Error(`Result: ${resultName}: Unhandled type ${_types.TypeDefInfo[info]}, ${(0, _util.stringify)(def)}`);
  }
}
/** @internal */


function tsResult(registry, definitions, def, imports) {
  const [okDef, errorDef] = def.sub;
  const inner = [tsResultGetter(registry, definitions, def.name, 'Err', errorDef, imports), // @deprecated, use Err
  tsResultGetter(registry, definitions, def.name, 'Error', errorDef, imports), tsResultGetter(registry, definitions, def.name, 'Ok', okDef, imports)].join('');
  (0, _index.setImports)(definitions, imports, [def.type]);
  const fmtType = def.lookupName && def.name !== def.lookupName ? def.lookupName : (0, _index.formatType)(registry, definitions, def, imports, false);
  return (0, _index.exportInterface)(def.lookupIndex, def.name, fmtType, inner);
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-unused-vars


function tsSi(registry, definitions, typeDef, imports) {
  // FIXME
  return `// SI: ${JSON.stringify(typeDef)}`;
}
/** @internal */


function tsSet(_, definitions, _ref3, imports) {
  let {
    lookupIndex,
    name: setName,
    sub
  } = _ref3;
  (0, _index.setImports)(definitions, imports, ['Set']);
  const types = sub.map(_ref4 => {
    let {
      name
    } = _ref4;
    (0, _util.assert)(name, 'Invalid TypeDef found, no name specified');
    return createGetter(definitions, `is${name}`, 'boolean', imports);
  });
  return (0, _index.exportInterface)(lookupIndex, setName, 'Set', types.join(''));
}
/** @internal */


function tsStruct(registry, definitions, _ref5, imports) {
  let {
    lookupIndex,
    name: structName,
    sub
  } = _ref5;
  (0, _index.setImports)(definitions, imports, ['Struct']);
  const keys = sub.map(def => {
    const fmtType = def.lookupName && def.name !== def.lookupName ? def.lookupName : (0, _index.formatType)(registry, definitions, def, imports, false);
    return createGetter(definitions, def.name, fmtType, imports);
  });
  return (0, _index.exportInterface)(lookupIndex, structName, 'Struct', keys.join(''));
}
/** @internal */


function tsUInt(registry, definitions, def, imports) {
  return tsInt(registry, definitions, def, imports, 'UInt');
}
/** @internal */


function tsVec(registry, definitions, def, imports) {
  const type = def.sub.type;

  if (type === 'u8') {
    if (def.info === _types.TypeDefInfo.VecFixed) {
      (0, _index.setImports)(definitions, imports, ['U8aFixed']);
      return (0, _index.exportType)(def.lookupIndex, def.name, 'U8aFixed');
    } else {
      (0, _index.setImports)(definitions, imports, ['Bytes']);
      return (0, _index.exportType)(def.lookupIndex, def.name, 'Bytes');
    }
  }

  const fmtType = def.lookupName && def.name !== def.lookupName ? def.lookupName : (0, _index.formatType)(registry, definitions, def, imports, false);
  return (0, _index.exportInterface)(def.lookupIndex, def.name, fmtType);
} // handlers are defined externally to use - this means that when we do a
// `generators[typedef.info](...)` TS will show any unhandled types. Rather
// we are being explicit in having no handlers where we do not support (yet)


const typeEncoders = {
  [_types.TypeDefInfo.BTreeMap]: tsBTreeMap,
  [_types.TypeDefInfo.BTreeSet]: tsBTreeSet,
  [_types.TypeDefInfo.Compact]: tsCompact,
  [_types.TypeDefInfo.DoNotConstruct]: tsDoNotConstruct,
  [_types.TypeDefInfo.Enum]: tsEnum,
  [_types.TypeDefInfo.HashMap]: tsHashMap,
  [_types.TypeDefInfo.Int]: tsInt,
  [_types.TypeDefInfo.Linkage]: errorUnhandled,
  [_types.TypeDefInfo.Null]: tsNull,
  [_types.TypeDefInfo.Option]: tsOption,
  [_types.TypeDefInfo.Plain]: tsPlain,
  [_types.TypeDefInfo.Range]: errorUnhandled,
  [_types.TypeDefInfo.Result]: tsResult,
  [_types.TypeDefInfo.Set]: tsSet,
  [_types.TypeDefInfo.Si]: tsSi,
  [_types.TypeDefInfo.Struct]: tsStruct,
  [_types.TypeDefInfo.Tuple]: tsTuple,
  [_types.TypeDefInfo.UInt]: tsUInt,
  [_types.TypeDefInfo.Vec]: tsVec,
  [_types.TypeDefInfo.VecFixed]: tsVec
};
/** @internal */

exports.typeEncoders = typeEncoders;

function generateInterfaces(registry, definitions, _ref6, imports) {
  let {
    types
  } = _ref6;
  return Object.entries(types).map(_ref7 => {
    let [name, type] = _ref7;
    const def = (0, _create.getTypeDef)((0, _util.isString)(type) ? type : (0, _util.stringify)(type), {
      name
    });
    return [name, typeEncoders[def.info](registry, definitions, def, imports)];
  });
}

const templateIndex = (0, _index.readTemplate)('tsDef/index');

const generateTsDefIndexTemplate = _handlebars.default.compile(templateIndex);

const templateModuleTypes = (0, _index.readTemplate)('tsDef/moduleTypes');

const generateTsDefModuleTypesTemplate = _handlebars.default.compile(templateModuleTypes);

const templateTypes = (0, _index.readTemplate)('tsDef/types');

const generateTsDefTypesTemplate = _handlebars.default.compile(templateTypes);
/** @internal */


function generateTsDefFor(registry, importDefinitions, defName, _ref8, outputDir) {
  let {
    types
  } = _ref8;

  const imports = _objectSpread(_objectSpread({}, (0, _index.createImports)(importDefinitions, {
    types
  })), {}, {
    interfaces: []
  });

  const definitions = imports.definitions;
  const interfaces = generateInterfaces(registry, definitions, {
    types
  }, imports);
  const items = interfaces.sort((a, b) => a[0].localeCompare(b[0])).map(_ref9 => {
    let [, definition] = _ref9;
    return definition;
  });
  (0, _index.writeFile)(_path.default.join(outputDir, defName, 'types.ts'), () => generateTsDefModuleTypesTemplate({
    headerType: 'defs',
    imports,
    items,
    name: defName,
    types: [...Object.keys(imports.localTypes).sort().map(packagePath => ({
      file: packagePath.replace('@axia-js/types/augment', '@axia-js/types'),
      types: Object.keys(imports.localTypes[packagePath])
    }))]
  }), true);
  (0, _index.writeFile)(_path.default.join(outputDir, defName, 'index.ts'), () => generateTsDefIndexTemplate({
    headerType: 'defs'
  }), true);
}
/** @internal */


function generateTsDef(importDefinitions, outputDir, generatingPackage) {
  const registry = new _create.TypeRegistry();
  (0, _index.writeFile)(_path.default.join(outputDir, 'types.ts'), () => {
    const definitions = importDefinitions[generatingPackage];
    Object.entries(definitions).forEach(_ref10 => {
      let [defName, obj] = _ref10;
      console.log(`\tExtracting interfaces for ${defName}`);
      generateTsDefFor(registry, importDefinitions, defName, obj, outputDir);
    });
    return generateTsDefTypesTemplate({
      headerType: 'defs',
      items: Object.keys(definitions)
    });
  });
  (0, _index.writeFile)(_path.default.join(outputDir, 'index.ts'), () => generateTsDefIndexTemplate({
    headerType: 'defs'
  }), true);
}
/** @internal */


function generateDefaultTsDef() {
  generateTsDef({
    '@axia-js/types/interfaces': defaultDefinitions
  }, 'packages/types/src/interfaces', '@axia-js/types/interfaces');
}