import type { DidKeys$Json } from './types';

import { validateKiltDidUri } from '@kiltprotocol/did/lib/cjs/Did.utils';

export function isDidKeys$Json(json: unknown): json is DidKeys$Json {
  json as DidKeys$Json;

  if ((json as DidKeys$Json).didUri && Array.isArray((json as DidKeys$Json).keys)) {
    try {
      return validateKiltDidUri((json as DidKeys$Json).didUri);
    } catch {
      return false;
    }
  }

  return false;
}
