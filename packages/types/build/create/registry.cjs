"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeRegistry = void 0;

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseKey"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _util = require("@axia-js/util");

var _utilCrypto = require("@axia-js/util-crypto");

var _DoNotConstruct = require("../codec/DoNotConstruct.cjs");

var _Json = require("../codec/Json.cjs");

var _Raw = require("../codec/Raw.cjs");

var _index = require("../extrinsic/signedExtensions/index.cjs");

var _Event = require("../generic/Event.cjs");

var baseTypes = _interopRequireWildcard(require("../index.types.cjs"));

var definitions = _interopRequireWildcard(require("../interfaces/definitions.cjs"));

var _index2 = require("../metadata/decorate/index.cjs");

var _Metadata = require("../metadata/Metadata.cjs");

var _createClass = require("./createClass.cjs");

var _createType = require("./createType.cjs");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const l = (0, _util.logger)('registry'); // create error mapping from metadata

function injectErrors(_, metadata, metadataErrors) {
  const {
    lookup,
    pallets
  } = metadata.asLatest; // decorate the errors

  pallets.forEach((_ref, _sectionIndex) => {
    let {
      errors,
      index,
      name
    } = _ref;

    if (errors.isNone) {
      return;
    }

    const sectionIndex = metadata.version >= 12 ? index.toNumber() : _sectionIndex;
    const sectionName = (0, _util.stringCamelCase)(name);
    lookup.getSiType(errors.unwrap().type).def.asVariant.variants.forEach(_ref2 => {
      let {
        docs,
        fields,
        index,
        name
      } = _ref2;
      const variantIndex = index.toNumber();
      const eventIndex = new Uint8Array([sectionIndex, variantIndex]);
      metadataErrors[(0, _util.u8aToHex)(eventIndex)] = {
        args: fields.map(_ref3 => {
          let {
            type
          } = _ref3;
          return lookup.getTypeDef(type).type;
        }),
        docs: docs.map(d => d.toString()),
        fields,
        index: variantIndex,
        method: name.toString(),
        name: name.toString(),
        section: sectionName
      };
    });
  });
} // create event classes from metadata


function injectEvents(registry, metadata, metadataEvents) {
  const {
    lookup,
    pallets
  } = metadata.asLatest; // decorate the events

  pallets.filter(_ref4 => {
    let {
      events
    } = _ref4;
    return events.isSome;
  }).forEach((_ref5, _sectionIndex) => {
    let {
      events,
      index,
      name
    } = _ref5;
    const sectionIndex = metadata.version >= 12 ? index.toNumber() : _sectionIndex;
    const sectionName = (0, _util.stringCamelCase)(name);
    lookup.getSiType(events.unwrap().type).def.asVariant.variants.forEach(variant => {
      const variantIndex = variant.index.toNumber();
      const eventIndex = new Uint8Array([sectionIndex, variantIndex]);
      const meta = registry.createType('EventMetadataLatest', _objectSpread(_objectSpread({}, variant), {}, {
        args: variant.fields.map(_ref6 => {
          let {
            type
          } = _ref6;
          return lookup.getTypeDef(type).type;
        })
      }));
      metadataEvents[(0, _util.u8aToHex)(eventIndex)] = class extends _Event.GenericEventData {
        constructor(registry, value) {
          super(registry, value, meta, sectionName, variant.name.toString());
        }

      };
    });
  });
} // create extrinsic mapping from metadata


function injectExtrinsics(registry, metadata, metadataCalls) {
  const extrinsics = (0, _index2.decorateExtrinsics)(registry, metadata.asLatest, metadata.version); // decorate the extrinsics

  Object.values(extrinsics).forEach(methods => Object.values(methods).forEach(method => {
    metadataCalls[(0, _util.u8aToHex)(method.callIndex)] = method;
  }));
} // extract additional properties from the metadata


function extractProperties(registry, metadata) {
  var _constants$system;

  const original = registry.getChainProperties();
  const constants = (0, _index2.decorateConstants)(registry, metadata.asLatest, metadata.version);
  const ss58Format = (_constants$system = constants.system) === null || _constants$system === void 0 ? void 0 : _constants$system.ss58Prefix;

  if (!ss58Format) {
    return original;
  }

  const {
    tokenDecimals,
    tokenSymbol
  } = original || {};
  return registry.createType('ChainProperties', {
    ss58Format,
    tokenDecimals,
    tokenSymbol
  });
}

