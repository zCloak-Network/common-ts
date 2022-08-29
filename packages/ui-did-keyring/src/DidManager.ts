import type { DidDetails } from '@kiltprotocol/did';
import type { DidUri } from '@kiltprotocol/types';
import type { KeyringOptions, KeyringPair$Json } from '@polkadot/keyring/types';
import type { DidKeys$Json } from '@zcloak/did-keyring/types';

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

  public override generateDid(mnemonic: string, password: string): DidKeys$Json {
    const json = super.generateDid(mnemonic, password);

    this.#store.set(didKey(json.didUri), json.didUri);
    json.keys.forEach((key) => {
      this.#store.set(accountKey(key.address), key);
    });

    return json;
  }

  public override restoreDid(textOrJson: string | DidKeys$Json): DidKeys$Json {
    const json = super.restoreDid(textOrJson);

    this.#store.set(didKey(json.didUri), json.didUri);
    json.keys.forEach((key) => {
      this.#store.set(accountKey(key.address), key);
    });

    return json;
  }

  public override removeDid(didUriOrDetails: DidUri | DidDetails): DidDetails {
    const didDetails = super.removeDid(didUriOrDetails);

    this.#store.remove(didKey(didDetails.uri));
    didDetails.getKeys().forEach((key) => {
      this.#store.remove(accountKey(this.getPair(key.publicKey).address));
    });

    return didDetails;
  }
}
