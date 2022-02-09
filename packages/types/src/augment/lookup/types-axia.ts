// Auto-generated via `yarn axia-types-from-defs`, do not edit
/* eslint-disable */

import type { Compact, Enum, Null, Struct, U8aFixed, Vec, u16, u32 } from '@axia-js/types';
import type { PerU16 } from '@axia-js/types/interfaces/runtime';
import type { ITuple } from '@axia-js/types/types';

declare module '@axia-js/types/lookup' {

  /** @name AxiaaxcRuntimeCommonClaimsEthereumAddress (66) */
  export interface AxiaaxcRuntimeCommonClaimsEthereumAddress extends U8aFixed {}

  /** @name AxiaaxcRuntimeProxyType (72) */
  export interface AxiaaxcRuntimeProxyType extends Enum {
    readonly isAny: boolean;
    readonly isNonTransfer: boolean;
    readonly isGovernance: boolean;
    readonly isStaking: boolean;
    readonly isUnused4: boolean;
    readonly isIdentityJudgement: boolean;
    readonly isCancelProxy: boolean;
  }

  /** @name AxiaaxcRuntimeSessionKeys (139) */
  export interface AxiaaxcRuntimeSessionKeys extends Struct {
    readonly grandpa: SpFinalityGrandpaAppPublic;
    readonly babe: SpConsensusBabeAppPublic;
    readonly imOnline: PalletImOnlineSr25519AppSr25519Public;
    readonly paraValidator: AxiaaxcPrimitivesV0ValidatorAppPublic;
    readonly paraAssignment: AxiaaxcPrimitivesV1AssignmentAppPublic;
    readonly authorityDiscovery: SpAuthorityDiscoveryAppPublic;
  }

  /** @name AxiaaxcPrimitivesV0ValidatorAppPublic (140) */
  export interface AxiaaxcPrimitivesV0ValidatorAppPublic extends SpCoreSr25519Public {}

  /** @name AxiaaxcPrimitivesV1AssignmentAppPublic (141) */
  export interface AxiaaxcPrimitivesV1AssignmentAppPublic extends SpCoreSr25519Public {}

  /** @name AxiaaxcRuntimeCommonClaimsEcdsaSignature (175) */
  export interface AxiaaxcRuntimeCommonClaimsEcdsaSignature extends U8aFixed {}

  /** @name AxiaaxcRuntimeCommonClaimsStatementKind (180) */
  export interface AxiaaxcRuntimeCommonClaimsStatementKind extends Enum {
    readonly isRegular: boolean;
    readonly isSaft: boolean;
  }

  /** @name AxiaaxcRuntimeNposCompactSolution16 (233) */
  export interface AxiaaxcRuntimeNposCompactSolution16 extends Struct {
    readonly votes1: Vec<ITuple<[Compact<u32>, Compact<u16>]>>;
    readonly votes2: Vec<ITuple<[Compact<u32>, ITuple<[Compact<u16>, Compact<PerU16>]>, Compact<u16>]>>;
    readonly votes3: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes4: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes5: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes6: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes7: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes8: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes9: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes10: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes11: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes12: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes13: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes14: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes15: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
    readonly votes16: Vec<ITuple<[Compact<u32>, Vec<ITuple<[Compact<u16>, Compact<PerU16>]>>, Compact<u16>]>>;
  }

  /** @name AxiaaxcRuntimeOriginCaller (290) */
  export interface AxiaaxcRuntimeOriginCaller extends Enum {
    readonly isSystem: boolean;
    readonly asSystem: FrameSystemRawOrigin;
    readonly isUnused1: boolean;
    readonly isUnused2: boolean;
    readonly isVoid: boolean;
    readonly isUnused4: boolean;
    readonly isUnused5: boolean;
    readonly isUnused6: boolean;
    readonly isUnused7: boolean;
    readonly isUnused8: boolean;
    readonly isUnused9: boolean;
    readonly isUnused10: boolean;
    readonly isUnused11: boolean;
    readonly isUnused12: boolean;
    readonly isUnused13: boolean;
    readonly isUnused14: boolean;
    readonly isCouncil: boolean;
    readonly asCouncil: PalletCollectiveRawOrigin;
    readonly isTechnicalCommittee: boolean;
    readonly asTechnicalCommittee: PalletCollectiveRawOrigin;
  }

  /** @name AxiaaxcRuntimeCommonClaimsPrevalidateAttests (441) */
  export type AxiaaxcRuntimeCommonClaimsPrevalidateAttests = Null;

  /** @name AxiaaxcRuntimeRuntime (442) */
  export type AxiaaxcRuntimeRuntime = Null;

}