var _classes = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("classes");

var _definitions = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("definitions");

var _metadata = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("metadata");

var _metadataCalls = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("metadataCalls");

var _metadataErrors = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("metadataErrors");

var _metadataEvents = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("metadataEvents");

var _unknownTypes = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("unknownTypes");

var _chainProperties = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("chainProperties");

var _hasher = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("hasher");

var _knownDefaults = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("knownDefaults");

var _knownDefinitions = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("knownDefinitions");

var _knownTypes = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("knownTypes");

var _signedExtensions = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("signedExtensions");

var _userExtensions = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("userExtensions");

class TypeRegistry {
  constructor(createdAtHash) {
    Object.defineProperty(this, _classes, {
      writable: true,
      value: new Map()
    });
    Object.defineProperty(this, _definitions, {
      writable: true,
      value: new Map()
    });
    Object.defineProperty(this, _metadata, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _metadataCalls, {
      writable: true,
      value: {}
    });
    Object.defineProperty(this, _metadataErrors, {
      writable: true,
      value: {}
    });
    Object.defineProperty(this, _metadataEvents, {
      writable: true,
      value: {}
    });
    Object.defineProperty(this, _unknownTypes, {
      writable: true,
      value: new Map()
    });
    Object.defineProperty(this, _chainProperties, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _hasher, {
      writable: true,
      value: _utilCrypto.blake2AsU8a
    });
    Object.defineProperty(this, _knownDefaults, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _knownDefinitions, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _knownTypes, {
      writable: true,
      value: {}
    });
    Object.defineProperty(this, _signedExtensions, {
      writable: true,
      value: _index.fallbackExtensions
    });
    Object.defineProperty(this, _userExtensions, {
      writable: true,
      value: void 0
    });
    this.createdAtHash = void 0;
    (0, _classPrivateFieldLooseBase2.default)(this, _knownDefaults)[_knownDefaults] = _objectSpread({
      Json: _Json.Json,
      Metadata: _Metadata.Metadata,
      Raw: _Raw.Raw
    }, baseTypes);
    (0, _classPrivateFieldLooseBase2.default)(this, _knownDefinitions)[_knownDefinitions] = definitions;
    this.init();

    if (createdAtHash) {
      this.createdAtHash = this.createType('Hash', createdAtHash);
    }
  }

  init() {
    // start clean
    (0, _classPrivateFieldLooseBase2.default)(this, _classes)[_classes] = new Map();
    (0, _classPrivateFieldLooseBase2.default)(this, _definitions)[_definitions] = new Map();
    (0, _classPrivateFieldLooseBase2.default)(this, _unknownTypes)[_unknownTypes] = new Map();
    (0, _classPrivateFieldLooseBase2.default)(this, _knownTypes)[_knownTypes] = {}; // register know, first classes then on-demand-created definitions

    this.register((0, _classPrivateFieldLooseBase2.default)(this, _knownDefaults)[_knownDefaults]);
    Object.values((0, _classPrivateFieldLooseBase2.default)(this, _knownDefinitions)[_knownDefinitions]).forEach(_ref7 => {
      let {
        types
      } = _ref7;
      return this.register(types);
    });
    return this;
  }

  get chainDecimals() {
    var _classPrivateFieldLoo;

    if ((_classPrivateFieldLoo = (0, _classPrivateFieldLooseBase2.default)(this, _chainProperties)[_chainProperties]) !== null && _classPrivateFieldLoo !== void 0 && _classPrivateFieldLoo.tokenDecimals.isSome) {
      const allDecimals = (0, _classPrivateFieldLooseBase2.default)(this, _chainProperties)[_chainProperties].tokenDecimals.unwrap();

      if (allDecimals.length) {
        return allDecimals.map(b => b.toNumber());
      }
    }

    return [12];
  }

