"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.allExtensions = void 0;
exports.expandExtensionTypes = expandExtensionTypes;
exports.fallbackExtensions = void 0;
exports.findUnknownExtensions = findUnknownExtensions;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _axia = require("./axia.cjs");

var _shell = require("./shell.cjs");

var _statemint = require("./statemint.cjs");

var _axlib = require("./axlib.cjs");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// A mapping of the known signed extensions to the extra fields that they contain. Unlike in the actual extensions,
// we define the extra fields not as a Tuple, but rather as a struct so they can be named. These will be expanded
// into the various fields when added to the payload (we only support V4 onwards with these, V3 and earlier are
// deemed fixed and non-changeable)
const allExtensions = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, _axlib.axlib), _axia.axia), _shell.shell), _statemint.statemint); // the v4 signed extensions prior to the point of exposing these to the metadata.
// This may not match 100% with the current defaults and are used when not specified
// in the metadata (which is for very old chains). The order is important here, as
// applied by default


exports.allExtensions = allExtensions;
const fallbackExtensions = ['CheckVersion', 'CheckGenesis', 'CheckEra', 'CheckNonce', 'CheckWeight', 'ChargeTransactionPayment', 'CheckBlockGasLimit'];
exports.fallbackExtensions = fallbackExtensions;

function findUnknownExtensions(extensions) {
  let userExtensions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const names = [...Object.keys(allExtensions), ...Object.keys(userExtensions)];
  return extensions.filter(key => !names.includes(key));
}

function expandExtensionTypes(extensions, type) {
  let userExtensions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return extensions // Always allow user extensions first - these should provide overrides
  .map(key => userExtensions[key] || allExtensions[key]).filter(info => !!info).reduce((result, info) => _objectSpread(_objectSpread({}, result), info[type]), {});
}