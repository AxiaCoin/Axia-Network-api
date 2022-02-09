"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PortableRegistry = void 0;

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldLooseKey"));

var _util = require("@axia-js/util");

var _Struct = require("../../codec/Struct.cjs");

var _encodeTypes = require("../../create/encodeTypes.cjs");

var _getTypeDef = require("../../create/getTypeDef.cjs");

var _sanitize = require("../../create/sanitize.cjs");

var _index = require("../../types/index.cjs");

// Copyright 2017-2021 @axia/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
// Just a placeholder for a type.unrwapOr()
const TYPE_UNWRAP = {
  toNumber: () => -1
}; // Alias the primitive enum with out known values

const PRIMITIVE_ALIAS = {
  Char: 'u32',
  // Rust char is 4-bytes
  Str: 'Text'
}; // These are types where we have a specific decoding/encoding override + helpers

const PATHS_ALIAS = splitNamespace([// match {node, axia, ...}_runtime
'*_runtime::Call', '*_runtime::Event', // these have a specific encoding or logic (for pallets)
'pallet_democracy::vote::Vote', 'pallet_identity::types::Data', // these are well-known types with additional encoding
'sp_core::crypto::AccountId32', 'sp_runtime::generic::era::Era', 'sp_runtime::multiaddress::MultiAddress', // ethereum overrides (Frontier, Moonbeam, AXIA claims)
'account::AccountId20', 'axia_runtime_common::claims::EthereumAddress', // shorten some well-known types
'primitive_types::*', 'sp_arithmetic::per_things::*', // ink!
'ink_env::types::*']); // Mappings for types that should be converted to set via BitVec

const PATHS_SET = splitNamespace(['pallet_identity::types::BitFlags']); // These we never use these as top-level names, they are wrappers

const WRAPPERS = ['BoundedBTreeMap', 'BoundedVec', 'Box', 'BTreeMap', 'Cow', 'Result', 'Option', 'WeakBoundedVec', 'WrapperOpaque']; // These are reserved and/or conflicts with built-in Codec or JS definitions

const RESERVED = ['entries', 'hash', 'keys', 'new', 'size'];

function splitNamespace(values) {
  return values.map(v => v.split('::'));
}

function createNamespace(_ref) {
  let {
    path
  } = _ref;
  return sanitizeDocs(path).join('::');
}

function sanitizeDocs(docs) {
  return docs.map(d => d.toString());
}

function matchParts(first, second) {
  return first.length === second.length && first.every((a, index) => {
    const b = second[index].toString();

    if (a === '*' || a === b) {
      return true;
    }

    if (a.includes('*') && a.includes('_') && b.includes('_')) {
      const suba = a.split('_');
      const subb = b.split('_');

      if (suba[0] === '*') {
        // the first parts where the length is greater is always a match
        while (suba.length < subb.length) {
          subb.shift();
        }
      }

      return matchParts(suba, subb);
    }

    return false;
  });
} // check if the path matches the PATHS_ALIAS (with wildcards)


function getAliasPath(path) {
  // TODO We need to handle ink! Balance in some way
  return path.length && PATHS_ALIAS.some(p => matchParts(p, path)) ? path[path.length - 1].toString() : null;
}

