// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ICredential as KiltVC } from '@kiltprotocol/types';
import type { VerifiableCredential as ZkidVC } from '@zcloak/vc/types';

import { Credential } from '@kiltprotocol/core';
import { numberToU8a, stringToU8a, u8aConcat, u8aFixLength } from '@polkadot/util';

import { naclEncrypt, scryptEncode, scryptToU8a } from '@zcloak/crypto';
import { isVC } from '@zcloak/vc/utils';

import { DEFAULT_ENCRYPT_VERSION, TYPE_BYTE_LENGTH, VERSION_BYTE_LENGTH } from './defualts';
import { EncryptEnum } from './types';

export function vcEncrypt(kiltVC: KiltVC, passphrase?: string): Uint8Array;
export function vcEncrypt(zkidVC: ZkidVC, passphrase?: string): Uint8Array;

export function vcEncrypt(vc: KiltVC | ZkidVC, passphrase?: string): Uint8Array {
  let data: string;
  let type: EncryptEnum;

  if (Credential.isICredential(vc)) {
    data = JSON.stringify(vc);
    type = EncryptEnum.kilt;
  } else if (isVC(vc)) {
    data = JSON.stringify(vc);
    type = EncryptEnum.zkid;
  } else {
    throw new Error('input `vc` not an kilt credential or zkid credential');
  }

  const encoded = u8aConcat(
    u8aFixLength(numberToU8a(DEFAULT_ENCRYPT_VERSION), VERSION_BYTE_LENGTH * 8),
    u8aFixLength(numberToU8a(type), TYPE_BYTE_LENGTH * 8),
    stringToU8a(data)
  );

  if (!passphrase) {
    return encoded;
  }

  const { params, password, salt } = scryptEncode(passphrase);
  const { encrypted, nonce } = naclEncrypt(encoded, password.subarray(0, 32));

  return u8aConcat(scryptToU8a(salt, params), nonce, encrypted);
}
