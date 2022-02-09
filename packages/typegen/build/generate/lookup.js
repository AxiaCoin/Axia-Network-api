import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
import Handlebars from 'handlebars';
import path from 'path';
import * as defaultDefinitions from '@axia-js/types/interfaces/definitions';
import staticAXIALunar from '@axia-js/types-support/metadata/static-axialunar';
import staticAXIA from '@axia-js/types-support/metadata/static-axia';
import staticAxlib from '@axia-js/types-support/metadata/static-axlib';
import { isString, stringify } from '@axia-js/util';
import { createImports, exportType, initMeta, readTemplate, writeFile } from "../util/index.js";
import { typeEncoders } from "./tsDef.js";
const MAP_ENUMS = ['Call', 'Event', 'Error', 'RawEvent'];
const WITH_TYPEDEF = false;
const generateLookupDefsTmpl = Handlebars.compile(readTemplate('lookup/defs'));
const generateLookupDefsNamedTmpl = Handlebars.compile(readTemplate('lookup/defs-named'));
const generateLookupIndexTmpl = Handlebars.compile(readTemplate('lookup/index'));
const generateLookupTypesTmpl = Handlebars.compile(readTemplate('lookup/types'));

function generateParamType(registry, {
  name,
  type
}) {
  if (type.isSome) {
    const link = registry.lookup.types[type.unwrap().toNumber()];

    if (link.type.path.length) {
      return generateTypeDocs(registry, null, link.type.path, link.type.params);
    }
  }

  return name.toString();
}

function generateTypeDocs(registry, id, path, params) {
  return `${id ? `${registry.createLookupType(id)}${path.length ? ': ' : ''}` : ''}${path.map(p => p.toString()).join('::')}${params.length ? `<${params.map(p => generateParamType(registry, p)).join(', ')}>` : ''}`;
}

function formatObject(lines) {
  const max = lines.length - 1;
  return ['{', ...lines.map((l, index) => l.endsWith(',') || l.endsWith('{') || index === max || lines[index + 1].endsWith('}') || lines[index + 1].endsWith('}') ? l : `${l},`), '}'];
}

function expandSet(parsed) {
  return formatObject(Object.entries(parsed).reduce((all, [k, v]) => {
    all.push(`${k}: ${v}`);
    return all;
  }, []));
}

function expandObject(parsed) {
  if (parsed._set) {
    return expandSet(parsed._set);
  }

  return formatObject(Object.entries(parsed).reduce((all, [k, v]) => {
    const inner = isString(v) ? expandType(v) : Array.isArray(v) ? [`[${v.map(e => `'${e}'`).join(', ')}]`] : expandObject(v);
    inner.forEach((l, index) => {
      all.push(`${index === 0 ? `${k}: ${l}` : `${l}`}`);
    });
    return all;
  }, []));
}

function expandType(encoded) {
  if (!encoded.startsWith('{')) {
    return [`'${encoded}'`];
  }

  return expandObject(JSON.parse(encoded));
}

function expandDefToString({
  lookupNameRoot,
  type
}, indent) {
  if (lookupNameRoot) {
    return `'${lookupNameRoot}'`;
  }

  const lines = expandType(type);
  let inc = 0;
  return lines.map((l, index) => {
    let r;

    if (l.endsWith('{')) {
      r = index === 0 ? l : `${' '.padStart(indent + inc)}${l}`;
      inc += 2;
    } else {
      if (l.endsWith('},') || l.endsWith('}')) {
        inc -= 2;
      }

      r = index === 0 ? l : `${' '.padStart(indent + inc)}${l}`;
    }

    return r;
  }).join('\n');
}

