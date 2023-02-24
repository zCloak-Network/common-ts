// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StorageEvent } from '../types';

import Events from 'eventemitter3';

import { deserialize, serialize } from './utils';

export class SessionStorage extends Events<StorageEvent> {
  constructor() {
    super();
    window.addEventListener('storage', (event) => {
      if (event.storageArea === sessionStorage) {
        if (sessionStorage.length === 0) {
          this.emit('clear');
        } else {
          this.emit('store_changed', event.key, event.oldValue, event.newValue);
        }
      }
    });
  }

  public get(key: string | null): any {
    if (!key) return undefined;

    const val = sessionStorage.getItem(key);

    return deserialize(val);
  }

  public set(key: string, value: any) {
    const val = serialize(value);

    sessionStorage.setItem(key, val);
  }

  public remove(key: string) {
    sessionStorage.removeItem(key);
  }

  public each(fn: (key: string, val: any) => void): void {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);

      if (key) fn(key, this.get(key));
    }
  }
}
