// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StorageEvent } from './types';

import Events from 'eventemitter3';

export abstract class BaseStore extends Events<StorageEvent> {
  public abstract each(fn: (key: string, value: unknown) => void): Promise<void>;
  public abstract all(): Promise<[string, unknown][]>;
  public abstract get(key: string): Promise<unknown>;
  public abstract set(key: string, value: any): Promise<void>;
  public abstract remove(key: string): Promise<void>;
}
