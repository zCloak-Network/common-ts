// Copyright 2021-2022 zcloak authors & contributors
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
