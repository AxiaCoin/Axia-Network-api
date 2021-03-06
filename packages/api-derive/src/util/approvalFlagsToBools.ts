// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Vec } from '@axia-js/types';
import type { ApprovalFlag } from '@axia-js/types/interfaces/elections';

/** @internal */
export function approvalFlagsToBools (flags: Vec<ApprovalFlag> | ApprovalFlag[]): boolean[] {
  const bools: boolean[] = [];

  flags.forEach((flag: ApprovalFlag): void => {
    const str = flag.toString(2);

    // read from lowest bit to highest
    for (const bit of str.split('').reverse()) {
      bools.push(!!parseInt(bit, 10));
    }
  });

  // slice off trailing "false" values, as in axlib
  const lastApproval = bools.lastIndexOf(true);

  return lastApproval >= 0
    ? bools.slice(0, lastApproval + 1)
    : [];
}
