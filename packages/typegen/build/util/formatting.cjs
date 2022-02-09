"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HEADER = void 0;
exports.exportInterface = exportInterface;
exports.exportType = exportType;
exports.formatType = formatType;

var _handlebars = _interopRequireDefault(require("handlebars"));

var _create = require("@axia-js/types/create");

var _types = require("@axia-js/types/create/types");

var _util = require("@axia-js/util");

var _file = require("./file.cjs");

var _imports = require("./imports.cjs");

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
const NO_CODEC = ['Tuple', 'VecFixed'];

const HEADER = type => `// Auto-generated via \`yarn axia-types-from-${type}\`, do not edit\n/* eslint-disable */\n\n`;

exports.HEADER = HEADER;

_handlebars.default.registerPartial({
  footer: _handlebars.default.compile((0, _file.readTemplate)('footer')),
  header: _handlebars.default.compile((0, _file.readTemplate)('header'))
});

_handlebars.default.registerHelper({
  imports() {
    const {
      imports,
      types
    } = this;
    const defs = [{
      file: '@axia-js/types',
      types: [...Object.keys(imports.codecTypes).filter(name => !NO_CODEC.includes(name)), ...Object.keys(imports.extrinsicTypes), ...Object.keys(imports.genericTypes), ...Object.keys(imports.metadataTypes), ...Object.keys(imports.primitiveTypes)]
    }, {
      file: '@axia-js/types/types',
      types: Object.keys(imports.typesTypes)
    }, ...types];
    return [...defs].sort((a, b) => a.file.localeCompare(b.file)).reduce((result, _ref) => {
      let {
        file,
        types
      } = _ref;
      return types.length ? `${result}import type { ${types.sort().join(', ')} } from '${file}';\n` : result;
    }, '');
  },

  trim(options) {
    return options.fn(this).trim();
  },

  upper(options) {
    return options.fn(this).toUpperCase();
  }

}); // helper to generate a `export interface <Name> extends <Base> {<Body>}

/** @internal */


function exportInterface() {
  let lookupIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  let base = arguments.length > 2 ? arguments[2] : undefined;
  let body = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  // * @description extends [[${base}]]
  const doc = `/** @name ${name}${lookupIndex !== -1 ? ` (${lookupIndex})` : ''} */\n`;
  return `${doc}export interface ${name} extends ${base} {${body.length ? '\n' : ''}${body}}`;
} // helper to create an `export type <Name> = <Base>`
// but since we don't want type alias (TS doesn't preserve names) we use
// interface here.

/** @internal */


function exportType() {
  let lookupIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  let base = arguments.length > 2 ? arguments[2] : undefined;
  return exportInterface(lookupIndex, name, base);
}

