// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
import Handlebars from 'handlebars';
import { readTemplate } from "./file.js";
Handlebars.registerPartial({
  docs: Handlebars.compile(readTemplate('docs'))
});