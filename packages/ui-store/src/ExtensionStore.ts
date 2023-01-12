// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BaseStore } from './BaseStore';

const storage = chrome.storage.local;

export class ExtensionStore extends BaseStore {
  constructor() {
    super();

    chrome.storage.onChanged.addListener((event, namespace) => {
      if (namespace === 'local') {
        const key = Object.keys(event)[0];

        this.emit('store_changed', key, event[key]?.newValue);
      }
    });
  }

  public all(fn: (key: string, value: string) => void, done?: () => void) {
    storage.get(null, (items) => {
      for (const key in items) {
        fn(key, items[key]);
      }

      done?.();
    });
  }

  public get(key: string, fn: (value: unknown) => void) {
    storage.get(key, (item) => {
      fn(item[key] as unknown);
    });
  }

  public remove(key: string, fn?: () => void) {
    storage.remove(key, fn);
  }

  public set(key: string, value: unknown, fn?: () => void) {
    storage.set({ [key]: value }, fn);
  }
}