function removeDuplicateNames(lookup, names) {
  const rewrite = {};
  return names.map(_ref2 => {
    let [lookupIndex, name, params] = _ref2;

    if (!name) {
      return [lookupIndex, null, params];
    } // those where the name is matching


    const allSame = names.filter(_ref3 => {
      let [, oName] = _ref3;
      return name === oName;
    }); // are there among matching names

    const anyDiff = allSame.some(_ref4 => {
      let [oIndex,, oParams] = _ref4;
      return lookupIndex !== oIndex && (params.length !== oParams.length || params.some((p, index) => !p.name.eq(oParams[index].name) || p.type.unwrapOr(TYPE_UNWRAP).toNumber() !== oParams[index].type.unwrapOr(TYPE_UNWRAP).toNumber()));
    }); // everything matches, we can combine these

    if (!anyDiff || !allSame[0][2].length) {
      return [lookupIndex, name, params];
    } // find the first parameter that yields differences


    const paramIdx = allSame[0][2].findIndex((_ref5, index) => {
      let {
        type
      } = _ref5;
      return allSame.every(_ref6 => {
        let [,, params] = _ref6;
        return params[index].type.isSome;
      }) && allSame.every((_ref7, aIndex) => {
        let [,, params] = _ref7;
        return aIndex === 0 || !params[index].type.eq(type);
      });
    }); // No param found that is different

    if (paramIdx === -1) {
      return [lookupIndex, name, params];
    } // see if using the param type helps


    const adjusted = allSame.map(_ref8 => {
      let [oIndex, oName, oParams] = _ref8;
      const {
        def,
        path
      } = lookup.getSiType(oParams[paramIdx].type.unwrap());

      if (!def.isPrimitive && !path.length) {
        return [oIndex, null, params];
      }

      return [oIndex, def.isPrimitive ? `${oName}${def.asPrimitive.toString()}` : `${oName}${path[path.length - 1].toString()}`, params];
    }); // any dupes remaining?

    const noDupes = adjusted.every(_ref9 => {
      let [i, n] = _ref9;
      return !!n && !adjusted.some(_ref10 => {
        let [ai, an] = _ref10;
        return i !== ai && n === an;
      });
    });

    if (noDupes) {
      // we filtered above for null names
      adjusted.forEach(_ref11 => {
        let [index, name] = _ref11;
        rewrite[index] = name;
      });
    }

    return noDupes ? [lookupIndex, name, params] : [lookupIndex, null, params];
  }).filter(n => !!n[1]).map(_ref12 => {
    let [lookupIndex, name, params] = _ref12;
    return [lookupIndex, rewrite[lookupIndex] || name, params];
  });
}

function extractName(types, _ref13) {
  let {
    id,
    type: {
      params,
      path
    }
  } = _ref13;
  const lookupIndex = id.toNumber();

  if (!path.length || WRAPPERS.includes(path[path.length - 1].toString())) {
    return [lookupIndex, null, []];
  }

  const parts = path.map(p => (0, _util.stringUpperFirst)((0, _util.stringCamelCase)(p))).filter((p, index) => ( // Remove ::{generic, misc, pallet, traits, types}::
  index !== 1 || !['Generic', 'Misc', 'Pallet', 'Traits', 'Types'].includes(p.toString())) && ( // sp_runtime::generic::digest::Digest -> sp_runtime::generic::Digest
  // sp_runtime::multiaddress::MultiAddress -> sp_runtime::MultiAddress
  index === path.length - 1 || p.toLowerCase() !== path[index + 1].toLowerCase()));
  let typeName = parts.join('');

  if (parts.length === 2 && parts[parts.length - 1] === 'RawOrigin' && params.length === 2 && params[1].type.isSome) {
    // Do magic for RawOrigin lookup
    const instanceType = types[params[1].type.unwrap().toNumber()];

    if (instanceType.type.path.length === 2) {
      typeName = `${typeName}${instanceType.type.path[1].toString()}`;
    }
  }

  return [lookupIndex, typeName, params];
}

function registerTypes(lookup, lookups, names, params) {
  // Register the types we extracted
  lookup.registry.register(lookups); // Try and extract the AccountId/Address/Signature type from UncheckedExtrinsic

  if (params.SpRuntimeUncheckedExtrinsic) {
    // Address, Call, Signature, Extra
    const [addrParam,, sigParam] = params.SpRuntimeUncheckedExtrinsic;
    const siAddress = lookup.getSiType(addrParam.type.unwrap());
    const siSignature = lookup.getSiType(sigParam.type.unwrap());
    const nsSignature = createNamespace(siSignature);
    let nsAccountId = createNamespace(siAddress);
    const isMultiAddress = nsAccountId === 'sp_runtime::multiaddress::MultiAddress'; // With multiaddress, we check the first type param again

    if (isMultiAddress) {
      // AccountId, AccountIndex
      const [idParam] = siAddress.params;
      nsAccountId = createNamespace(lookup.getSiType(idParam.type.unwrap()));
    }

    lookup.registry.register({
      AccountId: ['sp_core::crypto::AccountId32'].includes(nsAccountId) ? 'AccountId32' : ['account::AccountId20', 'primitive_types::H160'].includes(nsAccountId) ? 'AccountId20' : 'AccountId32',
      // other, default to AccountId32
      Address: isMultiAddress ? 'MultiAddress' : 'AccountId',
      ExtrinsicSignature: ['sp_runtime::MultiSignature'].includes(nsSignature) ? 'MultiSignature' : names[sigParam.type.unwrap().toNumber()] || 'MultiSignature'
    });
  }
}

