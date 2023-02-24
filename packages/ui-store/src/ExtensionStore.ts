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

  public async all(): Promise<[string, any][]> {
    const values: [string, any][] = [];

    await this.each((key, value) => values.push([key, value]));

    return values;
  }

  public async each(fn: (key: string, value: string) => void): Promise<void> {
    const items = await chrome.storage.local.get(null);

    for (const key in items) {
      fn(key, items[key]);
    }
  }

  public get(key: string): Promise<any> {
    return chrome.storage.local.get(key);
  }

  public remove(key: string): Promise<void> {
    return chrome.storage.local.remove(key);
  }

  public set(key: string, value: any): Promise<void> {
    return chrome.storage.local.set({ [key]: value });
  }
}