function getFilteredTypes(lookup, exclude = []) {
  const named = lookup.types.filter(({
    id,
    type: {
      path
    }
  }) => {
    const typeDef = lookup.getTypeDef(id);
    return (// We actually only want those with lookupName set
      !!typeDef.lookupName && !(path.length === 2 && ( // Ensure that we match {node, axialunar, *}_runtime
      path[0].toString().split('_')[1] === 'runtime' && !['Call', 'Event'].includes(path[1].toString()) || path[0].toString().startsWith('pallet_')) && // Ensure we strip generics, e.g. Event<T>
      MAP_ENUMS.includes(path[1].toString().split('<')[0])) && !(path.length >= 3 && path[path.length - 2].toString() === 'pallet' && // As above, cater for generics
      MAP_ENUMS.includes(path[path.length - 1].toString().split('<')[0]))
    );
  });
  const names = named.map(({
    id
  }) => lookup.getName(id));
  return named.filter((_, index) => !names.some((n, iindex) => index > iindex && n === names[index])).map(p => [p, lookup.getTypeDef(p.id)]).filter(([, typeDef]) => !exclude.includes(typeDef.lookupName || '<invalid>'));
}

function generateLookupDefs(registry, filtered, destDir, subPath) {
  writeFile(path.join(destDir, `${subPath || 'definitions'}.ts`), () => {
    const all = filtered.map(([{
      id,
      type: {
        params,
        path
      }
    }, typeDef]) => {
      const typeLookup = registry.createLookupType(id);
      const def = expandDefToString(typeDef, subPath ? 2 : 4);
      return {
        docs: [generateTypeDocs(registry, id, path, params), WITH_TYPEDEF ? `@typeDef ${stringify(typeDef)}` : null].filter(d => !!d),
        type: {
          def,
          typeLookup,
          typeName: typeDef.lookupName
        }
      };
    });
    const max = all.length - 1;
    return (subPath ? generateLookupDefsNamedTmpl : generateLookupDefsTmpl)({
      defs: all.map(({
        docs,
        type
      }, i) => {
        const {
          def,
          typeLookup,
          typeName
        } = type;
        return {
          defs: [[typeName || typeLookup, `${def}${i !== max ? ',' : ''}`]].map(([n, t]) => `${n}: ${t}`),
          docs
        };
      }),
      headerType: 'defs'
    });
  });
}

function generateLookupTypes(registry, filtered, destDir, subPath) {
  const imports = _objectSpread(_objectSpread({}, createImports({
    '@axia-js/types/interfaces': defaultDefinitions
  }, {
    types: {}
  })), {}, {
    interfaces: []
  });

  const items = filtered.map(([, typeDef]) => {
    typeDef.name = typeDef.lookupName;
    return typeDef.lookupNameRoot && typeDef.lookupName ? exportType(typeDef.lookupIndex, typeDef.lookupName, typeDef.lookupNameRoot) : typeEncoders[typeDef.info](registry, imports.definitions, typeDef, imports);
  }).filter(t => !!t);
  writeFile(path.join(destDir, `types${subPath ? `-${subPath}` : ''}.ts`), () => generateLookupTypesTmpl({
    headerType: 'defs',
    imports,
    items: items.map(l => l.split('\n').map(l => l.length ? `  ${l}` : '').join('\n')),
    types: [...Object.keys(imports.localTypes).sort().map(packagePath => ({
      file: packagePath,
      types: Object.keys(imports.localTypes[packagePath])
    }))]
  }), true);
  writeFile(path.join(destDir, 'index.ts'), () => generateLookupIndexTmpl({
    headerType: 'defs'
  }), true);
}

function generateLookup(destDir, entries) {
  entries.reduce((exclude, [subPath, staticMeta]) => {
    const {
      lookup,
      registry
    } = initMeta(staticMeta).metadata.asLatest;
    const filtered = getFilteredTypes(lookup, exclude);
    generateLookupDefs(registry, filtered, destDir, subPath);
    generateLookupTypes(registry, filtered, destDir, subPath);
    return exclude.concat(...filtered.map(([, typeDef]) => typeDef.lookupName).filter(n => !!n));
  }, []);
} // Generate `packages/types/src/lookup/*s`, the registry of all lookup types


export function generateDefaultLookup(destDir = 'packages/types/src/augment/lookup', staticData) {
  generateLookup(destDir, staticData ? [[undefined, staticData]] : [['axlib', staticAxlib], ['axia', staticAXIA], ['axialunar', staticAXIALunar]]);
}