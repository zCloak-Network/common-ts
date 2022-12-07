// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair$Json } from '@zcloak/keyring/types';

import { assert } from '@polkadot/util';

import { helpers } from '@zcloak/did';
import { ZkDid as ZkDidSuper } from '@zcloak/did-keyring/zk/ZkDid';
import { DidUrl } from '@zcloak/did-resolver/types';
import { BrowserStore } from '@zcloak/ui-store';
import { BaseStore } from '@zcloak/ui-store/BaseStore';

import { zkDidKey, zkDidRegex, zkPairKey, zkPairKeyRegex } from './defaults';

export class ZkDid extends ZkDidSuper {
  #store: BaseStore;
  constructor(store?: BaseStore) {
    super();
    this.#store = store ?? new BrowserStore();
  }

  loadAll() {
    this.#store.all((key, val) => {
      if (zkPairKeyRegex.test(key)) {
        const json = val as KeyringPair$Json;

        this.keyring.addFromJson(json);
      } else if (zkDidRegex.test(key)) {
        const did: any = helpers.fromDidDocument(JSON.parse(val as string), this.keyring);

        this.dids.set(did.id, did);
      }
    });
  }

  override saveDid(didUrl: string, password?: string): void {
    const did = this.dids.get(didUrl as DidUrl);

    assert(did, 'did not found');

    this.#store.set(did.id, JSON.stringify(did.getDocument()));

    const identifierPair = this.getIdentifierPair(did.id);

    if (password && identifierPair) {
      Array.from(did.keyRelationship.values()).forEach(({ publicKey }) => {
        const pair = did.getPair(publicKey);

        this.#store.set(zkPairKey(publicKey), pair.toJson(password));
      });

      this.#store.set(zkPairKey(identifierPair.publicKey), identifierPair.toJson(password));

      super.saveDid(didUrl, password);
    }
  }

  override remove(didUrl: string): void {
    const did = this.dids.get(didUrl as DidUrl);

    assert(did, 'did not found');

    const identifierPair = this.getIdentifierPair(did.id);

    if (identifierPair) {
      Array.from(did.keyRelationship.values()).forEach(({ publicKey }) => {
        const pair = did.getPair(publicKey);

        this.#store.remove(zkPairKey(pair.publicKey));
      });

      this.#store.remove(zkPairKey(identifierPair.publicKey));
    }

    this.#store.remove(zkDidKey(didUrl as DidUrl));

    super.remove(didUrl);
  }
}
