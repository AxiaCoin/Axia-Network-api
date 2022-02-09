// Copyright 2017-2021 @axia-js/types-known authors & contributors
// SPDX-License-Identifier: Apache-2.0
import centrifugeChain from "./centrifuge-chain.js";
import axialunar from "./axialunar.js";
import node from "./node.js";
import nodeTemplate from "./node-template.js";
import axia from "./axia.js";
import betanet from "./betanet.js";
import shell from "./shell.js";
import statemint from "./statemint.js";
import alphanet from "./alphanet.js"; // Type overrides for specific spec types & versions as given in runtimeVersion

const typesSpec = {
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