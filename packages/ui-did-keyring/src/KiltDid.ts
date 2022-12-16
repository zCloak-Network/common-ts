// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LightDidDetails } from '@kiltprotocol/did';
import type { DidUri } from '@kiltprotocol/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { Keyring } from '@zcloak/did-keyring/kilt/Keyring';
import type { BaseStore } from '@zcloak/ui-store/BaseStore';

import { KiltDid as KiltDidSuper } from '@zcloak/did-keyring/kilt/KiltDid';
import { BrowserStore } from '@zcloak/ui-store';

import { kiltDidKey, kiltDidRegex, kiltPairKey, kiltPairKeyRegex } from './defaults';

export class KiltDid extends KiltDidSuper {
  #store: BaseStore;

  constructor(_keyring?: Keyring, store?: BaseStore) {
    super(_keyring);
    this.#store = store ?? new BrowserStore();
  }

  public loadAll() {
    this.#store.all((key, value) => {
      if (kiltPairKeyRegex.test(key)) {
        this.keyring.addFromJson(value as KeyringPair$Json);
      }
    });
    this.#store.all((key, value) => {
      if (kiltDidRegex.test(key)) {
        this.addDid(value as DidUri);
      }
    });
  }

  public override remove(didUrl: DidUri): void {
    const didDetails = this.didDetails.get(didUrl);

    if (didDetails) {
      didDetails.getKeys().forEach((key) => {
        this.#store.remove(kiltPairKey(this.keyring.getPair(key.publicKey).address));
      });
      this.#store.remove(kiltDidKey(didDetails.uri));
    }

    super.remove(didUrl);
  }

  public override addDid(
    didUriOrDetails: DidUri | LightDidDetails,
    password?: string | undefined
  ): LightDidDetails {
    const didDetails = super.addDid(didUriOrDetails, password);

    this.#store.set(kiltDidKey(didDetails.uri), didDetails.uri);
    didDetails.getKeys().forEach((key) => {
      const pair = this.keyring.getPair(key.publicKey);

      this.#store.set(kiltPairKey(pair.address), pair.toJson(password));
    });

    this.#store.set(kiltDidKey(didDetails.uri), didDetails.uri);

    return didDetails;
  }
}
