// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BaseStore } from './BaseStore';

export class ExtensionStore extends BaseStore {
  constructor() {
    super();

    chrome.storage.onChanged.addListener((event, namespace) => {
      if (namespace === 'local') {
        const key = Object.keys(event)[0];

        this.emit('store_changed', key, event[key]?.oldValue, event[key]?.newValue);
      }
    });
  }

  public async all(): Promise<[string, unknown][]> {
    const values: [string, unknown][] = [];

    await this.each((key, value) => values.push([key, value]));

    return values;
  }

  public async each(fn: (key: string, value: unknown) => void): Promise<void> {
    const items = await chrome.storage.local.get(null);

    for (const key in items) {
      fn(key, items[key]);
    }
  }

  public async get(key: string): Promise<unknown> {
    const values = await chrome.storage.local.get(key);

    return values?.[key] || null;
  }

  public remove(key: string): Promise<void> {
    return chrome.storage.local.remove(key);
  }

  public set(key: string, value: any): Promise<void> {
    return chrome.storage.local.set({ [key]: value });
  }
}
