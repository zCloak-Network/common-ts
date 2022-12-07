// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair } from '@zcloak/keyring/types';

import { assert } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';

import { ethereumEncode } from '@zcloak/crypto';
import { Did, helpers } from '@zcloak/did';
import { KeyRelationship } from '@zcloak/did/types';
import { ArweaveDidResolver } from '@zcloak/did-resolver';
import { DidUrl } from '@zcloak/did-resolver/types';
import { Keyring } from '@zcloak/keyring';

import { DidBase } from '../Base';
import { ZkDidKeys$Json } from '../types';

export class ZkDid extends DidBase {
  public dids: Map<DidUrl, Did>;
  private resolver: ArweaveDidResolver;
  protected keyring: Keyring;

  constructor(_keyring?: Keyring, _resolver?: ArweaveDidResolver) {
    super();
    this.keyring = _keyring ?? new Keyring();
    this.resolver = _resolver ?? new ArweaveDidResolver();
    this.dids = new Map<DidUrl, Did>();
  }

  addDidFromMnemonic(mnemonic: string, password?: string): void {
    const did = helpers.createEcdsaFromMnemonic(mnemonic, this.keyring);

    this.addDid(did, password);
  }

  addDidFromJson(jsonKeys: string, newPass: string, oldPass: string): string {
    const json = JSON.parse(jsonKeys) as ZkDidKeys$Json;
    const keyRelationship = new Map<DidUrl, KeyRelationship>();

    json.keys.forEach((key, index) => {
      const pair = this.keyring.addFromJson(key);

      pair.unlock(oldPass);

      const id: DidUrl = `${json.didUrl}#key-${index}`;
      const controller: DidUrl[] = [`${json.didUrl}`];
      const publicKey = pair.publicKey;

      keyRelationship.set(id, {
        id,
        controller,
        publicKey
      });
    });
    const pair = this.keyring.addFromJson(json.identifierKey);

    pair.unlock(oldPass);

    const did = new Did({
      id: json.didUrl,
      controller: new Set([json.didUrl]),
      keyRelationship,
      authentication: new Set(json.authentication),
      assertionMethod: new Set(json.assertionMethod),
      keyAgreement: new Set(json.keyAgreement),
      capabilityInvocation: new Set(json.capabilityInvocation),
      capabilityDelegation: new Set(json.capabilityDelegation),
      service: new Map()
    });

    did.init(this.keyring);

    this.addDid(did);

    return did.id;
  }

  remove(didUrl: string): void {
    this.dids.delete(didUrl as DidUrl);
    this.emit('add');
  }

  backupDid(didUrl: DidUrl, password: string) {
    const did = this.dids.get(didUrl);

    assert(did, 'did not found');

    const identifierPair = this.getIdentifierPair(didUrl);

    assert(identifierPair, 'no identifier pair found');

    return {
      didUrl: did.id,
      version: '1',
      identifierKey: identifierPair.toJson(password),
      keys: Array.from(did.keyRelationship.values()).map(({ publicKey }) => {
        const pair = did.getPair(publicKey);

        return pair.toJson(password);
      }),
      authentication: Array.from(did.authentication ?? []),
      assertionMethod: Array.from(did.assertionMethod ?? []),
      keyAgreement: Array.from(did.keyAgreement ?? []),
      capabilityInvocation: Array.from(did.capabilityInvocation ?? []),
      capabilityDelegation: Array.from(did.capabilityDelegation ?? [])
    } as ZkDidKeys$Json;
  }

  protected getIdentifierPair(didUrl: string): KeyringPair | undefined {
    const { identifier } = this.resolver.parseDid(didUrl);

    const identifierPair = this.keyring
      .getPairs()
      .find((pair) => ethereumEncode(pair.publicKey) === identifier);

    return identifierPair;
  }

  getAll(): string[] {
    return Array.from(this.dids.values()).map((item) => item.id);
  }

  unlock(didUrl: string, password: string) {
    const did = this.dids.get(didUrl as DidUrl);

    assert(did, 'did not found');

    Array.from(did.keyRelationship.values()).forEach(({ publicKey }) => {
      const pair = did.getPair(publicKey);

      pair.unlock(password);
    });
  }

  lock(didUrl: string) {
    const did = this.dids.get(didUrl as DidUrl);

    assert(did, 'did not found');

    Array.from(did.keyRelationship.values()).forEach(({ publicKey }) => {
      const pair = did.getPair(publicKey);

      pair.lock();
    });
  }

  getPairs(): KeyringPair[] {
    return this.keyring.getPairs();
  }

  getPair(publicKey: Uint8Array | HexString): KeyringPair {
    return this.keyring.getPair(publicKey);
  }

  addDid(did: Did, password?: string) {
    this.dids.set(did.id, did);
    this.saveDid(did.id, password);
  }

  saveDid(didUrl: string, password?: string) {
    const did = this.dids.get(didUrl as DidUrl);

    assert(did, 'no did found');

    Array.from(did.keyRelationship.values()).forEach(({ publicKey }) => {
      this.keyring.addFromJson(did.getPair(publicKey).toJson(password));
    });

    const identifierPair = this.getIdentifierPair(didUrl);

    assert(identifierPair, 'identifierPair not found');

    this.keyring.addFromJson(identifierPair.toJson(password));

    this.emit('add');
  }
}
