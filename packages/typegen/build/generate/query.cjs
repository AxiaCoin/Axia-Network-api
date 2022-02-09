"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateDefaultQuery = generateDefaultQuery;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _handlebars = _interopRequireDefault(require("handlebars"));

var _definitions = _interopRequireDefault(require("@axia-js/types/augment/lookup/definitions"));

var defaultDefs = _interopRequireWildcard(require("@axia-js/types/interfaces/definitions"));

var _StorageKey = require("@axia-js/types/primitive/StorageKey");

var _util = require("@axia-js/util");

var _index = require("../util/index.cjs");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// From a storage entry metadata, we return [args, returnType]

/** @internal */
function entrySignature(lookup, allDefs, registry, storageEntry, imports) {
  const outputType = lookup.getTypeDef((0, _StorageKey.unwrapStorageSi)(storageEntry.type));

  if (storageEntry.type.isPlain) {
    const typeDef = lookup.getTypeDef(storageEntry.type.asPlain);
    (0, _index.setImports)(allDefs, imports, [typeDef.lookupName || typeDef.type]);
    return [storageEntry.modifier.isOptional, '', '', (0, _index.formatType)(registry, allDefs, outputType, imports)];
  } else if (storageEntry.type.isMap) {
    const {
      hashers,
      key,
      value
    } = storageEntry.type.asMap;
    const keyDefs = hashers.length === 1 ? [lookup.getTypeDef(key)] : lookup.getSiType(key).def.asTuple.map(k => lookup.getTypeDef(k));
    const similarTypes = keyDefs.map(k => (0, _index.getSimilarTypes)(registry, allDefs, k.lookupName || k.type, imports));
    const keyTypes = similarTypes.map(t => t.join(' | '));
    const defValue = lookup.getTypeDef(value);
    (0, _index.setImports)(allDefs, imports, [...similarTypes.reduce((all, t) => all.concat(t), []), defValue.lookupName ? undefined : defValue.type]);
    return [storageEntry.modifier.isOptional, keyDefs.map(k => (0, _index.formatType)(registry, allDefs, k.lookupName || k.type, imports)).join(', '), keyTypes.map((t, i) => `arg${keyTypes.length === 1 ? '' : i + 1}: ${t}`).join(', '), (0, _index.formatType)(registry, allDefs, outputType, imports)];
  }

  throw new Error(`entryArgs: Cannot parse args of entry ${storageEntry.name.toString()}`);
}

const template = (0, _index.readTemplate)('query');

const generateForMetaTemplate = _handlebars.default.compile(template);
/** @internal */


function generateForMeta(registry, meta, dest, extraTypes, isStrict) {
  (0, _index.writeFile)(dest, () => {
    const allTypes = _objectSpread({
      '@axia-js/types/augment': {
        lookup: _definitions.default
      },
      '@axia-js/types/interfaces': defaultDefs
    }, extraTypes);

    const imports = (0, _index.createImports)(allTypes);
    const allDefs = Object.entries(allTypes).reduce((defs, _ref) => {
      let [path, obj] = _ref;
      return Object.entries(obj).reduce((defs, _ref2) => {
        let [key, value] = _ref2;
        return _objectSpread(_objectSpread({}, defs), {}, {
          [`${path}/${key}`]: value
        });
      }, defs);
    }, {});
    const {
      lookup,
      pallets
    } = meta.asLatest;
    const modules = pallets.filter(_ref3 => {
      let {
        storage
      } = _ref3;
      return storage.isSome;
    }).map(_ref4 => {
      let {
        name,
        storage
      } = _ref4;
      const items = storage.unwrap().items.map(storageEntry => {
        const [isOptional, args, params, _returnType] = entrySignature(lookup, allDefs, registry, storageEntry, imports);
        const returnType = isOptional ? `Option<${_returnType}>` : _returnType;
        return {
          args,
          docs: storageEntry.docs,
          entryType: 'AugmentedQuery',
          name: (0, _util.stringCamelCase)(storageEntry.name),
          params,
          returnType
        };
      }).sort(_index.compareName);
      return {
        items,
        name: (0, _util.stringCamelCase)(name)
      };
    }).sort(_index.compareName);
    imports.typesTypes.Observable = true;
    return generateForMetaTemplate({
      headerType: 'chain',
      imports,
      isStrict,
      modules,
      types: [...Object.keys(imports.localTypes).sort().map(packagePath => ({
        file: packagePath.replace('@axia-js/types/augment', '@axia-js/types'),
        types: Object.keys(imports.localTypes[packagePath])
      })), {
        file: '@axia-js/api/types',
        types: ['ApiTypes']
      }]
    });
  });
} // Call `generateForMeta()` with current static metadata

/** @internal */


function generateDefaultQuery() {
  let dest = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'packages/api/src/augment/query.ts';
  let data = arguments.length > 1 ? arguments[1] : undefined;
  let extraTypes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  let isStrict = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  const {
    metadata,
    registry
  } = (0, _index.initMeta)(data, extraTypes);
  return generateForMeta(registry, metadata, dest, extraTypes, isStrict);
}