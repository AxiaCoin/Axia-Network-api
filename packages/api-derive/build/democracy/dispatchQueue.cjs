"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dispatchQueue = dispatchQueue;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _rxjs = require("rxjs");

var _util = require("@axia-js/util");

var _index = require("../util/index.cjs");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const DEMOCRACY_ID = (0, _util.stringToHex)('democrac');

function queryQueue(api) {
  return api.query.democracy.dispatchQueue().pipe((0, _rxjs.switchMap)(dispatches => (0, _rxjs.combineLatest)([(0, _rxjs.of)(dispatches), api.derive.democracy.preimages(dispatches.map(_ref => {
    let [, hash] = _ref;
    return hash;
  }))])), (0, _rxjs.map)(_ref2 => {
    let [dispatches, images] = _ref2;
    return dispatches.map((_ref3, dispatchIndex) => {
      let [at, imageHash, index] = _ref3;
      return {
        at,
        image: images[dispatchIndex],
        imageHash,
        index
      };
    });
  }));
}

function schedulerEntries(api) {
  // We don't get entries, but rather we get the keys (triggered via finished referendums) and
  // the subscribe to those keys - this means we pickup when the schedulers actually executes
  // at a block, the entry for that block will become empty
  return api.derive.democracy.referendumsFinished().pipe((0, _rxjs.switchMap)(() => api.query.scheduler.agenda.keys()), (0, _rxjs.switchMap)(keys => {
    const blockNumbers = keys.map(_ref4 => {
      let {
        args: [blockNumber]
      } = _ref4;
      return blockNumber;
    });
    return blockNumbers.length ? (0, _rxjs.combineLatest)([(0, _rxjs.of)(blockNumbers), // this should simply be api.query.scheduler.agenda.multi<Vec<Option<Scheduled>>>,
    // however we have had cases on Darwinia where the indices have moved around after an
    // upgrade, which results in invalid on-chain data
    (0, _rxjs.combineLatest)(blockNumbers.map(blockNumber => api.query.scheduler.agenda(blockNumber).pipe( // this does create an issue since it discards all at that block
    (0, _rxjs.catchError)(() => (0, _rxjs.of)(null)))))]) : (0, _rxjs.of)([[], []]);
  }));
}

function queryScheduler(api) {
  return schedulerEntries(api).pipe((0, _rxjs.switchMap)(_ref5 => {
    let [blockNumbers, agendas] = _ref5;
    const result = [];
    blockNumbers.forEach((at, index) => {
      (agendas[index] || []).filter(opt => opt.isSome).forEach(optScheduled => {
        const scheduled = optScheduled.unwrap();

        if (scheduled.maybeId.isSome) {
          const id = scheduled.maybeId.unwrap().toHex();

          if (id.startsWith(DEMOCRACY_ID)) {
            const [, index] = api.registry.createType('(u64, ReferendumIndex)', id);
            const imageHash = scheduled.call.args[0];
            result.push({
              at,
              imageHash,
              index
            });
          }
        }
      });
    });
    return result.length ? (0, _rxjs.combineLatest)([(0, _rxjs.of)(result), api.derive.democracy.preimages(result.map(_ref6 => {
      let {
        imageHash
      } = _ref6;
      return imageHash;
    }))]) : (0, _rxjs.of)([[], []]);
  }), (0, _rxjs.map)(_ref7 => {
    let [infos, images] = _ref7;
    return infos.map((info, index) => _objectSpread(_objectSpread({}, info), {}, {
      image: images[index]
    }));
  }));
}

function dispatchQueue(instanceId, api) {
  return (0, _index.memo)(instanceId, () => {
    var _api$query$scheduler;

    return (0, _util.isFunction)((_api$query$scheduler = api.query.scheduler) === null || _api$query$scheduler === void 0 ? void 0 : _api$query$scheduler.agenda) ? queryScheduler(api) : api.query.democracy.dispatchQueue ? queryQueue(api) : (0, _rxjs.of)([]);
  });
}