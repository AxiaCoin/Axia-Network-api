"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateDefaultInterface = generateDefaultInterface;
exports.generateInterfaceTypes = generateInterfaceTypes;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _handlebars = _interopRequireDefault(require("handlebars"));

var _codec = require("@axia-js/types/codec");

var _create = require("@axia-js/types/create");

var defaultDefinitions = _interopRequireWildcard(require("@axia-js/types/interfaces/definitions"));

var defaultPrimitives = _interopRequireWildcard(require("@axia-js/types/primitive"));

var _index = require("../util/index.cjs");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const primitiveClasses = _objectSpread(_objectSpread({}, defaultPrimitives), {}, {
  Json: _codec.Json,
  Raw: _codec.Raw
});

const template = (0, _index.readTemplate)('interfaceRegistry');

const generateInterfaceTypesTemplate = _handlebars.default.compile(template);
/** @internal */


function generateInterfaceTypes(importDefinitions, dest) {
  const registry = new _create.TypeRegistry();
  (0, _index.writeFile)(dest, () => {
    Object.entries(importDefinitions).reduce((acc, def) => Object.assign(acc, def), {});
    const imports = (0, _index.createImports)(importDefinitions);
    const definitions = imports.definitions;
    const items = []; // first we create imports for our known classes from the API

    Object.keys(primitiveClasses).filter(name => !name.includes('Generic')).forEach(primitiveName => {
      (0, _index.setImports)(definitions, imports, [primitiveName]);
      items.push(primitiveName);
    });
    const existingTypes = {}; // ensure we have everything registered since we will get the definition
    // form the available types (so any unknown should show after this)

    Object.values(definitions).forEach(_ref => {
      let {
        types
      } = _ref;
      registry.register(types);
    }); // create imports for everything that we have available

    Object.values(definitions).forEach(_ref2 => {
      let {
        types
      } = _ref2;
      (0, _index.setImports)(definitions, imports, Object.keys(types));
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


function generateDefaultInterface() {
  generateInterfaceTypes({
    '@axia-js/types/interfaces': defaultDefinitions
  }, 'packages/types/src/augment/registry.ts');
}