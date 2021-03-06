import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { stringCamelCase } from '@axia-js/util';
import { createUnchecked } from "./createUnchecked.js";
/** @internal */

export function decorateExtrinsics(registry, {
  lookup,
  pallets
}, metaVersion) {
  return pallets.filter(({
    calls
  }) => calls.isSome).reduce((result, {
    calls,
    index,
    name
  }, _sectionIndex) => {
    const sectionName = stringCamelCase(name);
    const sectionIndex = metaVersion >= 12 ? index.toNumber() : _sectionIndex;
    result[sectionName] = lookup.getSiType(calls.unwrap().type).def.asVariant.variants.reduce((newModule, variant) => {
      const callMetadata = registry.createType('FunctionMetadataLatest', _objectSpread(_objectSpread({}, variant), {}, {
        args: variant.fields.map(({
          name,
          type
        }, index) => ({
          name: stringCamelCase(name.unwrapOr(`param${index}`)),
          type: lookup.getTypeDef(type).type
        }))
      }));
      newModule[stringCamelCase(callMetadata.name)] = createUnchecked(registry, sectionName, new Uint8Array([sectionIndex, callMetadata.index.toNumber()]), callMetadata);
      return newModule;
    }, {});
    return result;
  }, {});
}