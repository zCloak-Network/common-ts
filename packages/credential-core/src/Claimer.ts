import type {
  CTypeSchemaWithoutId,
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

    return Claim.fromCTypeAndClaimContents(ctype, claimContents, this.didDetails.did);
  }

  public generateCredential(
    requestForAttestation: RequestForAttestation,
    attesterDid: string
  ): Credential {
    return Credential.fromRequestAndAttestation(
      requestForAttestation,
      Attestation.fromRequestAndDid(requestForAttestation, attesterDid)
    );
  }

  public async requestForAttestation(claim: IClaim): Promise<RequestForAttestation> {
    const requestForAttestation = RequestForAttestation.fromClaim(claim);

    if (!this.keystore.isLocked) {
      return requestForAttestation.signWithDidKey(
        this.keystore,
        this.didDetails,
        this.didDetails.authenticationKey.id
      );
    }

    return requestForAttestation;
  }
}
