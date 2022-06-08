import type {
  FullDidCreationBuilder,
  FullDidDetails,
  FullDidUpdateBuilder,
  LightDidDetails
} from '@kiltprotocol/did';
import type { IRequestForAttestation } from '@kiltprotocol/types';

import {
  Attestation,
  BlockchainUtils,
  connect,
  Did,
  EncryptionKeyType,
  init,
  VerificationKeyType
} from '@kiltprotocol/sdk-js';
import { ApiPromise } from '@polkadot/api';
import { assert } from '@polkadot/util';

import { DidKeystore } from './types';

export class Attester {
  #keystore: DidKeystore;
  #isReadyPromise: Promise<this>;
  #api?: ApiPromise;

  constructor(keystore: DidKeystore, endpoint: string) {
    this.#keystore = keystore;

    this.#isReadyPromise = new Promise((resolve) => {
      init({ address: endpoint })
        .then(connect)
        .then(({ api }) => {
          this.#api = api;
          resolve(this);
        });
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
}
