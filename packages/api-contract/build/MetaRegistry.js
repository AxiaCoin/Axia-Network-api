import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _classPrivateFieldLooseBase from "@babel/runtime/helpers/esm/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/esm/classPrivateFieldLooseKey";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { TypeDefInfo, TypeRegistry, withTypeString } from '@axia-js/types';
import { assert, isUndefined } from '@axia-js/util';
// convert the offset into project-specific, index-1
export function getRegistryOffset(id, typeOffset) {
  return id.toNumber() - typeOffset;
}
const PRIMITIVE_ALIAS = {
  Char: 'u32',
  // Rust char is 4-bytes
  Str: 'Text'
};
const PRIMITIVE_ALWAYS = ['AccountId', 'AccountIndex', 'Address', 'Balance']; // TODO Replace usages with PortableRegistry

var _siTypes = /*#__PURE__*/_classPrivateFieldLooseKey("siTypes");

var _getMetaType = /*#__PURE__*/_classPrivateFieldLooseKey("getMetaType");

var _extract = /*#__PURE__*/_classPrivateFieldLooseKey("extract");

var _extractArray = /*#__PURE__*/_classPrivateFieldLooseKey("extractArray");

var _extractFields = /*#__PURE__*/_classPrivateFieldLooseKey("extractFields");

var _extractPrimitive = /*#__PURE__*/_classPrivateFieldLooseKey("extractPrimitive");

var _extractPrimitivePath = /*#__PURE__*/_classPrivateFieldLooseKey("extractPrimitivePath");

var _extractSequence = /*#__PURE__*/_classPrivateFieldLooseKey("extractSequence");

var _extractTuple = /*#__PURE__*/_classPrivateFieldLooseKey("extractTuple");

var _extractVariant = /*#__PURE__*/_classPrivateFieldLooseKey("extractVariant");

var _extractVariantSub = /*#__PURE__*/_classPrivateFieldLooseKey("extractVariantSub");

export class MetaRegistry extends TypeRegistry {
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
        const type = _classPrivateFieldLooseBase(this, _siTypes)[_siTypes][getRegistryOffset(id, this.typeOffset)];

