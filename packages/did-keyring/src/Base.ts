// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Events } from './Events';

export abstract class DidBase extends Events {
  abstract addDidFromMnemonic(mnemonic: string, password: string): void;
  abstract addDidFromJson(jsonKeys: string, newPass: string, oldPass: string): string;
  abstract remove(didUrl: string): void;
  abstract getAll(): string[];
  abstract lock(didUrl: string): void;
  abstract unlock(didUrl: string, password: string): void;
}
