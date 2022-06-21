import type { DidDetails } from '@kiltprotocol/did';
import type {
  IEncryptedMessage,
  IMessage,
  Message,
  RequestData,
  ResponseData
} from '@kiltprotocol/sdk-js';
import type { Keystore } from '@kiltprotocol/types';

import { KeyringPair } from '@polkadot/keyring/types';

export enum SigningAlgorithms {
  Ed25519 = 'ed25519',
  Sr25519 = 'sr25519',
  EcdsaSecp256k1 = 'ecdsa-secp256k1'
}

export enum EncryptionAlgorithms {
  NaclBox = 'x25519-xsalsa20-poly1305'
}

export interface DidKeystore extends Keystore<SigningAlgorithms, EncryptionAlgorithms> {
  siningPair: KeyringPair;
  encryptPair: KeyringPair;
  encrypt<A extends 'x25519-xsalsa20-poly1305'>({
    alg,
    data,
    peerPublicKey,
    publicKey
  }: RequestData<A> & { peerPublicKey: Uint8Array }): Promise<
    ResponseData<A> & { nonce: Uint8Array }
  >;
  decrypt<A extends 'x25519-xsalsa20-poly1305'>({
    alg,
    data,
    nonce,
    peerPublicKey,
    publicKey
  }: RequestData<A> & {
    peerPublicKey: Uint8Array;
    nonce: Uint8Array;
  }): Promise<ResponseData<A>>;
}

export interface MessageHelper {
  encryptMessage(message: Message, receiver: DidDetails): Promise<IEncryptedMessage>;
  decryptMessage(encryptMessage: IEncryptedMessage): Promise<IMessage>;
}
