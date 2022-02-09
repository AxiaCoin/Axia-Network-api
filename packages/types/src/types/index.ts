// Copyright 2017-2021 @axia-js/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

// augment the registry
import '@axia-js/types/augment';

export * from '../create/types';
export * from './calls';
export * from './codec';
export * from './definitions';
export * from './detect';
export * from './events';
export * from './extrinsic';
export * from './interfaces';
export * from './registry';

// used inside augmented definitions
export type { Observable } from 'rxjs';
