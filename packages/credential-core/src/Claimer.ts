import type { LightDidDetails } from '@kiltprotocol/did';
import type {
  CTypeSchemaWithoutId,
  IClaim,
  IClaimContents,
  ICType,
  ICTypeSchema,
  IEncryptedMessage,
  IMessage
} from '@kiltprotocol/types';

import {
  Attestation,
  Claim,
  connect,
  Credential,
  CType,
  Did,
  EncryptionKeyType,
  init,
  Message,
  RequestForAttestation,
  VerificationKeyType
} from '@kiltprotocol/sdk-js';
import { assert } from '@polkadot/util';

import { DidKeystore, MessageHelper, WithPassphrase } from './types';

export class Claimer implements MessageHelper, WithPassphrase {
  #keystore: DidKeystore;
  #isReadyPromise: Promise<this>;
  public didDetails: LightDidDetails;

  constructor(keystore: DidKeystore, endpoint: string) {
    this.#keystore = keystore;

    this.didDetails = this.getLightDid(keystore);

    this.#isReadyPromise = new Promise((resolve) => {
      init({ address: endpoint })
        .then(connect)
        .then(() => resolve(this));
    });
  }

  public get isLocked(): boolean {
    return this.#keystore.isLocked;
  }

  public get isReady(): Promise<this> {
    return this.#isReadyPromise;
  }

  public getLightDid(keystore: DidKeystore) {
    return keystore.isLocked
      ? Did.LightDidDetails.fromIdentifier(this.#keystore.address)
      : Did.LightDidDetails.fromDetails({
          authenticationKey: {
            type: VerificationKeyType.Sr25519,
            publicKey: this.#keystore.publicKey
          },
          encryptionKey: {
            type: EncryptionKeyType.X25519,
            publicKey: this.#keystore.encryptPublicKey
          }
        });
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

  public lock(): void {
    this.#keystore.lock();
    this.didDetails = this.getLightDid(this.#keystore);
  }

  public unlock(passphrase?: string): void {
    this.#keystore.unlock(passphrase);
    this.didDetails = this.getLightDid(this.#keystore);
  }

  public encryptMessage(message: Message, receiverKeyId: string): Promise<IEncryptedMessage> {
    assert(!this.#keystore.isLocked, 'Keystore is locked');
    assert(this.didDetails.encryptionKey, 'No encryption key');

    return message.encrypt(
      this.didDetails.encryptionKey.id,
      this.didDetails,
      this.#keystore,
      receiverKeyId
    );
  }

  public decryptMessage(): Promise<IMessage> {
    throw new Error('The DID with the given identifier is not on chain.');
  }
}
