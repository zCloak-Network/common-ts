// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DidKeys$Json } from './types';

import { LightDidDetails, Utils } from '@kiltprotocol/did';
import { DidUri, EncryptionKeyType, VerificationKeyType } from '@kiltprotocol/types';
import { assert } from '@polkadot/util';

import { DidBase } from '../Base';
import { Keyring } from './Keyring';

export class KiltDid extends DidBase<DidKeys$Json> {
  public didDetails: Map<DidUri, LightDidDetails> = new Map<DidUri, LightDidDetails>();
  protected keyring: Keyring;

  constructor(_keyring?: Keyring) {
    super();
    this.keyring = _keyring ?? new Keyring();
  }

  /**
   * @description add a new did from mnemonic
   * @param mnemonic 12 words mnemonic
   * @param password (optional)
   * @returns a [[LightDidDetails]] object
   */
  public override addDidFromMnemonic(mnemonic: string, password: string): LightDidDetails {
    const pairs = [
      this.keyring.addFromUri(mnemonic, {}, 'sr25519'),
      this.keyring.addFromUri(mnemonic, {}, 'ed25519')
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

    this.addDid(didDetails, password);

    return didDetails;
  }

  public override addDidFromJson(json: DidKeys$Json, newPass: string, oldPass: string): DidUri {
    const pairs = json.keys.map((key) => {
      const pair = this.keyring.addFromJson(key);

      pair.unlock(oldPass);

      return pair;
    });

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

    this.addDid(didDetails, newPass);

    return didDetails.uri;
  }

  /**
   * @description backup did, use password to encrypt did json
   * @param didUriOrDetails kilt didUri or LightDidDetails
   * @param password did json file password
   * @returns A [[DidKeysJson]] json string.
   */
  public override backupDid(didUrl: DidUri, password: string): DidKeys$Json {
    const didDetails = this.didDetails.get(didUrl);

    assert(didDetails, `Did: ${didUrl} not found`);

    return {
      didUri: didDetails.uri,
      keys: didDetails.getKeys().map((key) => this.keyring.getPair(key.publicKey).toJson(password))
    };
  }

  public override getAll(): DidUri[] {
    return Array.from(this.didDetails.keys());
  }

  public override unlock(didUrl: DidUri, password: string) {
    const did = this.didDetails.get(didUrl);

    assert(did, 'did not found');

    did.getKeys().forEach((key) => {
      const pair = this.keyring.getPair(key.publicKey);

      pair.unlock(password);
    });
  }

  public override lock(didUrl: DidUri) {
    const did = this.didDetails.get(didUrl);

    assert(did, 'did not found');

    did.getKeys().forEach((key) => {
      const pair = this.keyring.getPair(key.publicKey);

      pair.lock();
    });
  }

  public override remove(didUrl: DidUri): void {
    this.didDetails.delete(didUrl);
    this.emit('remove');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected addDid(didUriOrDetails: DidUri | LightDidDetails, password?: string): LightDidDetails {
    let didDetails: LightDidDetails;

    if (didUriOrDetails instanceof LightDidDetails) {
      didDetails = didUriOrDetails;
    } else {
      assert(Utils.validateKiltDidUri(didUriOrDetails), 'Not did uri');
      assert(Utils.parseDidUri(didUriOrDetails).type === 'light', 'only light did uri backup');

      didDetails = LightDidDetails.fromUri(didUriOrDetails);
    }

    this.didDetails.set(didDetails.uri, didDetails);

    this.emit('add');

    return didDetails;
  }
}