function extractNames(lookup, types) {
  const dedup = removeDuplicateNames(lookup, types.map(t => extractName(types, t)));
  const lookups = {};
  const names = {};
  const params = {};

  for (let i = 0; i < dedup.length; i++) {
    const [lookupIndex, name, p] = dedup[i];
    names[lookupIndex] = name;
    lookups[name] = lookup.registry.createLookupType(lookupIndex);
    params[name] = p;
  }

  registerTypes(lookup, lookups, names, params);
  return names;
} // types have an id, which means they are to be named by
// the specified id - ensure we have a mapping lookup for these


function extractTypeMap(types) {
  const result = {};

  for (let i = 0; i < types.length; i++) {
    const p = types[i];
    result[p.id.toNumber()] = p;
  }

  return result;
}

var _names = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("names");

var _typeDefs = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("typeDefs");

var _types = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("types");

var _createSiDef = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("createSiDef");

var _getLookupId = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("getLookupId");

var _extract = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extract");

var _extractArray = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractArray");

var _extractBitSequence = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractBitSequence");

var _extractCompact = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractCompact");

var _extractComposite = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractComposite");

var _extractCompositeSet = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractCompositeSet");

var _extractFields = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractFields");

var _extractFieldsAlias = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractFieldsAlias");

var _extractHistoric = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractHistoric");

var _extractPrimitive = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractPrimitive");

var _extractAliasPath = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractAliasPath");

var _extractSequence = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractSequence");

var _extractTuple = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractTuple");

var _extractVariant = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractVariant");

var _extractVariantEnum = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("extractVariantEnum");

class PortableRegistry extends _Struct.Struct {
  constructor(registry, value) {
    // console.time('PortableRegistry')
    super(registry, {
      types: 'Vec<PortableType>'
    }, value);
    Object.defineProperty(this, _extractVariantEnum, {
      value: _extractVariantEnum2
    });
    Object.defineProperty(this, _extractVariant, {
      value: _extractVariant2
    });
    Object.defineProperty(this, _extractTuple, {
      value: _extractTuple2
    });
    Object.defineProperty(this, _extractSequence, {
      value: _extractSequence2
    });
    Object.defineProperty(this, _extractAliasPath, {
      value: _extractAliasPath2
    });
    Object.defineProperty(this, _extractPrimitive, {
      value: _extractPrimitive2
    });
    Object.defineProperty(this, _extractHistoric, {
      value: _extractHistoric2
    });
    Object.defineProperty(this, _extractFieldsAlias, {
      value: _extractFieldsAlias2
    });
    Object.defineProperty(this, _extractFields, {
      value: _extractFields2
    });
    Object.defineProperty(this, _extractCompositeSet, {
      value: _extractCompositeSet2
    });
    Object.defineProperty(this, _extractComposite, {
      value: _extractComposite2
    });
    Object.defineProperty(this, _extractCompact, {
      value: _extractCompact2
    });
    Object.defineProperty(this, _extractBitSequence, {
      value: _extractBitSequence2
    });
    Object.defineProperty(this, _extractArray, {
      value: _extractArray2
    });
    Object.defineProperty(this, _extract, {
      value: _extract2
    });
    Object.defineProperty(this, _getLookupId, {
      value: _getLookupId2
    });
    Object.defineProperty(this, _createSiDef, {
      value: _createSiDef2
    });
    Object.defineProperty(this, _names, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _typeDefs, {
      writable: true,
      value: {}
    });
    Object.defineProperty(this, _types, {
      writable: true,
      value: void 0
    });
    (0, _classPrivateFieldLooseBase2.default)(this, _names)[_names] = extractNames(this, this.types);
    (0, _classPrivateFieldLooseBase2.default)(this, _types)[_types] = extractTypeMap(this.types); // console.timeEnd('PortableRegistry')
  }

  get names() {
    return Object.values((0, _classPrivateFieldLooseBase2.default)(this, _names)[_names]);
  }
  /**
   * @description The types of the registry
   */


  get types() {
    return this.get('types');
  }
  /**
   * @description Returns the name for a specific lookup
   */


