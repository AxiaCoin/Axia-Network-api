"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
// Copyright 2017-2021 @axia-js/types-known authors & contributors
// SPDX-License-Identifier: Apache-2.0
// type overrides for modules (where duplication between modules exist)
const typesModules = {
  assets: {
    Approval: 'AssetApproval',
    ApprovalKey: 'AssetApprovalKey',
    Balance: 'TAssetBalance',
    DestroyWitness: 'AssetDestroyWitness'
  },
  babe: {
    EquivocationProof: 'BabeEquivocationProof'
  },
  balances: {
    Status: 'BalanceStatus'
  },
  beefy: {
    AuthorityId: 'BeefyId'
  },
  contracts: {
    StorageKey: 'ContractStorageKey'
  },
  electionProviderMultiPhase: {
    Phase: 'ElectionPhase'
  },
  ethereum: {
    Block: 'EthBlock',
    Header: 'EthHeader',
    Receipt: 'EthReceipt',
    Transaction: 'EthTransaction',
    TransactionStatus: 'EthTransactionStatus'
  },
  evm: {
    Account: 'EvmAccount',
    Log: 'EvmLog',
    Vicinity: 'EvmVicinity'
  },
  grandpa: {
    Equivocation: 'GrandpaEquivocation',
    EquivocationProof: 'GrandpaEquivocationProof'
  },
  identity: {
    Judgement: 'IdentityJudgement'
  },
  inclusion: {
    ValidatorIndex: 'ParaValidatorIndex'
  },
  paraDisputes: {
    ValidatorIndex: 'ParaValidatorIndex'
  },
  paraInclusion: {
    ValidatorIndex: 'ParaValidatorIndex'
  },
  paraScheduler: {
    ValidatorIndex: 'ParaValidatorIndex'
  },
  paraShared: {
    ValidatorIndex: 'ParaValidatorIndex'
  },
  allychains: {
    Id: 'ParaId'
  },
  parasDisputes: {
    ValidatorIndex: 'ParaValidatorIndex'
  },
  parasInclusion: {
    ValidatorIndex: 'ParaValidatorIndex'
  },
  parasScheduler: {
    ValidatorIndex: 'ParaValidatorIndex'
  },
  parasShared: {
    ValidatorIndex: 'ParaValidatorIndex'
  },
  proposeAllychain: {
    Proposal: 'AllychainProposal'
  },
  proxy: {
    Announcement: 'ProxyAnnouncement'
  },
  scheduler: {
    ValidatorIndex: 'ParaValidatorIndex'
  },
  shared: {
    ValidatorIndex: 'ParaValidatorIndex'
  },
  society: {
    Judgement: 'SocietyJudgement',
    Vote: 'SocietyVote'
  },
  staking: {
    Compact: 'CompactAssignments'
  },
  treasury: {
    Proposal: 'TreasuryProposal'
  },
  xcm: {
    AssetId: 'XcmAssetId'
  },
  xcmPallet: {
    AssetId: 'XcmAssetId'
  }
};
var _default = typesModules;
exports.default = _default;