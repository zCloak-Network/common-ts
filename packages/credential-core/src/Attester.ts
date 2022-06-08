import type {
  FullDidCreationBuilder,
  FullDidDetails,
  FullDidUpdateBuilder,
  LightDidDetails
} from '@kiltprotocol/did';
import type { IEncryptedMessage, IRequestForAttestation } from '@kiltprotocol/types';

import {
  Attestation,
  BlockchainUtils,
  connect,
  Did,
  EncryptionKeyType,
  IMessage,
  init,
  Message,
  VerificationKeyType
} from '@kiltprotocol/sdk-js';
import { ApiPromise } from '@polkadot/api';
import { assert } from '@polkadot/util';

import { DidKeystore, MessageHelper, WithPassphrase } from './types';

export class Attester implements MessageHelper, WithPassphrase {
  #keystore: DidKeystore;
  #isReadyPromise: Promise<this>;
  #api?: ApiPromise;
  public didDetails: LightDidDetails;

  constructor(keystore: DidKeystore, endpoint: string) {
    this.#keystore = keystore;

    this.didDetails = this.getLightDid(keystore);

    this.#isReadyPromise = new Promise((resolve) => {
      init({ address: endpoint })
        .then(connect)
        .then(({ api }) => {
          this.#api = api;
          resolve(this);
        });
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

  public getFullDidDetails(): Promise<FullDidDetails | null> {
    return Did.FullDidDetails.fromChainInfo(this.#keystore.address);
  }

  public createFullDid(
    action: (
      didCreationBuilder: FullDidCreationBuilder,
      keystore: DidKeystore
    ) => Promise<FullDidDetails>
  ): Promise<FullDidDetails> {
    assert(this.#api, 'Api is not ready');
    assert(!this.#keystore.isLocked, 'Keystore is locked');

    const creationBuilder = Did.FullDidCreationBuilder.fromLightDidDetails(
      this.#api,
      this.didDetails
    );

    return action(creationBuilder, this.#keystore);
  }

  public async updateFullDid(
    action: (
      didUpdateBuilder: FullDidUpdateBuilder,
      keystore: DidKeystore
    ) => Promise<FullDidDetails>
  ): Promise<FullDidDetails> {
    assert(this.#api, 'Api is not ready');
    assert(!this.#keystore.isLocked, 'Keystore is locked');

    const fullDid = await this.getFullDidDetails();

    assert(fullDid, 'The DID with the given identifier is not on chain.');

    const updateBuilder = new Did.FullDidUpdateBuilder(this.#api, fullDid);

    return action(updateBuilder, this.#keystore);
  }

  public async attestClaim(request: IRequestForAttestation) {
    const fullDid = await this.getFullDidDetails();

    assert(fullDid, 'The DID with the given identifier is not on chain.');

    const attestation = Attestation.fromRequestAndDid(request, fullDid.did);

    // form tx and authorized extrinsic
    const tx = await attestation.getStoreTx();
    const extrinsic = await fullDid.authorizeExtrinsic(tx, this.#keystore, this.#keystore.address);

    return BlockchainUtils.signAndSubmitTx(extrinsic, this.#keystore.siningPair, {
      resolveOn: BlockchainUtils.IS_FINALIZED,
      reSign: true
    });
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

  public async decryptMessage(encryptMessage: IEncryptedMessage): Promise<IMessage> {
    const fullDid = await this.getFullDidDetails();

    assert(fullDid, 'The DID with the given identifier is not on chain.');

    return Message.decrypt(encryptMessage, this.#keystore, fullDid);
  }
}