  getName(lookupId) {
    return (0, _classPrivateFieldLooseBase2.default)(this, _names)[_names][(0, _classPrivateFieldLooseBase2.default)(this, _getLookupId)[_getLookupId](lookupId)];
  }
  /**
   * @description Finds a specific type in the registry
   */


  getSiType(lookupId) {
    // NOTE catch-22 - this may already be used as part of the constructor, so
    // ensure that we have actually initialized it correctly
    const found = ((0, _classPrivateFieldLooseBase2.default)(this, _types)[_types] || this.types)[(0, _classPrivateFieldLooseBase2.default)(this, _getLookupId)[_getLookupId](lookupId)];

    (0, _util.assert)(found, () => `PortableRegistry: Unable to find type with lookupId ${lookupId.toString()}`);
    return found.type;
  }
  /**
   * @description Lookup the type definition for the index
   */


  getTypeDef(lookupId) {
    const lookupIndex = (0, _classPrivateFieldLooseBase2.default)(this, _getLookupId)[_getLookupId](lookupId);

    if (!(0, _classPrivateFieldLooseBase2.default)(this, _typeDefs)[_typeDefs][lookupIndex]) {
      const lookupName = (0, _classPrivateFieldLooseBase2.default)(this, _names)[_names][lookupIndex];

      const empty = {
        info: _index.TypeDefInfo.DoNotConstruct,
        lookupIndex,
        lookupName,
        type: this.registry.createLookupType(lookupIndex)
      }; // Set named items since we will get into circular lookups along the way

      if (lookupName) {
        (0, _classPrivateFieldLooseBase2.default)(this, _typeDefs)[_typeDefs][lookupIndex] = empty;
      }

      const extracted = (0, _classPrivateFieldLooseBase2.default)(this, _extract)[_extract](this.getSiType(lookupId), lookupIndex); // For non-named items, we only set this right at the end


      if (!lookupName) {
        (0, _classPrivateFieldLooseBase2.default)(this, _typeDefs)[_typeDefs][lookupIndex] = empty;
      }

      Object.keys(extracted).forEach(k => {
        if (k !== 'lookupName' || extracted[k]) {
          // these are safe since we are looking through the keys as set
          (0, _classPrivateFieldLooseBase2.default)(this, _typeDefs)[_typeDefs][lookupIndex][k] = extracted[k];
        }
      }); // don't set lookupName on lower-level, we want to always direct to the type

      if (extracted.info === _index.TypeDefInfo.Plain) {
        (0, _classPrivateFieldLooseBase2.default)(this, _typeDefs)[_typeDefs][lookupIndex].lookupNameRoot = (0, _classPrivateFieldLooseBase2.default)(this, _typeDefs)[_typeDefs][lookupIndex].lookupName;
        delete (0, _classPrivateFieldLooseBase2.default)(this, _typeDefs)[_typeDefs][lookupIndex].lookupName;
      }
    }

    return (0, _classPrivateFieldLooseBase2.default)(this, _typeDefs)[_typeDefs][lookupIndex];
  }

}

exports.PortableRegistry = PortableRegistry;

function _createSiDef2(lookupId) {
  const typeDef = this.getTypeDef(lookupId);
  const lookupIndex = lookupId.toNumber(); // Setup for a lookup on complex types

  return [_index.TypeDefInfo.DoNotConstruct, _index.TypeDefInfo.Enum, _index.TypeDefInfo.Struct].includes(typeDef.info) && typeDef.lookupName ? {
    docs: typeDef.docs,
    info: _index.TypeDefInfo.Si,
    lookupIndex,
    lookupName: (0, _classPrivateFieldLooseBase2.default)(this, _names)[_names][lookupIndex],
    type: this.registry.createLookupType(lookupId)
  } : typeDef;
}

function _getLookupId2(lookupId) {
  if ((0, _util.isString)(lookupId)) {
    (0, _util.assert)(this.registry.isLookupType(lookupId), () => `PortableRegistry: Expected a lookup string type, found ${lookupId}`);
    return parseInt(lookupId.replace('Lookup', ''), 10);
  } else if ((0, _util.isNumber)(lookupId)) {
    return lookupId;
  }

  return lookupId.toNumber();
}

