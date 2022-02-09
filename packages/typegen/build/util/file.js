// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
import fs from 'fs';
import path from 'path';
export function writeFile(dest, generator, noLog) {
  !noLog && console.log(`${dest}\n\tGenerating`);
  let generated = generator();

  while (generated.includes('\n\n\n')) {
    generated = generated.replace(/\n\n\n/g, '\n\n');
  }

  !noLog && console.log('\tWriting');
  fs.writeFileSync(dest, generated, {
    flag: 'w'
  });
  !noLog && console.log('');
}
export function readTemplate(template) {
  return fs.readFileSync(path.join(__dirname, `../templates/${template}.hbs`)).toString();
}