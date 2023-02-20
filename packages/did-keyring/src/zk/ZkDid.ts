// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DidKeys$Json } from '@zcloak/did/keys/types';
import type { KeyringPair } from '@zcloak/keyring/types';

import { assert } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';

import { Did, helpers, keys } from '@zcloak/did';
import { isDidUrl } from '@zcloak/did/utils';
import { DidUrl } from '@zcloak/did-resolver/types';
import { Keyring } from '@zcloak/keyring';

import { DidBase } from '../Base';

export class ZkDid extends DidBase<DidKeys$Json> {
  public dids: Map<DidUrl, Did> = new Map<DidUrl, Did>();
  protected keyring: Keyring;

  constructor(_keyring?: Keyring) {
    super();
    this.keyring = _keyring ?? new Keyring();
  }

  public override addDidFromMnemonic(mnemonic: string, password: string): DidUrl {
    const did = helpers.createEcdsaFromMnemonic(mnemonic, this.keyring);

    this.addDid(did, password);

    return did.id;
  }

  public override addDidFromJson(json: DidKeys$Json, newPass: string, oldPass: string): DidUrl {
    const did = keys.restore(this.keyring, json, oldPass);

    this.addDid(did, newPass);

    return did.id;
  }

  public override backupDid(didUrl: DidUrl, password: string): DidKeys$Json {
    assert(isDidUrl(didUrl), 'expect didUrl to be zkid did syntax');
    const did = this.dids.get(didUrl);

    assert(did, `Did with url: ${didUrl} not found`);

    return keys.backup(this.keyring, did, password);
  }

  public override getAll(): DidUrl[] {
    return Array.from(this.dids.values()).map((item) => item.id);
  }

  public override unlock(didUrl: DidUrl, password: string) {
    const did = this.dids.get(didUrl);

    assert(did, 'did not found');

    Array.from(did.keyRelationship.values()).forEach(({ publicKey }) => {
      const pair = this.keyring.getPair(publicKey);

      pair.unlock(password);
    });
  }

  public override lock(didUrl: DidUrl) {
    const did = this.dids.get(didUrl);

    assert(did, 'did not found');

    Array.from(did.keyRelationship.values()).forEach(({ publicKey }) => {
      const pair = this.keyring.getPair(publicKey);

      pair.lock();
    });
  }

  public override remove(didUrl: DidUrl): void {
    this.dids.delete(didUrl);
    this.emit('remove');
  }

  public getPairs(): KeyringPair[] {
    return this.keyring.getPairs();
  }

  public getPair(publicKey: Uint8Array | HexString): KeyringPair {
    return this.keyring.getPair(publicKey);
  }

  public addDid(did: Did, password?: string) {
    this.dids.set(did.id, did);

    this.emit('add');
  }
}
