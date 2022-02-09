"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proposals = proposals;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _rxjs = require("rxjs");

var _util = require("@axia-js/util");

var _index = require("../util/index.cjs");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isNewDepositors(depositors) {
  // Detect balance...
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return (0, _util.isFunction)(depositors[1].mul);
}

function parse(_ref) {
  let [proposals, images, optDepositors] = _ref;
  return proposals.filter((_ref2, index) => {
    var _optDepositors$index;

    let [,, proposer] = _ref2;
    return !!((_optDepositors$index = optDepositors[index]) !== null && _optDepositors$index !== void 0 && _optDepositors$index.isSome) && !proposer.isEmpty;
  }).map((_ref3, proposalIndex) => {
    let [index, imageHash, proposer] = _ref3;
    const depositors = optDepositors[proposalIndex].unwrap();
    return _objectSpread(_objectSpread({}, isNewDepositors(depositors) ? {
      balance: depositors[1],
      seconds: depositors[0]
    } : {
      balance: depositors[0],
      seconds: depositors[1]
    }), {}, {
      image: images[proposalIndex],
      imageHash,
      index,
      proposer
    });
  });
}

function proposals(instanceId, api) {
  return (0, _index.memo)(instanceId, () => {
    var _api$query$democracy, _api$query$democracy2;

    return (0, _util.isFunction)((_api$query$democracy = api.query.democracy) === null || _api$query$democracy === void 0 ? void 0 : _api$query$democracy.publicProps) && (0, _util.isFunction)((_api$query$democracy2 = api.query.democracy) === null || _api$query$democracy2 === void 0 ? void 0 : _api$query$democracy2.preimages) ? api.query.democracy.publicProps().pipe((0, _rxjs.switchMap)(proposals => proposals.length ? (0, _rxjs.combineLatest)([(0, _rxjs.of)(proposals), api.derive.democracy.preimages(proposals.map(_ref4 => {
      let [, hash] = _ref4;
      return hash;
    })), api.query.democracy.depositOf.multi(proposals.map(_ref5 => {
      let [index] = _ref5;
      return index;
    }))]) : (0, _rxjs.of)([[], [], []])), (0, _rxjs.map)(parse)) : (0, _rxjs.of)([]);
  });
}