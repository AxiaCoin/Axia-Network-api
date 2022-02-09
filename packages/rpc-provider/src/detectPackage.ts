// Copyright 2017-2021 @axia-js/rpc-provider authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { packageInfo as typesInfo } from '@axia-js/types/packageInfo';
import { detectPackage } from '@axia-js/util';

import { packageInfo } from './packageInfo';

detectPackage(packageInfo, typeof __dirname !== 'undefined' && __dirname, [typesInfo]);
