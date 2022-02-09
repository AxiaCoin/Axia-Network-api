// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
import Handlebars from 'handlebars';
import { stringCamelCase } from '@axia-js/util';
import { compareName, createImports, initMeta, readTemplate, writeFile } from "../util/index.js";
const template = readTemplate('errors');
const generateForMetaTemplate = Handlebars.compile(template);
/** @internal */

function generateForMeta(meta, dest, isStrict) {
  writeFile(dest, () => {
    const imports = createImports({});
    const {
      lookup,
      pallets
    } = meta.asLatest;
    const modules = pallets.filter(({
      errors
    }) => errors.isSome).map(({
      errors,
      name
    }) => ({
      items: lookup.getSiType(errors.unwrap().type).def.asVariant.variants.map(({
        docs,
        name
      }) => ({
        docs,
        name: name.toString()
      })).sort(compareName),
      name: stringCamelCase(name)
    })).sort(compareName);
    return generateForMetaTemplate({
      headerType: 'chain',
      imports,
      isStrict,
      modules,
      types: [{
        file: '@axia-js/api/types',
        types: ['ApiTypes']
      }]
    });
  });
} // Call `generateForMeta()` with current static metadata

/** @internal */


export function generateDefaultErrors(dest = 'packages/api/src/augment/errors.ts', data, extraTypes = {}, isStrict = false) {
  const {
    metadata
  } = initMeta(data, extraTypes);
  return generateForMeta(metadata, dest, isStrict);
}