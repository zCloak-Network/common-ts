// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Keyring } from '@zcloak/keyring';
import type { KeyringPair$Json } from '@zcloak/keyring/types';

import { Did, helpers, keys } from '@zcloak/did';
import { ZkDid as ZkDidSuper } from '@zcloak/did-keyring/zk/ZkDid';
import { DidDocument, DidUrl } from '@zcloak/did-resolver/types';
import { BrowserStore } from '@zcloak/ui-store';
import { BaseStore } from '@zcloak/ui-store/BaseStore';

import { zkDidKey, zkDidRegex, zkPairKey, zkPairKeyRegex } from './defaults';

export class ZkDid extends ZkDidSuper {
  #store: BaseStore;
  constructor(_keyring?: Keyring, store?: BaseStore) {
    super(_keyring);
    this.#store = store ?? new BrowserStore();
  }

  loadAll() {
    this.#store.all((key, val) => {
      if (zkPairKeyRegex.test(key)) {
        const json = val as KeyringPair$Json;

        this.keyring.addFromJson(json);
      }
    });
    this.#store.all((key, val) => {
      if (zkDidRegex.test(key)) {
        const document: DidDocument = JSON.parse(val as string);

        const did = helpers.fromDidDocument(document, this.keyring);

        this.dids.set(did.id, did);
      }
    });
  }

  public override remove(didUrl: DidUrl): void {
    const did = this.dids.get(didUrl);

    if (did) {
      // remove identifier key
      const identifierPair = keys.getEcdsaIdentifierPair(this.keyring, did);

      if (identifierPair) {
        this.keyring.removePair(identifierPair.publicKey);
        this.#store.remove(zkPairKey(identifierPair.publicKey));
      }

      // remove keys
      Array.from(did.keyRelationship.values()).forEach(({ publicKey }) => {
        this.keyring.removePair(publicKey);
        this.#store.remove(zkPairKey(publicKey));
      });
      this.#store.remove(zkDidKey(did.id));
    }

    super.remove(didUrl);
  }

  protected override addDid(did: Did, password?: string | undefined): void {
    super.addDid(did, password);

    // save identifier
    const identifierPair = keys.getEcdsaIdentifierPair(this.keyring, did);

    if (identifierPair) {
      this.#store.set(zkPairKey(identifierPair.publicKey), identifierPair.toJson(password));
    }

    // save key
    Array.from(did.keyRelationship.values()).forEach(({ publicKey }) => {
      this.#store.set(zkPairKey(publicKey), this.keyring.getPair(publicKey).toJson(password));
    });
  }
}
