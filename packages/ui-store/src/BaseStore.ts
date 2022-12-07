// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

export abstract class BaseStore {
  abstract all(fn: (key: string, value: unknown) => void): void;
  abstract get(key: string, fn: (value: unknown) => void): void;
  abstract set(key: string, value: unknown, fn?: () => void): void;
  abstract remove(key: string, fn?: () => void): void;
}
