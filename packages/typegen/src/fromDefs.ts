// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0

import path from 'path';
import yargs from 'yargs';

import * as axlibDefs from '@axia-js/types/interfaces/definitions';

import { generateInterfaceTypes } from './generate/interfaceRegistry';
import { generateTsDef } from './generate/tsDef';

type ArgV = { input: string; package: string };

export function main (): void {
  const { input, package: pkg } = yargs.strict().options({
    input: {
      description: 'The directory to use for the user definitions',
      required: true,
      type: 'string'
    },
    package: {
      description: 'The package name & path to use for the user types',
      required: true,
      type: 'string'
    }
  }).argv as ArgV;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const userDefs = require(path.join(process.cwd(), input, 'definitions.ts')) as Record<string, any>;
  const userKeys = Object.keys(userDefs);
  const filteredBase = Object
    .entries(axlibDefs as Record<string, unknown>)
    .filter(([key]) => {
      if (userKeys.includes(key)) {
        console.warn(`Override found for ${key} in user types, ignoring in @axia-js/types`);

        return false;
      }

      return true;
    })
    .reduce((defs: Record<string, any>, [key, value]) => {
      defs[key] = value;

      return defs;
    }, {});

  const allDefs = {
    '@axia-js/types/interfaces': filteredBase,
    [pkg]: userDefs
  };

  generateTsDef(allDefs, path.join(process.cwd(), input), pkg);
  generateInterfaceTypes(allDefs, path.join(process.cwd(), input, 'augment-types.ts'));
}
