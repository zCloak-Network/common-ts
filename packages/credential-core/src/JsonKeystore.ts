// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeystoreSigningData, RequestData, ResponseData } from '@kiltprotocol/types';
import type { KeyringPair } from '@polkadot/keyring/types';

import { Keyring } from '@polkadot/keyring';
import { assert, u8aEq } from '@polkadot/util';
import { randomAsU8a } from '@polkadot/util-crypto';

import {
  DidKeystore,
  EncryptionAlgorithms,
  KeyringPair$JsonExtra,
  SigningAlgorithms
} from './types';

const supportedAlgs = { ...EncryptionAlgorithms, ...SigningAlgorithms };

export class JsonKeystore extends Keyring implements DidKeystore {
  constructor(json: KeyringPair$JsonExtra) {
    super({ ss58Format: 38 });
    this.setSS58Format(38);

    this.addFromJson(json);
    if (json.extra) this.addFromJson(json.extra);
  }

  public get isLocked(): boolean {
    return this.getPairs()
      .map((pair) => pair.isLocked)
      .reduce((l, r) => l || r);
  }

  public lock(): void {
    this.getPairs().forEach((pair) => pair.lock());
  }

  public unlock(passphrase?: string): void {
    this.getPairs().forEach((pair) => pair.unlock(passphrase));
  }

  public get siningPair(): KeyringPair {
    return this.getPairs()[0];
  }

  public get encryptPair(): KeyringPair {
    return this.getPairs()[1];
  }

  public supportedAlgs(): Promise<Set<SigningAlgorithms | EncryptionAlgorithms>> {
    return Promise.resolve(new Set(Object.values(supportedAlgs)));
  }

  public sign<A extends SigningAlgorithms>({
    alg,
    data,
    publicKey
  }: KeystoreSigningData<A>): Promise<ResponseData<A>> {
    const keypair = this.getPair(publicKey);
    const signature = keypair.sign(data, { withType: false });

    return Promise.resolve({ alg, data: signature });
  }

  public encrypt<A extends 'x25519-xsalsa20-poly1305'>({
    alg,
    data,
    peerPublicKey,
    publicKey
  }: RequestData<A> & { peerPublicKey: Uint8Array }): Promise<
    ResponseData<A> & { nonce: Uint8Array }
  > {
    const keypair = this.getPair(publicKey);
    const nonce = randomAsU8a(24);
    const sealed = keypair.encryptMessage(data, peerPublicKey, nonce);

    return Promise.resolve({ data: sealed, alg, nonce });
  }

  public decrypt<A extends 'x25519-xsalsa20-poly1305'>({
    alg,
    data,
    nonce,
    peerPublicKey,
    publicKey
  }: RequestData<A> & {
    peerPublicKey: Uint8Array;
    nonce: Uint8Array;
  }): Promise<ResponseData<A>> {
    assert(nonce.length === 24, 'Nonce length error, expect to 24');
    const keypair = this.getPair(publicKey);
    const decrypted = keypair.decryptMessage(data, peerPublicKey);

    if (!decrypted) {
      return Promise.reject(new Error('failed to decrypt with given key'));
    }

    return Promise.resolve({ data: decrypted, alg });
  }

  public hasKeys(keys: Array<Pick<RequestData<string>, 'alg' | 'publicKey'>>): Promise<boolean[]> {
    const knownKeys = this.getPairs().map((pair) => pair.publicKey);

    return Promise.resolve(keys.map((key) => knownKeys.some((i) => u8aEq(key.publicKey, i))));
  }
}
