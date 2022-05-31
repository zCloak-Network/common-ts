import type { BigNumberish } from '@ethersproject/bignumber';
import type { BytesLike } from '@ethersproject/bytes';

export interface RequestDetails {
  cType: BytesLike;
  fieldNames: BigNumberish[];
  programHash: BytesLike;
  attester: BytesLike;
}