  get chainSS58() {
    var _classPrivateFieldLoo2;

    return (_classPrivateFieldLoo2 = (0, _classPrivateFieldLooseBase2.default)(this, _chainProperties)[_chainProperties]) !== null && _classPrivateFieldLoo2 !== void 0 && _classPrivateFieldLoo2.ss58Format.isSome ? (0, _classPrivateFieldLooseBase2.default)(this, _chainProperties)[_chainProperties].ss58Format.unwrap().toNumber() : undefined;
  }

  get chainTokens() {
    var _classPrivateFieldLoo3;

    if ((_classPrivateFieldLoo3 = (0, _classPrivateFieldLooseBase2.default)(this, _chainProperties)[_chainProperties]) !== null && _classPrivateFieldLoo3 !== void 0 && _classPrivateFieldLoo3.tokenSymbol.isSome) {
      const allTokens = (0, _classPrivateFieldLooseBase2.default)(this, _chainProperties)[_chainProperties].tokenSymbol.unwrap();

      if (allTokens.length) {
        return allTokens.map(s => s.toString());
      }
    }

    return [_util.formatBalance.getDefaults().unit];
  }
  /**
   * @description Returns tru if the type is in a Compat format
   */


  isLookupType(value) {
    return /Lookup\d+$/.test(value);
  }
  /**
   * @description Creates a lookup string from the supplied id
   */


  createLookupType(lookupId) {
    return `Lookup${lookupId.toString()}`;
  }

  get knownTypes() {
    return (0, _classPrivateFieldLooseBase2.default)(this, _knownTypes)[_knownTypes];
  }

  get lookup() {
    return this.metadata.lookup;
  }

  get metadata() {
    (0, _util.assert)((0, _classPrivateFieldLooseBase2.default)(this, _metadata)[_metadata], 'Metadata has not been set on this registry');
    return (0, _classPrivateFieldLooseBase2.default)(this, _metadata)[_metadata];
  }

  get unknownTypes() {
    return [...(0, _classPrivateFieldLooseBase2.default)(this, _unknownTypes)[_unknownTypes].keys()];
  }

  get signedExtensions() {
    return (0, _classPrivateFieldLooseBase2.default)(this, _signedExtensions)[_signedExtensions];
  }
  /**
   * @describe Creates an instance of the class
   */


  createClass(type) {
    return (0, _createClass.createClass)(this, type);
  }
  /**
   * @description Creates an instance of a type as registered
   */


  createType(type) {
    for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }

