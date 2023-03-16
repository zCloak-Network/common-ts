// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  EncryptionAlgorithms,
  KeystoreSigningData,
  RequestData,
  ResponseData,
  SigningAlgorithms
} from '@kiltprotocol/types';
import { Keyring as PolkadotKeyring } from '@polkadot/keyring';
import { u8aEq } from '@polkadot/util';

import { randomAsU8a } from '@zcloak/crypto';

import { KiltKeystore } from './types';

const supportedAlgs = { ...EncryptionAlgorithms, ...SigningAlgorithms };

export class Keyring extends PolkadotKeyring implements KiltKeystore {
  public supportedAlgs(): Promise<Set<SigningAlgorithms | EncryptionAlgorithms>> {
    return Promise.resolve(new Set(Object.values(supportedAlgs)));
  }

  public async sign<A extends SigningAlgorithms>({
    alg,
    data,
    publicKey
  }: KeystoreSigningData<A>): Promise<ResponseData<A>> {
    const pair = this.getPair(publicKey);

    const signature = pair.sign(data, { withType: false });

    return Promise.resolve({ alg, data: signature });
  }

  public async encrypt<A extends 'x25519-xsalsa20-poly1305'>({
    alg,
    data,
    peerPublicKey,
    publicKey
  }: RequestData<A> & { peerPublicKey: Uint8Array }): Promise<ResponseData<A> & { nonce: Uint8Array }> {
    const pair = this.getPair(publicKey);

    const nonce = randomAsU8a(24);
    const sealed = pair.encryptMessage(data, peerPublicKey, nonce);

    return Promise.resolve({ data: sealed, alg, nonce });
  }

  public async decrypt<A extends 'x25519-xsalsa20-poly1305'>({
    alg,
    data,
    peerPublicKey,
    publicKey
  }: RequestData<A> & {
    peerPublicKey: Uint8Array;
    nonce: Uint8Array;
  }): Promise<ResponseData<A>> {
    const pair = this.getPair(publicKey);

    const decrypted = pair.decryptMessage(data, peerPublicKey);

    if (!decrypted) {
      return Promise.reject(new Error('failed to decrypt with given key'));
    }

    return { data: decrypted, alg };
  }

  public hasKeys(keys: Array<Pick<RequestData<string>, 'alg' | 'publicKey'>>): Promise<boolean[]> {
    const knownKeys = this.getPairs().map((pair) => pair.publicKey);

    return Promise.resolve(keys.map((key) => knownKeys.some((i) => u8aEq(key.publicKey, i))));
  }
}
