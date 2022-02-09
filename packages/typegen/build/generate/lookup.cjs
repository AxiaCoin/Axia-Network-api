"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateDefaultLookup = generateDefaultLookup;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _handlebars = _interopRequireDefault(require("handlebars"));

var _path = _interopRequireDefault(require("path"));

var defaultDefinitions = _interopRequireWildcard(require("@axia-js/types/interfaces/definitions"));

var _staticAxialunar = _interopRequireDefault(require("@axia-js/types-support/metadata/static-axialunar"));

var _staticAxia = _interopRequireDefault(require("@axia-js/types-support/metadata/static-axia"));

var _staticAxlib = _interopRequireDefault(require("@axia-js/types-support/metadata/static-axlib"));

var _util = require("@axia-js/util");

var _index = require("../util/index.cjs");

var _tsDef = require("./tsDef.cjs");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const MAP_ENUMS = ['Call', 'Event', 'Error', 'RawEvent'];
const WITH_TYPEDEF = false;

const generateLookupDefsTmpl = _handlebars.default.compile((0, _index.readTemplate)('lookup/defs'));

const generateLookupDefsNamedTmpl = _handlebars.default.compile((0, _index.readTemplate)('lookup/defs-named'));

const generateLookupIndexTmpl = _handlebars.default.compile((0, _index.readTemplate)('lookup/index'));

const generateLookupTypesTmpl = _handlebars.default.compile((0, _index.readTemplate)('lookup/types'));

function generateParamType(registry, _ref) {
  let {
    name,
    type
  } = _ref;

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
  return formatObject(Object.entries(parsed).reduce((all, _ref2) => {
    let [k, v] = _ref2;
    all.push(`${k}: ${v}`);
    return all;
  }, []));
}

function expandObject(parsed) {
  if (parsed._set) {
    return expandSet(parsed._set);
  }

  return formatObject(Object.entries(parsed).reduce((all, _ref3) => {
    let [k, v] = _ref3;
    const inner = (0, _util.isString)(v) ? expandType(v) : Array.isArray(v) ? [`[${v.map(e => `'${e}'`).join(', ')}]`] : expandObject(v);
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

function expandDefToString(_ref4, indent) {
  let {
    lookupNameRoot,
    type
  } = _ref4;

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

function getFilteredTypes(lookup) {
  let exclude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  const named = lookup.types.filter(_ref5 => {
    let {
      id,
      type: {
        path
      }
    } = _ref5;
    const typeDef = lookup.getTypeDef(id);
    return (// We actually only want those with lookupName set
      !!typeDef.lookupName && !(path.length === 2 && ( // Ensure that we match {node, axialunar, *}_runtime
      path[0].toString().split('_')[1] === 'runtime' && !['Call', 'Event'].includes(path[1].toString()) || path[0].toString().startsWith('pallet_')) && // Ensure we strip generics, e.g. Event<T>
      MAP_ENUMS.includes(path[1].toString().split('<')[0])) && !(path.length >= 3 && path[path.length - 2].toString() === 'pallet' && // As above, cater for generics
      MAP_ENUMS.includes(path[path.length - 1].toString().split('<')[0]))
    );
  });
  const names = named.map(_ref6 => {
    let {
      id
    } = _ref6;
    return lookup.getName(id);
  });
  return named.filter((_, index) => !names.some((n, iindex) => index > iindex && n === names[index])).map(p => [p, lookup.getTypeDef(p.id)]).filter(_ref7 => {
    let [, typeDef] = _ref7;
    return !exclude.includes(typeDef.lookupName || '<invalid>');
  });
}

function generateLookupDefs(registry, filtered, destDir, subPath) {
  (0, _index.writeFile)(_path.default.join(destDir, `${subPath || 'definitions'}.ts`), () => {
    const all = filtered.map(_ref8 => {
      let [{
        id,
        type: {
          params,
          path
        }
      }, typeDef] = _ref8;
      const typeLookup = registry.createLookupType(id);
      const def = expandDefToString(typeDef, subPath ? 2 : 4);
      return {
        docs: [generateTypeDocs(registry, id, path, params), WITH_TYPEDEF ? `@typeDef ${(0, _util.stringify)(typeDef)}` : null].filter(d => !!d),
        type: {
          def,
          typeLookup,
          typeName: typeDef.lookupName
        }
      };
    });
    const max = all.length - 1;
    return (subPath ? generateLookupDefsNamedTmpl : generateLookupDefsTmpl)({
      defs: all.map((_ref9, i) => {
        let {
          docs,
          type
        } = _ref9;
        const {
          def,
          typeLookup,
          typeName
        } = type;
        return {
          defs: [[typeName || typeLookup, `${def}${i !== max ? ',' : ''}`]].map(_ref10 => {
            let [n, t] = _ref10;
            return `${n}: ${t}`;
          }),
          docs
        };
      }),
      headerType: 'defs'
    });
  });
}

function generateLookupTypes(registry, filtered, destDir, subPath) {
  const imports = _objectSpread(_objectSpread({}, (0, _index.createImports)({
    '@axia-js/types/interfaces': defaultDefinitions
  }, {
    types: {}
  })), {}, {
    interfaces: []
  });

  const items = filtered.map(_ref11 => {
    let [, typeDef] = _ref11;
    typeDef.name = typeDef.lookupName;
    return typeDef.lookupNameRoot && typeDef.lookupName ? (0, _index.exportType)(typeDef.lookupIndex, typeDef.lookupName, typeDef.lookupNameRoot) : _tsDef.typeEncoders[typeDef.info](registry, imports.definitions, typeDef, imports);
  }).filter(t => !!t);
  (0, _index.writeFile)(_path.default.join(destDir, `types${subPath ? `-${subPath}` : ''}.ts`), () => generateLookupTypesTmpl({
    headerType: 'defs',
    imports,
    items: items.map(l => l.split('\n').map(l => l.length ? `  ${l}` : '').join('\n')),
    types: [...Object.keys(imports.localTypes).sort().map(packagePath => ({
      file: packagePath,
      types: Object.keys(imports.localTypes[packagePath])
    }))]
  }), true);
  (0, _index.writeFile)(_path.default.join(destDir, 'index.ts'), () => generateLookupIndexTmpl({
    headerType: 'defs'
  }), true);
}

function generateLookup(destDir, entries) {
  entries.reduce((exclude, _ref12) => {
    let [subPath, staticMeta] = _ref12;
    const {
      lookup,
      registry
    } = (0, _index.initMeta)(staticMeta).metadata.asLatest;
    const filtered = getFilteredTypes(lookup, exclude);
    generateLookupDefs(registry, filtered, destDir, subPath);
    generateLookupTypes(registry, filtered, destDir, subPath);
    return exclude.concat(...filtered.map(_ref13 => {
      let [, typeDef] = _ref13;
      return typeDef.lookupName;
    }).filter(n => !!n));
  }, []);
} // Generate `packages/types/src/lookup/*s`, the registry of all lookup types


function generateDefaultLookup() {
  let destDir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'packages/types/src/augment/lookup';
  let staticData = arguments.length > 1 ? arguments[1] : undefined;
  generateLookup(destDir, staticData ? [[undefined, staticData]] : [['axlib', _staticAxlib.default], ['axia', _staticAxia.default], ['axialunar', _staticAxialunar.default]]);
}