// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { KiltDid } from './kilt/KiltDid';
import { ZkDid } from './zk/ZkDid';
import { DidBase } from './Base';
import { isKiltDidKeys$Json, isZkDidKeys$Json } from './utils';

type DidTypes = 'kilt' | 'zk';
export class DidManager extends DidBase {
  public kilt: KiltDid;
  public zk: ZkDid;
  public default: DidBase;

  constructor() {
    super();
    this.kilt = new KiltDid();
    this.zk = new ZkDid();
    this.default = this.zk;
  }

  addDidFromMnemonic(mnemonic: string, password: string): void {
    this.default.addDidFromMnemonic(mnemonic, password);
  }

  addDidFromJson(jsonKeys: string, newPass: string, oldPass: string): string {
    let json: any;

    if (typeof jsonKeys === 'string') {
      json = JSON.parse(jsonKeys);
    } else {
      json = jsonKeys;
    }

    const isZk = isZkDidKeys$Json(json);
    const isKilt = isKiltDidKeys$Json(json);

    if (isZk) {
      return this.zk.addDidFromJson(jsonKeys, newPass, oldPass);
    }

    if (isKilt) {
      return this.kilt.addDidFromJson(jsonKeys, newPass, oldPass);
    }

    throw new Error('Not a valid Json key file.');
  }

  remove(didUrl: string): void {
    this.default.remove(didUrl);
  }

  getAll(): string[] {
    return this.zk.getAll().concat(this.kilt.getAll());
  }

  lock(didUrl: string): void {
    this.default.lock(didUrl);
  }

  unlock(didUrl: string, password: string): void {
    this.default.unlock(didUrl, password);
  }

  changeDefaultDid(type: DidTypes) {
    switch (type) {
      case 'kilt':
        this.default = this.kilt;
        break;
      case 'zk':
        this.default = this.zk;
        break;
      default:
        throw new Error('Unsupported did type.');
    }
  }
}
