// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import Handlebars from 'handlebars';
import { getTypeDef, paramsNotation } from '@axia-js/types/create';
import { TypeDefInfo } from '@axia-js/types/create/types';
import { isString, stringify } from '@axia-js/util';
import { readTemplate } from "./file.js";
import { setImports } from "./imports.js";
const NO_CODEC = ['Tuple', 'VecFixed'];
export const HEADER = type => `// Auto-generated via \`yarn axia-types-from-${type}\`, do not edit\n/* eslint-disable */\n\n`;
Handlebars.registerPartial({
  footer: Handlebars.compile(readTemplate('footer')),
  header: Handlebars.compile(readTemplate('header'))
});
Handlebars.registerHelper({
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
    return [...defs].sort((a, b) => a.file.localeCompare(b.file)).reduce((result, {
      file,
      types
    }) => {
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

export function exportInterface(lookupIndex = -1, name = '', base, body = '') {
  // * @description extends [[${base}]]
  const doc = `/** @name ${name}${lookupIndex !== -1 ? ` (${lookupIndex})` : ''} */\n`;
  return `${doc}export interface ${name} extends ${base} {${body.length ? '\n' : ''}${body}}`;
} // helper to create an `export type <Name> = <Base>`
// but since we don't want type alias (TS doesn't preserve names) we use
// interface here.

/** @internal */

export function exportType(lookupIndex = -1, name = '', base) {
  return exportInterface(lookupIndex, name, base);
}
const formatters = {
  [TypeDefInfo.Compact]: (registry, typeDef, definitions, imports, withShortcut) => {
    const sub = typeDef.sub;
    setImports(definitions, imports, ['Compact', sub.lookupName]);
    return paramsNotation('Compact', sub.lookupName || formatType(registry, definitions, sub.type, imports, withShortcut));
  },
  [TypeDefInfo.DoNotConstruct]: (registry, {
    lookupName
  }, definitions, imports, withShortcut) => {
    setImports(definitions, imports, ['DoNotConstruct']);
    return 'DoNotConstruct';
  },
  [TypeDefInfo.Enum]: (registry, typeDef, definitions, imports, withShortcut) => {
    if (typeDef.lookupName) {
      return typeDef.lookupName;
    }

    throw new Error(`TypeDefInfo.Enum: Not implemented on ${stringify(typeDef)}`);
  },
  [TypeDefInfo.Int]: (registry, typeDef, definitions, imports, withShortcut) => {
    throw new Error(`TypeDefInfo.Int: Not implemented on ${stringify(typeDef)}`);
  },
  [TypeDefInfo.UInt]: (registry, typeDef, definitions, imports, withShortcut) => {
    throw new Error(`TypeDefInfo.UInt: Not implemented on ${stringify(typeDef)}`);
  },
  [TypeDefInfo.Null]: (registry, typeDef, definitions, imports, withShortcut) => {
    setImports(definitions, imports, ['Null']);
    return 'Null';
  },
  [TypeDefInfo.Option]: (registry, typeDef, definitions, imports, withShortcut) => {
    const sub = typeDef.sub;
    setImports(definitions, imports, ['Option', sub.lookupName]);
    return paramsNotation('Option', sub.lookupName || formatType(registry, definitions, sub.type, imports, withShortcut));
  },
  [TypeDefInfo.Plain]: (registry, typeDef, definitions, imports, withShortcut) => {
    setImports(definitions, imports, [typeDef.type]);
    return typeDef.type;
  },
  [TypeDefInfo.Range]: (registry, typeDef, definitions, imports, withShortcut) => {
    throw new Error(`TypeDefInfo.Range: Not implemented on ${stringify(typeDef)}`);
  },
  [TypeDefInfo.Set]: (registry, typeDef, definitions, imports, withShortcut) => {
    throw new Error(`TypeDefInfo.Set: Not implemented on ${stringify(typeDef)}`);
  },
  [TypeDefInfo.Si]: (registry, typeDef, definitions, imports, withShortcut) => {
    return formatType(registry, definitions, registry.lookup.getTypeDef(typeDef.type), imports, withShortcut);
  },
  [TypeDefInfo.Struct]: (registry, typeDef, definitions, imports, withShortcut) => {
    if (typeDef.lookupName) {
      return typeDef.lookupName;
    }

    const sub = typeDef.sub;
    setImports(definitions, imports, ['Struct', ...sub.map(({
      lookupName
    }) => lookupName)]);
    return `{${withShortcut ? ' ' : '\n'}${sub.map(({
      lookupName,
      name,
      type
    }, index) => [name || `unknown${index}`, lookupName || formatType(registry, definitions, type, imports, withShortcut)]).map(([k, t]) => `${withShortcut ? '' : '    readonly '}${k}: ${t};`).join(withShortcut ? ' ' : '\n')}${withShortcut ? ' ' : '\n  '}} & Struct`;
  },
  [TypeDefInfo.Tuple]: (registry, typeDef, definitions, imports, withShortcut) => {
    const sub = typeDef.sub;
    setImports(definitions, imports, ['ITuple', ...sub.map(({
      lookupName
    }) => lookupName)]); // `(a,b)` gets transformed into `ITuple<[a, b]>`

    return paramsNotation('ITuple', `[${sub.map(({
      lookupName,
      type
    }) => lookupName || formatType(registry, definitions, type, imports, withShortcut)).join(', ')}]`);
  },
  [TypeDefInfo.Vec]: (registry, typeDef, definitions, imports, withShortcut) => {
    const sub = typeDef.sub;
    setImports(definitions, imports, ['Vec', sub.lookupName]);
    return paramsNotation('Vec', sub.lookupName || formatType(registry, definitions, sub.type, imports, withShortcut));
  },
  [TypeDefInfo.VecFixed]: (registry, typeDef, definitions, imports, withShortcut) => {
    const sub = typeDef.sub;

    if (sub.type === 'u8') {
      setImports(definitions, imports, ['U8aFixed']);
      return 'U8aFixed';
    }

    setImports(definitions, imports, ['Vec', sub.lookupName]);
    return paramsNotation('Vec', sub.lookupName || formatType(registry, definitions, sub.type, imports, withShortcut));
  },
  [TypeDefInfo.BTreeMap]: (registry, typeDef, definitions, imports, withShortcut) => {
    const [keyDef, valDef] = typeDef.sub;
    setImports(definitions, imports, ['BTreeMap', keyDef.lookupName, valDef.lookupName]);
    return `BTreeMap<${keyDef.lookupName || formatType(registry, definitions, keyDef.type, imports, withShortcut)}, ${valDef.lookupName || formatType(registry, definitions, valDef.type, imports, withShortcut)}>`;
  },
  [TypeDefInfo.BTreeSet]: (registry, typeDef, definitions, imports, withShortcut) => {
    const valDef = typeDef.sub;
    setImports(definitions, imports, ['BTreeSet', valDef.lookupName]);
    return `BTreeSet<${valDef.lookupName || formatType(registry, definitions, valDef.type, imports, withShortcut)}>`;
  },
  [TypeDefInfo.HashMap]: (registry, typeDef, definitions, imports, withShortcut) => {
    const [keyDef, valDef] = typeDef.sub;
    setImports(definitions, imports, ['HashMap', keyDef.lookupName, valDef.lookupName]);
    return `HashMap<${keyDef.lookupName || formatType(registry, definitions, keyDef.type, imports, withShortcut)}, ${valDef.lookupName || formatType(registry, definitions, valDef.type, imports, withShortcut)}>`;
  },
  [TypeDefInfo.Linkage]: (registry, typeDef, definitions, imports, withShortcut) => {
    const sub = typeDef.sub;
    setImports(definitions, imports, ['Linkage', sub.lookupName]);
    return paramsNotation('Linkage', sub.lookupName || formatType(registry, definitions, sub.type, imports, withShortcut));
  },
  [TypeDefInfo.Result]: (registry, typeDef, definitions, imports, withShortcut) => {
    const [okDef, errDef] = typeDef.sub;
    setImports(definitions, imports, ['Result', okDef.lookupName, errDef.lookupName]);
    return `Result<${okDef.lookupName || formatType(registry, definitions, okDef.type, imports, withShortcut)}, ${errDef.lookupName || formatType(registry, definitions, errDef.type, imports, withShortcut)}>`;
  }
};
/**
 * Correctly format a given type
 */

/** @internal */
// eslint-disable-next-line @typescript-eslint/ban-types

export function formatType(registry, definitions, type, imports, withShortcut = false) {
  let typeDef;

  if (isString(type)) {
    const _type = type.toString(); // If type is "unorthodox" (i.e. `{ something: any }` for an Enum input or `[a | b | c, d | e | f]` for a Tuple's similar types),
    // we return it as-is


    if (withShortcut && /(^{.+:.+})|^\([^,]+\)|^\(.+\)\[\]|^\[.+\]/.exec(_type) && !/\[\w+;\w+\]/.exec(_type)) {
      return _type;
    }

    typeDef = getTypeDef(type);
  } else {
    typeDef = type;
  }

  setImports(definitions, imports, [typeDef.lookupName || typeDef.type]);
  return formatters[typeDef.info](registry, typeDef, definitions, imports, withShortcut);
}