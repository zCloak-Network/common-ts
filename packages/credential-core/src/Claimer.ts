// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  CTypeSchemaWithoutId,
  DidUri,
  IClaim,
  IClaimContents,
  ICType,
  ICTypeSchema
} from '@kiltprotocol/types';

import { Attestation, Claim, Credential, CType, RequestForAttestation } from '@kiltprotocol/sdk-js';

import { Dids } from './Dids';

export class Claimer extends Dids {
  public generateClaim(
    ctypeInput: ICType | CTypeSchemaWithoutId | ICTypeSchema,
    claimContents: IClaimContents
  ): Claim {
    const ctype = CType.isICType(ctypeInput)
      ? CType.fromCType(ctypeInput)
      : CType.fromSchema(ctypeInput);

    return Claim.fromCTypeAndClaimContents(ctype, claimContents, this.didDetails.uri);
  }

  public generateCredential(
    requestForAttestation: RequestForAttestation,
    attesterUri: DidUri
  ): Credential {
    return Credential.fromRequestAndAttestation(
      requestForAttestation,
      Attestation.fromRequestAndDid(requestForAttestation, attesterUri)
    );
  }

  public async requestForAttestation(claim: IClaim): Promise<RequestForAttestation> {
    const requestForAttestation = RequestForAttestation.fromClaim(claim);

    if (this.keystore.siningPair.isLocked) {
      return requestForAttestation;
    }

    return requestForAttestation.signWithDidKey(
      this.keystore,
      this.didDetails,
      this.didDetails.authenticationKey.id
    );
  }
}
