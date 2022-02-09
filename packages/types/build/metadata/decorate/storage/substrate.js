// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { createFunction } from "./createFunction.js";

function findSiPrimitive(registry, _prim) {
  const prim = _prim.toLowerCase();

  const portable = registry.lookup.types.find(t => t.type.def.isPrimitive && t.type.def.asPrimitive.toString().toLowerCase() === prim || t.type.def.isHistoricMetaCompat && t.type.def.asHistoricMetaCompat.toString().toLowerCase() === prim);
  return portable;
}

function findSiType(registry, orig) {
  let portable = findSiPrimitive(registry, orig);

  if (!portable && orig === 'Bytes') {
    const u8 = findSiPrimitive(registry, 'u8');

    if (u8) {
      portable = registry.lookup.types.find(t => t.type.def.isSequence && t.type.def.asSequence.type.eq(u8.id) || t.type.def.isHistoricMetaCompat && t.type.def.asHistoricMetaCompat.eq(orig));
    }
  }

  if (!portable) {
    console.warn(`Unable to map ${orig} to a lookup index`);
  }

  return portable;
} // Small helper function to factorize code on this page.

/** @internal */


function createRuntimeFunction(method, key, {
  docs,
  type
}) {
  return registry => {
    var _findSiType;

    return createFunction(registry, {
      meta: registry.createType('StorageEntryMetadataLatest', {
        docs: registry.createType('Vec<Text>', [docs]),
        modifier: registry.createType('StorageEntryModifierLatest', 'Required'),
        name: registry.createType('Text', method),
        toJSON: () => key,
        type: registry.createType('StorageEntryTypeLatest', {
          Plain: ((_findSiType = findSiType(registry, type)) === null || _findSiType === void 0 ? void 0 : _findSiType.id) || 0
        })
      }),
      method,
      prefix: 'Axlib',
      section: 'axlib'
    }, {
      key,
      skipHashing: true
    });
  };
}

export const axlib = {
  changesTrieConfig: createRuntimeFunction('changesTrieConfig', ':changes_trie', {
    docs: ' Changes trie configuration is stored under this key.',
    type: 'u32'
  }),
  childStorageKeyPrefix: createRuntimeFunction('childStorageKeyPrefix', ':child_storage:', {
    docs: ' Prefix of child storage keys.',
    type: 'u32'
  }),
  code: createRuntimeFunction('code', ':code', {
    docs: ' Wasm code of the runtime.',
    type: 'Bytes'
  }),
  extrinsicIndex: createRuntimeFunction('extrinsicIndex', ':extrinsic_index', {
    docs: ' Current extrinsic index (u32) is stored under this key.',
    type: 'u32'
  }),
  heapPages: createRuntimeFunction('heapPages', ':heappages', {
    docs: ' Number of wasm linear memory pages required for execution of the runtime.',
    type: 'u64'
  })
};