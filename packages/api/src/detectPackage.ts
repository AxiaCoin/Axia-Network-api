// Copyright 2017-2021 @axia-js/api authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { packageInfo as deriveInfo } from '@axia-js/api-derive/packageInfo';
import { packageInfo as coreInfo } from '@axia-js/rpc-core/packageInfo';
import { packageInfo as providerInfo } from '@axia-js/rpc-provider/packageInfo';
import { packageInfo as typesInfo } from '@axia-js/types/packageInfo';
import { packageInfo as knownInfo } from '@axia-js/types-known/packageInfo';
import { detectPackage } from '@axia-js/util';

import { packageInfo } from './packageInfo';

detectPackage(packageInfo, typeof __dirname !== 'undefined' && __dirname, [deriveInfo, coreInfo, providerInfo, typesInfo, knownInfo]);