function _extract2(type, lookupIndex) {
  const namespace = [...type.path].join('::');
  let typeDef;
  const aliasType = getAliasPath(type.path);

  try {
    if (aliasType) {
      typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractAliasPath)[_extractAliasPath](lookupIndex, aliasType);
    } else if (type.def.isArray) {
      typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractArray)[_extractArray](lookupIndex, type.def.asArray);
    } else if (type.def.isBitSequence) {
      typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractBitSequence)[_extractBitSequence](lookupIndex, type.def.asBitSequence);
    } else if (type.def.isCompact) {
      typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractCompact)[_extractCompact](lookupIndex, type.def.asCompact);
    } else if (type.def.isComposite) {
      typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractComposite)[_extractComposite](lookupIndex, type, type.def.asComposite);
    } else if (type.def.isHistoricMetaCompat) {
      typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractHistoric)[_extractHistoric](lookupIndex, type.def.asHistoricMetaCompat);
    } else if (type.def.isPrimitive) {
      typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractPrimitive)[_extractPrimitive](lookupIndex, type);
    } else if (type.def.isSequence) {
      typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractSequence)[_extractSequence](lookupIndex, type.def.asSequence);
    } else if (type.def.isTuple) {
      typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractTuple)[_extractTuple](lookupIndex, type.def.asTuple);
    } else if (type.def.isVariant) {
      typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _extractVariant)[_extractVariant](lookupIndex, type, type.def.asVariant);
    } else {
      throw new Error(`No SiTypeDef handler for ${type.def.toString()}`);
    }
  } catch (error) {
    throw new Error(`PortableRegistry: ${lookupIndex}${namespace ? ` (${namespace})` : ''}: Error extracting ${(0, _util.stringify)(type)}: ${error.message}`);
  }

  return (0, _util.objectSpread)({
    docs: sanitizeDocs(type.docs),
    namespace
  }, typeDef);
}

function _extractArray2(_, _ref14) {
  let {
    len: length,
    type
  } = _ref14;
  (0, _util.assert)(!length || length.toNumber() <= 256, 'Only support for [Type; <length>], where length <= 256');
  return (0, _encodeTypes.withTypeString)(this.registry, {
    info: _index.TypeDefInfo.VecFixed,
    length: length.toNumber(),
    sub: (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](type)
  });
}

function _extractBitSequence2(_, _ref15) {
  let {
    bitOrderType,
    bitStoreType
  } = _ref15;

  const bitOrder = (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](bitOrderType);

  const bitStore = (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](bitStoreType); // NOTE: Currently the BitVec type is one-way only, i.e. we only use it to decode, not
  // re-encode stuff. As such we ignore the msb/lsb identifier given by bitOrderType, or rather
  // we don't pass it though at all


  (0, _util.assert)(['bitvec::order::Lsb0', 'bitvec::order::Msb0'].includes(bitOrder.namespace || ''), () => `Unexpected bitOrder found as ${bitOrder.namespace || '<unknown>'}`);
  (0, _util.assert)(bitStore.info === _index.TypeDefInfo.Plain && bitStore.type === 'u8', () => `Only u8 bitStore is currently supported, found ${bitStore.type}`);
  return {
    info: _index.TypeDefInfo.Plain,
    type: 'BitVec'
  };
}

function _extractCompact2(_, _ref16) {
  let {
    type
  } = _ref16;
  return (0, _encodeTypes.withTypeString)(this.registry, {
    info: _index.TypeDefInfo.Compact,
    sub: (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](type)
  });
}

