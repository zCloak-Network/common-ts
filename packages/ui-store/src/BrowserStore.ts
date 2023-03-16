// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LocalStorage } from './store/LocalStorage';
import { BaseStore } from './BaseStore';

export class BrowserStore extends BaseStore {
  #store: LocalStorage;

  constructor() {
    super();
    this.#store = new LocalStorage();
    this.#store.on('store_changed', (...args) => this.emit('store_changed', ...args));
  }

  public async all(): Promise<[string, unknown][]> {
    const values: [string, unknown][] = [];

    await this.each((key, value) => values.push([key, value]));

    return values;
  }

  public each(fn: (key: string, value: unknown) => void): Promise<void> {
    this.#store.each((key: string, value: unknown): void => {
      fn(key, value);
    });

    return Promise.resolve();
  }

  public get(key: string): Promise<unknown> {
    return Promise.resolve(this.#store.get(key));
  }

  public remove(key: string): Promise<void> {
    this.#store.remove(key);

    return Promise.resolve();
  }

  public set(key: string, value: any): Promise<void> {
    this.#store.set(key, value);

    return Promise.resolve();
  }
}
