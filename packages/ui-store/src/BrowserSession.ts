// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SessionStorage } from './store/SessionStorage';
import { BaseStore } from './BaseStore';

export class BrowserSession extends BaseStore {
  #session: SessionStorage;

  constructor() {
    super();
    this.#session = new SessionStorage();
  }

  public all(fn: (key: string, value: unknown) => void, done?: () => void): void {
    this.#session.each((key: string, value: unknown): void => {
      fn(key, value);
    });
    done?.();
  }

  public get(key: string, fn: (value: unknown) => void): void {
    fn(this.#session.get(key) as unknown);
  }

  public remove(key: string, fn?: () => void): void {
    this.#session.remove(key);
    fn && fn();
    this.emit('store_changed', key);
  }

  public set(key: string, value: unknown, fn?: () => void): void {
    this.#session.set(key, value as string);
    fn && fn();
    this.emit('store_changed', key, value);
  }
}
