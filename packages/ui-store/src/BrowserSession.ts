// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SessionStorage } from './store/SessionStorage';
import { BaseStore } from './BaseStore';

export class BrowserSession extends BaseStore {
  #session: SessionStorage;

  constructor() {
    super();
    this.#session = new SessionStorage();
    this.#session.on('clear', this.emit);
    this.#session.on('store_changed', this.emit);
  }

  public async all(): Promise<[string, unknown][]> {
    const values: [string, unknown][] = [];

    await this.each((key, value) => values.push([key, value]));

    return values;
  }

  public each(fn: (key: string, value: unknown) => void): Promise<void> {
    this.#session.each((key: string, value: unknown): void => {
      fn(key, value);
    });

    return Promise.resolve();
  }

  public get(key: string): Promise<unknown> {
    return Promise.resolve(this.#session.get(key));
  }

  public remove(key: string): Promise<void> {
    this.#session.remove(key);
    this.emit('store_changed', key);

    return Promise.resolve();
  }

  public set(key: string, value: any): Promise<void> {
    this.#session.set(key, value);
    this.emit('store_changed', key, value);

    return Promise.resolve();
  }
}
