"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _networks = require("@axia-js/networks");

var _util = require("@axia-js/util");

var _axialunar = _interopRequireDefault(require("./axialunar.cjs"));

var _axia = _interopRequireDefault(require("./axia.cjs"));

var _alphanet = _interopRequireDefault(require("./alphanet.cjs"));

// Copyright 2017-2021 @axia-js/types-known authors & contributors
// SPDX-License-Identifier: Apache-2.0
const allKnown = {
  axialunar: _axialunar.default,
  axia: _axia.default,
  alphanet: _alphanet.default
}; // testnets are not available in the networks map

const NET_EXTRA = {
  alphanet: {
    genesisHash: ['0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e']
  }
};
/** @internal */

function checkOrder(network, versions) {
  const ooo = versions.filter((curr, index) => {
    const prev = versions[index - 1];
    return index === 0 ? false : curr[0] <= prev[0] || curr[1] <= prev[1];
  });
  (0, _util.assert)(!ooo.length, () => `${network}: Mismatched upgrade ordering: ${(0, _util.stringify)(ooo)}`);
  return versions;
}
/** @internal */


function mapRaw(_ref) {
  let [network, versions] = _ref;
  const chain = _networks.selectableNetworks.find(n => n.network === network) || NET_EXTRA[network];
  (0, _util.assert)(chain, () => `Unable to find info for chain ${network}`);
  return {
    genesisHash: (0, _util.hexToU8a)(chain.genesisHash[0]),
    network,
    versions: checkOrder(network, versions).map(_ref2 => {
      let [blockNumber, specVersion] = _ref2;
      return {
        blockNumber: new _util.BN(blockNumber),
        specVersion: new _util.BN(specVersion)
      };
    })
  };
} // Type overrides for specific spec types & versions as given in runtimeVersion


const upgrades = Object.entries(allKnown).map(mapRaw);
var _default = upgrades;
exports.default = _default;