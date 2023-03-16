// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DidUri, EncryptionAlgorithms, Keystore, SigningAlgorithms } from '@kiltprotocol/types';
import type { KeyringPair$Json as KiltKeyringPair$Json } from '@polkadot/keyring/types';
import type { DidKeys$Json } from '@zcloak/did/keys/types';

export type KiltKeystore = Keystore<SigningAlgorithms, EncryptionAlgorithms>;

export type KiltDidKeys$Json = {
  didUri: DidUri;
  keys: KiltKeyringPair$Json[];
};

export type ZkDidKeys$Json = DidKeys$Json;
