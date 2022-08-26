import type { DidKeys$Json } from './types';

import { DidDetails, LightDidDetails } from '@kiltprotocol/did';
import { parseDidUri, validateKiltDidUri } from '@kiltprotocol/did/lib/cjs/Did.utils';
import { DidUri, EncryptionKeyType, VerificationKeyType } from '@kiltprotocol/types';
import { assert } from '@polkadot/util';

import { Keyring } from './Keyring';
import { isDidKeys$Json } from './utils';

export class DidManager extends Keyring {
  public didUris: string[] = [];

  public generateDid(mnemonic: string, password: string): DidKeys$Json {
    const pair1 = this.addFromMnemonic(mnemonic, {}, 'sr25519');
    const pair2 = this.addFromMnemonic(mnemonic, {}, 'ed25519');

    const didUri = LightDidDetails.fromDetails({
      authenticationKey: {
        publicKey: pair1.publicKey,
        type: pair1.type === 'sr25519' ? VerificationKeyType.Sr25519 : VerificationKeyType.Ed25519
      },
      encryptionKey: {
        publicKey: pair2.publicKey,
        type: EncryptionKeyType.X25519
      }
    }).uri;

    if (!this.didUris.includes(didUri)) this.didUris.push(didUri);

    return {
      didUri,
      keys: [pair1.toJson(password), pair2.toJson(password)]
    };
  }

  public restoreDid(text: string, password: string): DidUri {
    const json = JSON.parse(text);

    assert(isDidKeys$Json(json), 'Not a validate did-keys json');

    json.keys.forEach((j) => {
      const pair = this.addFromJson(j);

      // try unlock
      pair.unlock(password);
      pair.lock();
    });

    if (!this.didUris.includes(json.didUri)) this.didUris.push(json.didUri);

    return json.didUri;
  }

  public backupDid(didUriOrDetails: DidUri | DidDetails, password: string): DidKeys$Json {
    let didDetails: DidDetails;

    if (didUriOrDetails instanceof DidDetails) {
      didDetails = didUriOrDetails;
    } else {
      assert(validateKiltDidUri(didUriOrDetails), 'Not did uri');
      assert(parseDidUri(didUriOrDetails).type === 'light', 'only light did uri backup');

      didDetails = LightDidDetails.fromUri(didUriOrDetails);
    }

    return {
      didUri: didDetails.uri,
      keys: didDetails.getKeys().map((key) => this.getPair(key.publicKey).toJson(password))
    };
  }

  public removeDid(didUriOrDetails: DidUri | DidDetails): void {
    let didDetails: DidDetails;

    if (didUriOrDetails instanceof DidDetails) {
      didDetails = didUriOrDetails;
    } else {
      assert(validateKiltDidUri(didUriOrDetails), 'Not did uri');
      assert(parseDidUri(didUriOrDetails).type === 'light', 'only light did uri backup');

      didDetails = LightDidDetails.fromUri(didUriOrDetails);
    }

    didDetails.getKeys().forEach((key) => this.removePair(key.publicKey));

    this.didUris.splice(
      this.didUris.findIndex((didUri) => didUri === didDetails.uri),
      1
    );
  }
}
