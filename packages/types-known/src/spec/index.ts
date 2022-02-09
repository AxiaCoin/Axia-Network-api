// Copyright 2017-2021 @axia-js/types-known authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OverrideVersionedType } from '@axia-js/types/types';

import centrifugeChain from './centrifuge-chain';
import axialunar from './axialunar';
import node from './node';
import nodeTemplate from './node-template';
import axia from './axia';
import betanet from './betanet';
import shell from './shell';
import statemint from './statemint';
import alphanet from './alphanet';

// Type overrides for specific spec types & versions as given in runtimeVersion
const typesSpec: Record<string, OverrideVersionedType[]> = {
  'centrifuge-chain': centrifugeChain,
  axialunar,
  node,
  'node-template': nodeTemplate,
  axia,
  betanet,
  shell,
  statemine: statemint,
  statemint,
  alphanet,
  westmint: statemint
};

export default typesSpec;
