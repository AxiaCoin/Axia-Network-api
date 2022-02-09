"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = main;

var _path = _interopRequireDefault(require("path"));

var _yargs = _interopRequireDefault(require("yargs"));

var _util = require("@axia-js/util");

var _xWs = require("@axia-js/x-ws");

var _index = require("./generate/index.cjs");

var _index2 = require("./util/index.cjs");

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
function generate(metaHex, pkg, output, isStrict) {
  console.log(`Generating from metadata, ${(0, _util.formatNumber)((metaHex.length - 2) / 2)} bytes`);
  const extraTypes = pkg // eslint-disable-next-line @typescript-eslint/no-var-requires
  ? {
    [pkg]: require(_path.default.join(process.cwd(), output, 'definitions'))
  } : {};
  (0, _index.generateDefaultConsts)(_path.default.join(process.cwd(), output, 'augment-api-consts.ts'), metaHex, extraTypes, isStrict);
  (0, _index.generateDefaultErrors)(_path.default.join(process.cwd(), output, 'augment-api-errors.ts'), metaHex, extraTypes, isStrict);
  (0, _index.generateDefaultEvents)(_path.default.join(process.cwd(), output, 'augment-api-events.ts'), metaHex, extraTypes, isStrict);
  (0, _index.generateDefaultQuery)(_path.default.join(process.cwd(), output, 'augment-api-query.ts'), metaHex, extraTypes, isStrict);
  (0, _index.generateDefaultRpc)(_path.default.join(process.cwd(), output, 'augment-api-rpc.ts'), extraTypes);
  (0, _index.generateDefaultTx)(_path.default.join(process.cwd(), output, 'augment-api-tx.ts'), metaHex, extraTypes, isStrict);
  (0, _index2.writeFile)(_path.default.join(process.cwd(), output, 'augment-api.ts'), () => [(0, _index2.HEADER)('chain'), ...['@axia-js/api/augment/rpc', ...['consts', 'errors', 'events', 'query', 'tx', 'rpc'].filter(key => !!key).map(key => `./augment-api-${key}`)].map(path => `import '${path}';\n`)].join(''));
  process.exit(0);
}

function main() {
  const {
    endpoint,
    output,
    package: pkg,
    strict: isStrict
  } = _yargs.default.strict().options({
    endpoint: {
      description: 'The endpoint to connect to (e.g. wss://axialunar-rpc.axia.io) or relative path to a file containing the JSON output of an RPC state_getMetadata call',
      required: true,
      type: 'string'
    },
    output: {
      description: 'The target directory to write the data to',
      required: true,
      type: 'string'
    },
    package: {
      description: 'Optional package in output location (for extra definitions)',
      type: 'string'
    },
    strict: {
      description: 'Turns on strict mode, no output of catch-all generic versions',
      type: 'boolean'
    }
  }).argv;

  if (endpoint.startsWith('wss://') || endpoint.startsWith('ws://')) {
    try {
      const websocket = new _xWs.WebSocket(endpoint);

      websocket.onclose = event => {
        console.error(`disconnected, code: '${event.code}' reason: '${event.reason}'`);
        process.exit(1);
      };

      websocket.onerror = event => {
        console.error(event);
        process.exit(1);
      };

      websocket.onopen = () => {
        console.log('connected');
        websocket.send('{"id":"1","jsonrpc":"2.0","method":"state_getMetadata","params":[]}');
      };

      websocket.onmessage = message => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        generate(JSON.parse(message.data).result, pkg, output, isStrict);
      };
    } catch (error) {
      process.exit(1);
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-member-access
    generate(require(_path.default.join(process.cwd(), endpoint)).result, pkg, output, isStrict);
  }
}