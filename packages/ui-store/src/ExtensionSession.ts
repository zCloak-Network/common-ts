// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BaseStore } from './BaseStore';

const session = chrome.storage.session;

export class ExtensionSession extends BaseStore {
  constructor() {
    super();

    chrome.storage.onChanged.addListener((event, namespace) => {
      if (namespace === 'session') {
        const key = Object.keys(event)[0];

        this.emit('store_changed', key, event[key]?.newValue);
      }
    });
  }

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

  public async remove(key: string) {
    await session.remove(key);
  }

  public async set(key: string, value: unknown) {
    await session.set({ [key]: value });
  }
}
