// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Events } from './event/Event';

export abstract class BaseStore extends Events {
  abstract all(fn: (key: string, value: unknown) => void): void;
  abstract get(key: string, fn: (value: unknown) => void): void;
  abstract set(key: string, value: unknown, fn?: () => void): void;
  abstract remove(key: string, fn?: () => void): void;
}
