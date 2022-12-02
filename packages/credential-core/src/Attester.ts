// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IAttestation, ICType, IRequestForAttestation } from '@kiltprotocol/types';

import {
  FullDidCreationBuilder,
  FullDidDetails,
  FullDidUpdateBuilder,
  LightDidDetails
} from '@kiltprotocol/did';
import { Attestation, BlockchainUtils, CType, Did } from '@kiltprotocol/sdk-js';
import { assert } from '@polkadot/util';

import { Dids } from './Dids';
import { DidKeystore } from './types';

export class Attester extends Dids {
  #isReadyPromise: Promise<this>;

  constructor(keystore: DidKeystore, endpoint: string) {
    super(keystore, endpoint);
    this.#isReadyPromise = super.isReady.then(async () => {
      const fullDidDetails = await Did.FullDidDetails.fromChainInfo(
        `did:kilt:${keystore.siningPair.address}`
      );

      if (fullDidDetails) {
        this.didDetails = fullDidDetails;
      }

      return this;
    });
  }

  public override get isReady(): Promise<this> {
    return this.#isReadyPromise;
  }

  public get isFullDid(): boolean {
    return this.didDetails instanceof FullDidDetails;
  }

  public createFullDid(
    action: (
      didCreationBuilder: FullDidCreationBuilder,
      keystore: DidKeystore
    ) => Promise<FullDidDetails>
  ): Promise<FullDidDetails> {
    assert(this.api, 'Api is not ready');
    assert(
      this.didDetails instanceof LightDidDetails,
      'The DID with the given identifier is not on chain.'
    );

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
    assert(
      this.didDetails instanceof FullDidDetails,
      'The DID with the given identifier is not on chain.'
    );

    const updateBuilder = new Did.FullDidUpdateBuilder(this.api, this.didDetails);

    return action(updateBuilder, this.keystore);
  }

  public async revokeAttestation(attestation: IAttestation) {
    assert(
      this.didDetails instanceof FullDidDetails,
      'The DID with the given identifier is not on chain.'
    );

    const tx = await Attestation.fromAttestation(attestation).getRevokeTx(0);
    const extrinsic = await this.didDetails.authorizeExtrinsic(
      tx,
      this.keystore,
      this.keystore.siningPair.address
    );

    return BlockchainUtils.signAndSubmitTx(extrinsic, this.keystore.siningPair, {
      resolveOn: BlockchainUtils.IS_FINALIZED,
      reSign: true
    });
  }

  public async attestClaim(request: IRequestForAttestation) {
    assert(
      this.didDetails instanceof FullDidDetails,
      'The DID with the given identifier is not on chain.'
    );

    const attestation = Attestation.fromRequestAndDid(request, this.didDetails.uri);

    // form tx and authorized extrinsic
    const tx = await attestation.getStoreTx();
    const extrinsic = await this.didDetails.authorizeExtrinsic(
      tx,
      this.keystore,
      this.keystore.siningPair.address
    );

    return BlockchainUtils.signAndSubmitTx(extrinsic, this.keystore.siningPair, {
      resolveOn: BlockchainUtils.IS_FINALIZED,
      reSign: true
    });
  }

  public async createCType(ctype: ICType) {
    assert(
      this.didDetails instanceof FullDidDetails,
      'The DID with the given identifier is not on chain.'
    );

    const cType = CType.fromCType(ctype);
    const tx = await cType.getStoreTx();
    const extrinsic = await this.didDetails.authorizeExtrinsic(
      tx,
      this.keystore,
      this.keystore.siningPair.address
    );

    return BlockchainUtils.signAndSubmitTx(extrinsic, this.keystore.siningPair, {
      resolveOn: BlockchainUtils.IS_FINALIZED,
      reSign: true
    });
  }
}
