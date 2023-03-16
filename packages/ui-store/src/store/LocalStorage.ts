// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StorageEvent } from '../types';

import Events from 'eventemitter3';

import { deserialize, getAllItems, serialize } from './utils';

export class LocalStorage extends Events<StorageEvent> {
  #items: Map<string, any> = new Map();

  constructor() {
    super();

    this.#items = getAllItems(localStorage);
    window.addEventListener('storage', (event) => {
      if (event.storageArea === localStorage) {
        if (localStorage.length === 0) {
          // clear storage

          for (const [key, value] of this.#items) {
            this.#items.delete(key);
            this.emit('store_changed', key, value, null);
          }
        } else {
          if (event.key) {
            this.#items.set(event.key, event.newValue);
            this.emit('store_changed', event.key, event.oldValue, event.newValue);
          }
        }
      }
    });
  }

  public get(key: string | null): any {
    if (!key) return undefined;

    const val = localStorage.getItem(key);

    return deserialize(val);
  }

  public set(key: string, value: any) {
    const val = serialize(value);

    localStorage.setItem(key, val);
    const oldValue = this.#items.get(key);

    this.#items.set(key, val);
    this.emit('store_changed', key, oldValue, value);
  }

  public remove(key: string) {
    localStorage.removeItem(key);
    this.#items.delete(key);
    this.emit('store_changed', key, this.#items.get(key), null);
  }

  public each(fn: (key: string, val: any) => void): void {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);

      if (key) fn(key, this.get(key));
    }
  }
}
