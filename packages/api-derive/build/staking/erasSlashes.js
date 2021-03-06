// Copyright 2017-2021 @axia-js/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { combineLatest, map, of, switchMap } from 'rxjs';
import { deriveCache, memo } from "../util/index.js";
const CACHE_KEY = 'eraSlashes';

function mapSlashes(era, noms, vals) {
  const nominators = {};
  const validators = {};
  noms.forEach(([key, optBalance]) => {
    nominators[key.args[1].toString()] = optBalance.unwrap();
  });
  vals.forEach(([key, optRes]) => {
    validators[key.args[1].toString()] = optRes.unwrapOrDefault()[1];
  });
  return {
    era,
    nominators,
    validators
  };
}

export function _eraSlashes(instanceId, api) {
  return memo(instanceId, (era, withActive) => {
    const cacheKey = `${CACHE_KEY}-${era.toString()}`;
    const cached = withActive ? undefined : deriveCache.get(cacheKey);
    return cached ? of(cached) : combineLatest([api.query.staking.nominatorSlashInEra.entries(era), api.query.staking.validatorSlashInEra.entries(era)]).pipe(map(([noms, vals]) => {
      const value = mapSlashes(era, noms, vals);
      !withActive && deriveCache.set(cacheKey, value);
      return value;
    }));
  });
}
export function eraSlashes(instanceId, api) {
  return memo(instanceId, era => api.derive.staking._eraSlashes(era, true));
}
export function _erasSlashes(instanceId, api) {
  return memo(instanceId, (eras, withActive) => eras.length ? combineLatest(eras.map(era => api.derive.staking._eraSlashes(era, withActive))) : of([]));
}
export function erasSlashes(instanceId, api) {
  return memo(instanceId, (withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._erasSlashes(eras, withActive))));
}