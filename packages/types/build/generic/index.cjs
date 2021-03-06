"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  GenericAccountId: true,
  GenericAccountIndex: true,
  GenericBlock: true,
  GenericCall: true,
  GenericChainProperties: true,
  GenericConsensusEngineId: true,
  GenericEvent: true,
  GenericEventData: true,
  GenericLookupSource: true,
  GenericMultiAddress: true,
  GenericAddress: true,
  GenericPortableRegistry: true,
  GenericVote: true
};
Object.defineProperty(exports, "GenericAccountId", {
  enumerable: true,
  get: function () {
    return _AccountId.GenericAccountId;
  }
});
Object.defineProperty(exports, "GenericAccountIndex", {
  enumerable: true,
  get: function () {
    return _AccountIndex.GenericAccountIndex;
  }
});
Object.defineProperty(exports, "GenericAddress", {
  enumerable: true,
  get: function () {
    return _MultiAddress.GenericMultiAddress;
  }
});
Object.defineProperty(exports, "GenericBlock", {
  enumerable: true,
  get: function () {
    return _Block.GenericBlock;
  }
});
Object.defineProperty(exports, "GenericCall", {
  enumerable: true,
  get: function () {
    return _Call.GenericCall;
  }
});
Object.defineProperty(exports, "GenericChainProperties", {
  enumerable: true,
  get: function () {
    return _ChainProperties.GenericChainProperties;
  }
});
Object.defineProperty(exports, "GenericConsensusEngineId", {
  enumerable: true,
  get: function () {
    return _ConsensusEngineId.GenericConsensusEngineId;
  }
});
Object.defineProperty(exports, "GenericEvent", {
  enumerable: true,
  get: function () {
    return _Event.GenericEvent;
  }
});
Object.defineProperty(exports, "GenericEventData", {
  enumerable: true,
  get: function () {
    return _Event.GenericEventData;
  }
});
Object.defineProperty(exports, "GenericLookupSource", {
  enumerable: true,
  get: function () {
    return _LookupSource.GenericLookupSource;
  }
});
Object.defineProperty(exports, "GenericMultiAddress", {
  enumerable: true,
  get: function () {
    return _MultiAddress.GenericMultiAddress;
  }
});
Object.defineProperty(exports, "GenericPortableRegistry", {
  enumerable: true,
  get: function () {
    return _PortableRegistry.GenericPortableRegistry;
  }
});
Object.defineProperty(exports, "GenericVote", {
  enumerable: true,
  get: function () {
    return _Vote.GenericVote;
  }
});

var _index = require("../ethereum/index.cjs");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _index[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index[key];
    }
  });
});

var _AccountId = require("./AccountId.cjs");

var _AccountIndex = require("./AccountIndex.cjs");

var _Block = require("./Block.cjs");

var _Call = require("./Call.cjs");

var _ChainProperties = require("./ChainProperties.cjs");

var _ConsensusEngineId = require("./ConsensusEngineId.cjs");

var _Event = require("./Event.cjs");

var _LookupSource = require("./LookupSource.cjs");

var _MultiAddress = require("./MultiAddress.cjs");

var _PortableRegistry = require("./PortableRegistry.cjs");

var _Vote = require("./Vote.cjs");