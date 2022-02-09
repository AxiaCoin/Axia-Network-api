"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _handlebars = _interopRequireDefault(require("handlebars"));

var _file = require("./file.cjs");

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
_handlebars.default.registerPartial({
  docs: _handlebars.default.compile((0, _file.readTemplate)('docs'))
});