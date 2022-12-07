// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  DidUri,
  EncryptionAlgorithms,
  Keystore,
  SigningAlgorithms
} from '@kiltprotocol/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

export type KiltKeystore = Keystore<SigningAlgorithms, EncryptionAlgorithms>;

export type DidKeys$Json = {
  didUri: DidUri;
  keys: KeyringPair$Json[];
};

export type DidEvents = 'add' | 'remove';
