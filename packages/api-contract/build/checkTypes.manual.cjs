"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _api = require("@axia-js/api");

var _testingPairs = require("@axia-js/keyring/testingPairs");

var _incrementer = _interopRequireDefault(require("../test/contracts/ink/incrementer.json"));

var _index = require("./index.cjs");

// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
// Simple non-runnable checks to test type definitions in the editor itself
async function checkBlueprint(api, pairs) {
  const blueprint = new _index.BlueprintPromise(api, _incrementer.default, '0x1234'); // new style

  await blueprint.tx.new({
    gasLimit: 456,
    salt: '0x1234',
    value: 123
  }, 42).signAndSend(pairs.bob);
  await blueprint.tx.new({
    gasLimit: 456,
    value: 123
  }, 42).signAndSend(pairs.bob); // old style

  await blueprint.tx.new(123, 456, 42).signAndSend(pairs.bob);
}

async function checkContract(api, pairs) {
  const contract = new _index.ContractPromise(api, _incrementer.default, '0x1234'); // queries

  await contract.query.get(pairs.alice.address, {});
  await contract.query.get(pairs.alice.address, 0, 0); // execute

  await contract.tx.inc({
    gasLimit: 1234
  }, 123).signAndSend(pairs.eve);
  await contract.tx.inc(123, 456, 69).signAndSend(pairs.eve);
}

async function main() {
  const api = await _api.ApiPromise.create({
    hasher: data => data
  });
  const pairs = (0, _testingPairs.createTestPairs)(); // eslint-disable-next-line @typescript-eslint/no-floating-promises

  Promise.all([checkBlueprint(api, pairs), checkContract(api, pairs)]);
} // eslint-disable-next-line @typescript-eslint/unbound-method


main().catch(console.error);