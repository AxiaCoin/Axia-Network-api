import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, compactAddLength, compactStripLength, isUndefined, stringCamelCase, stringLowerFirst, u8aConcat, u8aToU8a } from '@axia-js/util';
import { xxhashAsU8a } from '@axia-js/util-crypto';
import { Raw } from "../../../codec/index.js";
import { getHasher } from "./getHasher.js";

/** @internal */
function createKeyRaw(registry, itemFn, keys, hashers, args) {
  return u8aConcat(xxhashAsU8a(itemFn.prefix, 128), xxhashAsU8a(itemFn.method, 128), ...keys.map((type, index) => getHasher(hashers[index])(registry.createType(registry.createLookupType(type), args[index]).toU8a())));
}
/** @internal */


function createKey(registry, itemFn, keys, hashers, args) {
  const {
    method,
    section
  } = itemFn;
  assert(Array.isArray(args), () => `Call to ${stringCamelCase(section || 'unknown')}.${stringCamelCase(method || 'unknown')} needs ${keys.length} arguments`);
  assert(args.filter(a => !isUndefined(a)).length === keys.length, () => `Call to ${stringCamelCase(section || 'unknown')}.${stringCamelCase(method || 'unknown')} needs ${keys.length} arguments, found [${args.join(', ')}]`); // as per createKey, always add the length prefix (underlying it is Bytes)

  return compactAddLength(createKeyRaw(registry, itemFn, keys, hashers, args));
}
/** @internal */


function expandWithMeta({
  meta,
  method,
  prefix,
  section
}, _storageFn) {
  const storageFn = _storageFn;
  storageFn.meta = meta;
  storageFn.method = stringLowerFirst(method);
  storageFn.prefix = prefix;
  storageFn.section = section; // explicitly add the actual method in the toJSON, this gets used to determine caching and without it
  // instances (e.g. collective) will not work since it is only matched on param meta

  storageFn.toJSON = () => _objectSpread(_objectSpread({}, meta.toJSON()), {}, {
    storage: {
      method,
      prefix,
      section
    }
  });

  return storageFn;
}
/** @internal */


function extendHeadMeta(registry, {
  meta: {
    docs,
    name,
    type
  },
  section
}, {
  method
}, iterFn) {
  const outputType = registry.createLookupType(type.asMap.key); // metadata with a fallback value using the type of the key, the normal
  // meta fallback only applies to actual entry values, create one for head

  iterFn.meta = registry.createType('StorageEntryMetadataLatest', {
    docs,
    fallback: registry.createType('Bytes'),
    modifier: registry.createType('StorageEntryModifierLatest', 1),
    // required
    name,
    // FIXME???
    type: registry.createType('StorageEntryTypeLatest', outputType, 0)
  });
  return (...args) => registry.createType('StorageKey', iterFn(...args), {
    method,
    section
  });
}
/** @internal */


function extendPrefixedMap(registry, itemFn, storageFn) {
  const {
    meta: {
      type
    },
    method,
    section
  } = itemFn;
  storageFn.iterKey = extendHeadMeta(registry, itemFn, storageFn, (...args) => {
    assert(args.length === 0 || type.isMap && args.length < type.asMap.hashers.length, () => `Iteration ${stringCamelCase(section || 'unknown')}.${stringCamelCase(method || 'unknown')} needs arguments to be at least one less than the full arguments, found [${args.join(', ')}]`);

    if (args.length) {
      if (type.isMap) {
        const {
          hashers,
          key
        } = type.asMap;
        const keysVec = hashers.length === 1 ? [key] : [...registry.lookup.getSiType(key).def.asTuple.map(t => t)];
        const hashersVec = [...hashers];
        return new Raw(registry, createKeyRaw(registry, itemFn, keysVec.slice(0, args.length), hashersVec.slice(0, args.length), args));
      }
    }

    return new Raw(registry, createKeyRaw(registry, itemFn, [], [], []));
  });
  return storageFn;
}
/** @internal */


export function createFunction(registry, itemFn, options) {
  const {
    meta: {
      type
    }
  } = itemFn; // Can only have zero or one argument:
  //   - storage.system.account(address)
  //   - storage.timestamp.blockPeriod()
  // For higher-map queries the params are passed in as an tuple, [key1, key2]

  const storageFn = expandWithMeta(itemFn, (...args) => {
    if (type.isPlain) {
      return options.skipHashing ? compactAddLength(u8aToU8a(options.key)) : createKey(registry, itemFn, [], [], []);
    }

    const {
      hashers,
      key
    } = type.asMap;
    return hashers.length === 1 ? createKey(registry, itemFn, [key], hashers, args) : createKey(registry, itemFn, registry.lookup.getSiType(key).def.asTuple.map(t => t), hashers, args);
  });

  if (type.isMap) {
    extendPrefixedMap(registry, itemFn, storageFn);
  }

  storageFn.keyPrefix = (...args) => storageFn.iterKey && storageFn.iterKey(...args) || compactStripLength(storageFn())[1];

  return storageFn;
}