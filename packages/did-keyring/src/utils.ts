// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KiltDidKeys$Json, ZkDidKeys$Json } from './types';

import { Utils } from '@kiltprotocol/did';

import { isDidUrl } from '@zcloak/did/utils';

export function isKiltDidKeys$Json(json: unknown): json is KiltDidKeys$Json {
  json as KiltDidKeys$Json;

  if (
    (json as KiltDidKeys$Json).didUri &&
    Array.isArray((json as KiltDidKeys$Json).keys) &&
    (json as KiltDidKeys$Json).keys.length === 2
  ) {
    try {
      return Utils.validateKiltDidUri((json as KiltDidKeys$Json).didUri);
    } catch {
      return false;
    }
  }

  return false;
}

export function isZkDidKeys$Json(json: unknown): json is ZkDidKeys$Json {
  json as ZkDidKeys$Json;

  if (
    (json as ZkDidKeys$Json).didUrl &&
    Array.isArray((json as ZkDidKeys$Json).keys) &&
    (json as ZkDidKeys$Json).keys.length === 2
  ) {
    try {
      return isDidUrl((json as ZkDidKeys$Json).didUrl);
    } catch {
      return false;
    }
  }

  return false;
}
