"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  compareName: true
};
exports.compareName = compareName;

var _derived = require("./derived.cjs");

Object.keys(_derived).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _derived[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _derived[key];
    }
  });
});

var _docs = require("./docs.cjs");

Object.keys(_docs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _docs[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _docs[key];
    }
  });
});

var _file = require("./file.cjs");

Object.keys(_file).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _file[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _file[key];
    }
  });
});

var _formatting = require("./formatting.cjs");

Object.keys(_formatting).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _formatting[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _formatting[key];
    }
  });
});

var _imports = require("./imports.cjs");

Object.keys(_imports).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _imports[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _imports[key];
    }
  });
});

var _initMeta = require("./initMeta.cjs");

Object.keys(_initMeta).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _initMeta[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _initMeta[key];
    }
  });
});

var _register = require("./register.cjs");

Object.keys(_register).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _register[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _register[key];
    }
  });
});

// Copyright 2017-2021 @axia-js/typegen authors & contributors
// SPDX-License-Identifier: Apache-2.0
function compareName(a, b) {
  return a.name.toString().localeCompare(b.name.toString());
}