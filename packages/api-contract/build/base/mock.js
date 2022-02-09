// Copyright 2017-2021 @axia-js/api-contract authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { TypeRegistry } from '@axia-js/types';
const registry = new TypeRegistry();
export const mockApi = {
  isConnected: true,
  registry,
  tx: {
    contracts: {
      instantiateWithCode: () => {
        throw new Error('mock');
      }
    }
  }
};