        assert(!isUndefined(type), () => `getMetaType:: Unable to find ${id.toNumber()} in type values`);
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
          typeDef = _classPrivateFieldLooseBase(this, _extractPrimitivePath)[_extractPrimitivePath](type);
        } else if (type.def.isPrimitive) {
          typeDef = _classPrivateFieldLooseBase(this, _extractPrimitive)[_extractPrimitive](type);
        } else if (type.def.isComposite) {
          typeDef = _classPrivateFieldLooseBase(this, _extractFields)[_extractFields](type.def.asComposite.fields);
        } else if (type.def.isVariant) {
          typeDef = _classPrivateFieldLooseBase(this, _extractVariant)[_extractVariant](type.def.asVariant, id);
        } else if (type.def.isArray) {
          typeDef = _classPrivateFieldLooseBase(this, _extractArray)[_extractArray](type.def.asArray);
        } else if (type.def.isSequence) {
          typeDef = _classPrivateFieldLooseBase(this, _extractSequence)[_extractSequence](type.def.asSequence, id);
        } else if (type.def.isTuple) {
          typeDef = _classPrivateFieldLooseBase(this, _extractTuple)[_extractTuple](type.def.asTuple);
        } else {
          throw new Error(`Invalid ink! type at index ${id.toString()}`);
        }

        const displayName = (_path$pop = path.pop()) === null || _path$pop === void 0 ? void 0 : _path$pop.toString();
        return withTypeString(this, _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, displayName ? {
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
      value: ({
        len: length,
        type
      }) => {
        assert(!length || length.toNumber() <= 256, 'MetaRegistry: Only support for [Type; <length>], where length <= 256');
        return {
          info: TypeDefInfo.VecFixed,
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
        const [isStruct, isTuple] = fields.reduce(([isAllNamed, isAllUnnamed], {
          name
        }) => [isAllNamed && name.isSome, isAllUnnamed && name.isNone], [true, true]);
        assert(isTuple || isStruct, 'Invalid fields type detected, expected either Tuple or Struct');
        const sub = fields.map(({
          name,
          type
        }) => _objectSpread(_objectSpread({}, this.getMetaTypeDef({
          type
        })), name.isSome ? {
          name: name.unwrap().toString()
        } : {}));
        return isTuple && sub.length === 1 ? sub[0] : {
          // check for tuple first (no fields may be available)
          info: isTuple ? TypeDefInfo.Tuple : TypeDefInfo.Struct,
          sub
        };
      }
    });
    Object.defineProperty(this, _extractPrimitive, {
      writable: true,
      value: type => {
        const typeStr = type.def.asPrimitive.type.toString();
        return {
          info: TypeDefInfo.Plain,
          type: PRIMITIVE_ALIAS[typeStr] || typeStr.toLowerCase()
        };
      }
    });
    Object.defineProperty(this, _extractPrimitivePath, {
      writable: true,
      value: type => {
        return {
          info: TypeDefInfo.Plain,
          type: type.path[type.path.length - 1].toString()
        };
      }
    });
    Object.defineProperty(this, _extractSequence, {
      writable: true,
      value: ({
        type
      }, id) => {
        assert(!!type, () => `ContractRegistry: Invalid sequence type found at id ${id.toString()}`);
        return {
          info: TypeDefInfo.Vec,
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
          info: TypeDefInfo.Tuple,
          sub: ids.map(type => this.getMetaTypeDef({
            type
          }))
        };
      }
    });
    Object.defineProperty(this, _extractVariant, {
      writable: true,
      value: ({
        variants
      }, id) => {
        const {
          params,
          path
        } = _classPrivateFieldLooseBase(this, _getMetaType)[_getMetaType](id);

        const specialVariant = path[0].toString();
        return specialVariant === 'Option' ? {
          info: TypeDefInfo.Option,
          sub: this.getMetaTypeDef({
            type: params[0]
          })
        } : specialVariant === 'Result' ? {
          info: TypeDefInfo.Result,
          sub: params.map((type, index) => _objectSpread({
            name: ['Ok', 'Error'][index]
          }, this.getMetaTypeDef({
            type
          })))
        } : {
          info: TypeDefInfo.Enum,
          sub: _classPrivateFieldLooseBase(this, _extractVariantSub)[_extractVariantSub](variants)
        };
      }
    });
    Object.defineProperty(this, _extractVariantSub, {
      writable: true,
      value: variants => {
        return variants.every(({
          fields
        }) => fields.length === 0) ? variants.map(({
          discriminant,
          name
        }) => _objectSpread(_objectSpread({}, discriminant.isSome ? {
          ext: {
            discriminant: discriminant.unwrap().toNumber()
          }
        } : {}), {}, {
          info: TypeDefInfo.Plain,
          name: name.toString(),
          type: 'Null'
        })) : variants.map(({
          fields,
          name
        }) => withTypeString(this, _objectSpread(_objectSpread({}, _classPrivateFieldLooseBase(this, _extractFields)[_extractFields](fields)), {}, {
          name: name.toString()
        })));
      }
    });
    const [major, minor] = metadataVersion.split('.').map(n => parseInt(n, 10)); // type indexes are 1-based pre 0.7 and 0-based post

    this.typeOffset = major === 0 && minor < 7 ? 1 : 0;

    if (chainProperties) {
      this.setChainProperties(chainProperties);
    }
  }

  setMetaTypes(metaTypes) {
    _classPrivateFieldLooseBase(this, _siTypes)[_siTypes] = metaTypes;
  }

  getMetaTypeDef(typeSpec) {
    const offset = getRegistryOffset(typeSpec.type, this.typeOffset);
    let typeDef = this.metaTypeDefs[offset];

    if (!typeDef) {
      typeDef = _classPrivateFieldLooseBase(this, _extract)[_extract](_classPrivateFieldLooseBase(this, _getMetaType)[_getMetaType](typeSpec.type), typeSpec.type);
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