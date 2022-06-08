import type { Keystore } from '@kiltprotocol/types';

export enum SigningAlgorithms {
  Ed25519 = 'ed25519',
  Sr25519 = 'sr25519',
  EcdsaSecp256k1 = 'ecdsa-secp256k1'
}

export enum EncryptionAlgorithms {
  NaclBox = 'x25519-xsalsa20-poly1305'
}

export interface DidKeystore extends Keystore<SigningAlgorithms, EncryptionAlgorithms> {
  address: string;
  did: string;
  fullDid: string;
  publicKey: Uint8Array;
  encryptPublicKey: Uint8Array;
  isLocked: boolean;
  lock: () => void;
  unlock: (passphrase?: string) => void;
}
