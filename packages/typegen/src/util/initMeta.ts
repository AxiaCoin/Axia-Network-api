// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtraTypes } from '../generate/types';

import { Metadata, TypeRegistry } from '@axia-js/types';
import staticAxlib from '@axia-js/types-support/metadata/static-axlib';

import { registerDefinitions } from './register';

interface Result {
  metadata: Metadata;
  registry: TypeRegistry;
}

export function initMeta (staticMeta = staticAxlib, extraTypes: ExtraTypes = {}): Result {
  const registry = new TypeRegistry();

  registerDefinitions(registry, extraTypes);

  const metadata = new Metadata(registry, staticMeta);

  registry.setMetadata(metadata);

  return { metadata, registry };
}
