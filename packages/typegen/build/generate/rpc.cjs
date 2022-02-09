"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateDefaultRpc = generateDefaultRpc;
exports.generateRpcTypes = generateRpcTypes;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _handlebars = _interopRequireDefault(require("handlebars"));

var defaultDefinitions = _interopRequireWildcard(require("@axia-js/types/interfaces/definitions"));

var _index = require("../util/index.cjs");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const StorageKeyTye = 'StorageKey | string | Uint8Array | any';
const template = (0, _index.readTemplate)('rpc');

const generateRpcTypesTemplate = _handlebars.default.compile(template);
/** @internal */


function generateRpcTypes(registry, importDefinitions, dest) {
  let extraTypes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  (0, _index.writeFile)(dest, () => {
    const allTypes = _objectSpread({
      '@axia-js/types/interfaces': importDefinitions
    }, extraTypes);

    const imports = (0, _index.createImports)(allTypes);
    const definitions = imports.definitions;
    const allDefs = Object.entries(allTypes).reduce((defs, _ref) => {
      let [path, obj] = _ref;
      return Object.entries(obj).reduce((defs, _ref2) => {
        let [key, value] = _ref2;
        return _objectSpread(_objectSpread({}, defs), {}, {
          [`${path}/${key}`]: value
        });
      }, defs);
    }, {});
    const rpcKeys = Object.keys(definitions).filter(key => Object.keys(definitions[key].rpc || {}).length !== 0).sort();
    const additional = {};
    const modules = rpcKeys.map(sectionFullName => {
      const rpc = definitions[sectionFullName].rpc;
      const section = sectionFullName.split('/').pop();
      const allMethods = Object.keys(rpc).sort().map(methodName => {
        const def = rpc[methodName];
        let args;
        let type;
        let generic; // These are too hard to type with generics, do manual overrides

        if (section === 'state') {
          (0, _index.setImports)(allDefs, imports, ['Codec', 'Hash', 'StorageKey', 'Vec']);

          if (methodName === 'getStorage') {
            generic = 'T = Codec';
            args = [`key: ${StorageKeyTye}, block?: Hash | Uint8Array | string`];
            type = 'T';
          } else if (methodName === 'queryStorage') {
            generic = 'T = Codec[]';
            args = [`keys: Vec<StorageKey> | (${StorageKeyTye})[], fromBlock?: Hash | Uint8Array | string, toBlock?: Hash | Uint8Array | string`];
            type = '[Hash, T][]';
          } else if (methodName === 'queryStorageAt') {
            generic = 'T = Codec[]';
            args = [`keys: Vec<StorageKey> | (${StorageKeyTye})[], at?: Hash | Uint8Array | string`];
            type = 'T';
          } else if (methodName === 'subscribeStorage') {
            generic = 'T = Codec[]';
            args = [`keys?: Vec<StorageKey> | (${StorageKeyTye})[]`];
            type = 'T';
          }
        }

        if (args === undefined) {
          (0, _index.setImports)(allDefs, imports, [def.type]);
          args = def.params.map(param => {
            const similarTypes = (0, _index.getSimilarTypes)(registry, definitions, param.type, imports);
            (0, _index.setImports)(allDefs, imports, [param.type, ...similarTypes]);
            return `${param.name}${param.isOptional ? '?' : ''}: ${similarTypes.join(' | ')}`;
          });
          type = (0, _index.formatType)(registry, allDefs, def.type, imports);
          generic = '';
        }

        const item = {
          args: args.join(', '),
          docs: [def.description],
          generic,
          name: methodName,
          type
        };

        if (def.aliasSection) {
          if (!additional[def.aliasSection]) {
            additional[def.aliasSection] = {
              items: [],
              name: def.aliasSection
            };
          }

          additional[def.aliasSection].items.push(item);
          return null;
        }

        return item;
      }).filter(item => !!item);
      return {
        items: allMethods,
        name: section || 'unknown'
      };
    }).concat(...Object.values(additional)).sort((a, b) => a.name.localeCompare(b.name));
    imports.typesTypes.Observable = true;
    return generateRpcTypesTemplate({
      headerType: 'chain',
      imports,
      modules,
      types: [...Object.keys(imports.localTypes).sort().map(packagePath => ({
        file: packagePath.replace('@axia-js/types/augment', '@axia-js/types'),
        types: Object.keys(imports.localTypes[packagePath])
      }))]
    });
  });
}

function generateDefaultRpc() {
  let dest = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'packages/api/src/augment/rpc.ts';
  let extraTypes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const {
    registry
  } = (0, _index.initMeta)(undefined, extraTypes);
  generateRpcTypes(registry, defaultDefinitions, dest, extraTypes);
}