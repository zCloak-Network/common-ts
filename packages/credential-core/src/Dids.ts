import type { DidDetails } from '@kiltprotocol/did';
import type { ICredential, IEncryptedMessage } from '@kiltprotocol/types';

import {
  connect,
  Credential,
  Did,
  EncryptionKeyType,
  IMessage,
  init,
  Message,
  VerificationKeyType
} from '@kiltprotocol/sdk-js';
import { ApiPromise } from '@polkadot/api';
import { assert } from '@polkadot/util';

import { DidKeystore, MessageHelper } from './types';

export class Dids implements MessageHelper {
  #isReadyPromise: Promise<this>;
  protected keystore: DidKeystore;
  protected api?: ApiPromise;
  public didDetails: DidDetails;

  constructor(keystore: DidKeystore, endpoint: string) {
    this.keystore = keystore;

    this.didDetails = Did.LightDidDetails.fromDetails({
      authenticationKey: {
        type: VerificationKeyType.Sr25519,
        publicKey: keystore.siningPair.publicKey
      },
      encryptionKey: {
        type: EncryptionKeyType.X25519,
        publicKey: keystore.encryptPair.publicKey
      }
    });

    this.#isReadyPromise = new Promise((resolve) => {
      init({ address: endpoint })
        .then(connect)
        .then(({ api }) => {
          this.api = api;
          resolve(this);
        });
    });
  }

  public get isReady(): Promise<this> {
    return this.#isReadyPromise;
  }

  public encryptMessage(message: Message, receiver: DidDetails): Promise<IEncryptedMessage> {
    assert(this.didDetails.encryptionKey, 'No encryption key');
    assert(receiver.encryptionKey?.id, 'Receiver has not encryption key');

    return message.encrypt(
      this.didDetails.encryptionKey.id,
      this.didDetails,
      this.keystore,
      receiver.assembleKeyUri(receiver.encryptionKey.id)
    );
  }

  public async decryptMessage(encryptMessage: IEncryptedMessage): Promise<IMessage> {
    assert(this.didDetails.encryptionKey?.id, 'No encryption key');

    return Message.decrypt(encryptMessage, this.keystore, this.didDetails);
  }

  public verifyCredential(credential: ICredential): Promise<boolean> {
    return Credential.verify(credential);
  }
}
