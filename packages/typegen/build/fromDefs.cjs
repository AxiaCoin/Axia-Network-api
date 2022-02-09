"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = main;

var _path = _interopRequireDefault(require("path"));

var _yargs = _interopRequireDefault(require("yargs"));

var axlibDefs = _interopRequireWildcard(require("@axia-js/types/interfaces/definitions"));

var _interfaceRegistry = require("./generate/interfaceRegistry.cjs");

var _tsDef = require("./generate/tsDef.cjs");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
function main() {
  const {
    input,
    package: pkg
  } = _yargs.default.strict().options({
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
  }).argv; // eslint-disable-next-line @typescript-eslint/no-var-requires


  const userDefs = require(_path.default.join(process.cwd(), input, 'definitions.ts'));

  const userKeys = Object.keys(userDefs);
  const filteredBase = Object.entries(axlibDefs).filter(_ref => {
    let [key] = _ref;

    if (userKeys.includes(key)) {
      console.warn(`Override found for ${key} in user types, ignoring in @axia-js/types`);
      return false;
    }

    return true;
  }).reduce((defs, _ref2) => {
    let [key, value] = _ref2;
    defs[key] = value;
    return defs;
  }, {});
  const allDefs = {
    '@axia-js/types/interfaces': filteredBase,
    [pkg]: userDefs
  };
  (0, _tsDef.generateTsDef)(allDefs, _path.default.join(process.cwd(), input), pkg);
  (0, _interfaceRegistry.generateInterfaceTypes)(allDefs, _path.default.join(process.cwd(), input, 'augment-types.ts'));
}