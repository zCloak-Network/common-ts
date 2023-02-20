// Copyright 2021-2023 zcloak authors & contributors
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

  public all(fn: (key: string, value: string) => void, done?: () => void) {
    session.get(null, (items) => {
      for (const key in items) {
        fn(key, items[key]);
      }

      done?.();
    });
  }

  public get(key: string, fn: (value: unknown) => void) {
    session.get(key, (item) => {
      fn(item[key] as unknown);
    });
  }

  public remove(key: string, fn?: () => void) {
    session.remove(key, fn);
  }

  public set(key: string, value: unknown, fn?: () => void) {
    session.set({ [key]: value }, fn);
  }
}
