// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ICredential as KiltVC } from '@kiltprotocol/types';
import type { VerifiableCredential as ZkidVC } from '@zcloak/vc/types';

import { Credential } from '@kiltprotocol/core';
import { assert, u8aFixLength, u8aToNumber, u8aToString } from '@polkadot/util';

import { naclDecrypt, scryptEncode, scryptFromU8a } from '@zcloak/crypto';
import { isVC } from '@zcloak/vc/is';

import { NONCE_LENGTH, SCRYPT_LENGTH, TYPE_BYTE_LENGTH, VERSION_BYTE_LENGTH } from './defualts';
import { EncryptEnum } from './types';

export function vcDecrypt(encrypted: Uint8Array, passphrase?: string): KiltVC | ZkidVC<boolean> {
  let decoded: Uint8Array | null = encrypted;

  if (passphrase) {
    const { params, salt } = scryptFromU8a(encrypted);
    const { password } = scryptEncode(passphrase, salt, params);

    encrypted = encrypted.subarray(SCRYPT_LENGTH);

    decoded = naclDecrypt(
      encrypted.subarray(NONCE_LENGTH),
      encrypted.subarray(0, NONCE_LENGTH),
      u8aFixLength(password, 256, true)
    );
  }

  assert(decoded, 'Unable to decrypt using the supplied passphrase');

  const versionU8a = decoded.subarray(0, VERSION_BYTE_LENGTH);
  const typeU8a = decoded.subarray(VERSION_BYTE_LENGTH, VERSION_BYTE_LENGTH + TYPE_BYTE_LENGTH);
  const contentU8a = decoded.subarray(VERSION_BYTE_LENGTH + TYPE_BYTE_LENGTH);

  const version = u8aToNumber(versionU8a);
  const type = u8aToNumber(typeU8a);

  if (![0].includes(version)) {
    throw new Error('Wrong version number');
  }

  const content = JSON.parse(u8aToString(contentU8a));

  if (type === EncryptEnum.kilt) {
    assert(Credential.isICredential(content), 'Not a kilt credential, parse error');

    return content;
  } else if (EncryptEnum.zkid) {
    assert(isVC(content), 'Not a zkid credential, parse error');

    return content;
  }

  throw new Error(`Wrong content type with: ${type}`);
}
