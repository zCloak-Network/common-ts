// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LocalStorage } from './store/LocalStorage';
import { BaseStore } from './BaseStore';

export class BrowserStore extends BaseStore {
  #store: LocalStorage;

  constructor() {
    super();
    this.#store = new LocalStorage();

    window.addEventListener('storage', (event) => {
      event.key && this.emit('store_changed', event.key, event.newValue);
    });
  }

  public all(fn: (key: string, value: unknown) => void, done?: () => void): void {
    this.#store.each((key: string, value: unknown): void => {
      fn(key, value);
    });
    done?.();
  }

  public get(key: string, fn: (value: unknown) => void): void {
    fn(this.#store.get(key) as unknown);
  }

  public remove(key: string, fn?: () => void): void {
    this.#store.remove(key);
    fn && fn();
    this.emit('store_changed', key);
  }

  public set(key: string, value: unknown, fn?: () => void): void {
    this.#store.set(key, value);
    fn && fn();
    this.emit('store_changed', key, value);
  }
}
