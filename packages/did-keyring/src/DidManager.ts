// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DidUri } from '@kiltprotocol/types';
import type { DidKeys$Json as ZkidDidKeys$Json } from '@zcloak/did/keys/types';
import type { DidKeys$Json as KiltDidKeys$Json } from './kilt/types';

import { Utils } from '@kiltprotocol/did';

import { isDidUrl } from '@zcloak/did/utils';

import { KiltDid } from './kilt/KiltDid';
import { ZkDid } from './zk/ZkDid';
import { DidBase } from './Base';
import { isKiltDidKeys$Json, isZkDidKeys$Json } from './utils';

export class DidManager extends DidBase<ZkidDidKeys$Json | KiltDidKeys$Json> {
  public kilt: KiltDid;
  public zk: ZkDid;

  constructor(_zk?: ZkDid, _kilt?: KiltDid) {
    super();
    this.kilt = _kilt ?? new KiltDid();
    this.zk = _zk ?? new ZkDid();

    const onAdd = () => this.emit('add');
    const onRemove = () => this.emit('remove');

    this.zk.on('add', () => onAdd);
    this.zk.on('remove', () => onRemove);
    this.kilt.on('add', () => onAdd);
    this.kilt.on('remove', () => onRemove);
  }

  public override addDidFromMnemonic(mnemonic: string, password: string, type: 'zk' | 'kilt' = 'zk'): string {
    if (type === 'zk') {
      return this.zk.addDidFromMnemonic(mnemonic, password);
    } else {
      return this.kilt.addDidFromMnemonic(mnemonic, password);
    }
  }

  public override addDidFromJson(json: ZkidDidKeys$Json | KiltDidKeys$Json, newPass: string, oldPass: string): string {
    if (isZkDidKeys$Json(json)) {
      return this.zk.addDidFromJson(json, newPass, oldPass);
    }

    if (isKiltDidKeys$Json(json)) {
      return this.kilt.addDidFromJson(json, newPass, oldPass);
    }

    throw new Error('Not a valid Json key file.');
  }

  public override backupDid(didUrl: string, password: string): ZkidDidKeys$Json | KiltDidKeys$Json {
    if (isDidUrl(didUrl)) {
      return this.zk.backupDid(didUrl, password);
    } else if (Utils.isUri(didUrl)) {
      return this.kilt.backupDid(didUrl as DidUri, password);
    }

    throw new Error(`Unknown didUrl: ${didUrl}`);
  }

  public override remove(didUrl: string): void {
    if (isDidUrl(didUrl)) {
      return this.zk.remove(didUrl);
    } else if (Utils.isUri(didUrl)) {
      return this.kilt.remove(didUrl as DidUri);
    }

    throw new Error(`Unknown didUrl: ${didUrl}`);
  }

  public override getAll(): string[] {
    return (this.zk.getAll() as string[]).concat(this.kilt.getAll());
  }

  public override lock(didUrl: string): void {
    if (isDidUrl(didUrl)) {
      return this.zk.lock(didUrl);
    } else if (Utils.isUri(didUrl)) {
      return this.kilt.lock(didUrl as DidUri);
    }

    throw new Error(`Unknown didUrl: ${didUrl}`);
  }

  public override unlock(didUrl: string, password: string): void {
    if (isDidUrl(didUrl)) {
      return this.zk.unlock(didUrl, password);
    } else if (Utils.isUri(didUrl)) {
      return this.kilt.unlock(didUrl as DidUri, password);
    }

    throw new Error(`Unknown didUrl: ${didUrl}`);
  }
}
