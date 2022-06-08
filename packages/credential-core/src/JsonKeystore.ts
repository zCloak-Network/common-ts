import type { KeystoreSigningData, RequestData, ResponseData } from '@kiltprotocol/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

import { Keyring } from '@polkadot/keyring';
import { decodePair } from '@polkadot/keyring/pair/decode';
import { KeyringPair } from '@polkadot/keyring/types';
import { assert, u8aEmpty, u8aEq } from '@polkadot/util';
import { base64Decode, naclBoxPairFromSecret, naclOpen, naclSeal } from '@polkadot/util-crypto';

import { DidKeystore, EncryptionAlgorithms, SigningAlgorithms } from './types';

const supportedAlgs = { ...EncryptionAlgorithms, ...SigningAlgorithms };

export class JsonKeystore implements DidKeystore {
  #keyring: Keyring;
  #siningPair: KeyringPair;
  #json: KeyringPair$Json;
  #secretKey: Uint8Array = new Uint8Array();

  constructor(json: KeyringPair$Json) {
    this.#json = json;
    this.#keyring = new Keyring();
    this.#keyring.setSS58Format(38);
    this.#siningPair = this.#keyring.createFromJson(json);
  }

  public get siningPair(): KeyringPair {
    return this.#siningPair;
  }

  public get publicKey(): Uint8Array {
    return this.#siningPair.publicKey;
  }

  public get encryptPublicKey(): Uint8Array {
    assert(!this.isLocked, 'Please lock wallet');

    return naclBoxPairFromSecret(this.#secretKey).publicKey;
  }

  public get address(): string {
    return this.#siningPair.address;
  }

  public get isLocked(): boolean {
    return u8aEmpty(this.#secretKey);
  }

  public supportedAlgs(): Promise<Set<SigningAlgorithms | EncryptionAlgorithms>> {
    return Promise.resolve(new Set(Object.values(supportedAlgs)));
  }

  public lock(): void {
    this.#secretKey = new Uint8Array();

    return this.#siningPair.lock();
  }

  public unlock(passphrase?: string): void {
    this.#secretKey = decodePair(
      passphrase,
      base64Decode(this.#json.encoded),
      this.#json.encoding.type
    ).secretKey;

    return this.#siningPair.unlock(passphrase);
  }

  public sign<A extends SigningAlgorithms>({
    alg,
    data
  }: KeystoreSigningData<A>): Promise<ResponseData<A>> {
    assert(!this.isLocked, 'Please lock wallet');

    const signature = this.#siningPair.sign(data, { withType: false });

    return Promise.resolve({ alg, data: signature });
  }

  public encrypt<A extends 'x25519-xsalsa20-poly1305'>({
    alg,
    data,
    peerPublicKey
  }: RequestData<A> & { peerPublicKey: Uint8Array }): Promise<
    ResponseData<A> & { nonce: Uint8Array }
  > {
    assert(!this.isLocked, 'Please lock wallet');

    const { nonce, sealed } = naclSeal(
      data,
      naclBoxPairFromSecret(this.#secretKey).secretKey,
      peerPublicKey
    );

    return Promise.resolve({ data: sealed, alg, nonce });
  }

  public decrypt<A extends 'x25519-xsalsa20-poly1305'>({
    alg,
    data,
    nonce,
    peerPublicKey
  }: RequestData<A> & {
    peerPublicKey: Uint8Array;
    nonce: Uint8Array;
  }): Promise<ResponseData<A>> {
    assert(!this.isLocked, 'Please lock wallet');

    const decrypted = naclOpen(
      data,
      nonce,
      peerPublicKey,
      naclBoxPairFromSecret(this.#secretKey).secretKey
    );

    if (!decrypted) {
      return Promise.reject(new Error('failed to decrypt with given key'));
    }

    return Promise.resolve({ data: decrypted, alg });
  }

  public hasKeys(keys: Array<Pick<RequestData<string>, 'alg' | 'publicKey'>>): Promise<boolean[]> {
    const knownKeys = [this.publicKey, this.encryptPublicKey];

    return Promise.resolve(keys.map((key) => knownKeys.some((i) => u8aEq(key.publicKey, i))));
  }
}
