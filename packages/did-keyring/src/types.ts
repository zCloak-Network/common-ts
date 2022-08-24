import type { EncryptionAlgorithms, Keystore, SigningAlgorithms } from '@kiltprotocol/types';

export type KiltKeystore = Keystore<SigningAlgorithms, EncryptionAlgorithms>;