function _extractComposite2(lookupIndex, _ref17, _ref18) {
  let {
    params,
    path
  } = _ref17;
  let {
    fields
  } = _ref18;
  const specialVariant = path[0].toString();

  if (path.length === 1 && specialVariant === 'BTreeMap') {
    return (0, _encodeTypes.withTypeString)(this.registry, {
      info: _index.TypeDefInfo.BTreeMap,
      sub: params.map(_ref19 => {
        let {
          type
        } = _ref19;
        return (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](type.unwrap());
      })
    });
  } else if (['Range', 'RangeInclusive'].includes(specialVariant)) {
    return (0, _encodeTypes.withTypeString)(this.registry, {
      info: _index.TypeDefInfo.Range,
      sub: fields.map((_ref20, index) => {
        let {
          name,
          type,
          typeName
        } = _ref20;
        return (0, _util.objectSpread)({
          name: name.isSome ? name.unwrap().toString() : ['start', 'end'][index]
        }, (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](type), typeName.isSome ? {
          typeName: (0, _sanitize.sanitize)(typeName.unwrap())
        } : null);
      })
    });
  } else if (path.length) {
    if (path[path.length - 1].toString() === 'WrapperOpaque') {
      return (0, _encodeTypes.withTypeString)(this.registry, {
        info: _index.TypeDefInfo.WrapperOpaque,
        sub: (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](params[0].type.unwrap())
      });
    } else if (path[path.length - 1].toString() === 'WrapperKeepOpaque') {
      return {
        info: _index.TypeDefInfo.Plain,
        type: 'Bytes'
      };
    }
  }

  return PATHS_SET.some(p => matchParts(p, path)) ? (0, _classPrivateFieldLooseBase2.default)(this, _extractCompositeSet)[_extractCompositeSet](lookupIndex, params, fields) : (0, _classPrivateFieldLooseBase2.default)(this, _extractFields)[_extractFields](lookupIndex, fields);
}

function _extractCompositeSet2(_, params, fields) {
  (0, _util.assert)(params.length === 1 && fields.length === 1, 'Set handling expects param/field as single entries');
  return (0, _encodeTypes.withTypeString)(this.registry, {
    info: _index.TypeDefInfo.Set,
    length: this.registry.createType(this.registry.createLookupType(fields[0].type)).bitLength(),
    sub: this.getSiType(params[0].type.unwrap()).def.asVariant.variants.map(_ref21 => {
      let {
        index,
        name
      } = _ref21;
      return {
        // This will be an issue > 2^53 - 1 ... don't have those (yet)
        index: index.toNumber(),
        info: _index.TypeDefInfo.Plain,
        name: name.toString(),
        type: 'Null'
      };
    })
  });
}

function _extractFields2(lookupIndex, fields) {
  let isStruct = true;
  let isTuple = true;

  for (let f = 0; f < fields.length; f++) {
    const {
      name
    } = fields[f];
    isStruct = isStruct && name.isSome;
    isTuple = isTuple && name.isNone;
  }

  (0, _util.assert)(isTuple || isStruct, 'Invalid fields type detected, expected either Tuple (all unnamed) or Struct (all named)');

  if (fields.length === 0) {
    return {
      info: _index.TypeDefInfo.Null,
      type: 'Null'
    };
  } else if (isTuple && fields.length === 1) {
    const typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](fields[0].type);

    return (0, _util.objectSpread)({}, typeDef, lookupIndex === -1 ? {} : {
      lookupIndex,
      lookupName: (0, _classPrivateFieldLooseBase2.default)(this, _names)[_names][lookupIndex],
      lookupNameRoot: typeDef.lookupName
    }, fields[0].typeName.isSome ? {
      typeName: (0, _sanitize.sanitize)(fields[0].typeName.unwrap())
    } : null);
  }

  const [sub, alias] = (0, _classPrivateFieldLooseBase2.default)(this, _extractFieldsAlias)[_extractFieldsAlias](fields);

  return (0, _encodeTypes.withTypeString)(this.registry, (0, _util.objectSpread)({
    info: isTuple // Tuple check first
    ? _index.TypeDefInfo.Tuple : _index.TypeDefInfo.Struct
  }, alias.size ? {
    alias
  } : null, lookupIndex === -1 ? {} : {
    lookupIndex,
    lookupName: (0, _classPrivateFieldLooseBase2.default)(this, _names)[_names][lookupIndex]
  }, {
    sub
  }));
}

