// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EventEmitter } from 'eventemitter3';

import { StorageEvent } from './types';

export abstract class Events {
  #eventemitter = new EventEmitter();

  protected emit(type: StorageEvent, key: string, value?: unknown): boolean {
    return this.#eventemitter.emit(type, key, value);
  }

  public on(type: StorageEvent, handler: (key: string, value?: unknown) => any): this {
    this.#eventemitter.on(type, handler);

    return this;
  }

  public off(type: StorageEvent, handler: (key: string, value?: unknown) => any): this {
    this.#eventemitter.removeListener(type, handler);

    return this;
  }

  public once(type: StorageEvent, handler: (key: string, value?: unknown) => any): this {
    this.#eventemitter.once(type, handler);

    return this;
  }
}
