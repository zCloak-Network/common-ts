// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { deserialize, serialize } from './utils';

export class SessionStorage {
  get(key: string | null) {
    if (!key) return undefined;

    const val = sessionStorage.getItem(key);

    return deserialize(val);
  }

  set(key: string, value: unknown) {
    const val = serialize(value);

    sessionStorage.setItem(key, val);
  }

  remove(key: string) {
    sessionStorage.removeItem(key);
  }

  each(fn: (key: string, val: unknown) => void) {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);

      if (key) fn(key, this.get(key));
    }
  }
}
