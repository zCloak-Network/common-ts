// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Events } from './event/Event';

export abstract class BaseStore extends Events {
  public abstract all(fn: (key: string, value: unknown) => void, done?: () => void): void;
  public abstract get(key: string, fn: (value: unknown) => void): void;
  public abstract set(key: string, value: unknown, fn?: () => void): void;
  public abstract remove(key: string, fn?: () => void): void;
}
