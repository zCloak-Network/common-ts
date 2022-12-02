// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DidKeys$Json } from './types';

import { Utils } from '@kiltprotocol/did';

export function isDidKeys$Json(json: unknown): json is DidKeys$Json {
  json as DidKeys$Json;

  if (
    (json as DidKeys$Json).didUri &&
    Array.isArray((json as DidKeys$Json).keys) &&
    (json as DidKeys$Json).keys.length === 2
  ) {
    try {
      return Utils.validateKiltDidUri((json as DidKeys$Json).didUri);
    } catch {
      return false;
    }
  }

  return false;
}
