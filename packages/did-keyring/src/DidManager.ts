// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair } from '@polkadot/keyring/types';
import type { DidKeys$Json } from './types';

import { LightDidDetails, Utils } from '@kiltprotocol/did';
import { DidUri, EncryptionKeyType, VerificationKeyType } from '@kiltprotocol/types';
import { assert } from '@polkadot/util';

import { Events } from './Events';
import { isDidKeys$Json } from './utils';

export class DidManager extends Events {
  public didUris: Set<DidUri> = new Set<DidUri>();
  public didDetails: Map<DidUri, LightDidDetails> = new Map<DidUri, LightDidDetails>();

  public addDid(didUriOrDetails: DidUri | LightDidDetails, pairs: KeyringPair[]): void {
    pairs.forEach((pair) => this.addPair(pair));

    let didDetails: LightDidDetails;

    if (didUriOrDetails instanceof LightDidDetails) {
      didDetails = didUriOrDetails;
    } else {
      assert(Utils.validateKiltDidUri(didUriOrDetails), 'Not did uri');
      assert(Utils.parseDidUri(didUriOrDetails).type === 'light', 'only light did uri backup');

      didDetails = LightDidDetails.fromUri(didUriOrDetails);
    }

    this.didUris.add(didDetails.uri);
    this.didDetails.set(didDetails.uri, didDetails);
    this.emit('add');
  }

  /**
   * @description add a new did from mnemonic
   * @param mnemonic 12 words mnemonic
   * @param password (optional) if passed password, will call `backupDid` method
   * @returns a [[LightDidDetails]] object
   */
  public addDidFromMnemonic(mnemonic: string, password?: string): LightDidDetails {
    const pairs = [
      this.createFromUri(mnemonic, {}, 'sr25519'),
      this.createFromUri(mnemonic, {}, 'ed25519')
    ];

    const didDetails = LightDidDetails.fromDetails({
      authenticationKey: {
        publicKey: pairs[0].publicKey,
        type:
          pairs[0].type === 'sr25519' ? VerificationKeyType.Sr25519 : VerificationKeyType.Ed25519
      },
      encryptionKey: {
        publicKey: pairs[1].publicKey,
        type: EncryptionKeyType.X25519
      }
    });

    this.addDid(didDetails, pairs);

    if (password) {
      this.backupDid(didDetails, password);
    }

    return didDetails;
  }

  /**
   * @description add a new did from a [[DidKeys$Json]] or [[string]], if pass string, will covert to [[DidKeys$Json]]
   * @param textOrJson [[DidKeys$Json]] or stringify(DidKeys$Json)
   * @param password (optional) if passed password, will call `backupDid` method
   * @returns a [[LightDidDetails]] object
   */
  public addDidFromJson(textOrJson: string | DidKeys$Json, password?: string): LightDidDetails {
    let json: DidKeys$Json;

    if (typeof textOrJson === 'string') {
      json = JSON.parse(textOrJson);
      assert(isDidKeys$Json(json), 'Not a validate did-keys json');
    } else {
      json = textOrJson;
    }

    const pairs = json.keys.map((key) => this.createFromJson(key));

    const didDetails = LightDidDetails.fromDetails({
      authenticationKey: {
        publicKey: pairs[0].publicKey,
        type:
          pairs[0].type === 'sr25519' ? VerificationKeyType.Sr25519 : VerificationKeyType.Ed25519
      },
      encryptionKey: {
        publicKey: pairs[1].publicKey,
        type: EncryptionKeyType.X25519
      }
    });

    this.addDid(didDetails, pairs);

    if (password) {
      this.backupDid(didDetails, password);
    }

    return didDetails;
  }

  /**
   * @description backup did, use password to encrypt did json
   * @param didUriOrDetails kilt didUri or LightDidDetails
   * @param password did json file password
   * @returns A [[DidKeysJson]] object.
   */
  public backupDid(didUriOrDetails: DidUri | LightDidDetails, password: string): DidKeys$Json {
    let didDetails: LightDidDetails;

    if (didUriOrDetails instanceof LightDidDetails) {
      didDetails = didUriOrDetails;
    } else {
      assert(Utils.validateKiltDidUri(didUriOrDetails), 'Not did uri');
      assert(Utils.parseDidUri(didUriOrDetails).type === 'light', 'only light did uri backup');

      didDetails = LightDidDetails.fromUri(didUriOrDetails);
    }

    return {
      didUri: didDetails.uri,
      keys: didDetails.getKeys().map((key) => this.getPair(key.publicKey).toJson(password))
    };
  }

  /**
   * @description set a new password for did
   * will call `backupDid` method
   * @param didUriOrDetails kilt didUri or LightDidDetails
   * @param currentPassword current password of passed did
   * @param password new password for did
   */
  public setPassword(
    didUriOrDetails: DidUri | LightDidDetails,
    currentPassword: string,
    password: string
  ): void {
    let didDetails: LightDidDetails;

    if (didUriOrDetails instanceof LightDidDetails) {
      didDetails = didUriOrDetails;
    } else {
      assert(Utils.validateKiltDidUri(didUriOrDetails), 'Not did uri');
      assert(Utils.parseDidUri(didUriOrDetails).type === 'light', 'only light did uri backup');

      didDetails = LightDidDetails.fromUri(didUriOrDetails);
    }

    didDetails.getKeys().forEach((key) => {
      const pair = this.getPair(key.publicKey);

      pair.unlock(currentPassword);
      pair.encodePkcs8(password);
    });

    this.backupDid(didDetails, password);
  }

  public removeDid(didUriOrDetails: DidUri | LightDidDetails): void {
    let didDetails: LightDidDetails;

    if (didUriOrDetails instanceof LightDidDetails) {
      didDetails = didUriOrDetails;
    } else {
      assert(Utils.validateKiltDidUri(didUriOrDetails), 'Not did uri');
      assert(Utils.parseDidUri(didUriOrDetails).type === 'light', 'only light did uri backup');

      didDetails = LightDidDetails.fromUri(didUriOrDetails);
    }

    didDetails.getKeys().forEach((key) => this.removePair(key.publicKey));

    this.didUris.delete(didDetails.uri);
    this.didDetails.delete(didDetails.uri);
    this.emit('remove');
  }
}
