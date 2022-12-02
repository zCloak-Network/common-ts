// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import store from 'store';

export class BrowserStore {
  public all(fn: (key: string, value: unknown) => void): void {
    store.each((value: unknown, key: string): void => {
      fn(key, value);
    });
  }

  public get(key: string, fn: (value: unknown) => void): void {
    fn(store.get(key) as unknown);
  }

  public remove(key: string, fn?: () => void): void {
    store.remove(key);
    fn && fn();
  }

  public set(key: string, value: unknown, fn?: () => void): void {
    store.set(key, value);
    fn && fn();
  }
}
