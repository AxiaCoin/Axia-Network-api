"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MetaRegistry = void 0;
exports.getRegistryOffset = getRegistryOffset;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseKey"));

var _types = require("@axia-js/types");

var _util = require("@axia-js/util");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// convert the offset into project-specific, index-1
function getRegistryOffset(id, typeOffset) {
  return id.toNumber() - typeOffset;
}

const PRIMITIVE_ALIAS = {
  Char: 'u32',
  // Rust char is 4-bytes
  Str: 'Text'
};
const PRIMITIVE_ALWAYS = ['AccountId', 'AccountIndex', 'Address', 'Balance']; // TODO Replace usages with PortableRegistry

var _siTypes = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("siTypes");

var _getMetaType = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("getMetaType");

var _extract = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extract");

var _extractArray = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractArray");

var _extractFields = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractFields");

var _extractPrimitive = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractPrimitive");

var _extractPrimitivePath = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractPrimitivePath");

var _extractSequence = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractSequence");

var _extractTuple = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractTuple");

var _extractVariant = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractVariant");

var _extractVariantSub = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractVariantSub");

class MetaRegistry extends _types.TypeRegistry {
  constructor(metadataVersion, chainProperties) {
    super();
    this.metaTypeDefs = [];
    this.typeOffset = void 0;
    Object.defineProperty(this, _siTypes, {
      writable: true,
      value: []
    });
    Object.defineProperty(this, _getMetaType, {
      writable: true,
      value: id => {
        const type = (0, _classPrivateFieldLooseBase2.default)(this, _siTypes)[_siTypes][getRegistryOffset(id, this.typeOffset)];

        (0, _util.assert)(!(0, _util.isUndefined)(type), () => `getMetaType:: Unable to find ${id.toNumber()} in type values`);
        return this.createType('Si0Type', type);
      }
    });
    Object.defineProperty(this, _extract, {
      writable: true,
      value: (type, id) => {
        var _path$pop;

        const path = [...type.path];
        const isPrimitivePath = !!path.length && (path.length > 2 && path[0].eq('ink_env') && path[1].eq('types') || PRIMITIVE_ALWAYS.includes(path[path.length - 1].toString()));
        let typeDef;

        if (isPrimitivePath) {
          typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractPrimitivePath)[_extractPrimitivePath](type);
        } else if (type.def.isPrimitive) {
          typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractPrimitive)[_extractPrimitive](type);
        } else if (type.def.isComposite) {
          typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractFields)[_extractFields](type.def.asComposite.fields);
        } else if (type.def.isVariant) {
          typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractVariant)[_extractVariant](type.def.asVariant, id);
        } else if (type.def.isArray) {
          typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractArray)[_extractArray](type.def.asArray);
        } else if (type.def.isSequence) {
          typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractSequence)[_extractSequence](type.def.asSequence, id);
        } else if (type.def.isTuple) {
          typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractTuple)[_extractTuple](type.def.asTuple);
        } else {
          throw new Error(`Invalid ink! type at index ${id.toString()}`);
        }

        const displayName = (_path$pop = path.pop()) === null || _path$pop === void 0 ? void 0 : _path$pop.toString();
        return (0, _types.withTypeString)(this, _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, displayName ? {
          displayName
        } : {}), path.length > 1 ? {
          namespace: path.map(s => s.toString()).join('::')
        } : {}), type.params.length > 0 ? {
          sub: type.params.map(type => this.getMetaTypeDef({
            type
          }))
        } : {}), typeDef));
      }
    });
    Object.defineProperty(this, _extractArray, {
      writable: true,
      value: _ref => {
        let {
          len: length,
          type
        } = _ref;
        (0, _util.assert)(!length || length.toNumber() <= 256, 'MetaRegistry: Only support for [Type; <length>], where length <= 256');
        return {
          info: _types.TypeDefInfo.VecFixed,
          length: length.toNumber(),
          sub: this.getMetaTypeDef({
            type
          })
        };
      }
    });
    Object.defineProperty(this, _extractFields, {
      writable: true,
      value: fields => {
        const [isStruct, isTuple] = fields.reduce((_ref2, _ref3) => {
          let [isAllNamed, isAllUnnamed] = _ref2;
          let {
            name
          } = _ref3;
          return [isAllNamed && name.isSome, isAllUnnamed && name.isNone];
        }, [true, true]);
        (0, _util.assert)(isTuple || isStruct, 'Invalid fields type detected, expected either Tuple or Struct');
        const sub = fields.map(_ref4 => {
          let {
            name,
            type
          } = _ref4;
          return _objectSpread(_objectSpread({}, this.getMetaTypeDef({
            type
          })), name.isSome ? {
            name: name.unwrap().toString()
          } : {});
        });
        return isTuple && sub.length === 1 ? sub[0] : {
          // check for tuple first (no fields may be available)
          info: isTuple ? _types.TypeDefInfo.Tuple : _types.TypeDefInfo.Struct,
          sub
        };
      }
    });
    Object.defineProperty(this, _extractPrimitive, {
      writable: true,
      value: type => {
        const typeStr = type.def.asPrimitive.type.toString();
        return {
          info: _types.TypeDefInfo.Plain,
          type: PRIMITIVE_ALIAS[typeStr] || typeStr.toLowerCase()
        };
      }
    });
    Object.defineProperty(this, _extractPrimitivePath, {
      writable: true,
      value: type => {
        return {
          info: _types.TypeDefInfo.Plain,
          type: type.path[type.path.length - 1].toString()
        };
      }
    });
    Object.defineProperty(this, _extractSequence, {
      writable: true,
      value: (_ref5, id) => {
        let {
          type
        } = _ref5;
        (0, _util.assert)(!!type, () => `ContractRegistry: Invalid sequence type found at id ${id.toString()}`);
        return {
          info: _types.TypeDefInfo.Vec,
          sub: this.getMetaTypeDef({
            type
          })
        };
      }
    });
    Object.defineProperty(this, _extractTuple, {
      writable: true,
      value: ids => {
        return ids.length === 1 ? this.getMetaTypeDef({
          type: ids[0]
        }) : {
          info: _types.TypeDefInfo.Tuple,
          sub: ids.map(type => this.getMetaTypeDef({
            type
          }))
        };
      }
    });
    Object.defineProperty(this, _extractVariant, {
      writable: true,
      value: (_ref6, id) => {
        let {
          variants
        } = _ref6;

        const {
          params,
          path
        } = (0, _classPrivateFieldLooseBase2.default)(this, _getMetaType)[_getMetaType](id);

        const specialVariant = path[0].toString();
        return specialVariant === 'Option' ? {
          info: _types.TypeDefInfo.Option,
          sub: this.getMetaTypeDef({
            type: params[0]
          })
        } : specialVariant === 'Result' ? {
          info: _types.TypeDefInfo.Result,
          sub: params.map((type, index) => _objectSpread({
            name: ['Ok', 'Error'][index]
          }, this.getMetaTypeDef({
            type
          })))
        } : {
          info: _types.TypeDefInfo.Enum,
          sub: (0, _classPrivateFieldLooseBase2.default)(this, _extractVariantSub)[_extractVariantSub](variants)
        };
      }
    });
    Object.defineProperty(this, _extractVariantSub, {
      writable: true,
      value: variants => {
        return variants.every(_ref7 => {
          let {
            fields
          } = _ref7;
          return fields.length === 0;
        }) ? variants.map(_ref8 => {
          let {
            discriminant,
            name
          } = _ref8;
          return _objectSpread(_objectSpread({}, discriminant.isSome ? {
            ext: {
              discriminant: discriminant.unwrap().toNumber()
            }
          } : {}), {}, {
            info: _types.TypeDefInfo.Plain,
            name: name.toString(),
            type: 'Null'
          });
        }) : variants.map(_ref9 => {
          let {
            fields,
            name
          } = _ref9;
          return (0, _types.withTypeString)(this, _objectSpread(_objectSpread({}, (0, _classPrivateFieldLooseBase2.default)(this, _extractFields)[_extractFields](fields)), {}, {
            name: name.toString()
          }));
        });
      }
    });
    const [major, minor] = metadataVersion.split('.').map(n => parseInt(n, 10)); // type indexes are 1-based pre 0.7 and 0-based post

    this.typeOffset = major === 0 && minor < 7 ? 1 : 0;

    if (chainProperties) {
      this.setChainProperties(chainProperties);
    }
  }

  setMetaTypes(metaTypes) {
    (0, _classPrivateFieldLooseBase2.default)(this, _siTypes)[_siTypes] = metaTypes;
  }

  getMetaTypeDef(typeSpec) {
    const offset = getRegistryOffset(typeSpec.type, this.typeOffset);
    let typeDef = this.metaTypeDefs[offset];

    if (!typeDef) {
      typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extract)[_extract]((0, _classPrivateFieldLooseBase2.default)(this, _getMetaType)[_getMetaType](typeSpec.type), typeSpec.type);
      this.metaTypeDefs[offset] = typeDef;
    }

    if (typeSpec.displayName && typeSpec.displayName.length) {
      const displayName = typeSpec.displayName[typeSpec.displayName.length - 1].toString();

      if (!typeDef.type.startsWith(displayName)) {
        typeDef = _objectSpread(_objectSpread({}, typeDef), {}, {
          displayName,
          type: PRIMITIVE_ALWAYS.includes(displayName) ? displayName : typeDef.type
        });
      }
    } // Here we protect against the following cases
    //   - No displayName present, these are generally known primitives
    //   - displayName === type, these generate circular references
    //   - displayName Option & type Option<...something...>


    if (typeDef.displayName && !this.hasType(typeDef.displayName) && !(typeDef.type === typeDef.displayName || typeDef.type.startsWith(`${typeDef.displayName}<`))) {
      this.register({
        [typeDef.displayName]: typeDef.type
      });
    }

    return typeDef;
  }

}

exports.MetaRegistry = MetaRegistry;