// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import storage from 'store/storages/sessionStorage';

import { BaseStore } from './BaseStore';

export class BrowserStore extends BaseStore {
  public all(fn: (key: string, value: unknown) => void): void {
    storage.each((value: unknown, key: string): void => {
      fn(key, value);
    });
  }

  public get(key: string, fn: (value: unknown) => void): void {
    fn(storage.read(key) as unknown);
  }

  public remove(key: string, fn?: () => void): void {
    storage.remove(key);
    fn && fn();
  }

  public set(key: string, value: unknown, fn?: () => void): void {
    storage.write(key, value as string);
    fn && fn();
  }
}