    return this.createTypeUnsafe(type, params);
  }
  /**
   * @description Creates an instance of a type as registered
   */


  createTypeUnsafe(type, params, options) {
    return (0, _createType.createTypeUnsafe)(this, type, params, options);
  } // find a specific call


  findMetaCall(callIndex) {
    const hexIndex = (0, _util.u8aToHex)(callIndex);
    return (0, _util.assertReturn)((0, _classPrivateFieldLooseBase2.default)(this, _metadataCalls)[_metadataCalls][hexIndex], `findMetaCall: Unable to find Call with index ${hexIndex}/[${callIndex.toString()}]`);
  } // finds an error


  findMetaError(errorIndex) {
    const hexIndex = (0, _util.u8aToHex)((0, _util.isU8a)(errorIndex) ? errorIndex : new Uint8Array([errorIndex.index.toNumber(), errorIndex.error.toNumber()]));
    return (0, _util.assertReturn)((0, _classPrivateFieldLooseBase2.default)(this, _metadataErrors)[_metadataErrors][hexIndex], `findMetaError: Unable to find Error with index ${hexIndex}/[${errorIndex.toString()}]`);
  }

  findMetaEvent(eventIndex) {
    const hexIndex = (0, _util.u8aToHex)(eventIndex);
    return (0, _util.assertReturn)((0, _classPrivateFieldLooseBase2.default)(this, _metadataEvents)[_metadataEvents][hexIndex], `findMetaEvent: Unable to find Event with index ${hexIndex}/[${eventIndex.toString()}]`);
  }

  get(name, withUnknown) {
    let Type = (0, _classPrivateFieldLooseBase2.default)(this, _classes)[_classes].get(name); // we have not already created the type, attempt it


    if (!Type) {
      const definition = (0, _classPrivateFieldLooseBase2.default)(this, _definitions)[_definitions].get(name);

      let BaseType; // we have a definition, so create the class now (lazily)

      if (definition) {
        BaseType = (0, _createClass.createClass)(this, definition);

        (0, _classPrivateFieldLooseBase2.default)(this, _classes)[_classes].set(name, BaseType);
      } else if (withUnknown) {
        l.warn(`Unable to resolve type ${name}, it will fail on construction`);

        (0, _classPrivateFieldLooseBase2.default)(this, _unknownTypes)[_unknownTypes].set(name, true);

        BaseType = _DoNotConstruct.DoNotConstruct.with(name);
      }

      if (BaseType) {
        // NOTE If we didn't extend here, we would have strange artifacts. An example is
        // Balance, with this, new Balance() instanceof u128 is true, but Balance !== u128
        // Additionally, we now pass through the registry, which is a link to ourselves
        Type = class extends BaseType {};

        (0, _classPrivateFieldLooseBase2.default)(this, _classes)[_classes].set(name, Type);
      }
    }

    return Type;
  }

  getChainProperties() {
    return (0, _classPrivateFieldLooseBase2.default)(this, _chainProperties)[_chainProperties];
  }

  getClassName(Type) {
    const entry = [...(0, _classPrivateFieldLooseBase2.default)(this, _classes)[_classes].entries()].find(_ref8 => {
      let [, Clazz] = _ref8;
      return Type === Clazz;
    });
    return entry ? entry[0] : undefined;
  }

  getDefinition(typeName) {
    return (0, _classPrivateFieldLooseBase2.default)(this, _definitions)[_definitions].get(typeName);
  }

  getModuleInstances(specName, moduleName) {
    var _classPrivateFieldLoo4, _classPrivateFieldLoo5, _classPrivateFieldLoo6, _classPrivateFieldLoo7, _classPrivateFieldLoo8;

    return (_classPrivateFieldLoo4 = (0, _classPrivateFieldLooseBase2.default)(this, _knownTypes)[_knownTypes]) === null || _classPrivateFieldLoo4 === void 0 ? void 0 : (_classPrivateFieldLoo5 = _classPrivateFieldLoo4.typesBundle) === null || _classPrivateFieldLoo5 === void 0 ? void 0 : (_classPrivateFieldLoo6 = _classPrivateFieldLoo5.spec) === null || _classPrivateFieldLoo6 === void 0 ? void 0 : (_classPrivateFieldLoo7 = _classPrivateFieldLoo6[specName]) === null || _classPrivateFieldLoo7 === void 0 ? void 0 : (_classPrivateFieldLoo8 = _classPrivateFieldLoo7.instances) === null || _classPrivateFieldLoo8 === void 0 ? void 0 : _classPrivateFieldLoo8[moduleName];
  }

  getOrThrow(name, msg) {
    const Clazz = this.get(name);
    (0, _util.assert)(Clazz, msg || `type ${name} not found`);
    return Clazz;
  }

  getOrUnknown(name) {
    return this.get(name, true);
  }

  getSignedExtensionExtra() {
    return (0, _index.expandExtensionTypes)((0, _classPrivateFieldLooseBase2.default)(this, _signedExtensions)[_signedExtensions], 'payload', (0, _classPrivateFieldLooseBase2.default)(this, _userExtensions)[_userExtensions]);
  }

  getSignedExtensionTypes() {
    return (0, _index.expandExtensionTypes)((0, _classPrivateFieldLooseBase2.default)(this, _signedExtensions)[_signedExtensions], 'extrinsic', (0, _classPrivateFieldLooseBase2.default)(this, _userExtensions)[_userExtensions]);
  }

  hasClass(name) {
    return (0, _classPrivateFieldLooseBase2.default)(this, _classes)[_classes].has(name);
  }

  hasDef(name) {
    return (0, _classPrivateFieldLooseBase2.default)(this, _definitions)[_definitions].has(name);
  }

  hasType(name) {
    return !(0, _classPrivateFieldLooseBase2.default)(this, _unknownTypes)[_unknownTypes].get(name) && (this.hasClass(name) || this.hasDef(name));
  }

  hash(data) {
    return this.createType('CodecHash', (0, _classPrivateFieldLooseBase2.default)(this, _hasher)[_hasher](data));
  }

  // eslint-disable-next-line no-dupe-class-members
  register(arg1, arg2) {
    // NOTE Constructors appear as functions here
    if ((0, _util.isFunction)(arg1)) {
      (0, _classPrivateFieldLooseBase2.default)(this, _classes)[_classes].set(arg1.name, arg1);
    } else if ((0, _util.isString)(arg1)) {
      (0, _util.assert)((0, _util.isFunction)(arg2), () => `Expected class definition passed to '${arg1}' registration`);
      (0, _util.assert)(arg1 !== arg2.toString(), () => `Unable to register circular ${arg1} === ${arg1}`);

      (0, _classPrivateFieldLooseBase2.default)(this, _classes)[_classes].set(arg1, arg2);
    } else {
      this._registerObject(arg1);
    }
  }

  _registerObject(obj) {
    Object.entries(obj).forEach(_ref9 => {
      let [name, type] = _ref9;

      if ((0, _util.isFunction)(type)) {
        // This _looks_ a bit funny, but `typeof Clazz === 'function'
        (0, _classPrivateFieldLooseBase2.default)(this, _classes)[_classes].set(name, type);
      } else {
        const def = (0, _util.isString)(type) ? type : (0, _util.stringify)(type);
        (0, _util.assert)(name !== def, () => `Unable to register circular ${name} === ${def}`); // we already have this type, remove the classes registered for it

        if ((0, _classPrivateFieldLooseBase2.default)(this, _classes)[_classes].has(name)) {
          (0, _classPrivateFieldLooseBase2.default)(this, _classes)[_classes].delete(name);
        }

        (0, _classPrivateFieldLooseBase2.default)(this, _definitions)[_definitions].set(name, def);
      }
    });
  } // sets the chain properties


  setChainProperties(properties) {
    if (properties) {
      (0, _classPrivateFieldLooseBase2.default)(this, _chainProperties)[_chainProperties] = properties;
    }
  }

  setHasher(hasher) {
    (0, _classPrivateFieldLooseBase2.default)(this, _hasher)[_hasher] = hasher || _utilCrypto.blake2AsU8a;
  }

  setKnownTypes(knownTypes) {
    (0, _classPrivateFieldLooseBase2.default)(this, _knownTypes)[_knownTypes] = knownTypes;
  } // sets the metadata


  setMetadata(metadata, signedExtensions, userExtensions) {
    (0, _classPrivateFieldLooseBase2.default)(this, _metadata)[_metadata] = metadata.asLatest;
    injectExtrinsics(this, metadata, (0, _classPrivateFieldLooseBase2.default)(this, _metadataCalls)[_metadataCalls]);
    injectErrors(this, metadata, (0, _classPrivateFieldLooseBase2.default)(this, _metadataErrors)[_metadataErrors]);
    injectEvents(this, metadata, (0, _classPrivateFieldLooseBase2.default)(this, _metadataEvents)[_metadataEvents]); // setup the available extensions

    this.setSignedExtensions(signedExtensions || (metadata.asLatest.extrinsic.version.gt(_util.BN_ZERO) // FIXME Use the extension and their injected types
    ? metadata.asLatest.extrinsic.signedExtensions.map(_ref10 => {
      let {
        identifier
      } = _ref10;
      return identifier.toString();
    }) : _index.fallbackExtensions), userExtensions); // setup the chain properties with format overrides

    this.setChainProperties(extractProperties(this, metadata));
  } // sets the available signed extensions


  setSignedExtensions() {
    let signedExtensions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _index.fallbackExtensions;
    let userExtensions = arguments.length > 1 ? arguments[1] : undefined;
    (0, _classPrivateFieldLooseBase2.default)(this, _signedExtensions)[_signedExtensions] = signedExtensions;
    (0, _classPrivateFieldLooseBase2.default)(this, _userExtensions)[_userExtensions] = userExtensions;
    const unknown = (0, _index.findUnknownExtensions)((0, _classPrivateFieldLooseBase2.default)(this, _signedExtensions)[_signedExtensions], (0, _classPrivateFieldLooseBase2.default)(this, _userExtensions)[_userExtensions]);

    if (unknown.length) {
      l.warn(`Unknown signed extensions ${unknown.join(', ')} found, treating them as no-effect`);
    }
  }

}

exports.TypeRegistry = TypeRegistry;