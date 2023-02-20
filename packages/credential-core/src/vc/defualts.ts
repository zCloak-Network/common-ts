// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EncryptVersion } from './types';

export const DEFAULT_ENCRYPT_VERSION: EncryptVersion = 0;

export const VERSION_BYTE_LENGTH = 4;

export const TYPE_BYTE_LENGTH = 4;

export const SCRYPT_LENGTH = 32 + 3 * 4;

export const NONCE_LENGTH = 24;
