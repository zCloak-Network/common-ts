import type {
  CTypeSchemaWithoutId,
  IClaim,
  IClaimContents,
  ICType,
  ICTypeSchema
} from '@kiltprotocol/types';

import { LightDidDetails } from '@kiltprotocol/did';
import {
  Attestation,
  Claim,
  connect,
  Credential,
  CType,
  Did,
  EncryptionKeyType,
  init,
  RequestForAttestation,
  VerificationKeyType
} from '@kiltprotocol/sdk-js';

import { DidKeystore } from './types';

export class Claimer {
  #keystore: DidKeystore;
  #isReadyPromise: Promise<this>;

  constructor(keystore: DidKeystore, endpoint: string) {
    this.#keystore = keystore;

    this.#isReadyPromise = new Promise((resolve) => {
      init({ address: endpoint })
        .then(connect)
        .then(() => resolve(this));
    });
  }

  public get isReady(): Promise<this> {
    return this.#isReadyPromise;
  }

  public get didDetails(): LightDidDetails {
    if (!this.#keystore.isLocked) {
      return Did.LightDidDetails.fromDetails({
        authenticationKey: {
          type: VerificationKeyType.Sr25519,
          publicKey: this.#keystore.publicKey
        },
        encryptionKey: {
          type: EncryptionKeyType.X25519,
          publicKey: this.#keystore.encryptPublicKey
        }
      });
    } else {
      return Did.LightDidDetails.fromIdentifier(this.#keystore.address);
    }
  }

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

    if (!this.#keystore.isLocked) {
      return requestForAttestation.signWithDidKey(
        this.#keystore,
        this.didDetails,
        this.didDetails.authenticationKey.id
      );
    }

    return requestForAttestation;
  }
}
