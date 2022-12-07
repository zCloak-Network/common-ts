// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DidUri } from '@kiltprotocol/types';

import { decodeAddress } from '@polkadot/keyring';
import { stringToHex, u8aToHex } from '@polkadot/util';

import { DidUrl } from '@zcloak/did-resolver/types';

const KILT_PAIR_PREFIX = 'kilt:pair:';
const KILT_DID_PREFIX = 'kilt:did:';
const ZK_PAIR_PREFIX = 'zk:pair:';
const ZK_DID_PREFIX = 'zk:did:';

function toHex(address: string): string {
  return u8aToHex(
    // When saving pre-checksum changes, ensure that we can decode
    decodeAddress(address, true)
  );
}

const kiltPairKey = (address: string): string => `${KILT_PAIR_PREFIX}${toHex(address)}`;
const kiltPairKeyRegex = new RegExp(`^${KILT_PAIR_PREFIX}0x[0-9a-f]*`, '');

const kiltDidKey = (didUri: DidUri): string => `${KILT_DID_PREFIX}${stringToHex(didUri)}`;
const kiltDidRegex = new RegExp(`^${KILT_DID_PREFIX}0x[0-9a-f]*`, '');

const zkPairKey = (address: Uint8Array): string => `${ZK_PAIR_PREFIX}${u8aToHex(address)}`;
const zkPairKeyRegex = new RegExp(`^${ZK_PAIR_PREFIX}0x[0-9a-f]*`, '');

const zkDidKey = (didUri: DidUrl): string => `${ZK_DID_PREFIX}${stringToHex(didUri)}`;
const zkDidRegex = new RegExp(`^${ZK_DID_PREFIX}0x[0-9a-f]*`, '');

export {
  kiltPairKey,
  kiltPairKeyRegex,
  kiltDidKey,
  kiltDidRegex,
  zkPairKey,
  zkPairKeyRegex,
  zkDidKey,
  zkDidRegex
};
