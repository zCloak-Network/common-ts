// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DidUri } from '@kiltprotocol/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { KiltDidKeys$Json } from '@zcloak/did-keyring/types';

import { LightDidDetails, Utils } from '@kiltprotocol/did';
import { assert } from '@polkadot/util';

import { Keyring } from '@zcloak/did-keyring/kilt/Keyring';
import { KiltDid as KiltDidSuper } from '@zcloak/did-keyring/kilt/KiltDid';
import { BrowserStore } from '@zcloak/ui-store';
import { BaseStore } from '@zcloak/ui-store/BaseStore';

import { kiltDidKey, kiltDidRegex, kiltPairKey, kiltPairKeyRegex } from './defaults';

export class KisltDid extends KiltDidSuper {
  #store: BaseStore;

  constructor(_keyring?: Keyring, store?: BaseStore) {
    super(_keyring);
    this.#store = store ?? new BrowserStore();
  }

  public loadAll() {
    this.#store.all((key, value) => {
      if (kiltPairKeyRegex.test(key)) {
        this.keyring.addFromJson(value as KeyringPair$Json);
      } else if (kiltDidRegex.test(key)) {
        this.didUris.add(value as DidUri);
      }
    });
  }

  public override backupDid(
    didUriOrDetails: DidUri | LightDidDetails,
    password: string
  ): KiltDidKeys$Json {
    const json = super.backupDid(didUriOrDetails, password);

    this.#store.set(kiltDidKey(json.didUri), json.didUri);
    json.keys.forEach((key) => {
      this.#store.set(kiltPairKey(key.address), key);
    });

    return json;
  }

  public override removeDid(didUriOrDetails: DidUri | LightDidDetails): void {
    let didDetails: LightDidDetails;

    if (didUriOrDetails instanceof LightDidDetails) {
      didDetails = didUriOrDetails;
    } else {
      assert(Utils.validateKiltDidUri(didUriOrDetails), 'Not did uri');
      assert(Utils.parseDidUri(didUriOrDetails).type === 'light', 'only light did uri backup');

      didDetails = LightDidDetails.fromUri(didUriOrDetails);
    }

    this.#store.remove(kiltDidKey(didDetails.uri));
    didDetails.getKeys().forEach((key) => {
      this.#store.remove(kiltPairKey(this.keyring.getPair(key.publicKey).address));
    });

    super.removeDid(didUriOrDetails);
  }
}
