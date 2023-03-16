// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function serialize(obj: unknown) {
  return JSON.stringify(obj);
}

export function deserialize(strVal: string | null) {
  if (!strVal) return undefined;

  let val: any;

  try {
    val = JSON.parse(strVal);
  } catch (e) {
    val = strVal;
  }

  return val;
}

export function getAllItems(storage: Storage): Map<string, any> {
  const items: Map<string, any> = new Map();

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);

    if (key) {
      items.set(key, deserialize(storage.getItem(key)));
    }
  }

  return items;
}