const formatters = {
  [_types.TypeDefInfo.Compact]: (registry, typeDef, definitions, imports, withShortcut) => {
    const sub = typeDef.sub;
    (0, _imports.setImports)(definitions, imports, ['Compact', sub.lookupName]);
    return (0, _create.paramsNotation)('Compact', sub.lookupName || formatType(registry, definitions, sub.type, imports, withShortcut));
  },
  [_types.TypeDefInfo.DoNotConstruct]: (registry, _ref2, definitions, imports, withShortcut) => {
    let {
      lookupName
    } = _ref2;
    (0, _imports.setImports)(definitions, imports, ['DoNotConstruct']);
    return 'DoNotConstruct';
  },
  [_types.TypeDefInfo.Enum]: (registry, typeDef, definitions, imports, withShortcut) => {
    if (typeDef.lookupName) {
      return typeDef.lookupName;
    }

    throw new Error(`TypeDefInfo.Enum: Not implemented on ${(0, _util.stringify)(typeDef)}`);
  },
  [_types.TypeDefInfo.Int]: (registry, typeDef, definitions, imports, withShortcut) => {
    throw new Error(`TypeDefInfo.Int: Not implemented on ${(0, _util.stringify)(typeDef)}`);
  },
  [_types.TypeDefInfo.UInt]: (registry, typeDef, definitions, imports, withShortcut) => {
    throw new Error(`TypeDefInfo.UInt: Not implemented on ${(0, _util.stringify)(typeDef)}`);
  },
  [_types.TypeDefInfo.Null]: (registry, typeDef, definitions, imports, withShortcut) => {
    (0, _imports.setImports)(definitions, imports, ['Null']);
    return 'Null';
  },
  [_types.TypeDefInfo.Option]: (registry, typeDef, definitions, imports, withShortcut) => {
    const sub = typeDef.sub;
    (0, _imports.setImports)(definitions, imports, ['Option', sub.lookupName]);
    return (0, _create.paramsNotation)('Option', sub.lookupName || formatType(registry, definitions, sub.type, imports, withShortcut));
  },
  [_types.TypeDefInfo.Plain]: (registry, typeDef, definitions, imports, withShortcut) => {
    (0, _imports.setImports)(definitions, imports, [typeDef.type]);
    return typeDef.type;
  },
  [_types.TypeDefInfo.Range]: (registry, typeDef, definitions, imports, withShortcut) => {
    throw new Error(`TypeDefInfo.Range: Not implemented on ${(0, _util.stringify)(typeDef)}`);
  },
  [_types.TypeDefInfo.Set]: (registry, typeDef, definitions, imports, withShortcut) => {
    throw new Error(`TypeDefInfo.Set: Not implemented on ${(0, _util.stringify)(typeDef)}`);
  },
  [_types.TypeDefInfo.Si]: (registry, typeDef, definitions, imports, withShortcut) => {
    return formatType(registry, definitions, registry.lookup.getTypeDef(typeDef.type), imports, withShortcut);
  },
  [_types.TypeDefInfo.Struct]: (registry, typeDef, definitions, imports, withShortcut) => {
    if (typeDef.lookupName) {
      return typeDef.lookupName;
    }

    const sub = typeDef.sub;
    (0, _imports.setImports)(definitions, imports, ['Struct', ...sub.map(_ref3 => {
      let {
        lookupName
      } = _ref3;
      return lookupName;
    })]);
    return `{${withShortcut ? ' ' : '\n'}${sub.map((_ref4, index) => {
      let {
        lookupName,
        name,
        type
      } = _ref4;
      return [name || `unknown${index}`, lookupName || formatType(registry, definitions, type, imports, withShortcut)];
    }).map(_ref5 => {
      let [k, t] = _ref5;
      return `${withShortcut ? '' : '    readonly '}${k}: ${t};`;
    }).join(withShortcut ? ' ' : '\n')}${withShortcut ? ' ' : '\n  '}} & Struct`;
  },
  [_types.TypeDefInfo.Tuple]: (registry, typeDef, definitions, imports, withShortcut) => {
    const sub = typeDef.sub;
    (0, _imports.setImports)(definitions, imports, ['ITuple', ...sub.map(_ref6 => {
      let {
        lookupName
      } = _ref6;
      return lookupName;
    })]); // `(a,b)` gets transformed into `ITuple<[a, b]>`

    return (0, _create.paramsNotation)('ITuple', `[${sub.map(_ref7 => {
      let {
        lookupName,
        type
      } = _ref7;
      return lookupName || formatType(registry, definitions, type, imports, withShortcut);
    }).join(', ')}]`);
  },
  [_types.TypeDefInfo.Vec]: (registry, typeDef, definitions, imports, withShortcut) => {
    const sub = typeDef.sub;
    (0, _imports.setImports)(definitions, imports, ['Vec', sub.lookupName]);
    return (0, _create.paramsNotation)('Vec', sub.lookupName || formatType(registry, definitions, sub.type, imports, withShortcut));
  },
  [_types.TypeDefInfo.VecFixed]: (registry, typeDef, definitions, imports, withShortcut) => {
    const sub = typeDef.sub;

    if (sub.type === 'u8') {
      (0, _imports.setImports)(definitions, imports, ['U8aFixed']);
      return 'U8aFixed';
    }

    (0, _imports.setImports)(definitions, imports, ['Vec', sub.lookupName]);
    return (0, _create.paramsNotation)('Vec', sub.lookupName || formatType(registry, definitions, sub.type, imports, withShortcut));
  },
  [_types.TypeDefInfo.BTreeMap]: (registry, typeDef, definitions, imports, withShortcut) => {
    const [keyDef, valDef] = typeDef.sub;
    (0, _imports.setImports)(definitions, imports, ['BTreeMap', keyDef.lookupName, valDef.lookupName]);
    return `BTreeMap<${keyDef.lookupName || formatType(registry, definitions, keyDef.type, imports, withShortcut)}, ${valDef.lookupName || formatType(registry, definitions, valDef.type, imports, withShortcut)}>`;
  },
  [_types.TypeDefInfo.BTreeSet]: (registry, typeDef, definitions, imports, withShortcut) => {
    const valDef = typeDef.sub;
    (0, _imports.setImports)(definitions, imports, ['BTreeSet', valDef.lookupName]);
    return `BTreeSet<${valDef.lookupName || formatType(registry, definitions, valDef.type, imports, withShortcut)}>`;
  },
  [_types.TypeDefInfo.HashMap]: (registry, typeDef, definitions, imports, withShortcut) => {
    const [keyDef, valDef] = typeDef.sub;
    (0, _imports.setImports)(definitions, imports, ['HashMap', keyDef.lookupName, valDef.lookupName]);
    return `HashMap<${keyDef.lookupName || formatType(registry, definitions, keyDef.type, imports, withShortcut)}, ${valDef.lookupName || formatType(registry, definitions, valDef.type, imports, withShortcut)}>`;
  },
  [_types.TypeDefInfo.Linkage]: (registry, typeDef, definitions, imports, withShortcut) => {
    const sub = typeDef.sub;
    (0, _imports.setImports)(definitions, imports, ['Linkage', sub.lookupName]);
    return (0, _create.paramsNotation)('Linkage', sub.lookupName || formatType(registry, definitions, sub.type, imports, withShortcut));
  },
  [_types.TypeDefInfo.Result]: (registry, typeDef, definitions, imports, withShortcut) => {
    const [okDef, errDef] = typeDef.sub;
    (0, _imports.setImports)(definitions, imports, ['Result', okDef.lookupName, errDef.lookupName]);
    return `Result<${okDef.lookupName || formatType(registry, definitions, okDef.type, imports, withShortcut)}, ${errDef.lookupName || formatType(registry, definitions, errDef.type, imports, withShortcut)}>`;
  }
};
/**
 * Correctly format a given type
 */

/** @internal */
// eslint-disable-next-line @typescript-eslint/ban-types

function formatType(registry, definitions, type, imports) {
  let withShortcut = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  let typeDef;

  if ((0, _util.isString)(type)) {
    const _type = type.toString(); // If type is "unorthodox" (i.e. `{ something: any }` for an Enum input or `[a | b | c, d | e | f]` for a Tuple's similar types),
    // we return it as-is


    if (withShortcut && /(^{.+:.+})|^\([^,]+\)|^\(.+\)\[\]|^\[.+\]/.exec(_type) && !/\[\w+;\w+\]/.exec(_type)) {
      return _type;
    }

    typeDef = (0, _create.getTypeDef)(type);
  } else {
    typeDef = type;
  }

  (0, _imports.setImports)(definitions, imports, [typeDef.lookupName || typeDef.type]);
  return formatters[typeDef.info](registry, typeDef, definitions, imports, withShortcut);
}