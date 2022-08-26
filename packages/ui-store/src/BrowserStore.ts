import type { KeyringPair$Json } from '@polkadot/keyring/types';

import store from 'store';

export class BrowserStore {
  public all(fn: (key: string, value: KeyringPair$Json) => void): void {
    store.each((value: KeyringPair$Json, key: string): void => {
      fn(key, value);
    });
  }

  public get(key: string, fn: (value: KeyringPair$Json) => void): void {
    fn(store.get(key) as KeyringPair$Json);
  }

  public remove(key: string, fn?: () => void): void {
    store.remove(key);
    fn && fn();
  }

  public set(key: string, value: KeyringPair$Json, fn?: () => void): void {
    store.set(key, value);
    fn && fn();
  }
}
