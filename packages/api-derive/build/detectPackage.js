// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { packageInfo as apiInfo } from '@axia-js/api/packageInfo';
import { packageInfo as coreInfo } from '@axia-js/rpc-core/packageInfo';
import { packageInfo as typesInfo } from '@axia-js/types/packageInfo';
import { detectPackage } from '@axia-js/util';
import { packageInfo } from "./packageInfo.js";
detectPackage(packageInfo, typeof __dirname !== 'undefined' && __dirname, [apiInfo, coreInfo, typesInfo]);