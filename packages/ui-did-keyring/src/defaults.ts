// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DidUri } from '@kiltprotocol/types';

import { decodeAddress } from '@polkadot/keyring';
import { stringToHex, u8aToHex } from '@polkadot/util';

const ACCOUNT_PREFIX = 'account:';
const DID_PREFIX = 'did:';

function toHex(address: string): string {
  return u8aToHex(
    // When saving pre-checksum changes, ensure that we can decode
    decodeAddress(address, true)
  );
}

const accountKey = (address: string): string => `${ACCOUNT_PREFIX}${toHex(address)}`;
const accountRegex = new RegExp(`^${ACCOUNT_PREFIX}0x[0-9a-f]*`, '');

const didKey = (didUri: DidUri): string => `${DID_PREFIX}${stringToHex(didUri)}`;
const didRegex = new RegExp(`^${DID_PREFIX}0x[0-9a-f]*`, '');

export { accountKey, accountRegex, didKey, didRegex };
