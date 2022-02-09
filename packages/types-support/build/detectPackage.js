// Copyright 2017-2021 @axia-js/types-support authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { detectPackage } from '@axia-js/util';
import { packageInfo } from "./packageInfo.js";
detectPackage(packageInfo, typeof __dirname !== 'undefined' && __dirname, []);