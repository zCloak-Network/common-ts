// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { deserialize, serialize } from './utils';

export class LocalStorage {
  get(key: string | null) {
    if (!key) return undefined;

    const val = localStorage.getItem(key);

    return deserialize(val);
  }

  set(key: string, value: unknown) {
    const val = serialize(value);

    localStorage.setItem(key, val);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  each(fn: (key: string, val: unknown) => void) {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);

      if (key) fn(key, this.get(key));
    }
  }
}
