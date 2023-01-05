// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LocalStorage } from './store/localStorage';
import { BaseStore } from './BaseStore';

export class BrowserStore extends BaseStore {
  #store: LocalStorage;

  constructor() {
    super();
    this.#store = new LocalStorage();
  }

  public all(fn: (key: string, value: unknown) => void): void {
    this.#store.each((key: string, value: unknown): void => {
      fn(key, value);
    });
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
