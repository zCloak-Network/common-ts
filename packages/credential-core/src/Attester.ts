import type {
  FullDidCreationBuilder,
  FullDidDetails,
  FullDidUpdateBuilder
} from '@kiltprotocol/did';
import type { ICType, IRequestForAttestation } from '@kiltprotocol/types';

import { Attestation, BlockchainUtils, CType, Did } from '@kiltprotocol/sdk-js';
import { assert } from '@polkadot/util';

import { Dids } from './Dids';
import { DidKeystore } from './types';

export class Attester extends Dids {
  #isReadyPromise: Promise<this>;
  public fullDidDetails: Did.FullDidDetails | null = null;

  constructor(keystore: DidKeystore, endpoint: string) {
    super(keystore, endpoint);
    this.#isReadyPromise = super.isReady.then(async () => {
      this.fullDidDetails = await this.getFullDidDetails();

      return this;
    });
  }

  public override get isReady(): Promise<this> {
    return this.#isReadyPromise;
  }

  public createFullDid(
    action: (
      didCreationBuilder: FullDidCreationBuilder,
      keystore: DidKeystore
    ) => Promise<FullDidDetails>
  ): Promise<FullDidDetails> {
    assert(this.api, 'Api is not ready');
    assert(!this.keystore.isLocked, 'Keystore is locked');

    const creationBuilder = Did.FullDidCreationBuilder.fromLightDidDetails(
      this.api,
      this.didDetails
    );

    return action(creationBuilder, this.keystore);
  }

  public async updateFullDid(
    action: (
      didUpdateBuilder: FullDidUpdateBuilder,
      keystore: DidKeystore
    ) => Promise<FullDidDetails>
  ): Promise<FullDidDetails> {
    assert(this.api, 'Api is not ready');
    assert(!this.keystore.isLocked, 'Keystore is locked');

    const fullDid = await this.getFullDidDetails();

    assert(fullDid, 'The DID with the given identifier is not on chain.');

    const updateBuilder = new Did.FullDidUpdateBuilder(this.api, fullDid);

    return action(updateBuilder, this.keystore);
  }

  public async attestClaim(request: IRequestForAttestation) {
    const fullDid = await this.getFullDidDetails();

    assert(fullDid, 'The DID with the given identifier is not on chain.');

    const attestation = Attestation.fromRequestAndDid(request, fullDid.did);

    // form tx and authorized extrinsic
    const tx = await attestation.getStoreTx();
    const extrinsic = await fullDid.authorizeExtrinsic(tx, this.keystore, this.keystore.address);

    return BlockchainUtils.signAndSubmitTx(extrinsic, this.keystore.siningPair, {
      resolveOn: BlockchainUtils.IS_IN_BLOCK,
      reSign: true
    });
  }

  public async createCType(ctype: ICType) {
    const fullDid = await this.getFullDidDetails();

    assert(fullDid, 'The DID with the given identifier is not on chain.');

    const cType = CType.fromCType(ctype);
    const tx = await cType.getStoreTx();
    const extrinsic = await fullDid.authorizeExtrinsic(tx, this.keystore, this.keystore.address);

    return BlockchainUtils.signAndSubmitTx(extrinsic, this.keystore.siningPair, {
      resolveOn: BlockchainUtils.IS_IN_BLOCK,
      reSign: true
    });
  }
}
