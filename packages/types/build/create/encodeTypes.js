import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, isNumber, isUndefined, stringify } from '@axia-js/util';
import { TypeDefInfo } from "./types.js";

const stringIdentity = value => value.toString();

const INFO_WRAP = ['BTreeMap', 'BTreeSet', 'Compact', 'HashMap', 'Option', 'Result', 'Vec'];
export function paramsNotation(outer, inner, transform = stringIdentity) {
  return `${outer}${inner ? `<${(Array.isArray(inner) ? inner : [inner]).map(transform).join(', ')}>` : ''}`;
}

function encodeWithParams(registry, typeDef, outer) {
  const {
    info,
    sub
  } = typeDef;

  switch (info) {
    case TypeDefInfo.BTreeMap:
    case TypeDefInfo.BTreeSet:
    case TypeDefInfo.Compact:
    case TypeDefInfo.HashMap:
    case TypeDefInfo.Linkage:
    case TypeDefInfo.Option:
    case TypeDefInfo.Result:
    case TypeDefInfo.Vec:
      return paramsNotation(outer, sub, p => encodeTypeDef(registry, p));
  }

  throw new Error(`Unable to encode ${stringify(typeDef)} with params`);
}

function encodeSubTypes(registry, sub, asEnum, extra) {
  const names = sub.map(({
    name
  }) => name);
  assert(names.every(n => !!n), () => `Subtypes does not have consistent names, ${names.join(', ')}`);
  const inner = sub.reduce((result, type) => _objectSpread(_objectSpread({}, result), {}, {
    [type.name]: encodeTypeDef(registry, type)
  }), _objectSpread({}, extra));
  return stringify(asEnum ? {
    _enum: inner
  } : inner);
} // We setup a record here to ensure we have comprehensive coverage (any item not covered will result
// in a compile-time error with the missing index)


const encoders = {
  [TypeDefInfo.BTreeMap]: (registry, typeDef) => encodeWithParams(registry, typeDef, 'BTreeMap'),
  [TypeDefInfo.BTreeSet]: (registry, typeDef) => encodeWithParams(registry, typeDef, 'BTreeSet'),
  [TypeDefInfo.Compact]: (registry, typeDef) => encodeWithParams(registry, typeDef, 'Compact'),
  [TypeDefInfo.DoNotConstruct]: (registry, {
    displayName,
    lookupIndex,
    lookupName
  }) => `DoNotConstruct<${lookupName || displayName || (isUndefined(lookupIndex) ? 'Unknown' : registry.createLookupType(lookupIndex))}>`,
  [TypeDefInfo.Enum]: (registry, {
    sub
  }) => {
    assert(sub && Array.isArray(sub), 'Unable to encode Enum type'); // c-like enums have all Null entries
    // TODO We need to take the disciminant into account and auto-add empty entries

    return sub.every(({
      type
    }) => type === 'Null') ? stringify({
      _enum: sub.map(({
        name
      }, index) => `${name || `Empty${index}`}`)
    }) : encodeSubTypes(registry, sub, true);
  },
  [TypeDefInfo.HashMap]: (registry, typeDef) => encodeWithParams(registry, typeDef, 'HashMap'),
  [TypeDefInfo.Int]: (registry, {
    length = 32
  }) => `Int<${length}>`,
  [TypeDefInfo.Linkage]: (registry, typeDef) => encodeWithParams(registry, typeDef, 'Linkage'),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [TypeDefInfo.Null]: (registry, typeDef) => 'Null',
  [TypeDefInfo.Option]: (registry, typeDef) => encodeWithParams(registry, typeDef, 'Option'),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [TypeDefInfo.Plain]: (registry, {
    displayName,
    type
  }) => displayName || type,
  [TypeDefInfo.Range]: (registry, typeDef) => encodeWithParams(registry, typeDef, typeDef.type.includes('RangeInclusive') ? 'RangeInclusive' : 'Range'),
  [TypeDefInfo.Result]: (registry, typeDef) => encodeWithParams(registry, typeDef, 'Result'),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [TypeDefInfo.Set]: (registry, {
    length = 8,
    sub
  }) => {
    assert(sub && Array.isArray(sub), 'Unable to encode Set type');
    return stringify({
      _set: sub.reduce((all, {
        index,
        name
      }, count) => _objectSpread(_objectSpread({}, all), {}, {
        [`${name || `Unknown${index || count}`}`]: index || count
      }), {
        _bitLength: length || 8
      })
    });
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [TypeDefInfo.Si]: (registry, {
    lookupName,
    type
  }) => lookupName || type,
  [TypeDefInfo.Struct]: (registry, {
    alias,
    sub
  }) => {
    assert(sub && Array.isArray(sub), 'Unable to encode Struct type');
    return encodeSubTypes(registry, sub, false, _objectSpread({}, alias ? {
      _alias: [...alias.entries()].reduce((all, [k, v]) => _objectSpread(_objectSpread({}, all), {}, {
        [k]: v
      }), {})
    } : {}));
  },
  [TypeDefInfo.Tuple]: (registry, {
    sub
  }) => {
    assert(sub && Array.isArray(sub), 'Unable to encode Tuple type');
    return `(${sub.map(type => encodeTypeDef(registry, type)).join(',')})`;
  },
  [TypeDefInfo.UInt]: (registry, {
    length = 32
  }) => `UInt<${length}>`,
  [TypeDefInfo.Vec]: (registry, typeDef) => encodeWithParams(registry, typeDef, 'Vec'),
  [TypeDefInfo.VecFixed]: (registry, {
    length,
    sub
  }) => {
    assert(isNumber(length) && !isUndefined(sub) && !Array.isArray(sub), 'Unable to encode VecFixed type');
    return `[${sub.type};${length}]`;
  }
};

function encodeType(registry, typeDef, withLookup = true) {
  return withLookup && typeDef.lookupName ? typeDef.lookupName : encoders[typeDef.info](registry, typeDef);
}

export function encodeTypeDef(registry, typeDef) {
  // In the case of contracts we do have the unfortunate situation where the displayName would
  // refer to "Option" when it is an option. For these, string it out, only using when actually
  // not a top-level element to be used
  return typeDef.displayName && !INFO_WRAP.some(i => typeDef.displayName === i) ? typeDef.displayName : encodeType(registry, typeDef);
}
export function withTypeString(registry, typeDef) {
  return _objectSpread(_objectSpread({}, typeDef), {}, {
    type: encodeType(registry, typeDef, false)
  });
}