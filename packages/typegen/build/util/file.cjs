"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readTemplate = readTemplate;
exports.writeFile = writeFile;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
function writeFile(dest, generator, noLog) {
  !noLog && console.log(`${dest}\n\tGenerating`);
  let generated = generator();

  while (generated.includes('\n\n\n')) {
    generated = generated.replace(/\n\n\n/g, '\n\n');
  }

  !noLog && console.log('\tWriting');

  _fs.default.writeFileSync(dest, generated, {
    flag: 'w'
  });

  !noLog && console.log('');
}

function readTemplate(template) {
  return _fs.default.readFileSync(_path.default.join(__dirname, `../templates/${template}.hbs`)).toString();
}