// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { Compact, Enum, Option, Struct, Tuple, Vec } from '@axia-js/types/codec';
import { AbstractInt } from '@axia-js/types/codec/AbstractInt';
import { getTypeDef } from '@axia-js/types/create';
import { TypeDefInfo } from '@axia-js/types/create/types';
import { GenericAccountId, GenericLookupSource, GenericVote } from '@axia-js/types/generic';
import { AllConvictions } from '@axia-js/types/interfaces/democracy/definitions';
import { bool, Null } from '@axia-js/types/primitive';
import { isChildClass, stringify } from '@axia-js/util';
import { formatType } from "./formatting.js";
import { setImports } from "./imports.js";

function arrayToStrType(arr) {
  return `${arr.map(c => `'${c}'`).join(' | ')}`;
}

const voteConvictions = arrayToStrType(AllConvictions); // Make types a little bit more flexible
// - if param instanceof AbstractInt, then param: u64 | Uint8array | AnyNumber
// etc

/** @internal */

export function getSimilarTypes(registry, definitions, _type, imports) {
  const typeParts = _type.split('::');

  const type = typeParts[typeParts.length - 1];
  const possibleTypes = [formatType(registry, definitions, type, imports)];

  if (type === 'Extrinsic') {
    setImports(definitions, imports, ['IExtrinsic']);
    return ['IExtrinsic'];
  } else if (type === 'Keys') {
    // This one is weird... surely it should popup as a Tuple? (but either way better as defined hex)
    return ['Keys', 'string', 'Uint8Array'];
  } else if (type === 'StorageKey') {
    // TODO We can do better
    return ['StorageKey', 'string', 'Uint8Array', 'any'];
  } else if (type === '()') {
    return ['null'];
  }

  const Clazz = registry.createClass(type);

  if (isChildClass(Vec, Clazz)) {
    const vecDef = getTypeDef(type);
    const subDef = vecDef.sub; // this could be that we define a Vec type and refer to it by name

    if (subDef) {
      if (subDef.info === TypeDefInfo.Plain) {
        possibleTypes.push(`(${getSimilarTypes(registry, definitions, subDef.type, imports).join(' | ')})[]`);
      } else if (subDef.info === TypeDefInfo.Tuple) {
        const subs = subDef.sub.map(({
          type
        }) => getSimilarTypes(registry, definitions, type, imports).join(' | '));
        possibleTypes.push(`([${subs.join(', ')}])[]`);
      } else {
        throw new Error(`Unhandled subtype in Vec, ${stringify(subDef)}`);
      }
    }
  } else if (isChildClass(Enum, Clazz)) {
    const e = new Clazz(registry);

    if (e.isBasic) {
      possibleTypes.push(arrayToStrType(e.defKeys), 'number');
    } else {
      // TODO We don't really want any here, these should be expanded
      possibleTypes.push(...e.defKeys.map(key => `{ ${key}: any }`), 'string');
    }

    possibleTypes.push('Uint8Array');
  } else if (isChildClass(AbstractInt, Clazz) || isChildClass(Compact, Clazz)) {
    possibleTypes.push('AnyNumber', 'Uint8Array');
  } else if (isChildClass(GenericLookupSource, Clazz)) {
    possibleTypes.push('Address', 'AccountId', 'AccountIndex', 'LookupSource', 'string', 'Uint8Array');
  } else if (isChildClass(GenericAccountId, Clazz)) {
    possibleTypes.push('string', 'Uint8Array');
  } else if (isChildClass(bool, Clazz)) {
    possibleTypes.push('boolean', 'Uint8Array');
  } else if (isChildClass(Null, Clazz)) {
    possibleTypes.push('null');
  } else if (isChildClass(Struct, Clazz)) {
    const s = new Clazz(registry);
    const obj = s.defKeys.map(key => `${key}?: any`).join('; ');
    possibleTypes.push(`{ ${obj} }`, 'string', 'Uint8Array');
  } else if (isChildClass(Option, Clazz)) {
    // TODO inspect container
    possibleTypes.push('null', 'object', 'string', 'Uint8Array');
  } else if (isChildClass(GenericVote, Clazz)) {
    possibleTypes.push(`{ aye: boolean; conviction?: ${voteConvictions} | number }`, 'boolean', 'string', 'Uint8Array');
  } else if (isChildClass(Uint8Array, Clazz)) {
    possibleTypes.push('string', 'Uint8Array');
  } else if (isChildClass(String, Clazz)) {
    possibleTypes.push('string');
  } else if (isChildClass(Tuple, Clazz)) {
    const tupDef = getTypeDef(type);
    const subDef = tupDef.sub; // this could be that we define a Tuple type and refer to it by name

    if (Array.isArray(subDef)) {
      const subs = subDef.map(({
        type
      }) => getSimilarTypes(registry, definitions, type, imports).join(' | '));
      possibleTypes.push(`[${subs.join(', ')}]`);
    }
  }

  return [...new Set(possibleTypes)];
}