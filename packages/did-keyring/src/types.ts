// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  DidUri,
  EncryptionAlgorithms,
  Keystore,
  SigningAlgorithms
} from '@kiltprotocol/types';
import type { KeyringPair$Json as KiltKeyringPair$Json } from '@polkadot/keyring/types';
import type { KeyringPair$Json as ZkKeyringPair$Json } from '@zcloak/keyring/types';

import { DidUrl } from '@zcloak/did-resolver/types';

export type KiltKeystore = Keystore<SigningAlgorithms, EncryptionAlgorithms>;

export type KiltDidKeys$Json = {
  didUri: DidUri;
  keys: KiltKeyringPair$Json[];
};

type DidKeys$JsonVersion = '1';

export interface ZkDidKeys$Json {
  didUrl: DidUrl;
  version: DidKeys$JsonVersion;
  identifierKey: ZkKeyringPair$Json;
  keys: ZkKeyringPair$Json[];
  authentication: DidUrl[];
  assertionMethod: DidUrl[];
  keyAgreement: DidUrl[];
  capabilityInvocation: DidUrl[];
  capabilityDelegation: DidUrl[];
}

export type DidEvents = 'add' | 'remove';
