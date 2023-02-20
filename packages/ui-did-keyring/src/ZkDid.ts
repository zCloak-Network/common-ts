// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DidDocument, DidUrl } from '@zcloak/did-resolver/types';
import type { Keyring } from '@zcloak/keyring';
import type { KeyringPair$Json } from '@zcloak/keyring/types';
import type { BaseStore } from '@zcloak/ui-store/BaseStore';

import { Did, helpers, keys } from '@zcloak/did';
import { ZkDid as ZkDidSuper } from '@zcloak/did-keyring/zk/ZkDid';
import { BrowserStore } from '@zcloak/ui-store';

import { zkDidKey, zkDidRegex, zkPairKey, zkPairKeyRegex } from './defaults';

export class ZkDid extends ZkDidSuper {
  #store: BaseStore;

  constructor(_keyring?: Keyring, store?: BaseStore) {
    super(_keyring);
    this.#store = store ?? new BrowserStore();
  }

  public loadAll(): Promise<void> {
    return new Promise((resolve) => {
      this.#store.all((key, val) => {
        const jsons: KeyringPair$Json[] = [];
        const documents: DidDocument[] = [];

        if (zkPairKeyRegex.test(key)) {
          jsons.push(val as KeyringPair$Json);
        } else if (zkDidRegex.test(key)) {
          documents.push(val as DidDocument);
        }

        jsons.forEach((json) => this.keyring.addFromJson(json));
        documents.forEach((document) => {
          const did = helpers.fromDidDocument(document, this.keyring);

          this.dids.set(did.id, did);
        });
      }, resolve);
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

  public override addDid(did: Did, password?: string | undefined): void {
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

    this.#store.set(zkDidKey(did.id), did.getDocument());
  }
}
