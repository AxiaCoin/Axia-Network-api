// Auto-generated via `yarn axia-types-from-defs`, do not edit
/* eslint-disable */

/* eslint-disable sort-keys */

import type { DefinitionsTypes } from '../../types';

export default {
  /**
   * Lookup66: axiaaxc_runtime_common::claims::EthereumAddress
   **/
  AxiaaxcRuntimeCommonClaimsEthereumAddress: '[u8;20]',
  /**
   * Lookup72: axiaaxc_runtime::ProxyType
   **/
  AxiaaxcRuntimeProxyType: {
    _enum: ['Any', 'NonTransfer', 'Governance', 'Staking', 'Unused4', 'IdentityJudgement', 'CancelProxy']
  },
  /**
   * Lookup139: axiaaxc_runtime::SessionKeys
   **/
  AxiaaxcRuntimeSessionKeys: {
    grandpa: 'SpFinalityGrandpaAppPublic',
    babe: 'SpConsensusBabeAppPublic',
    imOnline: 'PalletImOnlineSr25519AppSr25519Public',
    paraValidator: 'AxiaaxcPrimitivesV0ValidatorAppPublic',
    paraAssignment: 'AxiaaxcPrimitivesV1AssignmentAppPublic',
    authorityDiscovery: 'SpAuthorityDiscoveryAppPublic'
  },
  /**
   * Lookup140: axiaaxc_primitives::v0::validator_app::Public
   **/
  AxiaaxcPrimitivesV0ValidatorAppPublic: 'SpCoreSr25519Public',
  /**
   * Lookup141: axiaaxc_primitives::v1::assignment_app::Public
   **/
  AxiaaxcPrimitivesV1AssignmentAppPublic: 'SpCoreSr25519Public',
  /**
   * Lookup175: axiaaxc_runtime_common::claims::EcdsaSignature
   **/
  AxiaaxcRuntimeCommonClaimsEcdsaSignature: '[u8;65]',
  /**
   * Lookup180: axiaaxc_runtime_common::claims::StatementKind
   **/
  AxiaaxcRuntimeCommonClaimsStatementKind: {
    _enum: ['Regular', 'Saft']
  },
  /**
   * Lookup233: axiaaxc_runtime::NposCompactSolution16
   **/
  AxiaaxcRuntimeNposCompactSolution16: {
    votes1: 'Vec<(Compact<u32>,Compact<u16>)>',
    votes2: 'Vec<(Compact<u32>,(Compact<u16>,Compact<PerU16>),Compact<u16>)>',
    votes3: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);2],Compact<u16>)>',
    votes4: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);3],Compact<u16>)>',
    votes5: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);4],Compact<u16>)>',
    votes6: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);5],Compact<u16>)>',
    votes7: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);6],Compact<u16>)>',
    votes8: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);7],Compact<u16>)>',
    votes9: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);8],Compact<u16>)>',
    votes10: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);9],Compact<u16>)>',
    votes11: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);10],Compact<u16>)>',
    votes12: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);11],Compact<u16>)>',
    votes13: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);12],Compact<u16>)>',
    votes14: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);13],Compact<u16>)>',
    votes15: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);14],Compact<u16>)>',
    votes16: 'Vec<(Compact<u32>,[(Compact<u16>,Compact<PerU16>);15],Compact<u16>)>'
  },
  /**
   * Lookup290: axiaaxc_runtime::OriginCaller
   **/
  AxiaaxcRuntimeOriginCaller: {
    _enum: {
      system: 'FrameSystemRawOrigin',
      Unused1: 'Null',
      Unused2: 'Null',
      Void: 'SpCoreVoid',
      Unused4: 'Null',
      Unused5: 'Null',
      Unused6: 'Null',
      Unused7: 'Null',
      Unused8: 'Null',
      Unused9: 'Null',
      Unused10: 'Null',
      Unused11: 'Null',
      Unused12: 'Null',
      Unused13: 'Null',
      Unused14: 'Null',
      Council: 'PalletCollectiveRawOrigin',
      TechnicalCommittee: 'PalletCollectiveRawOrigin'
    }
  },
  /**
   * Lookup441: axiaaxc_runtime_common::claims::PrevalidateAttests<T>
   **/
  AxiaaxcRuntimeCommonClaimsPrevalidateAttests: 'Null',
  /**
   * Lookup442: axiaaxc_runtime::Runtime
   **/
  AxiaaxcRuntimeRuntime: 'Null'
} as DefinitionsTypes;
