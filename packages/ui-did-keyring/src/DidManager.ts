import type { DidUri } from '@kiltprotocol/types';
import type { KeyringOptions, KeyringPair$Json } from '@polkadot/keyring/types';
import type { DidKeys$Json } from '@zcloak/did-keyring/types';

import { LightDidDetails, Utils } from '@kiltprotocol/did';
import { assert } from '@polkadot/util';

import { DidManager as DidManagerSuper } from '@zcloak/did-keyring/DidManager';
import { BrowserStore } from '@zcloak/ui-store';

import { accountKey, accountRegex, didKey, didRegex } from './defaults';

export class DidManager extends DidManagerSuper {
  #store: BrowserStore;

  constructor(options?: KeyringOptions, store?: BrowserStore) {
    super(options);
    this.#store = store || new BrowserStore();
  }

  public loadAll() {
    this.#store.all((key, value) => {
      if (accountRegex.test(key)) {
        this.addFromJson(value as KeyringPair$Json);
      } else if (didRegex.test(key)) {
        this.didUris.add(value as DidUri);
      }
    });
  }

  public override backupDid(
    didUriOrDetails: DidUri | LightDidDetails,
    password: string
  ): DidKeys$Json {
    const json = super.backupDid(didUriOrDetails, password);

    this.#store.set(didKey(json.didUri), json.didUri);
    json.keys.forEach((key) => {
      this.#store.set(accountKey(key.address), key);
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

    this.#store.remove(didKey(didDetails.uri));
    didDetails.getKeys().forEach((key) => {
      this.#store.remove(accountKey(this.getPair(key.publicKey).address));
    });

    super.removeDid(didUriOrDetails);
  }
}
