import _classPrivateFieldLooseBase from "@babel/runtime/helpers/esm/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/esm/classPrivateFieldLooseKey";
// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert } from '@axia-js/util';
import { Struct } from "../codec/index.js";
import { toV10 } from "./v9/toV10.js";
import { toV11 } from "./v10/toV11.js";
import { toV12 } from "./v11/toV12.js";
import { toV13 } from "./v12/toV13.js";
import { toV14 } from "./v13/toV14.js";
import { toLatest } from "./v14/toLatest.js";
import { MagicNumber } from "./MagicNumber.js";
import { getUniqTypes, toCallsOnly } from "./util/index.js";
const LATEST_VERSION = 14;
/**
 * @name MetadataVersioned
 * @description
 * The versioned runtime metadata as a decoded structure
 */

var _converted = /*#__PURE__*/_classPrivateFieldLooseKey("converted");

var _assertVersion = /*#__PURE__*/_classPrivateFieldLooseKey("assertVersion");

var _getVersion = /*#__PURE__*/_classPrivateFieldLooseKey("getVersion");

var _metadata = /*#__PURE__*/_classPrivateFieldLooseKey("metadata");

export class MetadataVersioned extends Struct {
  constructor(registry, value) {
    super(registry, {
      magicNumber: MagicNumber,
      metadata: 'MetadataAll'
    }, value);
    Object.defineProperty(this, _converted, {
      writable: true,
      value: new Map()
    });
    Object.defineProperty(this, _assertVersion, {
      writable: true,
      value: version => {
        assert(this.version <= version, () => `Cannot convert metadata from version ${this.version} to ${version}`);
        return this.version === version;
      }
    });
    Object.defineProperty(this, _getVersion, {
      writable: true,
      value: (version, fromPrev) => {
        const asCurr = `asV${version}`;
        const asPrev = version === 'latest' ? `asV${LATEST_VERSION}` : `asV${version - 1}`;

        if (version !== 'latest' && _classPrivateFieldLooseBase(this, _assertVersion)[_assertVersion](version)) {
          return _classPrivateFieldLooseBase(this, _metadata)[_metadata]()[asCurr];
        }

        if (!_classPrivateFieldLooseBase(this, _converted)[_converted].has(version)) {
          _classPrivateFieldLooseBase(this, _converted)[_converted].set(version, fromPrev(this.registry, this[asPrev], this.version));
        }

        return _classPrivateFieldLooseBase(this, _converted)[_converted].get(version);
      }
    });
    Object.defineProperty(this, _metadata, {
      writable: true,
      value: () => {
        return this.get('metadata');
      }
    });
  }

  /**
   * @description Returns the wrapped metadata as a limited calls-only (latest) version
   */
  get asCallsOnly() {
    return new MetadataVersioned(this.registry, {
      magicNumber: this.magicNumber,
      metadata: this.registry.createType('MetadataAll', toCallsOnly(this.registry, this.asLatest), LATEST_VERSION)
    });
  }
  /**
   * @description Returns the wrapped metadata as a V9 object
   */


  get asV9() {
    _classPrivateFieldLooseBase(this, _assertVersion)[_assertVersion](9);

    return _classPrivateFieldLooseBase(this, _metadata)[_metadata]().asV9;
  }
  /**
   * @description Returns the wrapped values as a V10 object
   */


  get asV10() {
    return _classPrivateFieldLooseBase(this, _getVersion)[_getVersion](10, toV10);
  }
  /**
   * @description Returns the wrapped values as a V11 object
   */


  get asV11() {
    return _classPrivateFieldLooseBase(this, _getVersion)[_getVersion](11, toV11);
  }
  /**
   * @description Returns the wrapped values as a V12 object
   */


  get asV12() {
    return _classPrivateFieldLooseBase(this, _getVersion)[_getVersion](12, toV12);
  }
  /**
   * @description Returns the wrapped values as a V13 object
   */


  get asV13() {
    return _classPrivateFieldLooseBase(this, _getVersion)[_getVersion](13, toV13);
  }
  /**
   * @description Returns the wrapped values as a V14 object
   */


  get asV14() {
    return _classPrivateFieldLooseBase(this, _getVersion)[_getVersion](14, toV14);
  }
  /**
   * @description Returns the wrapped values as a latest version object
   */


  get asLatest() {
    return _classPrivateFieldLooseBase(this, _getVersion)[_getVersion]('latest', toLatest);
  }
  /**
   * @description The magicNumber for the Metadata (known constant)
   */


  get magicNumber() {
    return this.get('magicNumber');
  }
  /**
   * @description the metadata version this structure represents
   */


  get version() {
    return _classPrivateFieldLooseBase(this, _metadata)[_metadata]().index;
  }

  getUniqTypes(throwError) {
    return getUniqTypes(this.registry, this.asLatest, throwError);
  }
  /**
   * @description Converts the Object to JSON, typically used for RPC transfers
   */


  toJSON() {
    // HACK(y): ensure that we apply the aliases if we have not done so already, this is
    // needed to ensure we have the correct overrides (which is only applied in toLatest)
    // eslint-disable-next-line no-unused-expressions
    this.asLatest;
    return super.toJSON();
  }

}