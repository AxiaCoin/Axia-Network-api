// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { packageInfo as knownInfo } from '@axia-js/types-known/packageInfo';
import { detectPackage } from '@axia-js/util';

import { packageInfo } from './packageInfo';

detectPackage(packageInfo, typeof __dirname !== 'undefined' && __dirname, [knownInfo]);
