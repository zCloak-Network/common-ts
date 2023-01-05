// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BaseStore } from './BaseStore';

const session = chrome.storage.session;

export class ExtensionSession extends BaseStore {
  public all(fn: (key: string, value: string) => void) {
    session.get(null, (items) => {
      for (const key in items) {
        fn(key, items[key]);
      }
    });
  }

  public get(key: string, fn: (value: unknown) => void) {
    session.get(key, (item) => {
      fn(item[key] as unknown);
    });
  }

  public remove(key: string, fn?: () => void) {
    session.remove(key);
    fn && fn();
    this.emit('store_changed', key);
  }

  public set(key: string, value: unknown, fn?: () => void) {
    session.set({ [key]: value });
    fn && fn();
    this.emit('store_changed', key, value);
  }
}
