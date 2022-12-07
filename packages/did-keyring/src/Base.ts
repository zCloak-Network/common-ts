// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Events } from './Events';

export abstract class DidBase<KeyJson extends Record<string, any>> extends Events {
  abstract addDidFromMnemonic(mnemonic: string, password: string, type?: 'zk' | 'kilt'): void;
  abstract addDidFromJson(jsonKeys: KeyJson, newPass: string, oldPass: string): string;
  abstract backupDid(didUrl: string, password: string): KeyJson;
  abstract remove(didUrl: string): void;
  abstract getAll(): string[];
  abstract lock(didUrl: string): void;
  abstract unlock(didUrl: string, password: string): void;
}
