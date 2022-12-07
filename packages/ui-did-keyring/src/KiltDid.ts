// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DidUri } from '@kiltprotocol/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

import { LightDidDetails } from '@kiltprotocol/did';

import { Keyring } from '@zcloak/did-keyring/kilt/Keyring';
import { KiltDid as KiltDidSuper } from '@zcloak/did-keyring/kilt/KiltDid';
import { BrowserStore } from '@zcloak/ui-store';
import { BaseStore } from '@zcloak/ui-store/BaseStore';

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
      this.#store.remove(kiltDidKey(didDetails.uri));
      didDetails.getKeys().forEach((key) => {
        this.#store.remove(kiltPairKey(this.keyring.getPair(key.publicKey).address));
      });
    }

    super.remove(didUrl);
  }

  protected override addDid(
    didUriOrDetails: DidUri | LightDidDetails,
    password?: string | undefined
  ): LightDidDetails {
    const didDetails = super.addDid(didUriOrDetails, password);

    this.#store.set(kiltDidKey(didDetails.uri), didDetails.uri);
    didDetails.getKeys().forEach((key) => {
      this.#store.set(kiltPairKey(this.keyring.getPair(key.publicKey).address), key);
    });

    return didDetails;
  }
}