function _extractFieldsAlias2(fields) {
  const alias = new Map();
  const sub = new Array(fields.length);

  for (let i = 0; i < fields.length; i++) {
    const {
      docs,
      name,
      type,
      typeName
    } = fields[i];

    const typeDef = (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](type);

    if (name.isNone) {
      sub[i] = typeDef;
    } else {
      let nameField = (0, _util.stringCamelCase)(name.unwrap());
      let nameOrig = null;

      if (nameField.includes('#')) {
        nameOrig = nameField;
        nameField = nameOrig.replace(/#/g, '_');
      } else if (RESERVED.includes(nameField)) {
        nameOrig = nameField;
        nameField = `${nameField}_`;
      }

      if (nameOrig) {
        alias.set(nameField, nameOrig);
      }

      sub[i] = (0, _util.objectSpread)({}, typeDef, {
        docs: sanitizeDocs(docs),
        name: nameField
      }, typeName.isSome ? {
        typeName: (0, _sanitize.sanitize)(typeName.unwrap())
      } : null);
    }
  }

  return [sub, alias];
}

function _extractHistoric2(_, type) {
  return (0, _util.objectSpread)({}, (0, _getTypeDef.getTypeDef)(type), {
    displayName: type.toString(),
    isFromSi: true
  });
}

function _extractPrimitive2(_, type) {
  const typeStr = type.def.asPrimitive.type.toString();
  return {
    info: _index.TypeDefInfo.Plain,
    type: PRIMITIVE_ALIAS[typeStr] || typeStr.toLowerCase()
  };
}

function _extractAliasPath2(_, type) {
  return {
    info: _index.TypeDefInfo.Plain,
    type
  };
}

function _extractSequence2(lookupIndex, _ref22) {
  let {
    type
  } = _ref22;

  const sub = (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](type);

  if (sub.type === 'u8') {
    return {
      info: _index.TypeDefInfo.Plain,
      type: 'Bytes'
    };
  }

  return (0, _encodeTypes.withTypeString)(this.registry, {
    info: _index.TypeDefInfo.Vec,
    lookupIndex,
    lookupName: (0, _classPrivateFieldLooseBase2.default)(this, _names)[_names][lookupIndex],
    sub
  });
}

function _extractTuple2(lookupIndex, ids) {
  if (ids.length === 0) {
    return {
      info: _index.TypeDefInfo.Null,
      type: 'Null'
    };
  } else if (ids.length === 1) {
    return this.getTypeDef(ids[0]);
  }

  const sub = ids.map(type => (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](type));
  return (0, _encodeTypes.withTypeString)(this.registry, {
    info: _index.TypeDefInfo.Tuple,
    lookupIndex,
    lookupName: (0, _classPrivateFieldLooseBase2.default)(this, _names)[_names][lookupIndex],
    sub
  });
}

function _extractVariant2(lookupIndex, _ref23, _ref24) {
  let {
    params,
    path
  } = _ref23;
  let {
    variants
  } = _ref24;
  const specialVariant = path[0].toString();

  if (specialVariant === 'Option') {
    return (0, _encodeTypes.withTypeString)(this.registry, {
      info: _index.TypeDefInfo.Option,
      sub: (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](params[0].type.unwrap())
    });
  } else if (specialVariant === 'Result') {
    return (0, _encodeTypes.withTypeString)(this.registry, {
      info: _index.TypeDefInfo.Result,
      sub: params.map((_ref25, index) => {
        let {
          type
        } = _ref25;
        return (0, _util.objectSpread)({
          name: ['Ok', 'Error'][index]
        }, (0, _classPrivateFieldLooseBase2.default)(this, _createSiDef)[_createSiDef](type.unwrap()));
      })
    });
  } else if (variants.length === 0) {
    return {
      info: _index.TypeDefInfo.Null,
      type: 'Null'
    };
  }

  return (0, _classPrivateFieldLooseBase2.default)(this, _extractVariantEnum)[_extractVariantEnum](lookupIndex, variants);
}

function _extractVariantEnum2(lookupIndex, variants) {
  const sub = []; // we may get entries out of order, arrange them first before creating with gaps filled
  // NOTE: Since we mutate, use a copy of the array as an input

  [...variants].sort((a, b) => a.index.cmp(b.index)).forEach(_ref26 => {
    let {
      fields,
      index,
      name
    } = _ref26;
    const desired = index.toNumber();

    while (sub.length !== desired) {
      sub.push({
        index: sub.length,
        info: _index.TypeDefInfo.Null,
        name: `__Unused${sub.length}`,
        type: 'Null'
      });
    }

    sub.push((0, _util.objectSpread)((0, _classPrivateFieldLooseBase2.default)(this, _extractFields)[_extractFields](-1, fields), {
      index: index.toNumber(),
      name: name.toString()
    }));
  });
  return (0, _encodeTypes.withTypeString)(this.registry, {
    info: _index.TypeDefInfo.Enum,
    lookupIndex,
    lookupName: (0, _classPrivateFieldLooseBase2.default)(this, _names)[_names][lookupIndex],
    sub
  });
}